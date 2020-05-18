import React, { Suspense, useState } from "react";
import { Canvas } from "react-three-fiber";
import Tractor from "./Tractor";
import Controls from "./Controls";
import Lights from "./Lights";
import Ground from "./Ground";
import Waypoints from "./Waypoints";

function Scene() {
  const [waypoints, setWaypoints] = useState([]);

  const onGroundClick = (event) => {
    setWaypoints([...waypoints, event.point]);
  };

  return (
    <Canvas
      style={{ background: "#cccccc" }}
      camera={{
        position: [2.5, 2.5, 2.5],
        fov: 60,
        near: 0.1,
        far: 500,
        up: [0, 0, 1]
      }}
    >
      <Lights />
      <Ground onClick={onGroundClick} />
      <fogExp2 args={["#cccccc", 0.02]} />
      <Controls />
      <Suspense fallback={null}>
        <Tractor />
      </Suspense>
      <Waypoints waypoints={waypoints} />
    </Canvas>
  );
}

export default Scene;
