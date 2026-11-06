# CO2 + temperature/humidity daughterboard assembly

Board source: [`boards/daughters/co2-temp-hum.circuit.tsx`](../boards/daughters/co2-temp-hum.circuit.tsx). Physical facts: [`docs/daughters/co2-temp-hum.md`](./daughters/co2-temp-hum.md). The stack pinout is declared only in [`lib/stack-interface.tsx`](../lib/stack-interface.tsx).

## Placed parts

| Designator | Part | JLCPCB Part # | Package | Class |
| --- | --- | --- | --- | --- |
| U1 | SCD41-D-R2 | C3659294 | LGA-20 land pattern + centre GND pad, 10.1 mm x 10.1 mm | Extended |
| U2 | SHT40-AD1B-R2 | C2909890 | DFN-4-EP, 1.5 mm x 1.5 mm | Extended |
| U3 | AMS1117-3.3 | C6186 | SOT-223 | Basic |
| C1 | 10 µF 0805 ceramic | C15850 | 0805 | Basic |
| C2 | 22 µF 16 V tantalum | C6245788 | 1206 | Extended |
| C3 | 10 µF 0805 ceramic | C15850 | 0805 | Basic |
| C4 | 100 nF 0402 ceramic | C307331 | 0402 | Basic |
| C5 | 100 nF 0402 ceramic | C307331 | 0402 | Basic |

`release/boards-daughters-co2-temp-hum-bom.csv` is generated from this set, and every row carries its JLCPCB part number.

## Local 3.3 V sensor rail

U3 is an AMS1117-3.3 in SOT-223, rated for 1 A. It takes VBUS_5V and produces `SENSOR_3V3`. No copper connects `SENSOR_3V3` to `RAIL_3V3`, so this board neither sources nor back-feeds the stack rail. C1 (10 µF) is the input capacitor; C2 (22 µF tantalum) is the output capacitor the AMS1117 datasheet specifies for stability.

At 205 mA and 5.25 V input:

- Power dissipation: (5.25 V - 3.3 V) x 0.205 A = 0.400 W.
- Junction temperature at 25 °C ambient with the SOT-223 θJA = 90 °C/W: 25 °C + 0.400 W x 90 °C/W = 61.0 °C.
- Rated maximum junction temperature: 125 °C. Margin: 64.0 °C.
- With a conservative 150 °C/W bound: 25 °C + 0.400 W x 150 °C/W = 85.0 °C, still 40.0 °C below the 125 °C rating.

## Sensor decoupling

The SCD41 datasheet requires VDD and VDDH tied together close to the part and decoupled on that combined rail. U1 pin 7 (VDD) and pin 19 (VDDH) both land on `SENSOR_3V3`; C3 (10 µF) is the bulk capacitor and C4 (100 nF) the high-frequency capacitor to GND. The SHT40 datasheet specifies a 100 nF supply bypass; C5 is that capacitor from U2 VDD to VSS. All five capacitors are BOM rows.

## I2C

U1 is the SCD41 at 0x62; U2 is the SHT40 at 0x44. Both sit on the `SDA` and `SCL` nets. This board adds no I2C pull-ups: the motherboard's R5 and R6 are the bus pull-ups, 4.7 kΩ to `RAIL_3V3`.

The SCD41 and SHT40 SDA/SCL absolute maximum is VDD + 0.3 V. With `SENSOR_3V3` unpowered and the motherboard bus powered, the 4.7 kΩ pull-ups to `RAIL_3V3` would hold SDA/SCL at up to 3.3 V and forward-bias the sensor ESD diodes. Do not power the bus with the local rail off. In the stack, VBUS_5V and RAIL_3V3 come from the same motherboard input and `SENSOR_3V3` is derived from VBUS_5V, so the local rail comes up with the bus; losing only the LDO output is a fault state, not an operating mode.

## Hand-fitted stack connector

J1 is an SSQ-108-24-G-D, a Samtec 2x8, 2.54 mm stackable female socket strip with an 8.51 mm body and 14.83 mm square tails, through-hole. J1's land pattern is the generic 2x8 THT female-header footprint `jlcpcb:C30734`, whose interleaved pin numbering matches J2. J2 is the PM254-2-08-S-8.5: its socket contacts are on the 2.54 mm grid at x = 21.23 mm and 23.77 mm, while its SMD pads are wider and further out, so J1 pin 1 at (23.77, -8.89) mm lands on J2 pin 1. The 14.83 mm tails pass through this board and plug into J2; the 8.51 mm socket accepts the next board's tails. It is marked `doNotPlace`: it appears in no BOM row and no CPL row, and JLCPCB does not fit it. It sits at `STACK_HEADER_XY` (22.5 mm, 0 mm), rotated 90°, so the board plugs into the board below and accepts the board above.

## Assembly note

Use JLCPCB Standard PCBA. The SCD41 is MSL 3 and JLCPCB lists X-ray inspection as required for C3659294; Standard PCBA provides it. Economic PCBA is not acceptable for this board. The two sensors are the JLCPCB parts named above; do not substitute them.

## Stack position

This is a single-instance, slot-0 board: slot 0 is the board directly above the motherboard. A second identical board in one stack is out of scope until the stack contract gains an addressing mechanism.
