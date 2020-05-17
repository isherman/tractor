import React, { Suspense, useState, useEffect } from "react";
import { Canvas } from "react-three-fiber";
import Tractor from "./Tractor";
import Controls from "./Controls";
import Lights from "./Lights";
import Grid from "./Grid";

const socket = new WebSocket("ws://localhost:8989/simsocket");

function Scene() {
  const [position, setPosition] = useState([0, 0, 0]);
  const [quaternion, setQuaternion] = useState([0, 0, 0, 0]);

  useEffect(() => {
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setPosition(message.world_translation_tractor);
      setQuaternion(message.world_quaternion_tractor);
    };
  }, [position, quaternion]);

  return (
    <Canvas
      style={{ background: "#cccccc" }}
      camera={{
        position: [2.5, 2.5, 2.5],
        fov: 60,
        near: 0.001,
        far: 500,
        up: [0, 0, 1]
      }}
    >
      <Lights />
      <Grid />
      <Controls />
      <Suspense fallback={null}>
        <Tractor position={position} quaternion={quaternion} />
      </Suspense>
    </Canvas>
  );
}

export default Scene;
