# esp-zigbee-dongle

PCBs designed as code with [tscircuit](https://tscircuit.com): boards are TypeScript/TSX, and the
toolchain turns them into Circuit JSON and then into the files a fabricator needs.

The intended product is the ESP32-H2 Zigbee/ESPHome node described in `package.json`'s `description` — a
stackable motherboard plus daisy-chained daughterboards. **The board in the repository today is a small
sample coupon, not that design.**

## Prerequisites

- **Bun** — the only JavaScript runtime. The version this project is built with is declared as
  `packageManager` in `package.json` (`bun@1.4.3`), which is also the version both workflows install.
- **pre-commit** — needed for the git hooks. Without it on `PATH`, `bun install` skips the hook install
  rather than failing.

## Commands

| Command | What it does |
| --- | --- |
| `bun install` | Installs dependencies and, via the `prepare` script, the pre-commit git hooks. |
| `bun run dev` | tscircuit's development server. |
| `bun run build` | `tsci build` — evaluates every board and writes Circuit JSON to `dist/`. |
| `bun run check` | `tsci check` — reports circuit errors and warnings. |
| `bun run typecheck` | `tsc --noEmit`. |
| `bun run snapshot` | `tsci snapshot` — renders board images. |
| `bun run fabrication` | `tsci build` then `scripts/fabrication.ts` — produces the JLCPCB file set in `release/`. |

## From source to a release

1. A board is a `.circuit.tsx` or `.board.tsx` file — `index.circuit.tsx` today.
2. `tsci build` writes `dist/<board>/circuit.json`.
3. `scripts/fabrication.ts` walks `dist/` and, per board, writes three files into `release/`:
   `<slug>-gerbers.zip`, `<slug>-bom.csv` and `<slug>-cpl.csv`. The slug is the board's directory path
   under `dist/`, sanitised by `scripts/fabrication.ts` — `/` and any character outside the set the
   release host accepts become `-` — so names stay unique in the flat release-asset namespace.
4. Pushing a `v*` tag runs `.github/workflows/release.yml`, which builds and attaches `release/*` to the
   GitHub release. **The release is treated as this workflow's output in full: when the release already
   exists, any asset attached to it that is not part of the current `release/*` set — including a file
   added by hand — is deleted. Each deletion is logged in the run.**

**The packaging step refuses to run while the only board is the sample coupon.** The coupon is excluded
from packaging by name in `scripts/fabrication.ts`, so a release publishes no manufacturing package for
it; the run stops with `No publishable boards`. Adding a real board makes it package automatically — the
default is to publish every board unless it is named as a smoke test.

### What the packaging step enforces

- **One build per release.** Every board's `circuit.json` must carry the same trailing
  `source_project_metadata` source-tree hash, so a board left in `dist/` by an earlier build cannot be
  released alongside the current one.
- **Placement metadata.** Every component that will appear in the CPL must carry a `pin1_location` and a
  JLCPCB entry in `supplier_pin1_location_map`; otherwise the converter would silently substitute an
  unverified rotation.
- **No flagged part numbers.** If the build recorded a `supplier_footprint_mismatch_warning` for a part
  the BOM asserts, the run stops rather than shipping an unverified match.
- **All or nothing.** The set is assembled in a staging directory and verified before it replaces
  `release/`, so a failed run never leaves a partial set that looks complete.
- **Unique, non-empty slugs.** Two boards that would produce the same file names are rejected rather than
  overwriting one another.

## Generated and ignored

`node_modules/`, `.tscircuit/` (tsci's parts cache and autorouting artefacts), `dist/` (build output),
`release/` (the JLCPCB upload set — attached to releases, never committed), and `.openchamber/` and
`.opencode/` (local-only working files). See `.gitignore`.

## Before committing

`.pre-commit-config.yaml` defines two hooks: a board build (`bun run build`) over the `.ts`/`.tsx` sources
and the files that change how they build, and `bun run typecheck` over the sources and the files that
change how they are type-checked. The two do not cover the same set — the build hook also triggers on
`tscircuit.config.json`, which the typecheck hook does not. The exact `files:` patterns are in
`.pre-commit-config.yaml`. They run automatically on commit, or explicitly as
`pre-commit run --all-files`.

CI runs those same hooks and additionally runs `bun run fabrication`, so a break in the packaging path
fails the push or pull request instead of a tag whose release then never appears.

## Deliberate deviations

- **`typescript` is pinned to 5.9.3, and a major bump cannot land without a decision.** `tscircuit` declares
  a `^5.0.0` peer, and Bun only warns on a peer mismatch — so CI would stay green while the toolchain
  drifted. See the `description` on that rule in `renovate.json`.
- **`@types/node` is a declared devDependency.** `tsconfig.json` asks for the `node` types because
  `scripts/fabrication.ts` imports `node:` builtins. Without the declaration it resolves only through a
  hoisted transitive, so a dependency change could remove it with no signal.
- **`prepare` installs the pre-commit git hooks** when `bun install` runs, guarded by
  `command -v pre-commit` so a machine without pre-commit is unaffected.
- **The versioning policy lives in `renovate.json`.** Every rule there carries a human-readable
  `description` explaining why it exists; the rule that matters here is that dependency versions are
  pinned exactly and move only through a reviewed update.

## Known build warnings

`bun run build` prints warnings for the sample board. The structural ones follow from the coupon
being deliberately minimal, are expected, and need no action. The advisory availability warning
appears when the parts lookup does not answer:

```
source_component_availability_warning: R1 may not have availability from jlcpcb (C11702).
```

This is not a stock problem. `C11702` is a JLCPCB **Basic** part, and
[LCSC lists it in stock](https://www.lcsc.com/product-detail/C11702.html). The check reads tscircuit's
own `jlcsearch` dataset, which can report *unknown* stock for parts that are in stock, and
tscircuit's documentation states the warning *"can mean zero stock, unknown stock, or a failed or
timed-out lookup; it does not prove the part is unavailable."*

The check is deliberately left enabled, because it is useful for parts whose data is current.

## Licence

MIT — see [LICENSE](LICENSE).
