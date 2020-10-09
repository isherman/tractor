/* eslint-disable no-console */
import * as React from "react";
import {
  FormProps,
  SingleElementVisualizerProps,
  Visualizer,
  VisualizerId,
  VisualizerOptionConfig,
  VisualizerProps
} from "../../../registry/visualization";
import { EventTypeId } from "../../../registry/events";
import { Layout } from "./Layout";
import { KeyValueTable } from "./KeyValueTable";
import { Card } from "./Card";
import { CaptureCalibrationDatasetConfiguration } from "../../../../genproto/farm_ng_proto/tractor/v1/capture_calibration_dataset";
import { useFormState } from "../../../hooks/useFormState";
import FormGroup from "./FormGroup";

export const CaptureCalibrationDatasetConfigurationForm: React.FC<FormProps<
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

export const CaptureCalibrationDatasetConfigurationElement: React.FC<SingleElementVisualizerProps<
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

export class CaptureCalibrationDatasetConfigurationVisualizer
  implements Visualizer<CaptureCalibrationDatasetConfiguration> {
  static id: VisualizerId = "captureCalibrationDatasetConfiguration";
  types: EventTypeId[] = [
    "type.googleapis.com/farm_ng_proto.tractor.v1.CaptureCalibrationDatasetConfiguration"
  ];

  options: VisualizerOptionConfig[] = [
    { label: "view", options: ["overlay", "grid"] }
  ];

  component: React.FC<
    VisualizerProps<CaptureCalibrationDatasetConfiguration>
  > = (props) => {
    const view = props.options[0].value as "overlay" | "grid";
    return (
      <Layout
        view={view}
        element={CaptureCalibrationDatasetConfigurationElement}
        {...props}
      />
    );
  };
}
