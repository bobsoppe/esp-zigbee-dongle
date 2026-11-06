# CO2 + temperature/humidity daughterboard

Physical facts for [`boards/daughters/co2-temp-hum.circuit.tsx`](../../boards/daughters/co2-temp-hum.circuit.tsx). The stack pinout is declared only in [`lib/stack-interface.tsx`](../../lib/stack-interface.tsx); this file does not repeat the pin order. Assembly and BOM notes: [`docs/assembly.md`](../assembly.md).

## Outline

- Board outline: 60.0 mm x 40.0 mm rectangle, centred on the board origin.
- Four unplated 2.7 mm M2.5 clearance holes at the `STACK_HOLE_POSITIONS` coordinates: (-26.0, 16.0), (26.0, 16.0), (-26.0, -16.0), (26.0, -16.0) mm.

## Sensor placement

All components are on the top side.

| Designator | Part | Centre (x, y) mm | Notes |
| --- | --- | ---: | --- |
| U1 | SCD41 | -4.0, 4.0 | NDIR CO2 sensor; air aperture faces up, away from the motherboard |
| U2 | SHT40 | -14.0, -9.0 | Temperature/humidity sensor; placed away from U3 |
| U3 | AMS1117-3.3 | -21.0, 11.0 | Local 3.3 V LDO, the main heat source |

## Stack height

The stack pitch to the next board is at least 15.4 mm, per [`docs/board.md`](../board.md). J1 is an SSQ-108-24-G-D: its 14.83 mm tails pass 1.6 mm through the board, leaving 13.23 mm below it. At the SSQ datasheet's 6.35 mm maximum insertion into the PM254-2-08-S-8.5's 8.5 mm-high J2 socket, the tail spans 6.88 mm above the socket opening, so the board-to-board pitch is 8.5 + 6.88 = 15.4 mm. The four standoffs are 15.4 mm minimum; a standard 16 mm M2.5 standoff also fits (about 5.7 mm SSQ insertion), as recorded in [`docs/board.md`](../board.md)'s Stack hardware section. This board is slot 0, directly above the motherboard; the next board's PCB sits about 15.4 mm above this board's PCB.

## Air access

The enclosure must expose the SCD41's top gas aperture. The SCD41 body is 10.1 mm x 10.1 mm centred at (-4.0, 4.0) mm, so the minimum clear opening directly above it is 10.1 mm x 10.1 mm (102.01 mm²), spanning x = -9.05 mm to +1.05 mm and y = -1.05 mm to +9.05 mm. Use a larger opening where the enclosure allows. Do not cover the aperture with board material, a label, or another component.

## Antenna keep-out

The motherboard antenna keep-out is x = -6.6 mm to +6.6 mm, y = +20.0 mm to +25.4 mm, as recorded in [`docs/board.md`](../board.md). This board's outline ends at y = +20.0 mm, and its copper is inset from the outline by at least the 0.2 mm board-edge clearance, so neither the outline nor any copper enters the keep-out.
