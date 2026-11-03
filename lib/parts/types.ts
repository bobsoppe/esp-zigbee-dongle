import type { PcbPin1Location } from "circuit-json"

export type VerifiedPart = {
  id: string
  description: string
  supplierPartNumbers: { jlcpcb: string[] }
  supplierPin1: { jlcpcb: PcbPin1Location }
  verification: string
}
