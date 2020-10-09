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
import { CalibrateBaseToCameraConfiguration } from "../../../../genproto/farm_ng_proto/tractor/v1/calibrate_base_to_camera";
import { useFetchResource } from "../../../hooks/useFetchResource";
import { CaptureCalibrationDatasetResult } from "../../../../genproto/farm_ng_proto/tractor/v1/capture_calibration_dataset";
import { CalibrateApriltagRigResult } from "../../../../genproto/farm_ng_proto/tractor/v1/calibrate_apriltag_rig";
import { CaptureCalibrationDatasetResultElement } from "./CaptureCalibrationDatasetResult";
import { CalibrateApriltagRigResultElement } from "./CalibrateApriltagRigResult";
import {
  BaseToCameraInitializationForm,
  BaseToCameraInitializationTable
} from "./BaseToCameraInitializationTable";
import { useFormState } from "../../../hooks/useFormState";
import FormGroup from "./FormGroup";
import { Resource } from "../../../../genproto/farm_ng_proto/tractor/v1/resource";
import { BaseToCameraInitialization } from "../../../../genproto/farm_ng_proto/tractor/v1/calibrator";

export const CalibrateBaseToCameraConfigurationForm: React.FC<FormProps<
  CalibrateBaseToCameraConfiguration
>> = (props) => {
  const [value, update] = useFormState(props);
  return (
    <>
      <FormGroup
        // TODO: Replace with resource browser
        label="Calibration Dataset"
        value={value.calibrationDataset?.path}
        type="text"
        onChange={(e) =>
          update((v) => ({
            ...v,
            calibrationDataset: Resource.fromPartial({
              path: e.target.value,
              contentType:
                "application/json; type=type.googleapis.com/farm_ng_proto.tractor.v1.CaptureCalibrationDatasetResult"
            })
          }))
        }
      />

      <FormGroup
        // TODO: Replace with resource browser
        label="Apriltag Rig Result"
        value={value.apriltagRigResult?.path}
        type="text"
        onChange={(e) =>
          update((v) => ({
            ...v,
            apriltagRigResult: Resource.fromPartial({
              path: e.target.value,
              contentType:
                "application/json; type=type.googleapis.com/farm_ng_proto.tractor.v1.CalibrateApriltagRigResult"
            })
          }))
        }
      />

      <BaseToCameraInitializationForm
        initialValue={
          value.initialization || BaseToCameraInitialization.fromPartial({})
        }
        onUpdate={(updated) =>
          update((v) => ({ ...v, initialization: updated }))
        }
      />

      <FormGroup
        label="Name"
        value={value.name}
        type="text"
        onChange={(e) => update((v) => ({ ...v, name: e.target.value }))}
      />
    </>
  );
};

export const CalibrateBaseToCameraConfigurationElement: React.FC<SingleElementVisualizerProps<
  CalibrateBaseToCameraConfiguration
>> = (props) => {
  const {
    value: [timestamp, value],
    resources
  } = props;

  const calibrationDataset = useFetchResource<CaptureCalibrationDatasetResult>(
    value.calibrationDataset,
    resources || undefined
  );
  const apriltagRigResult = useFetchResource<CalibrateApriltagRigResult>(
    value.apriltagRigResult,
    resources || undefined
  );
  const { initialization, name } = value;

  return (
    <Card timestamp={timestamp} json={value}>
      <Card title="Summary">
        <KeyValueTable records={[["Name", name]]} />
      </Card>
      {initialization && (
        <Card title="base_pose_camera Initialization">
          <BaseToCameraInitializationTable value={initialization} />
        </Card>
      )}
      {calibrationDataset && (
        <Card title="Calibration Dataset">
          <CaptureCalibrationDatasetResultElement
            value={[0, calibrationDataset]}
            options={[]}
            resources={resources}
          />
        </Card>
      )}
      {apriltagRigResult && (
        <Card title="Apriltag Rig Result">
          <CalibrateApriltagRigResultElement
            value={[0, apriltagRigResult]}
            options={[]}
            resources={resources}
          />
        </Card>
      )}
    </Card>
  );
};

export class CalibrateBaseToCameraConfigurationVisualizer
  implements Visualizer<CalibrateBaseToCameraConfiguration> {
  static id: VisualizerId = "calibrateBaseToCameraConfiguration";
  types: EventTypeId[] = [
    "type.googleapis.com/farm_ng_proto.tractor.v1.CalibrateBaseToCameraConfiguration"
  ];

  options: VisualizerOptionConfig[] = [
    { label: "view", options: ["overlay", "grid"] }
  ];

  component: React.FC<VisualizerProps<CalibrateBaseToCameraConfiguration>> = (
    props
  ) => {
    const view = props.options[0].value as "overlay" | "grid";
    return (
      <Layout
        view={view}
        element={CalibrateBaseToCameraConfigurationElement}
        {...props}
      />
    );
  };
}
