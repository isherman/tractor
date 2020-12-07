/* eslint-disable no-console */
import * as React from "react";
import { SingleElementVisualizerProps } from "../../../registry/visualization";
import {
  StandardComponentOptions,
  StandardComponent,
} from "./StandardComponent";
import { CalibrateIntrinsicsResult } from "@farm-ng/genproto-calibration/farm_ng/calibration/calibrate_intrinsics";
import { Card } from "./Card";

const CalibrateIntrinsicsResultElement: React.FC<SingleElementVisualizerProps<
  CalibrateIntrinsicsResult
>> = (props) => {
  const {
    value: [timestamp, value],
    // resources,
  } = props;

  return (
    <Card timestamp={timestamp} json={value}>
      TODO
    </Card>
  );
};

export const CalibrateIntrinsicsResultVisualizer = {
  id: "CalibrateIntrinsicsResult",
  types: ["type.googleapis.com/farm_ng.calibration.CalibrateIntrinsicsResult"],
  options: StandardComponentOptions,
  Component: StandardComponent(CalibrateIntrinsicsResultElement),
  Element: CalibrateIntrinsicsResultElement,
};
