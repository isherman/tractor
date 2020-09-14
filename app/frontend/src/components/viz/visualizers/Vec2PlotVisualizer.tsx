import * as React from "react";
import { Line } from "react-chartjs-2";
import { Vec2 } from "../../../../genproto/farm_ng_proto/tractor/v1/geometry";
import {
  VisualizerOptionConfig,
  VisualizerProps
} from "../../../data/registry";

export class Vec2PlotVisualizer {
  name = "plot";

  options: VisualizerOptionConfig[] = [
    { label: "strokeWidth", options: ["1", "2", "3", "4"] }
  ];

  component: React.FC<VisualizerProps<Vec2>> = ({ values, options }) => {
    if (!values) {
      return null;
    }

    const plotData = {
      labels: values.map((v) => new Date(v[0])),
      datasets: [
        {
          label: "x",
          data: values.map((v) => v[1].x),
          fill: false,
          borderColor: "rgba(75,192,192,1)",
          borderWidth: parseInt(options[0].value)
        },
        {
          label: "y",
          data: values.map((v) => v[1].y),
          fill: false,
          borderColor: "#742774",
          borderWidth: parseInt(options[0].value)
        }
      ]
    };
    const plotOptions = {
      scales: {
        xAxes: [
          {
            display: false
          }
        ]
      }
    };

    return (
      <div>
        <Line data={plotData} options={plotOptions} />
      </div>
    );
  };
}
