import { Fragment } from "react"
// U1's footprint is Espressif's ESP32-H2-MINI-1.kicad_mod, installed by
// `bunx tsci add https://github.com/espressif/kicad-libraries`. The local copy
// has two mechanical fixes and no pad-geometry changes: the four F.CrtYd line
// segments are merged into one fp_rect because the importer otherwise emits
// open courtyard rings the placement DRC rejects, and the filename carries
// tscircuit's explicit pin1location(leftside,top) hint because the module's
// corner ground pads sit outboard of pin 1.
import esp32h2 from "../lib/ESP32-H2-MINI-1_pin1location(leftside,top)_.kicad_mod"
import { ESP32_H2_MINI_1 } from "../lib/parts"
import {
  STACK_HEADER_PITCH,
  STACK_HEADER_ROTATION,
  STACK_HEADER_ROWS,
  STACK_HEADER_XY,
  STACK_HOLE_POSITIONS,
  STACK_PIN_COUNT,
  STACK_PIN_NAMES,
} from "../lib/stack-interface"

const moduleGndPins = [
  1, 2, 11, 14, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
  51, 52, 53,
]

const moduleNoConnectPins = [
  4, 5, 6, 7, 9, 10, 13, 17, 18, 19, 22, 25, 28, 29, 30, 31, 32, 33, 34, 35,
]

// A .kicad_mod import carries pads but no source ports, so the module's pin
// names are declared here for the traces and noConnect list to select.
const modulePinLabels = Object.fromEntries(
  Array.from({ length: 53 }, (_, index) => [index + 1, `pin${index + 1}`]),
)

// AUX_A and AUX_B are contract pins with nothing on this board. They stay in
// the pin order but carry no net here, so neither a net nor a trace is emitted.
const spareStackNets: readonly string[] = ["AUX_A", "AUX_B"]

const stackNets = [...new Set(STACK_PIN_NAMES)].filter(
  (net) => !spareStackNets.includes(net),
)

// The stack connector feeds the whole daughterboard chain, so its power pins
// take the same width as the rails they carry (Espressif: >= 20 mil on the main
// power traces). Signal pins keep the router default.
const stackPowerWidths: Partial<Record<(typeof STACK_PIN_NAMES)[number], string>> =
  { VBUS_5V: "0.5mm", GND: "0.5mm", RAIL_3V3: "0.3mm" }
const internalNets = [
  "EN",
  "BOOT",
  "SW",
  "BST",
  "USB_DP_CONN",
  "USB_DP",
  "USB_DM_CONN",
  "USB_DM",
]

