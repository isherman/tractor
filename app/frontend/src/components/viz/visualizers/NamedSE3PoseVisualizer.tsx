/* eslint-disable no-console */
import * as React from "react";
import { useState } from "react";
import { Card } from "react-bootstrap";
import RangeSlider from "react-bootstrap-range-slider";
import styles from "./ApriltagDetectionsVisualizer.module.scss";
import {
  Visualizer,
  VisualizerId,
  VisualizerOptionConfig,
  VisualizerProps
} from "../../../registry/visualization";
import { formatValue } from "../../../utils/formatValue";
import { EventTypeId } from "../../../registry/events";
import { JsonPopover } from "../../JsonPopover";
import { NamedSE3Pose } from "../../../../genproto/farm_ng_proto/tractor/v1/geometry";
import { Canvas } from "react-three-fiber";
import { Controls } from "../../Controls";
import { Ground } from "../../Ground";
import { Lights } from "../../Lights";
import { toQuaternion, toVector3 } from "../../../utils/protoConversions";

export class NamedSE3PoseVisualizer implements Visualizer<NamedSE3Pose> {
  static id: VisualizerId = "namedSE3Pose";
  types: EventTypeId[] = [
    "type.googleapis.com/farm_ng_proto.tractor.v1.NamedSE3Pose"
  ];

  options: VisualizerOptionConfig[] = [];

  component: React.FC<VisualizerProps<NamedSE3Pose>> = ({ values }) => {
    if (!values) {
      return null;
    }

    const [index, setIndex] = useState(0);

    const canvas = (
      <Canvas
        style={{ background: "darkgray", width: "100%", height: "100%" }}
        camera={{
          position: [2.5, 2.5, 2.5],
          fov: 60,
          near: 0.1,
          far: 500,
          up: [0, 0, 1]
        }}
      >
        <Lights />
        <Ground transparent={true} />
        <fogExp2 args={[0xcccccc, 0.02]} />
        <Controls />
        <axesHelper
          position={toVector3(values[index][1].aPoseB?.position)}
          quaternion={toQuaternion(values[index][1].aPoseB?.rotation)}
        />
      </Canvas>
    );

    return (
      <Card bg={"light"} className={[styles.card, "shadow-sm"].join(" ")}>
        <Card.Body>
          <RangeSlider
            value={index}
            onChange={(e) => setIndex(parseInt(e.target.value))}
            min={0}
            max={values.length - 1}
            step={1}
            tooltip={"off"}
          />
          {canvas}
        </Card.Body>
        <Card.Footer className={styles.footer}>
          <span className="text-muted">
            {formatValue(new Date(values[index][0]))}
          </span>
          <JsonPopover json={values[index][1]} />
        </Card.Footer>
      </Card>
    );
  };
}
