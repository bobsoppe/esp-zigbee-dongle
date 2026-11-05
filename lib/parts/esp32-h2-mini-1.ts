import type { VerifiedPart } from "./types"

export const ESP32_H2_MINI_1: VerifiedPart = {
  id: "espressif:ESP32-H2-MINI-1-H4",
  description: "ESP32-H2-MINI-1-H4, 4 MB flash, PCB antenna",
  supplierPartNumbers: { jlcpcb: ["C20416123"] },
  supplierPin1: { jlcpcb: "leftside_top" },
  verification:
    "Supplier footprint corner pads sit 0.05 mm outboard of pin 1; pin 1 and antenna orientation were checked against the Espressif land pattern.",
}
