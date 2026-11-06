import { Fragment } from "react"

import {
  STACK_HEADER_PITCH,
  STACK_HEADER_ROTATION,
  STACK_HEADER_ROWS,
  STACK_HEADER_XY,
  STACK_HOLE_POSITIONS,
  STACK_PIN_COUNT,
  STACK_PIN_NAMES,
} from "../../lib/stack-interface"

// Contract pins that this board leaves open. Declaring them no-connect keeps
// them out of the trace checker while the connector still carries all 16 pins.
const STACK_NO_CONNECT: readonly string[] = [
  "RAIL_3V3",
  "CHAIN_IN",
  "CHAIN_OUT",
  "IRQ_N",
  "AUX_A",
  "AUX_B",
]

// SCD41 DNC pads: the datasheet requires them soldered to floating pads.
const SCD41_DNC_PINS = [1, 2, 3, 4, 5, 8, 11, 12, 13, 14, 15, 16, 17, 18] as const

const SCD41_PIN_ATTRIBUTES = {
  ...Object.fromEntries(
    SCD41_DNC_PINS.map((pin) => [pin, { doNotConnect: true }]),
  ),
  6: { requiresGround: true },
  7: { requiresPower: true },
  19: { requiresPower: true },
  20: { requiresGround: true },
  21: { requiresGround: true },
}

const SENSOR_RAIL = "SENSOR_3V3"

const STACK_TRACE_WIDTHS: Partial<
  Record<(typeof STACK_PIN_NAMES)[number], string>
> = {
  VBUS_5V: "0.3mm",
  GND: "0.3mm",
}

// J1's generic 2x8 THT land pattern numbers pins interleaved by row, matching J2.

