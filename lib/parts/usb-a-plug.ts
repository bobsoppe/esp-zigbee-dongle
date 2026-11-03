import type { VerifiedPart } from "./types"

export const USB_A_PLUG: VerifiedPart = {
  id: "hdgc:USB-ZL-111PWB",
  description: "USB-ZL-111PWB, USB 2.0 male A plug, 4P + shield",
  supplierPartNumbers: { jlcpcb: ["C5292498"] },
  supplierPin1: { jlcpcb: "topside_right" },
  verification:
    "JLCPCB's footprint labels the pin 1 pad VCC at the right end of the four-pad row, and both the row and the shield pads are symmetric about the connector centreline, so the unrotated placement that faces the tongue off the -Y edge puts pin 1 (VBUS) at x = +3.5 mm without mirroring.",
}
