/* eslint-disable no-console */
import * as React from "react";
import { SingleElementVisualizerProps } from "../../../registry/visualization";
import {
  CapturePoseResponse,
  capturePoseResponse_StatusToJSON,
} from "@farm-ng/genproto-calibration/farm_ng/calibration/robot_hal";
import {
  StandardComponentOptions,
  StandardComponent,
} from "./StandardComponent";
import { Card } from "./Card";
import { KeyValueTable } from "./KeyValueTable";
import { NamedSE3PoseVisualizer } from "./NamedSE3Pose";
import { Scene } from "./Scene";
import { ImageVisualizer } from "./Image";
import { useStores } from "../../../hooks/useStores";
import styles from "./CapturePoseResponse.module.scss";

const CapturePoseResponseElement: React.FC<SingleElementVisualizerProps<
  CapturePoseResponse
>> = (props) => {
  const {
    value: [timestamp, value],
  } = props;

  const { status, images } = value;
  const { httpResourceArchive } = useStores();

  const poses = value.poses.map((pose, index) => {
    return (
      <NamedSE3PoseVisualizer.Marker3D
        key={`${pose.frameA}:${pose.frameB}:${index}`}
        value={[0, pose]}
      />
    );
  });

  // TODO: Joint States

  return (
    <Card timestamp={timestamp} json={value}>
      <Card title="Summary">
        <KeyValueTable
          records={[["Status", capturePoseResponse_StatusToJSON(status)]]}
        />
      </Card>
      <Card title="Poses">
        <Scene groundTransparency>{poses}</Scene>
      </Card>
      <Card title="Images">
        <div className={styles.imageRow}>
          {images.map((image, index) => (
            <ImageVisualizer.Element
              key={index}
              value={[timestamp, image]}
              resources={httpResourceArchive}
            />
          ))}
        </div>
      </Card>
    </Card>
  );
};

export const CapturePoseResponseVisualizer = {
  id: "CapturePoseResponse",
  types: ["type.googleapis.com/farm_ng.calibration.CapturePoseResponse"],
  options: StandardComponentOptions,
  Component: StandardComponent(CapturePoseResponseElement),
  Element: CapturePoseResponseElement,
};
