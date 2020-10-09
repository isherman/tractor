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
import { CalibrateApriltagRigConfiguration } from "../../../../genproto/farm_ng_proto/tractor/v1/calibrate_apriltag_rig";
import { useFetchResource } from "../../../hooks/useFetchResource";
import { KeyValueTable } from "./KeyValueTable";
import { Card } from "./Card";
import { CaptureCalibrationDatasetResult } from "../../../../genproto/farm_ng_proto/tractor/v1/capture_calibration_dataset";
import { CaptureCalibrationDatasetResultElement } from "./CaptureCalibrationDatasetResult";
import { useFormState } from "../../../hooks/useFormState";
import FormGroup from "./FormGroup";
import { Resource } from "../../../../genproto/farm_ng_proto/tractor/v1/resource";

export const CalibrateApriltagRigConfigurationForm: React.FC<FormProps<
  CalibrateApriltagRigConfiguration
>> = (props) => {
  const [value, update] = useFormState(props);

  return (
    <>
      <FormGroup
        // TODO: Replace with resource browser
        label="Resource Path"
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
        // TODO: Replace with repeated integer input (CURRENTLY BROKEN)
        label="Tag IDs"
        value={value.tagIds.join(", ")}
        type="text"
        onChange={(e) =>
          update((v) => ({
            ...v,
            tagIds: e.target.value.split(", ").map((_) => parseInt(_.trim()))
          }))
        }
      />

      <FormGroup
        label="Name"
        value={value.name}
        type="text"
        onChange={(e) => update((v) => ({ ...v, name: e.target.value }))}
      />

      <FormGroup
        label="Root Tag ID"
        value={value.rootTagId}
        type="number"
        onChange={(e) =>
          update((v) => ({ ...v, rootTagId: parseInt(e.target.value) }))
        }
      />
    </>
  );
};

export const CalibrateApriltagRigConfigurationElement: React.FC<SingleElementVisualizerProps<
  CalibrateApriltagRigConfiguration
>> = (props) => {
  const {
    value: [timestamp, value],
    resources
  } = props;

  const { tagIds, rootTagId, name } = value;

  const calibrationDataset = useFetchResource<CaptureCalibrationDatasetResult>(
    value.calibrationDataset,
    resources || undefined
  );

  return (
    <Card timestamp={timestamp} json={value}>
      <Card title="Summary">
        <KeyValueTable
          records={[
            ["Name", name],
            ["Tag IDs", tagIds.join(", ")],
            ["Root Tag ID", rootTagId]
          ]}
        />
      </Card>
      {calibrationDataset && (
        <Card title="Calibration Dataset">
          <CaptureCalibrationDatasetResultElement
            value={[0, calibrationDataset]}
            options={[]}
            resources={resources}
          />
        </Card>
      )}
    </Card>
  );
};

export class CalibrateApriltagRigConfigurationVisualizer
  implements Visualizer<CalibrateApriltagRigConfiguration> {
  static id: VisualizerId = "calibrateApriltagRigConfiguration";
  types: EventTypeId[] = [
    "type.googleapis.com/farm_ng_proto.tractor.v1.CalibrateApriltagRigConfiguration"
  ];

  options: VisualizerOptionConfig[] = [
    { label: "view", options: ["overlay", "grid"] }
  ];

  component: React.FC<VisualizerProps<CalibrateApriltagRigConfiguration>> = (
    props
  ) => {
    const view = props.options[0].value as "overlay" | "grid";
    return (
      <Layout
        view={view}
        element={CalibrateApriltagRigConfigurationElement}
        {...props}
      />
    );
  };
}
