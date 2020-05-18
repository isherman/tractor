/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/prop-types */
import React, { useState } from "react";

function Waypoint({ isGoal, ...props }) {
  const [hovered, setHover] = useState(false);

  const color = isGoal ? "hotpink" : hovered ? "blue" : "gray";

  const onClick = (event) => {
    event.stopPropagation();
    props.onClick();
  };

  return (
    <mesh
      {...props}
      onClick={onClick}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      rotation-x={Math.PI / 2}
    >
      <cylinderBufferGeometry attach="geometry" args={[0.2, 0.2, 0.05, 32]} />
      <meshStandardMaterial attach="material" color={color} />
    </mesh>
  );
}

export default Waypoint;
