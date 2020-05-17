// TODO: Fix this eslint
/* eslint-disable react/jsx-filename-extension */
import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import { Canvas } from "react-three-fiber";
import Tractor from "./components/Tractor";
import Controls from "./components/Controls";
import Lights from "./components/Lights";
import Grid from "./components/Grid";

// const simUpdater = {
//   socket: null,

//   start() {
//     const url = "ws://localhost:8989/simsocket";
//     simUpdater.socket = new WebSocket(url);
//     simUpdater.socket.onmessage = (event) => {
//       simUpdater.showMessage(JSON.parse(event.data));
//     };
//   },

//   showMessage(message) {
//     const p = message.world_translation_tractor;
//     const q = message.world_quaternion_tractor;
//     tractorMesh.position.set(p[0], p[1], p[2]);
//     tractorMesh.quaternion.set(q[0], q[1], q[2], q[3]);
//     xAxis.position.set(p[0], p[1], p[2]);
//     xAxis.quaternion.set(q[0], q[1], q[2], q[3]);
//   }
// };

ReactDOM.render(
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
      <Tractor position={[0, 0, 0]} rotation={[0, 0, 0]} />
    </Suspense>
  </Canvas>,
  document.getElementById("scene")
);
