/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from "react";
import { useLoader } from "react-three-fiber";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";

function Tractor() {
  const [hovered, setHover] = useState(false);

  const stl = useLoader(STLLoader, "./stl/tractor.v0.stl"); // TODO: Consider importing

  return (
    <mesh
      castShadow
      receiveShadow
      scale={[0.001, 0.001, 0.001]}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <bufferGeometry attach="geometry" {...stl} />
      <meshPhongMaterial
        attach="material"
        color={hovered ? "hotpink" : "#ff5533"}
        specular="#111111"
        shininess={200}
      />
    </mesh>
  );
}
export default Tractor;
