/* eslint-disable no-console */
import * as React from "react";
import { Card } from "./Card";
import {
  SingleElementVisualizerProps,
  VisualizerProps,
} from "../../../registry/visualization";
import {
  JointState,
  jointState_UnitsToJSON,
} from "@farm-ng/genproto-perception/farm_ng/perception/kinematics";
import { StandardComponentOptions } from "./StandardComponent";
import { colorGenerator } from "../../../utils/colorGenerator";
import { Plot } from "./Plot";
import { KeyValueTable } from "./KeyValueTable";

const JointStateComponent: React.FC<VisualizerProps<JointState>> = ({
  values,
  options,
}) => {
  const jointValuesByName = values.reduce<{ [k: string]: number[] }>(
    (acc, [_, value]) => {
      if (!acc[value.name]) {
        acc[value.name] = [];
      }
      acc[value.name].push(value.value);
      return acc;
    },
    {}
  );
  const jointNames = Object.keys(jointValuesByName).sort();

  const plotData = [
    values.map(([t, _]) => t / 1000),
    ...jointNames.map((key) => jointValuesByName[key]),
  ];

  const strokeWidth = parseInt(options[0].value);
  const colors = colorGenerator();
  const plotOptions = {
    width: 800,
    height: 600,
    series: [
      {
        show: false,
      },
      ...jointNames.map((label) => ({
        label,
        stroke: colors.next().value,
        width: strokeWidth,
      })),
    ],
  };

  return <Plot data={plotData} options={plotOptions} />;
};

const JointStateElement: React.FC<SingleElementVisualizerProps<JointState>> = (
  props
) => {
  const {
    value: [timestamp, value],
  } = props;

  return (
    <Card json={value} timestamp={timestamp}>
      <KeyValueTable
        headers={["Name", "Value", "Units"]}
        records={[
          ["Name", value.name],
          ["Value", value.value],
          ["Units", jointState_UnitsToJSON(value.units)],
        ]}
      />
    </Card>
  );
};

export const JointStateVisualizer = {
  id: "JointState",
  types: ["type.googleapis.com/farm_ng.perception.JointState"],
  options: StandardComponentOptions,
  Component: JointStateComponent,
  Element: JointStateElement,
};
