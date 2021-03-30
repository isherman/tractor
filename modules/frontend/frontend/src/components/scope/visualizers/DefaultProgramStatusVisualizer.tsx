/* eslint-disable no-console */
import * as React from "react";
import { SingleElementVisualizerProps } from "../../../registry/visualization";
import { Card } from "./Card";
import {
  StandardMultiElement,
  StandardMultiElementOptions,
} from "./StandardMultiElement";
import { DefaultProgramStatus } from "@farm-ng/genproto-core/farm_ng/core/programd";

const DefaultProgramStatusElement: React.FC<SingleElementVisualizerProps<
  DefaultProgramStatus
>> = (props) => {
  const {
    value: [timestamp, value],
  } = props;

  return (
    <Card timestamp={timestamp} json={value}>
      {value.line}
    </Card>
  );
};

export const DefaultProgramStatusVisualizer = {
  id: "DefaultProgramStatus",
  types: ["type.googleapis.com/farm_ng.core.DefaultProgramStatus"],
  options: StandardMultiElementOptions,
  MultiElement: StandardMultiElement(DefaultProgramStatusElement),
  Element: DefaultProgramStatusElement,
};
