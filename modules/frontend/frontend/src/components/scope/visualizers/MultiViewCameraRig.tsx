/* eslint-disable no-console */
import * as React from "react";
import { SingleElementVisualizerProps } from "../../../registry/visualization";
import { MultiViewCameraRig } from "@farm-ng/genproto-perception/farm_ng/perception/camera_model";
import {
  cameraModelToThreeJSFOV,
  openCVPoseToThreeJSPose,
} from "../../../utils/protoConversions";
import {
  Standard3DComponent,
  Standard3DComponentOptions,
  Standard3DElement,
} from "./StandardComponent";
import { NamedSE3PoseVisualizer } from "./NamedSE3Pose";
import { PerspectiveCamera } from "./Camera";

const MultiViewCameraRig3DElement: React.FC<SingleElementVisualizerProps<
  MultiViewCameraRig
>> = ({ children, ...props }) => {
  const {
    value: [, value],
  } = props;

  const cameras = value.cameraPoseRig.map((pose) => {
    const camera = value.cameras.find((c) => c.frameName === pose.frameB);
    return {
      fov: camera ? cameraModelToThreeJSFOV(camera) : 80,
      aspect: camera ? camera.imageWidth / camera.imageHeight : 1,
      pose: openCVPoseToThreeJSPose(pose),
    };
  });

  const cameraRig = cameras?.map((camera) => {
    const key = `${camera.pose.frameA}:${camera.pose.frameB}`;
    return (
      <NamedSE3PoseVisualizer.Marker3D key={key} value={[0, camera.pose]}>
        <PerspectiveCamera
          showHelper
          fov={camera.fov}
          far={0.5}
          aspect={camera.aspect}
        />
      </NamedSE3PoseVisualizer.Marker3D>
    );
  });

  return <group>{cameraRig}</group>;
};

export const MultiViewCameraRigVisualizer = {
  id: "MultiViewCameraRig",
  types: ["type.googleapis.com/farm_ng.perception.MultiViewCameraRig"],
  options: Standard3DComponentOptions,
  Component: Standard3DComponent(MultiViewCameraRig3DElement),
  Element: Standard3DElement(MultiViewCameraRig3DElement),
  Marker3D: MultiViewCameraRig3DElement,
};
