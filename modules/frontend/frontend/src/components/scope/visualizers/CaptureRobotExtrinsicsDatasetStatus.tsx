/* eslint-disable no-console */
import * as React from "react";
import { SingleElementVisualizerProps } from "../../../registry/visualization";
import { KeyValueTable } from "./KeyValueTable";
import { Card } from "./Card";
import {
  CaptureRobotExtrinsicsDatasetResult,
  CaptureRobotExtrinsicsDatasetStatus,
} from "@farm-ng/genproto-calibration/farm_ng/calibration/capture_robot_extrinsics_dataset";
import { useFetchResource } from "../../../hooks/useFetchResource";
import {
  StandardComponent,
  StandardComponentOptions,
} from "./StandardComponent";
import { CaptureRobotExtrinsicsDatasetResultVisualizer } from "./CaptureRobotExtrinsicsDatasetResult";

const CaptureRobotExtrinsicsDatasetStatusElement: React.FC<SingleElementVisualizerProps<
  CaptureRobotExtrinsicsDatasetStatus
>> = (props) => {
  const {
    value: [timestamp, value],
    resources,
  } = props;

  const result = useFetchResource<CaptureRobotExtrinsicsDatasetResult>(
    value.result,
    resources
  );
  const {
    configuration,
    latestRequestIndex,
    // latestResponse
  } = value;

  // TODO:
  //   - all frames in the configuration
  //   - all poses in the request queue
  //   - the last request and response pose
  //   - the last response image
  //   - latest_request_index / request_queue.length

  return (
    <Card timestamp={timestamp} json={value}>
      <Card title="Summary">
        <KeyValueTable
          records={[
            ["Completed Requests", latestRequestIndex],
            ["Total Requests", configuration?.basePosesLink.length],
          ]}
        />
      </Card>
      {result && (
        <Card title="Result">
          {
            <CaptureRobotExtrinsicsDatasetResultVisualizer.Element
              {...props}
              value={[0, result]}
            />
          }
        </Card>
      )}
    </Card>
  );
};

export const CaptureRobotExtrinsicsDatasetStatusVisualizer = {
  id: "CaptureRobotExtrinsicsDatasetStatus",
  types: [
    "type.googleapis.com/farm_ng.calibration.CaptureRobotExtrinsicsDatasetStatus",
  ],
  options: StandardComponentOptions,
  Component: StandardComponent(CaptureRobotExtrinsicsDatasetStatusElement),
  Element: CaptureRobotExtrinsicsDatasetStatusElement,
};
