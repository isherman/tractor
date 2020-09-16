import * as React from "react";
import {
  EventType,
  VisualizerOptionConfig,
  VisualizerProps
} from "../../../data/registry";
import { Plot } from "./Plot";

export class TimeSkewVisualizer {
  name = "timeSkew";

  options: VisualizerOptionConfig[] = [];

  component: React.FC<VisualizerProps<EventType>> = ({ values }) => {
    if (!values) {
      return null;
    }

    const plotData = [values.map((_, i) => i), values.map((v) => v[0] / 1000)];

    const plotOptions = {
      width: 800,
      height: 600,
      series: [
        {
          show: false
        },
        {
          label: "t",
          stroke: "rgb(75,192,192)",
          width: 1
        }
      ],
      scales: {
        x: {
          time: false
        },
        y: {
          time: true
        }
      }
    };

    return <Plot data={plotData} options={plotOptions} />;
  };
}
