import * as React from "react";
import {
  BaseToCameraInitialization,
  CalibrationParameter,
  ViewInitialization
} from "../../../../genproto/farm_ng_proto/tractor/v1/calibrator";
import { useFormState } from "../../../hooks/useFormState";
import {
  FormProps,
  SingleElementVisualizerProps
} from "../../../registry/visualization";
import { CalibrationParameterVisualizer } from "./CalibrationParameter";
import { CalibrationParameterTable } from "./CalibrationParameterTable";
import { Card } from "./Card";
import { LayoutOptions, LayoutVisualizerComponent } from "./Layout";
import { ViewInitializationVisualizer } from "./ViewInitialization";

const BaseToCameraInitializationForm: React.FC<FormProps<
  BaseToCameraInitialization
>> = (props) => {
  const [value, update] = useFormState(props);
  return (
    <>
      <h6>Wheel Baseline</h6>
      <CalibrationParameterVisualizer.Form
        initialValue={
          value.wheelBaseline || CalibrationParameter.fromPartial({})
        }
        onUpdate={(updated) =>
          update((v) => ({ ...v, wheelBaseline: updated }))
        }
      />
      <h6>Wheel Radius</h6>
      <CalibrationParameterVisualizer.Form
        initialValue={value.wheelRadius || CalibrationParameter.fromPartial({})}
        onUpdate={(updated) => update((v) => ({ ...v, wheelRadius: updated }))}
      />
      <ViewInitializationVisualizer.Form
        initialValue={
          value.basePoseCamera || ViewInitialization.fromPartial({})
        }
        onUpdate={(updated) =>
          update((v) => ({ ...v, basePoseCamera: updated }))
        }
      />
    </>
  );
};

const BaseToCameraInitializationElement: React.FC<SingleElementVisualizerProps<
  BaseToCameraInitialization
>> = ({ value: [, value] }) => {
  const { wheelBaseline, wheelRadius, basePoseCamera } = value;
  return (
    <>
      {basePoseCamera && (
        <Card title="base_pose_camera Initialization">
          <ViewInitializationVisualizer.Element value={[0, basePoseCamera]} />
        </Card>
      )}
      {wheelBaseline && wheelRadius && (
        <Card title="Other Calibration Parameters">
          <CalibrationParameterTable
            labels={["Wheel Baseline", "Wheel Radius"]}
            parameters={[wheelBaseline, wheelRadius]}
          />
        </Card>
      )}
    </>
  );
};

export const BaseToCameraInitializationVisualizer = {
  id: "BaseToCameraInitialization",
  types: [
    "type.googleapis.com/farm_ng_proto.tractor.v1.BaseToCameraInitialization"
  ],
  options: LayoutOptions,
  Component: LayoutVisualizerComponent(BaseToCameraInitializationElement),
  Element: BaseToCameraInitializationElement,
  Form: BaseToCameraInitializationForm
};