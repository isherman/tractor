import React, { useRef } from "react";
import { extend, useThree, useFrame } from "react-three-fiber";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

extend({ OrbitControls });

function Controls() {
  const ref = useRef();
  const { camera, gl } = useThree();

  useFrame(() => ref.current && ref.current.update());

  return (
    <orbitControls
      ref={ref}
      args={[camera, gl.domElement]}
      enableDamping
      dampingFactor={0.05}
      screenSpacePanning={false}
      maxDistance={100}
      minDistance={0.1}
      maxPolarAngle={Math.PI / 2}
    />
  );
}

export default Controls;
