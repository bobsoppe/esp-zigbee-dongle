
// RC smoke-test coupon, not the ESP32-H2 product board.
export default () => (
  <board name="rc-smoke-test-placeholder" width="10mm" height="10mm">
    <resistor
      name="R1"
      resistance="1k"
      footprint="jlcpcb:C11702"
      supplierPartNumbers={{ jlcpcb: ["C11702"] }}
      schX={3}
      pcbX={3}
    />
    <capacitor
      name="C1"
      capacitance="1000pF"
      footprint="jlcpcb:C1523"
      supplierPartNumbers={{ jlcpcb: ["C1523"] }}
      schX={-3}
      pcbX={-3}
    />
    <trace from=".R1 > .pin1" to=".C1 > .pin1" />
  </board>
)
