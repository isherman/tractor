/* eslint-disable no-console */
import * as React from "react";
import { SingleElementVisualizerProps } from "../../../registry/visualization";
import {
  Standard3DComponent,
  Standard3DComponentOptions,
  Standard3DElement
} from "./StandardComponent";
import { TrajectoryMarker } from "../../../../genproto/farm_ng_proto/tractor/v1/markers";
import { PoseMarkerVisualizer } from "./PoseMarker";
import { SE3Pose } from "../../../../genproto/farm_ng_proto/tractor/v1/geometry";
import { toQuaternion } from "../../../utils/protoConversions";

// message TractoryMarker {
//   TrajectorySE3 trajectory = 1;
//   double position_tolerance = 2;
//   double angle_tolerance = 3;
//   uint32 buffer_size = 4;
//   Color color = 5;
// }

const TrajectoryMarkerMarker3D: React.FC<SingleElementVisualizerProps<
  TrajectoryMarker
>> = (props) => {
  const {
    value: [, value]
  } = props;

  return (
    <group>
      {value.trajectory?.aPosesB
        .reduce((acc, pose) => {
          if (
            acc.length == 0 ||
            Math.acos(
              toQuaternion(pose.rotation)
                .normalize()
                .dot(toQuaternion(acc[acc.length - 1].rotation).normalize())
            ) > value.angleTolerance
          ) {
            acc.push(pose);
          }
          return acc;
        }, [] as SE3Pose[])
        .map((pose, index) => {
          return (
            <PoseMarkerVisualizer.Marker3D
              key={index}
              value={[
                0,
                {
                  pose,
                  arrow: {
                    color: value.color,
                    shaftLength: 1,
                    shaftRadius: 0.1,
                    headLength: 0.2,
                    headRadius: 0.1
                  },
                  axes: undefined
                }
              ]}
            />
          );
        })}
    </group>
  );
};

export const TrajectoryMarkerVisualizer = {
  id: "TrajectoryMarker",
  types: ["type.googleapis.com/farm_ng_proto.tractor.v1.TrajectoryMarker"],
  options: Standard3DComponentOptions,
  Component: Standard3DComponent(TrajectoryMarkerMarker3D),
  Element: Standard3DElement(TrajectoryMarkerMarker3D),
  Marker3D: TrajectoryMarkerMarker3D
};
