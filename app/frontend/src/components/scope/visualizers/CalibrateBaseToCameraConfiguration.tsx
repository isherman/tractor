/* eslint-disable no-console */
import * as React from "react";
import {
  FormProps,
  SingleElementVisualizerProps
} from "../../../registry/visualization";
import { LayoutOptions, LayoutVisualizerComponent } from "./Layout";
import { KeyValueTable } from "./KeyValueTable";
import { Card } from "./Card";
import { CalibrateBaseToCameraConfiguration } from "../../../../genproto/farm_ng_proto/tractor/v1/calibrate_base_to_camera";
import { useFetchResource } from "../../../hooks/useFetchResource";
import { CaptureCalibrationDatasetResult } from "../../../../genproto/farm_ng_proto/tractor/v1/capture_calibration_dataset";
import { CalibrateApriltagRigResult } from "../../../../genproto/farm_ng_proto/tractor/v1/calibrate_apriltag_rig";
import { useFormState } from "../../../hooks/useFormState";
import FormGroup from "./FormGroup";
import { Resource } from "../../../../genproto/farm_ng_proto/tractor/v1/resource";
import { BaseToCameraInitialization } from "../../../../genproto/farm_ng_proto/tractor/v1/calibrator";
import { CaptureCalibrationDatasetResultVisualizer } from "./CaptureCalibrationDatasetResult";
import { CalibrateApriltagRigResultVisualizer } from "./CalibrateApriltagRigResult";
import { BaseToCameraInitializationVisualizer } from "./BaseToCameraInitialization";

const CalibrateBaseToCameraConfigurationForm: React.FC<FormProps<
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

      <BaseToCameraInitializationVisualizer.Form
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

const CalibrateBaseToCameraConfigurationElement: React.FC<SingleElementVisualizerProps<
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
          <BaseToCameraInitializationVisualizer.Element
            value={[0, initialization]}
          />
        </Card>
      )}
      {calibrationDataset && (
        <Card title="Calibration Dataset">
          <CaptureCalibrationDatasetResultVisualizer.Element
            value={[0, calibrationDataset]}
            options={[]}
            resources={resources}
          />
        </Card>
      )}
      {apriltagRigResult && (
        <Card title="Apriltag Rig Result">
          <CalibrateApriltagRigResultVisualizer.Element
            value={[0, apriltagRigResult]}
            options={[]}
            resources={resources}
          />
        </Card>
      )}
    </Card>
  );
};

export const CalibrateBaseToCameraConfigurationVisualizer = {
  id: "CalibrateBaseToCameraConfiguration",
  types: [
    "type.googleapis.com/farm_ng_proto.tractor.v1.CalibrateBaseToCameraConfiguration"
  ],
  options: LayoutOptions,
  Component: LayoutVisualizerComponent(
    CalibrateBaseToCameraConfigurationElement
  ),
  Element: CalibrateBaseToCameraConfigurationElement,
  Form: CalibrateBaseToCameraConfigurationForm
};
