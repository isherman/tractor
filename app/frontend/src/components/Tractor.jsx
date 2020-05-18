/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useState, useEffect } from "react";
import { useLoader } from "react-three-fiber";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { webSocketClient } from "../config";

function Tractor() {
  // TODO: Should this be bundled?
  const stl = useLoader(STLLoader, "./stl/tractor.v0.stl");

  const [position, setPosition] = useState([0, 0, 0]);
  const [quaternion, setQuaternion] = useState([0, 0, 0, 1]);

  useEffect(() => {
    webSocketClient.on("message", (message) => {
      setPosition(message.world_translation_tractor);
      setQuaternion(message.world_quaternion_tractor);
    });
  }, [position, quaternion]);

  return (
    <group position={position} quaternion={quaternion}>
      <axesHelper />
      <mesh castShadow receiveShadow scale={[0.001, 0.001, 0.001]}>
        <bufferGeometry attach="geometry" {...stl} />
        <meshPhongMaterial
          attach="material"
          color="#ff5533"
          specular="#111111"
          shininess={200}
        />
      </mesh>
    </group>
  );
}
export default Tractor;
