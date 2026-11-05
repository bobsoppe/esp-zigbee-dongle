import { ESP32_H2_MINI_1 } from "./esp32-h2-mini-1"
import { USB_A_PLUG } from "./usb-a-plug"

export { ESP32_H2_MINI_1, USB_A_PLUG }

export const VERIFIED_PARTS = [ESP32_H2_MINI_1, USB_A_PLUG]

const partsBySupplierPart = new Map<
  string,
  (typeof VERIFIED_PARTS)[number]
>()

for (const part of VERIFIED_PARTS) {
  for (const [supplier, numbers] of Object.entries(part.supplierPartNumbers)) {
    for (const number of numbers) {
      const key = `${supplier}:${number}`
      if (partsBySupplierPart.has(key)) {
        throw new Error(`Duplicate verified part for supplier part ${key}`)
      }
      partsBySupplierPart.set(key, part)
    }
  }
}

export const VERIFIED_PARTS_BY_SUPPLIER_PART = partsBySupplierPart
