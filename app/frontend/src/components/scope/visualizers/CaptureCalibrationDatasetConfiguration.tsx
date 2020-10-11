/* eslint-disable no-console */
import * as React from "react";
import {
  FormProps,
  SingleElementVisualizerProps
} from "../../../registry/visualization";
import { LayoutOptions, LayoutVisualizerComponent } from "./Layout";
import { KeyValueTable } from "./KeyValueTable";
import { Card } from "./Card";
import { CaptureCalibrationDatasetConfiguration } from "../../../../genproto/farm_ng_proto/tractor/v1/capture_calibration_dataset";
import { useFormState } from "../../../hooks/useFormState";
import FormGroup from "./FormGroup";

const CaptureCalibrationDatasetConfigurationForm: React.FC<FormProps<
  CaptureCalibrationDatasetConfiguration
>> = (props) => {
  const [value, update] = useFormState(props);

  return (
    <>
      <FormGroup
        label="Number of Frames"
        value={value.numFrames}
        type="number"
        onChange={(e) =>
          update((v) => ({ ...v, numFrames: parseInt(e.target.value) }))
        }
      />

      <FormGroup
        label="Name"
        value={value.name}
        description="A name for the dataset, used to name the output archive."
        type="text"
        onChange={(e) => update((v) => ({ ...v, name: e.target.value }))}
      />
    </>
  );
};

const CaptureCalibrationDatasetConfigurationElement: React.FC<SingleElementVisualizerProps<
  CaptureCalibrationDatasetConfiguration
>> = (props) => {
  const {
    value: [timestamp, value]
  } = props;

  const { numFrames, name } = value;

  return (
    <Card timestamp={timestamp} json={value}>
      <Card title="Summary">
        <KeyValueTable
          records={[
            ["Num Frames", numFrames],
            ["Name", name]
          ]}
        />
      </Card>
    </Card>
  );
};

export const CaptureCalibrationDatasetConfigurationVisualizer = {
  id: "CaptureCalibrationDatasetConfiguration",
  types: [
    "type.googleapis.com/farm_ng_proto.tractor.v1.CaptureCalibrationDatasetConfiguration"
  ],
  options: LayoutOptions,
  Component: LayoutVisualizerComponent(
    CaptureCalibrationDatasetConfigurationElement
  ),
  Element: CaptureCalibrationDatasetConfigurationElement,
  Form: CaptureCalibrationDatasetConfigurationForm
};
