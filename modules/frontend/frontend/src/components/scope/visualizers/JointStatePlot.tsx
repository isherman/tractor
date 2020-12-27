/* eslint-disable no-console */
import * as React from "react";
import { JointState } from "@farm-ng/genproto-perception/farm_ng/perception/kinematics";
import { colorGenerator } from "../../../utils/colorGenerator";
import { Plot } from "./Plot";
import styles from "./JointStatePlot.module.scss";
import { range } from "../../../utils/range";
import uPlot from "uplot";
import { useMemo } from "react";

export const JointStatePlot: React.FC<{
  values: JointState[][];
  completed?: number;
}> = ({ values, completed }) => {
  const jointValuesByName = values.reduce<{ [k: string]: number[] }>(
    (acc, jointStates) => {
      jointStates.forEach((value) => {
        if (!acc[value.name]) {
          acc[value.name] = [];
        }
        acc[value.name].push(value.value);
      });
      return acc;
    },
    {}
  );
  const jointNames = Object.keys(jointValuesByName).sort();
  const maxNumSamples = Math.max(
    ...Object.values(jointValuesByName).map((_) => _.length)
  );
  const plotData = [
    range(0, maxNumSamples),
    ...jointNames.map((key) => jointValuesByName[key]),
  ];

  const colors = colorGenerator();
  const plotOptions = useMemo(
    () => ({
      width: 800,
      height: 600,
      scales: { x: { time: false } },
      axes: [
        {
          incrs: maxNumSamples > 1 ? [1] : undefined,
          values: (_: uPlot, splits: number[]) =>
            splits.map((v, index) => {
              return `${v}${
                completed !== undefined && index <= completed ? "*" : ""
              }`;
            }),
        },
      ],
      series: [
        { show: false },
        ...jointNames.map((label) => ({ label, stroke: colors.next().value })),
      ],
    }),
    [completed, maxNumSamples]
  );

  return (
    <div className={styles.plot}>
      <Plot data={plotData} options={plotOptions} />
    </div>
  );
};
