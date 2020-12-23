/* eslint-disable no-console */
import * as React from "react";
import { JointState } from "@farm-ng/genproto-perception/farm_ng/perception/kinematics";
import { colorGenerator } from "../../../utils/colorGenerator";
import { Plot } from "./Plot";
import styles from "./JointStatePlot.module.scss";
import { range } from "../../../utils/range";

export const JointStatePlot: React.FC<{ values: JointState[][] }> = ({
  values,
}) => {
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

  const plotData = [
    range(
      0,
      Math.max(...Object.values(jointValuesByName).map((_) => _.length)) + 1
    ),
    ...jointNames.map((key) => jointValuesByName[key]),
  ];

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
      })),
    ],
  };

  return (
    <div className={styles.plot}>
      <Plot data={plotData} options={plotOptions} />
    </div>
  );
};
