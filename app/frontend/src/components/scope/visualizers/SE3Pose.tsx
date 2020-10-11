/* eslint-disable no-console */
import * as React from "react";
import {
  FormProps,
  SingleElementVisualizerProps
} from "../../../registry/visualization";
import {
  Quaternion,
  SE3Pose,
  Vec3
} from "../../../../genproto/farm_ng_proto/tractor/v1/geometry";
import { OverlayOptions, OverlayVisualizerComponent } from "./Overlay";
import { useFormState } from "../../../hooks/useFormState";
import FormGroup from "./FormGroup";

const SE3PoseForm: React.FC<FormProps<SE3Pose>> = (props) => {
  const [value, update] = useFormState(props);
  return (
    <>
      <FormGroup
        label="tx"
        value={value.position?.x}
        type="number"
        onChange={(e) =>
          update((v) => ({
            ...v,
            position: { ...v.position, x: parseFloat(e.target.value) } as Vec3
          }))
        }
      />
      <FormGroup
        label="ty"
        value={value.position?.x}
        type="number"
        onChange={(e) =>
          update((v) => ({
            ...v,
            position: { ...v.position, y: parseFloat(e.target.value) } as Vec3
          }))
        }
      />
      <FormGroup
        label="tz"
        value={value.position?.z}
        type="number"
        onChange={(e) =>
          update((v) => ({
            ...v,
            position: { ...v.position, z: parseFloat(e.target.value) } as Vec3
          }))
        }
      />

      <FormGroup
        label="rx"
        value={value.rotation?.x}
        type="number"
        onChange={(e) =>
          update((v) => ({
            ...v,
            rotation: {
              ...v.rotation,
              x: parseFloat(e.target.value)
            } as Quaternion
          }))
        }
      />

      <FormGroup
        label="ry"
        value={value.rotation?.y}
        type="number"
        onChange={(e) =>
          update((v) => ({
            ...v,
            rotation: {
              ...v.rotation,
              y: parseFloat(e.target.value)
            } as Quaternion
          }))
        }
      />

      <FormGroup
        label="rz"
        value={value.rotation?.z}
        type="number"
        onChange={(e) =>
          update((v) => ({
            ...v,
            rotation: {
              ...v.rotation,
              z: parseFloat(e.target.value)
            } as Quaternion
          }))
        }
      />

      <FormGroup
        label="rw"
        value={value.rotation?.w}
        type="number"
        onChange={(e) =>
          update((v) => ({
            ...v,
            rotation: {
              ...v.rotation,
              w: parseFloat(e.target.value)
            } as Quaternion
          }))
        }
      />
    </>
  );
};

const SE3PoseElement: React.FC<SingleElementVisualizerProps<SE3Pose>> = () => {
  return <p>TODO</p>;
};

export const SE3PoseVisualizer = {
  id: "SE3Pose",
  types: ["type.googleapis.com/farm_ng_proto.tractor.v1.SE3Pose"],
  options: OverlayOptions,
  Component: OverlayVisualizerComponent(SE3PoseElement),
  Element: SE3PoseElement,
  Form: SE3PoseForm
};
