import * as React from "react";
import { Line } from "react-chartjs-2";
import {
  EventType,
  VisualizerOptionConfig,
  VisualizerProps
} from "../../../data/registry";

export class TimeSkewVisualizer {
  name = "timeSkew";

  options: VisualizerOptionConfig[] = [];

  component: React.FC<VisualizerProps<EventType>> = ({ values }) => {
    if (!values) {
      return null;
    }

    const plotData = {
      labels: values.map((_, i) => i),
      datasets: [
        {
          label: "t",
          data: values.map((v) => v[0]),
          fill: false,
          borderColor: "rgba(75,192,192,1)",
          borderWidth: 1
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
