/* eslint-disable no-console */
import * as React from "react";
import { SingleElementVisualizerProps } from "../../../registry/visualization";
import { useFetchResource } from "../../../hooks/useFetchResource";
import { Card } from "./Card";
import {
  CalibrateBaseToCameraResult,
  CalibrateBaseToCameraStatus
} from "../../../../genproto/farm_ng_proto/tractor/v1/calibrate_base_to_camera";
import { LayoutOptions, LayoutVisualizerComponent } from "./Layout";
import { CalibrateBaseToCameraResultVisualizer } from "./CalibrateBaseToCameraResult";

const CalibrateBaseToCameraStatusElement: React.FC<SingleElementVisualizerProps<
  CalibrateBaseToCameraStatus
>> = (props) => {
  const {
    value: [timestamp, value],
    resources
  } = props;

  const result = useFetchResource<CalibrateBaseToCameraResult>(
    value.result,
    resources || undefined
  );

  return (
    result && (
      <Card timestamp={timestamp} json={value}>
        <CalibrateBaseToCameraResultVisualizer.Element
          value={[0, result]}
          options={[]}
          resources={resources}
        />
      </Card>
    )
  );
};

export const CalibrateBaseToCameraStatusVisualizer = {
  id: "CalibrateBaseToCameraStatus",
  types: [
    "type.googleapis.com/farm_ng_proto.tractor.v1.CalibrateBaseToCameraStatus"
  ],
  options: LayoutOptions,
  Component: LayoutVisualizerComponent(CalibrateBaseToCameraStatusElement),
  Element: CalibrateBaseToCameraStatusElement
};
