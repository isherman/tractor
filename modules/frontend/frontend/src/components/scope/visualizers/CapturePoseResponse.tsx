/* eslint-disable no-console */
import * as React from "react";
import { SingleElementVisualizerProps } from "../../../registry/visualization";
import { CapturePoseResponse } from "@farm-ng/genproto-calibration/farm_ng/calibration/robot_hal";
import {
  StandardComponentOptions,
  StandardComponent,
} from "./StandardComponent";
import { Card } from "./Card";
import { KeyValueTable } from "./KeyValueTable";

const CapturePoseResponseElement: React.FC<SingleElementVisualizerProps<
  CapturePoseResponse
>> = (props) => {
  const {
    value: [timestamp, value],
  } = props;

  const {} = value;

  return (
    <Card timestamp={timestamp} json={value}>
      <Card title="Summary">
        <KeyValueTable records={[]} />
      </Card>
    </Card>
  );
};

export const CapturePoseResponseVisualizer = {
  id: "CapturePoseResponse",
  types: ["type.googleapis.com/farm_ng.calibration.CapturePoseResponse"],
  options: StandardComponentOptions,
  Component: StandardComponent(CapturePoseResponseElement),
  Element: CapturePoseResponseElement,
};
