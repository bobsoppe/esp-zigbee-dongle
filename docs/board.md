# Motherboard physical facts

The stack pinout is declared only in [`lib/stack-interface.tsx`](../lib/stack-interface.tsx). This file records the board's physical facts and does not repeat the pin order.

## Outline

- Board outline: 60.0 mm × 40.0 mm rectangle, centred on the board origin.

## Ground

The GND pour runs on inner layer 1 and on the top layer; the inner1 pour is channelled around the inner-layer signals and the top pour around the top-layer traces. The antenna region is outside the 60 mm × 40 mm outline, so neither pour enters the antenna keep-out.

## Standoff holes

The stack is carried by four standoffs, not by the header. Each hole is unplated and 2.7 mm in diameter (M2.5 clearance), at the coordinates exported by `STACK_HOLE_POSITIONS`:

| Hole | X (mm) | Y (mm) | Diameter (mm) |
| --- | ---: | ---: | ---: |
| H1 | -26.0 | 16.0 | 2.7 |
| H2 | 26.0 | 16.0 | 2.7 |
| H3 | -26.0 | -16.0 | 2.7 |
| H4 | 26.0 | -16.0 | 2.7 |

### Stack hardware

Four M2.5 hex standoffs per board gap carry the stack; the header is not load-bearing. Use 15.4 mm minimum length to match the SSQ/J2 seated height. A standard 16 mm M2.5 standoff also fits: the SSQ-108-24-G-D's 14.83 mm tails then engage the socket by about 5.7 mm, inside the socket's 3.68–6.35 mm insertion range. Do not use 15 mm: it over-inserts the SSQ tails by about 0.4 mm. M2.5 pan-head screws pass through the 2.7 mm unplated holes. Nylon or brass is acceptable; if brass, the standoff must seat on solder mask and must not bridge exposed copper.

## Stack header

The 2×8, 2.54 mm receptacle centre is exported as `STACK_HEADER_XY` and its orientation as `STACK_HEADER_ROTATION`; it sits at (22.5, 0.0) mm, rotated 90°, on the +X short edge, with 3.0 mm between its courtyard and the outline. Keeping the stack connector on an edge leaves the board centre free for the module's support parts; the four standoffs, not the header, carry the stack.

Pins 13 and 14 keep their `AUX_A`/`AUX_B` labels but carry nothing on this board, so they are left untraced and the checker reports them as missing a trace. That warning is expected, not an unfinished connection.

## USB-A input

The board plugs straight into a USB-A charger, so the input is a male USB-A plug on the -Y (bottom) long edge, centred at x = 0, with its tongue pointing off the board. The ESP32-H2 module's antenna is on the opposite long edge, so the charger ends up at the far end from the antenna.

- Four 2.0 mm × 0.8 mm signal pads at y ≈ -14.6 mm: pin 1 VBUS at x = +3.5 mm, pin 2 D- at +1.0 mm, pin 3 D+ at -1.0 mm, pin 4 GND at -3.5 mm.
- Two plated shield pads, 1.46 mm × 3.0 mm copper with a 0.86 mm × 2.4 mm drill, at x ≈ ±5.8 mm and y ≈ -17.2 mm, tied to GND. Their copper stops 1.3 mm inside the -20.0 mm edge, so no copper or drill crosses the outline.
- Two 1.0 mm unplated locating holes at x ≈ ±2.2 mm and y ≈ -17.0 mm, with matching copper cutouts.
- The connector footprint courtyard spans y ≈ -35.2 mm to -13.4 mm, so the plug overhangs the -20.0 mm edge by ≈15.2 mm and the inserted plug carries the board. A stack heavier than the motherboard itself needs an enclosure support or a USB extension cable.

## Placement

Parts follow the signal path so no net crosses the board twice: the USB-A plug and its ESD array sit on the -Y edge; the buck block sits in the left column with the input capacitor against U2, the inductor turned so its switch pad faces U2, and the output capacitors beside the inductor; the module's EN network and decoupling form two rows directly under the module's pad row; and the stack header occupies the +X edge. The free space is the centre-right band between the header and the module.

## Ground and the routing deviation

Inner1 is **not** a complete plane: the autorouter places signal traces there and the pour is cut around them.

Espressif's four-layer reference keeps layer 2 as solid GND with no signal traces. Meeting that here means hand-authoring every trace and disabling the autorouter, and in this toolchain disabling routing also bypasses its clearance and connectivity checks (`routingDisabled` skips routing DRC), so the board would ship with no automated design-rule check at all. The trade was made the other way: keep the autorouter and its DRC, accept a channelled inner1, and use the top-layer pour as the USB pair's reference plane.

The USB pair is therefore neither impedance-controlled nor length-matched — it is routed as two single-ended nets. That is acceptable for the ESP32-H2's USB Serial/JTAG, which is Full-Speed (12 Mbit/s). Revisit both decisions together if the design moves to High-Speed USB, or if a future revision needs a solid reference plane.

## Thermal path

The ESP32-H2 module's exposed pad is deliberately not via-stitched: the gaps between its EPAD pads are too small for a via at the board's clearance rules (the pad geometry is owned by the committed module footprint), and via-in-pad would need filled and capped vias. At module-only load — no daughterboard — the pads and both GND pours carry the heat. Revisit if the load grows or the buck runs hot.

## Fiducials

None. `<fiducial>` serialises its pad as covered by solder mask, and the Gerber writer skips the mask flash for that flag, so the pad would be tented; the local-footprint alternative re-seeds a GND/VBUS clearance violation in the router. Add them at panelisation or in a later revision.

## Antenna keep-out

The ESP32-H2-MINI-1 module is placed at the top edge with its PCB antenna overhanging the outline. The antenna keep-out is 13.2 mm wide × 5.4 mm deep and lies entirely outside the 60 mm × 40 mm outline, spanning x = -6.6 mm to +6.6 mm and y = +20.0 mm to +25.4 mm. The module courtyard extends 0.2 mm beyond the keep-out. No copper, solder mask, or board material may occupy that rectangle. Keep at least 15 mm of clear space above the antenna in the finished stack and enclosure.
