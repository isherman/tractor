import * as React from "react";
import { Vec2 } from "../../../../genproto/farm_ng_proto/tractor/v1/geometry";
import {
  VisualizerOptionConfig,
  VisualizerProps
} from "../../../registry/visualization";
import { Plot } from "./Plot";

export class Vec2PlotVisualizer {
  name = "plot";

  options: VisualizerOptionConfig[] = [
    { label: "strokeWidth", options: ["1", "2", "3", "4"] }
  ];

  component: React.FC<VisualizerProps<Vec2>> = ({ values, options }) => {
    if (!values) {
      return null;
    }

    const plotData = [
      values.map((v) => v[0] / 1000),
      values.map((v) => v[1].x),
      values.map((v) => v[1].y)
    ];

    const plotOptions = {
      width: 800,
      height: 600,
      series: [
        {
          show: false
        },
        {
          label: "x",
          stroke: "rgb(75,192,192)",
          width: parseInt(options[0].value)
        },
        {
          label: "y",
          stroke: "#742774",
          width: parseInt(options[0].value)
        }
      ]
    };

    return <Plot data={plotData} options={plotOptions} />;
  };
}
