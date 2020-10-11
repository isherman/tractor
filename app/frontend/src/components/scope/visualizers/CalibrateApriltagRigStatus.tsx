/* eslint-disable no-console */
import * as React from "react";
import { SingleElementVisualizerProps } from "../../../registry/visualization";
import { LayoutOptions, LayoutVisualizerComponent } from "./Layout";
import {
  CalibrateApriltagRigResult,
  CalibrateApriltagRigStatus
} from "../../../../genproto/farm_ng_proto/tractor/v1/calibrate_apriltag_rig";
import { useFetchResource } from "../../../hooks/useFetchResource";
import { Card } from "./Card";
import { CalibrateApriltagRigResultVisualizer } from "./CalibrateApriltagRigResult";

const CalibrateApriltagRigStatusElement: React.FC<SingleElementVisualizerProps<
  CalibrateApriltagRigStatus
>> = (props) => {
  const {
    value: [timestamp, value],
    resources
  } = props;

  const result = useFetchResource<CalibrateApriltagRigResult>(
    value.result,
    resources || undefined
  );

  if (!result) {
    return null;
  }

  return (
    <Card timestamp={timestamp} json={value}>
      <CalibrateApriltagRigResultVisualizer.Element
        value={[0, result]}
        options={[]}
        resources={resources}
      />
    </Card>
  );
};

export const CalibrateApriltagRigStatusVisualizer = {
  id: "CalibrateApriltagRigStatus",
  types: [
    "type.googleapis.com/farm_ng_proto.tractor.v1.CalibrateApriltagRigStatus"
  ],
  options: LayoutOptions,
  Component: LayoutVisualizerComponent(CalibrateApriltagRigStatusElement),
  Element: CalibrateApriltagRigStatusElement
};
