/* eslint-disable no-console */
import * as React from "react";
import { Card } from "./Card";
import {
  FormProps,
  SingleElementVisualizerProps
} from "../../../registry/visualization";
import {
  NamedSE3Pose,
  SE3Pose
} from "../../../../genproto/farm_ng_proto/tractor/v1/geometry";
import { Controls } from "../../Controls";
import { Ground } from "../../Ground";
import { Lights } from "../../Lights";
import { toQuaternion, toVector3 } from "../../../utils/protoConversions";
import { OverlayOptions, OverlayVisualizerComponent } from "./Overlay";
import { Canvas } from "../../Canvas";
import { useFormState } from "../../../hooks/useFormState";
import FormGroup from "./FormGroup";
import { SE3PoseVisualizer } from "./SE3Pose";

const NamedSE3PoseForm: React.FC<FormProps<NamedSE3Pose>> = (props) => {
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

      <SE3PoseVisualizer.Form
        initialValue={value.aPoseB || SE3Pose.fromJSON({})}
        onUpdate={(updated) => update((v) => ({ ...v, aPoseB: updated }))}
      />
    </>
  );
};

const NamedSE3PoseElement: React.FC<SingleElementVisualizerProps<
  NamedSE3Pose
>> = ({ value: [timestamp, value] }) => {
  return (
    <Card json={value} timestamp={timestamp}>
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
    </Card>
  );
};

export const NamedSE3PoseVisualizer = {
  id: "NamedSE3Pose",
  types: ["type.googleapis.com/farm_ng_proto.tractor.v1.NamedSE3Pose"],
  options: OverlayOptions,
  Component: OverlayVisualizerComponent(NamedSE3PoseElement),
  Element: NamedSE3PoseElement,
  Form: NamedSE3PoseForm
};