export default () => (
  <board name="co2-temp-hum" width="60mm" height="40mm">
    {["VBUS_5V", "GND", "SDA", "SCL", SENSOR_RAIL].map((net) => (
      <Fragment key={net}>
        <net name={net} />
      </Fragment>
    ))}

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

    <pinheader
      name="J1"
      pinCount={STACK_PIN_COUNT}
      doubleRow={STACK_HEADER_ROWS === 2}
      pitch={`${STACK_HEADER_PITCH}mm`}
      gender="female"
      isSmt={false}
      footprint="jlcpcb:C30734"
      pinLabels={[...STACK_PIN_NAMES]}
      manufacturerPartNumber="SSQ-108-24-G-D"
      pinAttributes={Object.fromEntries(
        STACK_NO_CONNECT.map((label) => [label, { doNotConnect: true }]),
      )}
      pcbX={STACK_HEADER_XY.x}
      pcbY={STACK_HEADER_XY.y}
      pcbRotation={STACK_HEADER_ROTATION}
      connectsFromAbove
      doNotPlace
    />

    <chip
      name="U1"
      footprint="jlcpcb:C3659294"
      supplierPartNumbers={{ jlcpcb: ["C3659294"] }}
      manufacturerPartNumber="SCD41-D-R2"
      pinAttributes={SCD41_PIN_ATTRIBUTES}
      pcbX={-4}
      pcbY={4}
    />

    <chip
      name="U2"
      footprint="jlcpcb:C2909890"
      supplierPartNumbers={{ jlcpcb: ["C2909890"] }}
      manufacturerPartNumber="SHT40-AD1B-R2"
      pinAttributes={{
        3: { requiresPower: true },
        4: { requiresGround: true },
        5: { requiresGround: true },
      }}
      pcbX={-14}
      pcbY={-9}
    />

    <chip
      name="U3"
      footprint="jlcpcb:C6186"
      supplierPartNumbers={{ jlcpcb: ["C6186"] }}
      manufacturerPartNumber="AMS1117-3.3"
      pinLabels={{ 1: "GND", 2: "VOUT", 3: "VIN", 4: "TAB" }}
      pinAttributes={{
        1: { requiresGround: true },
        2: { providesPower: true },
        3: { requiresPower: true },
        4: { providesPower: true },
      }}
      pcbX={-21}
      pcbY={11}
    />

    <capacitor
      name="C1"
      capacitance="10uF"
      footprint="jlcpcb:C15850"
      supplierPartNumbers={{ jlcpcb: ["C15850"] }}
      pcbX={-14.5}
      pcbY={11}
    />

    <capacitor
      name="C2"
      capacitance="22uF"
      polarized
      footprint="jlcpcb:C6245788"
      supplierPartNumbers={{ jlcpcb: ["C6245788"] }}
      pcbX={-12.5}
      pcbY={7.5}
    />

    <capacitor
      name="C3"
      capacitance="10uF"
      footprint="jlcpcb:C15850"
      supplierPartNumbers={{ jlcpcb: ["C15850"] }}
      pcbX={-12.5}
      pcbY={0}
    />

    <capacitor
      name="C4"
      capacitance="100nF"
      footprint="jlcpcb:C307331"
      supplierPartNumbers={{ jlcpcb: ["C307331"] }}
      pcbX={-1.5}
      pcbY={-3.5}
    />

    <capacitor
      name="C5"
      capacitance="100nF"
      footprint="jlcpcb:C307331"
      supplierPartNumbers={{ jlcpcb: ["C307331"] }}
      pcbX={-14}
      pcbY={-12}
    />

    {STACK_PIN_NAMES.map((net, index) =>
      STACK_NO_CONNECT.includes(net) ? null : (
        <Fragment key={`J1-${index + 1}`}>
          <trace
            name={`J1_PIN${index + 1}_${net}`}
            from={`.J1 > .pin${index + 1}`}
            to={`net.${net}`}
            width={STACK_TRACE_WIDTHS[net]}
          />
        </Fragment>
      ),
    )}

    <trace name="U3_VIN" from=".U3 > .pin3" to="net.VBUS_5V" width="0.3mm" />
    <trace name="U3_GND" from=".U3 > .pin1" to="net.GND" width="0.3mm" />
    <trace name="U3_VOUT" from=".U3 > .pin2" to={`net.${SENSOR_RAIL}`} width="0.3mm" />
    <trace name="U3_TAB" from=".U3 > .pin4" to={`net.${SENSOR_RAIL}`} width="0.3mm" />

    <trace name="C1_VBUS" from=".C1 > .pin1" to="net.VBUS_5V" width="0.3mm" />
    <trace name="C1_GND" from=".C1 > .pin2" to="net.GND" width="0.3mm" />
    <trace name="C2_RAIL" from=".C2 > .pin1" to={`net.${SENSOR_RAIL}`} width="0.3mm" />
    <trace name="C2_GND" from=".C2 > .pin2" to="net.GND" width="0.3mm" />
    <trace name="C3_RAIL" from=".C3 > .pin1" to={`net.${SENSOR_RAIL}`} width="0.3mm" />
    <trace name="C3_GND" from=".C3 > .pin2" to="net.GND" width="0.3mm" />
    <trace name="C4_RAIL" from=".C4 > .pin1" to={`net.${SENSOR_RAIL}`} />
    <trace name="C4_GND" from=".C4 > .pin2" to="net.GND" />
    <trace name="C5_RAIL" from=".C5 > .pin1" to={`net.${SENSOR_RAIL}`} />
    <trace name="C5_GND" from=".C5 > .pin2" to="net.GND" />

    <trace name="U1_VDD" from=".U1 > .pin7" to={`net.${SENSOR_RAIL}`} width="0.3mm" />
    <trace name="U1_VDDH" from=".U1 > .pin19" to={`net.${SENSOR_RAIL}`} width="0.3mm" />
    <trace name="U1_GND_6" from=".U1 > .pin6" to="net.GND" />
    <trace name="U1_GND_20" from=".U1 > .pin20" to="net.GND" />
    <trace name="U1_GND_21" from=".U1 > .pin21" to="net.GND" />
    <trace name="U1_SCL" from=".U1 > .pin9" to="net.SCL" />
    <trace name="U1_SDA" from=".U1 > .pin10" to="net.SDA" />

    <trace name="U2_SDA" from=".U2 > .pin1" to="net.SDA" />
    <trace name="U2_SCL" from=".U2 > .pin2" to="net.SCL" />
    <trace name="U2_VDD" from=".U2 > .pin3" to={`net.${SENSOR_RAIL}`} />
    <trace name="U2_VSS" from=".U2 > .pin4" to="net.GND" />
    <trace name="U2_EP" from=".U2 > .pin5" to="net.GND" />
  </board>
)
