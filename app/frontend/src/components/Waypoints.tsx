/* eslint-disable react/no-array-index-key */
/* eslint-disable react/prop-types */
import { useState } from "react";
import * as React from "react";
import Waypoint from "./Waypoint";
import { webSocketClient } from "../config";
import { Vector3 } from "three";

type WaypointsProps = {
  waypoints: Vector3[];
}

function Waypoints({ waypoints }: WaypointsProps) {
  const [goal, setGoal] = useState<number | null>(null);

  const selectGoal = (index: number) => {
    setGoal(goal === index ? null : index);
    webSocketClient.send(waypoints[index]);
  };

  const waypointObjects = waypoints.map((waypoint, index) => (
    <Waypoint
      key={index}
      position={waypoint}
      isGoal={goal === index}
      onClick={(_) => selectGoal(index)}
    />
  ));
  return <group>{waypointObjects}</group>;
}

export default Waypoints;
