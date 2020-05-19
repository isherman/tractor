import * as React from "react";
import { Color } from "three";

function Lights() {
  return (
    <group>
      <directionalLight color={new Color(0xffffff)} position={[1, 1, 1]} />
      <directionalLight color={new Color(0x002288)} position={[-1, -1, -1]} />
      <ambientLight color={new Color(0x222222)} />
    </group>
  );
}

export default Lights;
