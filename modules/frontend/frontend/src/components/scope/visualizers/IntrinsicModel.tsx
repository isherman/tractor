/* eslint-disable no-console */
import * as React from "react";
import { Card } from "./Card";
import { SingleElementVisualizerProps } from "../../../registry/visualization";
import { IntrinsicModel } from "@farm-ng/genproto-calibration/farm_ng/calibration/intrinsic_model";
import {
  StandardComponentOptions,
  StandardComponent,
} from "./StandardComponent";
import { KeyValueTable } from "./KeyValueTable";
import { Table } from "react-bootstrap";
import { solverStatusToJSON } from "@farm-ng/genproto-calibration/farm_ng/calibration/calibrator";
import { formatValue } from "../../../utils/formatValue";
import { CameraModelVisualizer } from "./CameraModel";
import { useState } from "react";
import RangeSlider from "react-bootstrap-range-slider";
import { ImageVisualizer } from "./Image";
import { ApriltagDetectionsVisualizer } from "./ApriltagDetections";
// import { ApriltagRigVisualizer } from "./ApriltagRig";
// import { Scene } from "./Scene";
// import { PerspectiveCamera } from "./Camera";
// import { NamedSE3PoseVisualizer } from "./NamedSE3Pose";
// import {
//   cameraModelToThreeJSFOV,
//   matrix4ToSE3Pose,
//   openCVPoseToThreeJSPose,
//   toQuaternion,
//   toVector3,
// } from "../../../utils/protoConversions";
// import { Matrix4 } from "three";

// repeated farm_ng.perception.ApriltagRig apriltag_rigs = 2;
// repeated farm_ng.perception.NamedSE3Pose camera_poses_rig = 7;

const IntrinsicModelElement: React.FC<SingleElementVisualizerProps<
  IntrinsicModel
>> = (props) => {
  const {
    value: [timestamp, value],
  } = props;

  const {
    tagStats,
    cameraModel,
    cameraPosesRig,
    detections,
    solverStatus,
    rmse,
  } = value;

  // The currently selected image index
  const [index, setIndex] = useState(0);
  const maxImageIndex = cameraPosesRig.length ? cameraPosesRig.length - 1 : 0;

  const reprojectionImage = value.reprojectionImages[index];
  const apriltagDetections = detections[index];

  // TODO: Support multiple apriltag rigs
  // const apriltagRig = apriltagRigs[0] && (
  //   <ApriltagRigVisualizer.Marker3D value={[0, apriltagRigs[0]]} />
  // );

  // const cameraRig = (
  //   <NamedSE3PoseVisualizer.Marker3D
  //     value={[0, openCVPoseToThreeJSPose(cameraPosesRig[0])]}
  //   >
  //     <PerspectiveCamera
  //       showHelper
  //       fov={cameraModel ? cameraModelToThreeJSFOV(cameraModel) : 80}
  //       far={0.5}
  //       aspect={
  //         cameraModel ? cameraModel.imageWidth / cameraModel.imageHeight : 1
  //       }
  //     />
  //   </NamedSE3PoseVisualizer.Marker3D>
  // );

  // const cameraRigPoseApriltagRig =
  //   cameraPosesRig[index].aPoseB || matrix4ToSE3Pose(new Matrix4());

  return (
    <Card json={value} timestamp={timestamp}>
      <Card title="Camera Model">
        {cameraModel && (
          <CameraModelVisualizer.Element {...props} value={[0, cameraModel]} />
        )}
      </Card>

      <Card title="Summary">
        <KeyValueTable
          records={[
            ["Solver Status", solverStatusToJSON(solverStatus)],
            ["Total RMSE", rmse],
          ]}
        />

        <Table striped bordered size="sm" responsive="md">
          <thead>
            <tr>
              <th>Tag Id</th>
              <th># Frames</th>
              <th>RMSE</th>
            </tr>
          </thead>
          <tbody>
            {tagStats.map((tagStat) => (
              <tr key={tagStat.tagId}>
                <td>{tagStat.tagId}</td>
                <td>{tagStat.nFrames}</td>
                <td>{formatValue(tagStat.tagRigRmse)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card title="Details">
        <h6> Image Index </h6>
        <RangeSlider
          value={index}
          onChange={(_, v) => setIndex(v)}
          min={0}
          max={maxImageIndex}
          step={1}
        />

        <Card title="Reprojection Images">
          {reprojectionImage && (
            <ImageVisualizer.Element
              {...props}
              value={[0, reprojectionImage]}
            />
          )}
        </Card>

        <Card title="Apriltag Detections">
          {apriltagDetections && (
            <ApriltagDetectionsVisualizer.Element
              {...props}
              value={[0, apriltagDetections]}
            />
          )}
        </Card>
      </Card>
    </Card>
  );
};

export const IntrinsicModelVisualizer = {
  id: "IntrinsicModel",
  types: ["type.googleapis.com/farm_ng.calibration.IntrinsicModel"],
  options: StandardComponentOptions,
  Component: StandardComponent(IntrinsicModelElement),
  Element: IntrinsicModelElement,
};
