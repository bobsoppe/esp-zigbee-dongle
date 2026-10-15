import { execFileSync } from "node:child_process"
import {
  mkdir,
  readdir,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises"
import { dirname, join, relative, resolve, sep } from "node:path"
import type { AnyCircuitElement } from "circuit-json"
import {
  convertBomRowsToCsv,
  convertCircuitJsonToBomRows,
} from "circuit-json-to-bom-csv"
import {
  convertCircuitJsonToPickAndPlaceCsv,
  convertCircuitJsonToPickAndPlaceRows,
} from "circuit-json-to-pnp-csv"

type CircuitJson = AnyCircuitElement[]
type BomRows = Awaited<ReturnType<typeof convertCircuitJsonToBomRows>>

const DIST_DIR = "dist"
const RELEASE_DIR = "release"
// Staging lives under dist/ (already gitignored) so the swap is an atomic rename
// on one filesystem; it holds no circuit.json, so the discovery walk never sees it.
const STAGING_DIR = join(DIST_DIR, "release-staging")

async function findCircuitJsonFiles(dir: string): Promise<string[]> {
  const found: string[] = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      found.push(...(await findCircuitJsonFiles(path)))
    } else if (entry.name === "circuit.json") {
      found.push(path)
    }
  }
  return found
}

async function readCircuitJson(boardFile: string): Promise<CircuitJson> {
  try {
    return JSON.parse(await readFile(boardFile, "utf8"))
  } catch (error) {
    throw new Error(
      `${boardFile}: not valid JSON (${error instanceof Error ? error.message : String(error)})`,
    )
  }
}

// The build records a supplier_footprint_mismatch_warning when the part's
// authored footprint disagrees with the supplier's pad geometry beyond the
// toolchain's own threshold. If the BOM asserts that part number — the column
// JLCPCB acts on alone — the order would ship an unverified match, so refuse
// the run. A warning no BOM row references (e.g. a do_not_place part) is inert.
function assertNoMismatchedSupplierParts(
  circuitJson: CircuitJson,
  bomRows: BomRows,
  boardFile: string,
): void {
  const componentNameBySourceId = new Map<string, string>()
  const sourceIdByPcbComponentId = new Map<string | undefined, string>()
  for (const element of circuitJson) {
    if (element.type === "source_component" && element.name) {
      componentNameBySourceId.set(element.source_component_id, element.name)
    }
    if (element.type === "pcb_component") {
      sourceIdByPcbComponentId.set(
        element.pcb_component_id,
        element.source_component_id,
      )
    }
  }

  const referencedPartNumbers = new Set<string>()
  for (const row of bomRows) {
    const partNumber = row.supplier_part_number_columns?.["JLCPCB Part #"]
    if (typeof partNumber === "string" && partNumber.trim() !== "") {
      referencedPartNumbers.add(partNumber.trim())
    }
  }

  const mismatches: string[] = []
  for (const element of circuitJson) {
    if (element.type !== "supplier_footprint_mismatch_warning") continue
    const partNumber =
      typeof element.supplier_part_number === "string"
        ? element.supplier_part_number.trim()
        : ""
    if (partNumber === "" || !referencedPartNumbers.has(partNumber)) continue
    const designator =
      componentNameBySourceId.get(
        sourceIdByPcbComponentId.get(element.pcb_component_id) ?? "",
      ) ??
      element.source_component_id ??
      element.pcb_component_id
    mismatches.push(
      `${designator}: ${partNumber} (footprint_copper_intersection_over_union ${element.footprint_copper_intersection_over_union})`,
    )
  }

  if (mismatches.length > 0) {
    throw new Error(
      `${boardFile}: BOM asserts supplier parts the build flagged as footprint mismatches; the part or the footprint must be reconciled before a release:\n${mismatches.map((line) => `  ${line}`).join("\n")}`,
    )
  }
}

const boardFiles = (
  await findCircuitJsonFiles(DIST_DIR).catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") return []
    throw error
  })
).sort()

if (boardFiles.length === 0) {
  throw new Error(`No circuit.json found under ${DIST_DIR}/ — run \`tsci build\` first.`)
}

// GitHub release assets share one flat namespace and the host renames files
// containing anything outside A-Za-z0-9._-, so derive one sanitised slug per
// board and reject empty or colliding slugs before the first export.
// index.circuit.tsx is the project's toolchain smoke test, not a product board: it is
// still built and checked, but packaging it would publish an orderable JLCPCB set for
// a coupon. Excluding it by name keeps the default "publish every board", so a new
// product board is packaged automatically and none can be dropped by a pattern.
// The release job relies on the refusal below: it must never set
// FABRICATION_ALLOW_EMPTY. CI on this coupon-only tree sets it so its later
// hook steps run; nothing is packaged and no release set is left behind.
const SMOKE_TEST_SLUGS = new Set(["index"])

const releases = boardFiles
  .map((boardFile) => ({
    boardFile,
    // dist/boards/motherboard/circuit.json -> boards-motherboard
    slug: relative(DIST_DIR, dirname(boardFile))
      .split(sep)
      .join("-")
      .replace(/[^A-Za-z0-9._-]/g, "-"),
  }))
  .filter(({ slug }) => !SMOKE_TEST_SLUGS.has(slug))

if (releases.length === 0) {
  if (process.env.FABRICATION_ALLOW_EMPTY) {
    console.log(
      `Nothing publishable: every board under ${DIST_DIR}/ is a smoke test. Not packaging.`,
    )
    process.exit(0)
  }
  throw new Error(
    `No publishable boards: every board under ${DIST_DIR}/ is a smoke test.`,
  )
}

