import React from "react";

function Grid() {
  return (
    <group>
      <axesHelper />
      <gridHelper args={[400, 400]} rotation={[-Math.PI / 2, 0, 0]} />
      <fogExp2 args={["#cccccc", 0.02]} />
    </group>
  );
}

export default Grid;
