/* eslint-disable no-console */
import * as React from "react";
import { SingleElementVisualizerProps } from "../../../registry/visualization";
import {
  StandardComponentOptions,
  StandardComponent
} from "./StandardComponent";
import { Card } from "./Card";
import { TrajectorySE3 } from "../../../../genproto/farm_ng_proto/tractor/v1/geometry";
import { Html, useHelper } from "drei";
import { toQuaternion, toVector3 } from "../../../utils/protoConversions";
import { Popover } from "../../Popover";
import { formatValue } from "../../../utils/formatValue";
import { BoxHelper } from "three/src/helpers/BoxHelper";
import { useRef } from "react";

const TrajectorySE33DElement: React.FC<SingleElementVisualizerProps<
  TrajectorySE3
>> = (props) => {
  const {
    value: [, value]
  } = props;

  const { frameA, frameB, aPosesB } = value;

  const groupRef = useRef<THREE.Group>();
  useHelper(groupRef, BoxHelper, "red");
  return (
    <>
      <group ref={groupRef}>
        {aPosesB.map((pose, index) => {
          return (
            <group
              key={index}
              position={toVector3(pose.position)}
              quaternion={toQuaternion(pose.rotation)}
            >
              <Html>
                <Popover>
                  <div>{frameB}</div>
                  <div>{frameA}</div>
                  <div>{formatValue(pose.stamp)}</div>
                </Popover>
              </Html>
              <axesHelper />
            </group>
          );
        })}
      </group>
    </>
  );
};

const TrajectorySE3Element: React.FC<SingleElementVisualizerProps<
  TrajectorySE3
>> = (props) => {
  const {
    value: [timestamp, value]
  } = props;

  return <Card timestamp={timestamp} json={value}></Card>;
};

export const TrajectorySE3Visualizer = {
  id: "TrajectorySE3",
  types: ["type.googleapis.com/farm_ng_proto.tractor.v1.TrajectorySE3"],
  options: StandardComponentOptions,
  Component: StandardComponent(TrajectorySE3Element),
  Element: TrajectorySE3Element,
  Marker3D: TrajectorySE33DElement
};
