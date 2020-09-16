import * as React from "react";
import { SteeringCommand } from "../../../../genproto/farm_ng_proto/tractor/v1/steering";
import { EventTypeId } from "../../../registry/events";
import {
  Visualizer,
  VisualizerId,
  VisualizerOptionConfig,
  VisualizerProps
} from "../../../registry/visualization";
import { Plot } from "./Plot";

export class SteeringCommandVisualizer implements Visualizer<SteeringCommand> {
  static id: VisualizerId = "steeringcommand";
  types: EventTypeId[] = [
    "type.googleapis.com/farm_ng_proto.tractor.v1.SteeringCommand"
  ];

  options: VisualizerOptionConfig[] = [
    { label: "strokeWidth", options: ["1", "2", "3", "4"] }
  ];

  component: React.FC<VisualizerProps<SteeringCommand>> = ({
    values,
    options
  }) => {
    if (!values) {
      return null;
    }

    const plotData = [
      values.map((v) => v[0] / 1000),
      values.map((v) => v[1].brake),
      values.map((v) => v[1].deadman),
      values.map((v) => v[1].velocity),
      values.map((v) => v[1].angularVelocity)
    ];

    const plotOptions = {
      width: 800,
      height: 600,
      series: [
        {
          show: false
        },
        {
          label: "brake",
          stroke: "#ff0000",
          width: parseInt(options[0].value)
        },
        {
          label: "deadman",
          stroke: "#000000",
          width: parseInt(options[0].value)
        },
        {
          label: "v",
          stroke: "#00ff00",
          width: parseInt(options[0].value)
        },
        {
          label: "ω",
          stroke: "#0000ff",
          width: parseInt(options[0].value)
        }
      ]
    };

    return <Plot data={plotData} options={plotOptions} />;
  };
}
