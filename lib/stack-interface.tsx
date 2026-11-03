// The stack contract. This file is the only declaration of the 16-pin order.
export const STACK_PIN_NAMES = [
  "VBUS_5V",
  "GND",
  "RAIL_3V3",
  "GND",
  "SDA",
  "SCL",
  "GND",
  "CHAIN_IN",
  "CHAIN_OUT",
  "GND",
  "IRQ_N",
  "GND",
  "AUX_A",
  "AUX_B",
  "VBUS_5V",
  "GND",
] as const

export const STACK_PIN_COUNT = STACK_PIN_NAMES.length

export const STACK_HEADER_PITCH = 2.54
export const STACK_HEADER_ROWS = 2

export const STACK_HEADER_XY = { x: 0, y: -14 } as const

export type StackHolePosition = {
  x: number
  y: number
  diameter: number
}

export const STACK_HOLE_POSITIONS: readonly StackHolePosition[] = [
  { x: -26, y: 16, diameter: 2.7 },
  { x: 26, y: 16, diameter: 2.7 },
  { x: -26, y: -16, diameter: 2.7 },
  { x: 26, y: -16, diameter: 2.7 },
]
