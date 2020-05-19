/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-props-no-spreading */
import { useState, useEffect } from "react";
import * as React from "react";
import { useLoader, ReactThreeFiber } from "react-three-fiber";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { webSocketClient } from "../config";
import { Quaternion, Vector3, Color } from "three";

function Tractor() {
  // TODO: Should this be bundled?
  const stl = useLoader(STLLoader, "./stl/tractor.v0.stl");

  const [position, setPosition] = useState<ReactThreeFiber.Vector3>(new Vector3());
  const [quaternion, setQuaternion] = useState<THREE.Quaternion>(new Quaternion());

  useEffect(() => {
    webSocketClient.on("message", (message) => {
      setPosition(new Vector3(...message.world_translation_tractor));
      setQuaternion(new Quaternion(...message.world_quaternion_tractor));
    });
  }, [position, quaternion]);

  return (
    <group position={position} quaternion={quaternion}>
      <axesHelper />
      <mesh castShadow receiveShadow scale={[0.001, 0.001, 0.001]}>
        <bufferGeometry attach="geometry" {...stl} />
        <meshPhongMaterial
          attach="material"
          color={new Color("#ff5533")}
          specular={new Color("#111111")}
          shininess={200}
        />
      </mesh>
    </group>
  );
}
export default Tractor;
