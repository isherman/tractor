/* eslint-disable no-console */
import * as React from "react";
import { SingleElementVisualizerProps } from "../../../registry/visualization";
import {
  BaseToCameraModel,
  BaseToCameraModel_Sample as BaseToCameraModelSample,
  solverStatusToJSON
} from "../../../../genproto/farm_ng_proto/tractor/v1/calibrator";
import {
  StandardComponentOptions,
  StandardComponent
} from "./StandardComponent";
import { Card } from "./Card";
import { KeyValueTable } from "./KeyValueTable";
import { BaseToCameraInitializationVisualizer } from "./BaseToCameraInitialization";
// import { TrajectorySE3Visualizer } from "./TrajectorySE3";
import { Canvas } from "../../Canvas";
import { Lights } from "../../Lights";
import { Controls } from "../../Controls";
import { Ground } from "../../Ground";
import { Overlay } from "./Overlay";
import { TrajectoryMarkerVisualizer } from "./TrajectoryMarker";
import { Color } from "../../../../genproto/farm_ng_proto/tractor/v1/markers";
import { TrajectorySE3Visualizer } from "./TrajectorySE3";

const SampleMarker3D: React.FC<SingleElementVisualizerProps<
  BaseToCameraModelSample
>> = (props) => {
  const {
    value: [, value]
  } = props;
  const {
    // cameraPoseRigStart,
    // cameraPoseRigEnd,
    cameraTrajectoryRig,
    // wheelMeasurements,
    odometryTrajectoryBase,
    visualOdometryTrajectoryBase
  } = value;

  return (
    <div>
      <Canvas>
        <Lights />
        <Ground transparent={true} />
        <fogExp2 args={[0xcccccc, 0.02]} />
        <Controls />

        {cameraTrajectoryRig && (
          // <TrajectorySE3Visualizer.Marker3D
          //   value={[0, cameraTrajectoryRig]}
          // ></TrajectorySE3Visualizer.Marker3D>
          <TrajectoryMarkerVisualizer.Marker3D
            value={[
              0,
              {
                trajectory: cameraTrajectoryRig,
                angleTolerance: 0.1,
                bufferSize: 10000,
                color: Color.fromPartial({ rgba: { r: 1 } }),
                positionTolerance: 0
              }
            ]}
          />
        )}
        {odometryTrajectoryBase && (
          // <TrajectorySE3Visualizer.Marker3D
          //   value={[0, odometryTrajectoryBase]}
          // ></TrajectorySE3Visualizer.Marker3D>
          <TrajectoryMarkerVisualizer.Marker3D
            value={[
              0,
              {
                trajectory: odometryTrajectoryBase,
                angleTolerance: 0.1,
                bufferSize: 10000,
                color: Color.fromPartial({ rgba: { g: 1 } }),
                positionTolerance: 0
              }
            ]}
          />
        )}

        {visualOdometryTrajectoryBase && (
          <TrajectorySE3Visualizer.Marker3D
            value={[0, visualOdometryTrajectoryBase]}
          ></TrajectorySE3Visualizer.Marker3D>
          // <TrajectoryMarkerVisualizer.Marker3D
          //   value={[
          //     0,
          //     {
          //       trajectory: visualOdometryTrajectoryBase,
          //       angleTolerance: 0.1,
          //       bufferSize: 10000,
          //       color: Color.fromPartial({ rgba: { b: 1 } }),
          //       positionTolerance: 0
          //     }
          //   ]}
          // />
        )}
      </Canvas>
    </div>
  );
};

const BaseToCameraModelMarker3D: React.FC<SingleElementVisualizerProps<
  BaseToCameraModel
>> = (props) => {
  const {
    value: [, value]
  } = props;
  const { samples } = value;
  return (
    <Overlay
      values={samples.map((_) => [0, _])}
      Element={SampleMarker3D}
      options={[]}
    />
  );
};

const BaseToCameraModelElement: React.FC<SingleElementVisualizerProps<
  BaseToCameraModel
>> = (props) => {
  const {
    value: [timestamp, value]
  } = props;

  const {
    solverStatus,
    rmse,
    wheelBaseline,
    wheelRadius,
    basePoseCamera,
    initialization
  } = value;

  return (
    <Card timestamp={timestamp} json={value}>
      <Card title="3D">
        <BaseToCameraModelMarker3D
          value={[timestamp, value]}
        ></BaseToCameraModelMarker3D>
      </Card>
      <Card title="Summary">
        <KeyValueTable
          records={[
            ["Solver Status", solverStatus && solverStatusToJSON(solverStatus)],
            ["Total RMSE", rmse],
            ["Wheel Baseline", wheelBaseline],
            ["Wheel Radius", wheelRadius],
            ["base_pose_camera.x", basePoseCamera?.aPoseB?.position?.x],
            ["base_pose_camera.y", basePoseCamera?.aPoseB?.position?.y],
            ["base_pose_camera.z", basePoseCamera?.aPoseB?.position?.z]
          ]}
        />
      </Card>
      {initialization && (
        <Card title="Initialization">
          <BaseToCameraInitializationVisualizer.Element
            value={[0, initialization]}
          />
        </Card>
      )}
    </Card>
  );
};

export const BaseToCameraModelVisualizer = {
  id: "BaseToCameraModel",
  types: ["type.googleapis.com/farm_ng_proto.tractor.v1.BaseToCameraModel"],
  options: StandardComponentOptions,
  Component: StandardComponent(BaseToCameraModelElement),
  Element: BaseToCameraModelElement,
  Marker3D: BaseToCameraModelMarker3D
};
