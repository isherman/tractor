/* eslint-disable react/prop-types */
import * as React from "react";

function Ground(props) {
  const onClick = (event) => {
    if (!event.altKey) {
      return;
    }
    props.onClick(event);
  };

  return (
    <group>
      <axesHelper />
      <gridHelper
        args={[400, 400]}
        position={[0, 0, 0.1]}
        rotation={[Math.PI / 2, 0, 0]}
      />
      <mesh receiveShadow onClick={onClick}>
        <planeBufferGeometry attach="geometry" args={[1000, 1000]} />
        <meshPhongMaterial attach="material" color="#dddddd" />
      </mesh>
    </group>
  );
}

export default Ground;
