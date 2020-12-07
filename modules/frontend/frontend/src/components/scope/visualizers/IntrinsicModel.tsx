/* eslint-disable no-console */
import * as React from "react";
import { Card } from "./Card";
import { SingleElementVisualizerProps } from "../../../registry/visualization";
import { IntrinsicModel } from "@farm-ng/genproto-calibration/farm_ng/calibration/intrinsic_model";
import {
  StandardComponentOptions,
  StandardComponent,
} from "./StandardComponent";

const IntrinsicModelElement: React.FC<SingleElementVisualizerProps<
  IntrinsicModel
>> = (props) => {
  const {
    value: [timestamp, value],
  } = props;
  return (
    <Card json={value} timestamp={timestamp}>
      TODO
    </Card>
  );
};

export const IntrinsicModelVisualizer = {
  id: "IntrinsicModel",
  types: ["type.googleapis.com/farm_ng.calibration.IntrinsicModel"],
  options: StandardComponentOptions,
  Component: StandardComponent(IntrinsicModelElement),
  Element: IntrinsicModelElement,
};
