/* eslint-disable react/no-array-index-key */
/* eslint-disable react/prop-types */
import React, { useState } from "react";
import Waypoint from "./Waypoint";
import { webSocketClient } from "../config";

function Waypoints({ waypoints }) {
  const [goal, setGoal] = useState(null);

  const selectGoal = (index) => {
    setGoal(goal === index ? null : index);
    webSocketClient.send(waypoints[index]);
  };

  const waypointObjects = waypoints.map((waypoint, index) => (
    <Waypoint
      key={index}
      position={waypoint}
      isGoal={goal === index}
      onClick={() => selectGoal(index)}
    />
  ));
  return <group>{waypointObjects}</group>;
}

export default Waypoints;
