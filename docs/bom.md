# Bill of materials

The board's SMD parts are all on the top side. Basic parts are used wherever a Basic part fits. Every Extended part is listed below with the reason no Basic equivalent fits.

| Designator | Part | JLCPCB Part # | Class | Why this part |
| --- | --- | --- | --- | --- |
| U1 | ESP32-H2-MINI-1-H4 | C20416123 | Extended | The current ESP32-H2-MINI-1 variant with the on-board PCB antenna and 4 MB flash; no Basic RF module exists. |
| J1 | USB-ZL-111PWB, USB 2.0 male A plug, 4P + shield | C5292498 | Extended | No Basic male USB-A PCB plug; a receptacle cannot plug directly into a charger. Its shield pins 5/6 are plated through-hole pads, not SMD. |
| J2 | PM254-2-08-S-8.5, 2×8 2.54 mm SMD female header | C3975153 | Extended | No Basic 2×8 2.54 mm SMD female header; through-hole equivalents are not single-side SMT. |
| U2 | AP63203WU-7, 3.3 V 2 A synchronous buck | C780769 | Extended | No Basic 3.3 V fixed-output buck converter; a Basic LDO would violate the buck requirement. |
| L1 | PRS6020-4R7MT, 4.7 µH 2 A shielded inductor | C105672 | Extended | No Basic power inductor in this value and current class. |
| D1 | USBLC6-2SC6, USB ESD array | C7519 | Extended | No Basic USB ESD array covering VBUS and two data lines. |

J1 is the only part with through-hole pins: its shield pins 5 and 6 are plated through-holes that top-side reflow does not fill, so they need hand or wave soldering to ground the shell and carry the plug's mechanical load.

Basic parts: R3–R7 (0402 resistors) and C1–C11 (0402/0805 capacitors). The board source and the generated `release/boards-motherboard-bom.csv` carry the exact values and part numbers.
