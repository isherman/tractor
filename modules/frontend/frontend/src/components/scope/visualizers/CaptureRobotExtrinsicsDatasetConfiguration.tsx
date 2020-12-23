/* eslint-disable no-console */
import * as React from "react";
import { SingleElementVisualizerProps } from "../../../registry/visualization";
import { KeyValueTable } from "./KeyValueTable";
import { Card } from "./Card";
import { CaptureRobotExtrinsicsDatasetConfiguration } from "@farm-ng/genproto-calibration/farm_ng/calibration/capture_robot_extrinsics_dataset";
import {
  StandardComponent,
  StandardComponentOptions,
} from "./StandardComponent";
import { ApriltagRigVisualizer } from "./ApriltagRig";
import { Scene } from "./Scene";
import { MultiViewCameraRigVisualizer } from "./MultiViewCameraRig";
import { NamedSE3PoseVisualizer } from "./NamedSE3Pose";
import { JointStatePlot } from "./JointStatePlot";
import { NamedSE3Pose } from "@farm-ng/genproto-perception/farm_ng/perception/geometry";

const CaptureRobotExtrinsicsDatasetConfigurationElement: React.FC<SingleElementVisualizerProps<
  CaptureRobotExtrinsicsDatasetConfiguration
>> = (props) => {
  const {
    value: [timestamp, value],
  } = props;

  const {
    name,
    workspaceFrameName,
    baseFrameName,
    linkFrameName,
    halServiceAddress,
  } = value;

  const baseCameraRig = value.baseCameraRig && (
    <MultiViewCameraRigVisualizer.Marker3D value={[0, value.baseCameraRig]} />
  );

  const baseTagRig = value.baseTagRig && (
    <ApriltagRigVisualizer.Marker3D value={[0, value.baseTagRig]} />
  );

  const linkCameraRig = value.linkCameraRig && (
    <MultiViewCameraRigVisualizer.Marker3D value={[0, value.linkCameraRig]} />
  );

  const linkTagRig = value.linkTagRig && (
    <ApriltagRigVisualizer.Marker3D value={[0, value.linkTagRig]} />
  );

  const requestPoses = value.requestQueue.reduce<
    ReturnType<React.FC<SingleElementVisualizerProps<NamedSE3Pose>>>[]
  >((acc, req, index) => {
    req.poses.forEach((pose) => {
      acc.push(
        <NamedSE3PoseVisualizer.Marker3D
          key={`${pose.frameA}:${pose.frameB}:${index}`}
          value={[0, { ...pose, frameB: `${pose.frameB} (${index})` }]}
        />
      );
    });
    return acc;
  }, []);

  return (
    <Card timestamp={timestamp} json={value}>
      <Card title="Summary">
        <KeyValueTable
          records={[
            ["Name", name],
            ["HAL Service Address", halServiceAddress],
            ["Workspace Frame Name", workspaceFrameName],
            ["Base Frame Name", baseFrameName],
            ["Link Frame Name", linkFrameName],
          ]}
        />
      </Card>
      <Card title="Request Poses">
        <Scene groundTransparency>{requestPoses}</Scene>
        <JointStatePlot values={value.requestQueue.map((_) => _.jointStates)} />
      </Card>
      <Card title="Base Camera Rig">
        <Scene groundTransparency>{baseCameraRig}</Scene>
      </Card>
      <Card title="Base Tag Rig">
        <Scene groundTransparency>{baseTagRig}</Scene>
      </Card>
      <Card title="Link Camera Rig">
        <Scene groundTransparency>{linkCameraRig}</Scene>
      </Card>
      <Card title="Link Tag Rig">
        <Scene groundTransparency>{linkTagRig}</Scene>
      </Card>
    </Card>
  );
};

export const CaptureRobotExtrinsicsDatasetConfigurationVisualizer = {
  id: "CaptureRobotExtrinsicsDatasetConfiguration",
  types: [
    "type.googleapis.com/farm_ng.calibration.CaptureRobotExtrinsicsDatasetConfiguration",
  ],
  options: StandardComponentOptions,
  Component: StandardComponent(
    CaptureRobotExtrinsicsDatasetConfigurationElement
  ),
  Element: CaptureRobotExtrinsicsDatasetConfigurationElement,
};
