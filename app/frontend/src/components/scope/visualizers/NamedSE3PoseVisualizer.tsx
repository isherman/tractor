/* eslint-disable no-console */
import * as React from "react";
import { Card } from "react-bootstrap";
import styles from "./NamedSE3PoseVisualizer.module.scss";
import {
  FormProps,
  SingleElementVisualizerProps,
  Visualizer,
  VisualizerId,
  VisualizerOptionConfig,
  VisualizerProps
} from "../../../registry/visualization";
import { formatValue } from "../../../utils/formatValue";
import { EventTypeId } from "../../../registry/events";
import { JsonPopover } from "../../JsonPopover";
import {
  NamedSE3Pose,
  SE3Pose
} from "../../../../genproto/farm_ng_proto/tractor/v1/geometry";
import { Controls } from "../../Controls";
import { Ground } from "../../Ground";
import { Lights } from "../../Lights";
import { toQuaternion, toVector3 } from "../../../utils/protoConversions";
import { Overlay } from "./Overlay";
import { Canvas } from "../../Canvas";
import { useFormState } from "../../../hooks/useFormState";
import FormGroup from "./FormGroup";
import { SE3PoseForm } from "./SE3Pose";

export const NamedSE3PoseForm: React.FC<FormProps<NamedSE3Pose>> = (props) => {
  const [value, update] = useFormState(props);
  return (
    <>
      <FormGroup
        label="Frame A"
        value={value.frameA}
        type="text"
        onChange={(e) => update((v) => ({ ...v, frameA: e.target.value }))}
      />
      <FormGroup
        label="Frame B"
        value={value.frameB}
        type="text"
        onChange={(e) => update((v) => ({ ...v, frameB: e.target.value }))}
      />

      <SE3PoseForm
        initialValue={value.aPoseB || SE3Pose.fromJSON({})}
        onUpdate={(updated) => update((v) => ({ ...v, aPoseB: updated }))}
      />
    </>
  );
};

export const NamedSE3PoseElement: React.FC<SingleElementVisualizerProps<
  NamedSE3Pose
>> = ({ value: [timestamp, value] }) => {
  return (
    <Card bg={"light"} className={[styles.card, "shadow-sm"].join(" ")}>
      <Card.Body>
        <Canvas>
          <Lights />
          <Ground transparent={true} />
          <fogExp2 args={[0xcccccc, 0.02]} />
          <Controls />
          <axesHelper
            position={toVector3(value.aPoseB?.position)}
            quaternion={toQuaternion(value.aPoseB?.rotation)}
          />
        </Canvas>
      </Card.Body>
      <Card.Footer className={styles.footer}>
        <span className="text-muted">{formatValue(new Date(timestamp))}</span>
        <JsonPopover json={value} />
      </Card.Footer>
    </Card>
  );
};

export class NamedSE3PoseVisualizer implements Visualizer<NamedSE3Pose> {
  static id: VisualizerId = "namedSE3Pose";
  types: EventTypeId[] = [
    "type.googleapis.com/farm_ng_proto.tractor.v1.NamedSE3Pose"
  ];

  options: VisualizerOptionConfig[] = [];

  component: React.FC<VisualizerProps<NamedSE3Pose>> = (props) => {
    return <Overlay element={NamedSE3PoseElement} {...props} />;
  };
}