const emptySlugs = releases.filter(({ slug }) => slug === "")
if (emptySlugs.length > 0) {
  throw new Error(
    `Empty release slug for:\n${emptySlugs.map(({ boardFile }) => boardFile).join("\n")}`,
  )
}

const dirsBySlug = new Map<string, string[]>()
for (const { boardFile, slug } of releases) {
  dirsBySlug.set(slug, [...(dirsBySlug.get(slug) ?? []), dirname(boardFile)])
}

const collisions = [...dirsBySlug].filter(([, dirs]) => dirs.length > 1)
if (collisions.length > 0) {
  throw new Error(
    `Release slug collisions:\n${collisions
      .map(([slug, dirs]) => `  ${slug}: ${dirs.join(", ")}`)
      .join("\n")}`,
  )
}

// Ties the packaged set to a single build: every board's circuit JSON must end
// with the project-metadata element and agree on the source-tree md5, so a
// board left in dist/ by an earlier build cannot be released alongside this one.
const boardHashes = await Promise.all(
  boardFiles.map(async (boardFile) => {
    const circuitJson = await readCircuitJson(boardFile)
    const trailing = circuitJson[circuitJson.length - 1]
    const hash =
      trailing?.type === "source_project_metadata" &&
      typeof trailing.source_filesystem_md5_hash === "string" &&
      trailing.source_filesystem_md5_hash !== ""
        ? trailing.source_filesystem_md5_hash
        : undefined
    return { boardFile, hash }
  }),
)

const hashes = new Set(boardHashes.map(({ hash }) => hash))
if (hashes.size > 1 || hashes.has(undefined)) {
  throw new Error(
    `Boards do not share one build provenance:\n${boardHashes
      .map(({ boardFile, hash }) => `  ${boardFile}: ${hash ?? "missing"}`)
      .join("\n")}`,
  )
}

// The converter's fail-closed mode rejects any included component whose
// jlcpcb rotation it cannot derive from pin1_location and
// supplier_pin1_location_map.jlcpcb. Run it before the first export so an
// unverified rotation cannot reach a published row.
for (const { boardFile } of releases) {
  try {
    convertCircuitJsonToPickAndPlaceRows(
      await readCircuitJson(boardFile),
      { supplier: "jlcpcb", requireSupplierRotation: true },
    )
  } catch (error) {
    throw new Error(
      `${boardFile}: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

// Build the whole set in staging first: a run that fails part-way must not leave
// correctly-named files that a later publisher cannot tell from a complete set.
await rm(STAGING_DIR, { recursive: true, force: true })
await mkdir(STAGING_DIR, { recursive: true })

try {
  for (const { boardFile, slug } of releases) {
    execFileSync(
      // Call the CLI from this repository's install; the npm package named
      // "tsci" is an unrelated project, so a name lookup must never happen.
      resolve("node_modules", ".bin", "tsci"),
      [
        "export",
        boardFile,
        "-f",
        "gerbers",
        // Must be absolute: tsci resolves -o relative to the input file's
        // directory, not the working directory.
        "-o",
        resolve(STAGING_DIR, `${slug}-gerbers.zip`),
      ],
      {
        stdio: "inherit",
        // Bound a wedged supplier lookup in tsci export; 600 s ≈ 200x its ~3 s normal run.
        timeout: 600_000,
      },
    )

    const circuitJson = await readCircuitJson(boardFile)

    const bomRows = await convertCircuitJsonToBomRows({ circuitJson })
    assertNoMismatchedSupplierParts(circuitJson, bomRows, boardFile)
    await writeFile(
      join(STAGING_DIR, `${slug}-bom.csv`),
      convertBomRowsToCsv(bomRows),
    )

    await writeFile(
      join(STAGING_DIR, `${slug}-cpl.csv`),
      convertCircuitJsonToPickAndPlaceCsv(circuitJson, {
        supplier: "jlcpcb",
        requireSupplierRotation: true,
      }),
    )
  }

  // The set is publishable only once every board has all three artefacts and
  // none is empty; verify before anything becomes visible under release/.
  const incomplete: string[] = []
  for (const { boardFile, slug } of releases) {
    for (const suffix of ["gerbers.zip", "bom.csv", "cpl.csv"]) {
      const artefact = `${slug}-${suffix}`
      const size = await stat(join(STAGING_DIR, artefact)).then(
        (stats) => stats.size,
        () => -1,
      )
      if (size <= 0) {
        incomplete.push(
          `${boardFile}: ${artefact} is ${size < 0 ? "missing" : "empty"}`,
        )
      }
    }
  }
  if (incomplete.length > 0) {
    throw new Error(`Release is incomplete:\n${incomplete.join("\n")}`)
  }

  // Publish atomically: rename(2) cannot replace a non-empty directory, so this
  // delete is load-bearing and it is the only one. The set is staged and
  // verified before this point, so a stale asset cannot be published alongside
  // this build's output, and a run that fails earlier leaves the old set intact.
  await rm(RELEASE_DIR, { recursive: true, force: true })
  await rename(STAGING_DIR, RELEASE_DIR)
} catch (error) {
  // A failed run must leave nothing that could be mistaken for a release.
  await rm(STAGING_DIR, { recursive: true, force: true })
  throw error
}

for (const { slug } of releases) {
  console.log(`${slug}: gerbers.zip, bom.csv, cpl.csv`)
}