export default () => (
  <board
    name="esp32-h2-stackable-motherboard"
    width="60mm"
    height="40mm"
    layers={4}
  >
    {[...stackNets, ...internalNets].map((net) => (
      <Fragment key={net}>
        <net name={net} />
      </Fragment>
    ))}

    <copperpour
      connectsTo="net.GND"
      layer="inner1"
      useThermalReliefs
      cutoutMargin="0.3mm"
    />

    <copperpour
      connectsTo="net.GND"
      layer="top"
      useThermalReliefs
      cutoutMargin="0.3mm"
    />
    {STACK_HOLE_POSITIONS.map((hole, index) => (
      <Fragment key={`H${index + 1}`}>
        <hole
          name={`H${index + 1}`}
          diameter={`${hole.diameter}mm`}
          pcbX={hole.x}
          pcbY={hole.y}
        />
      </Fragment>
    ))}

    <chip
      name="J1"
      footprint="jlcpcb:C5292498"
      supplierPartNumbers={{ jlcpcb: ["C5292498"] }}
      allowOffBoard
      pcbX={0}
      pcbY={-22.4}
    />

    <chip
      name="U1"
      footprint={esp32h2}
      supplierPartNumbers={ESP32_H2_MINI_1.supplierPartNumbers}
      pinLabels={modulePinLabels}
      allowOffBoard
      pcbX={0}
      pcbY={17.1}
      noConnect={moduleNoConnectPins.map((pin) => `pin${pin}`)}
    />

    <pinheader
      name="J2"
      pinCount={STACK_PIN_COUNT}
      doubleRow={STACK_HEADER_ROWS === 2}
      pitch={`${STACK_HEADER_PITCH}mm`}
      gender="female"
      footprint="jlcpcb:C3975153"
      supplierPartNumbers={{ jlcpcb: ["C3975153"] }}
      pinLabels={[...STACK_PIN_NAMES]}
      pcbX={STACK_HEADER_XY.x}
      pcbY={STACK_HEADER_XY.y}
      pcbRotation={STACK_HEADER_ROTATION}
      connectsFromAbove
    />

    <chip
      name="U2"
      footprint="jlcpcb:C780769"
      supplierPartNumbers={{ jlcpcb: ["C780769"] }}
      pcbX={-13.335}
      pcbY={-1.27}
    />

    <inductor
      name="L1"
      inductance="4.7uH"
      footprint="jlcpcb:C105672"
      supplierPartNumbers={{ jlcpcb: ["C105672"] }}
      pcbX={-19.685}
      pcbY={-1.27}
      pcbRotation={180}
    />

    <chip
      name="D1"
      footprint="jlcpcb:C7519"
      supplierPartNumbers={{ jlcpcb: ["C7519"] }}
      pcbX={0}
      pcbY={-10.795}
    />

    <resistor name="R3" resistance="10k" footprint="jlcpcb:C25744" supplierPartNumbers={{ jlcpcb: ["C25744"] }} pcbX={-8.89} pcbY={6.35} />
    <resistor name="R4" resistance="10k" footprint="jlcpcb:C25744" supplierPartNumbers={{ jlcpcb: ["C25744"] }} pcbX={8.89} pcbY={3.81} />
    <resistor name="R5" resistance="4.7k" footprint="jlcpcb:C25900" supplierPartNumbers={{ jlcpcb: ["C25900"] }} pcbX={4.445} pcbY={3.81} />
    <resistor name="R6" resistance="4.7k" footprint="jlcpcb:C25900" supplierPartNumbers={{ jlcpcb: ["C25900"] }} pcbX={0} pcbY={3.81} />
    <resistor name="R7" resistance="10k" footprint="jlcpcb:C25744" supplierPartNumbers={{ jlcpcb: ["C25744"] }} pcbX={-4.445} pcbY={3.81} />

    <capacitor name="C1" capacitance="1uF" footprint="jlcpcb:C52923" supplierPartNumbers={{ jlcpcb: ["C52923"] }} pcbX={-8.89} pcbY={3.81} />
    <capacitor name="C2" capacitance="10uF" footprint="jlcpcb:C15850" supplierPartNumbers={{ jlcpcb: ["C15850"] }} pcbX={-9} pcbY={-1.27} />
    <capacitor name="C3" capacitance="22uF" footprint="jlcpcb:C45783" supplierPartNumbers={{ jlcpcb: ["C45783"] }} pcbX={-22.185} pcbY={3.9} />
    <capacitor name="C4" capacitance="22uF" footprint="jlcpcb:C45783" supplierPartNumbers={{ jlcpcb: ["C45783"] }} pcbX={-27.2} pcbY={3.9} />
    <capacitor name="C5" capacitance="10uF" footprint="jlcpcb:C15850" supplierPartNumbers={{ jlcpcb: ["C15850"] }} pcbX={0} pcbY={6.35} />
    <capacitor name="C6" capacitance="1uF" footprint="jlcpcb:C52923" supplierPartNumbers={{ jlcpcb: ["C52923"] }} pcbX={4.445} pcbY={6.35} />
    <capacitor name="C7" capacitance="100nF" footprint="jlcpcb:C307331" supplierPartNumbers={{ jlcpcb: ["C307331"] }} pcbX={-4.445} pcbY={6.35} />
    <capacitor name="C8" capacitance="100nF" footprint="jlcpcb:C307331" supplierPartNumbers={{ jlcpcb: ["C307331"] }} pcbX={-13.8} pcbY={1.9} />
    <capacitor name="C9" capacitance="22uF" footprint="jlcpcb:C45783" supplierPartNumbers={{ jlcpcb: ["C45783"] }} pcbX={-9.8} pcbY={-6.35} />
    <capacitor name="C10" capacitance="100nF" footprint="jlcpcb:C307331" supplierPartNumbers={{ jlcpcb: ["C307331"] }} pcbX={-14.5} pcbY={-6.35} />
    <capacitor name="C11" capacitance="100nF" footprint="jlcpcb:C307331" supplierPartNumbers={{ jlcpcb: ["C307331"] }} pcbX={8.89} pcbY={6.35} />

    {STACK_PIN_NAMES.map((net, index) =>
      spareStackNets.includes(net) ? null : (
        <Fragment key={`J2-${index + 1}`}>
          <trace
            name={`J2_PIN${index + 1}_${net}`}
            from={`.J2 > .pin${index + 1}`}
            to={`net.${net}`}
            width={stackPowerWidths[net]}
          />
        </Fragment>
      ),
    )}

    {[4, 5, 6].map((pin) => (
      <Fragment key={`J1-GND-${pin}`}>
        <trace name={`J1_GND_${pin}`} from={`.J1 > .pin${pin}`} to="net.GND" />
      </Fragment>
    ))}
    <trace name="J1_VBUS" from=".J1 > .pin1" to="net.VBUS_5V" width="0.5mm" />
    <trace name="J1_DM" from=".J1 > .pin2" to="net.USB_DM_CONN" />
    <trace name="J1_DP" from=".J1 > .pin3" to="net.USB_DP_CONN" />

    {moduleGndPins.map((pin) => (
      <Fragment key={`U1-GND-${pin}`}>
        <trace name={`U1_GND_${pin}`} from={`.U1 > .pin${pin}`} to="net.GND" />
      </Fragment>
    ))}
    <trace name="U1_3V3" from=".U1 > .pin3" to="net.RAIL_3V3" />
    <trace name="U1_VBAT" from=".U1 > .pin15" to="net.RAIL_3V3" />
    <trace name="U1_EN" from=".U1 > .pin8" to="net.EN" />
    <trace name="U1_IRQ" from=".U1 > .pin12" to="net.IRQ_N" />
    <trace name="U1_CHAIN_OUT" from=".U1 > .pin16" to="net.CHAIN_OUT" />
    <trace name="U1_SCL" from=".U1 > .pin20" to="net.SCL" />
    <trace name="U1_SDA" from=".U1 > .pin21" to="net.SDA" />
    <trace name="U1_BOOT" from=".U1 > .pin23" to="net.BOOT" />
    <trace name="U1_CHAIN_IN" from=".U1 > .pin24" to="net.CHAIN_IN" />
    <trace name="U1_USB_DM" from=".U1 > .pin26" to="net.USB_DM" />
    <trace name="U1_USB_DP" from=".U1 > .pin27" to="net.USB_DP" />

    <trace name="U2_FB" from=".U2 > .pin1" to="net.RAIL_3V3" width="0.3mm" />
    <trace name="U2_EN" from=".U2 > .pin2" to="net.VBUS_5V" width="0.3mm" />
    <trace name="U2_VIN" from=".U2 > .pin3" to="net.VBUS_5V" width="0.3mm" />
    <trace name="U2_GND" from=".U2 > .pin4" to="net.GND" width="0.3mm" />
    <trace name="U2_SW" from=".U2 > .pin5" to="net.SW" width="0.3mm" />
    <trace name="U2_BST" from=".U2 > .pin6" to="net.BST" width="0.3mm" />

    <trace name="L1_SW" from=".L1 > .pin1" to="net.SW" width="0.5mm" />
    <trace name="L1_3V3" from=".L1 > .pin2" to="net.RAIL_3V3" width="0.3mm" />

    <trace name="D1_IO1_CONN" from=".D1 > .pin1" to="net.USB_DP_CONN" />
    <trace name="D1_GND" from=".D1 > .pin2" to="net.GND" />
    <trace name="D1_IO2_CONN" from=".D1 > .pin3" to="net.USB_DM_CONN" />
    <trace name="D1_IO2" from=".D1 > .pin4" to="net.USB_DM" />
    <trace name="D1_VBUS" from=".D1 > .pin5" to="net.VBUS_5V" />
    <trace name="D1_IO1" from=".D1 > .pin6" to="net.USB_DP" />

    <trace name="R3_3V3" from=".R3 > .pin1" to="net.RAIL_3V3" />
    <trace name="R3_EN" from=".R3 > .pin2" to="net.EN" />
    <trace name="R4_3V3" from=".R4 > .pin1" to="net.RAIL_3V3" />
    <trace name="R4_BOOT" from=".R4 > .pin2" to="net.BOOT" />
    <trace name="R5_3V3" from=".R5 > .pin1" to="net.RAIL_3V3" />
    <trace name="R5_SDA" from=".R5 > .pin2" to="net.SDA" />
    <trace name="R6_3V3" from=".R6 > .pin1" to="net.RAIL_3V3" />
    <trace name="R6_SCL" from=".R6 > .pin2" to="net.SCL" />
    <trace name="R7_3V3" from=".R7 > .pin1" to="net.RAIL_3V3" />
    <trace name="R7_IRQ" from=".R7 > .pin2" to="net.IRQ_N" />

    <trace name="C1_EN" from=".C1 > .pin1" to="net.EN" />
    <trace name="C1_GND" from=".C1 > .pin2" to="net.GND" />
    <trace name="C2_VBUS" from=".C2 > .pin1" to="net.VBUS_5V" width="0.5mm" />
    <trace name="C2_GND" from=".C2 > .pin2" to="net.GND" width="0.5mm" />
    <trace name="C3_3V3" from=".C3 > .pin1" to="net.RAIL_3V3" width="0.3mm" />
    <trace name="C3_GND" from=".C3 > .pin2" to="net.GND" width="0.5mm" />
    <trace name="C4_3V3" from=".C4 > .pin1" to="net.RAIL_3V3" width="0.3mm" />
    <trace name="C4_GND" from=".C4 > .pin2" to="net.GND" width="0.5mm" />
    <trace name="C5_3V3" from=".C5 > .pin1" to="net.RAIL_3V3" />
    <trace name="C5_GND" from=".C5 > .pin2" to="net.GND" />
    <trace name="C6_3V3" from=".C6 > .pin1" to="net.RAIL_3V3" />
    <trace name="C6_GND" from=".C6 > .pin2" to="net.GND" />
    <trace name="C7_3V3" from=".C7 > .pin1" to="net.RAIL_3V3" />
    <trace name="C7_GND" from=".C7 > .pin2" to="net.GND" />
    <trace name="C8_BST" from=".C8 > .pin1" to="net.BST" />
    <trace name="C8_SW" from=".C8 > .pin2" to="net.SW" />
    <trace name="C9_VBUS" from=".C9 > .pin1" to="net.VBUS_5V" width="0.5mm" />
    <trace name="C9_GND" from=".C9 > .pin2" to="net.GND" width="0.5mm" />
    <trace name="C10_VBUS" from=".C10 > .pin1" to="net.VBUS_5V" width="0.5mm" />
    <trace name="C10_GND" from=".C10 > .pin2" to="net.GND" width="0.5mm" />
    <trace name="C11_3V3" from=".C11 > .pin1" to="net.RAIL_3V3" />
    <trace name="C11_GND" from=".C11 > .pin2" to="net.GND" />

  </board>
)
