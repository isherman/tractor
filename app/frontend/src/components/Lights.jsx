import React from "react";

function Lights() {
  return (
    <group>
      <directionalLight color={0xffffff} position={[1, 1, 1]} />
      <directionalLight color={0x002288} position={[-1, -1, -1]} />
      <ambientLight color={0x222222} />
    </group>
  );
}

export default Lights;
