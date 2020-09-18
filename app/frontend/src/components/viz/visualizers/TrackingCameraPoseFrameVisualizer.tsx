/* eslint-disable no-console */
import * as React from "react";
import {
  Visualizer,
  VisualizerId,
  VisualizerOptionConfig,
  VisualizerProps
} from "../../../registry/visualization";
import { EventTypeId } from "../../../registry/events";
import { TrackingCameraPoseFrame } from "../../../../genproto/farm_ng_proto/tractor/v1/tracking_camera";
import { Plot } from "./Plot";
import { Vec3 } from "../../../../genproto/farm_ng_proto/tractor/v1/geometry";

const norm = (v?: Vec3): number => {
  return v
    ? Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2) + Math.pow(v.z, 2))
    : 0;
};

export class TrackingCameraPoseFrameVisualizer
  implements Visualizer<TrackingCameraPoseFrame> {
  static id: VisualizerId = "trackingCameraPoseFrame";
  types: EventTypeId[] = [
    "type.googleapis.com/farm_ng_proto.tractor.v1.TrackingCameraPoseFrame"
  ];

  options: VisualizerOptionConfig[] = [];

  component: React.FC<VisualizerProps<TrackingCameraPoseFrame>> = ({
    values
  }) => {
    if (!values) {
      return null;
    }

    const plotData = [
      values.map((v) => v[0] / 1000),
      values.map((v) => norm(v[1].velocity)),
      values.map((v) => norm(v[1].acceleration))
    ];

    const plotOptions = {
      width: 800,
      height: 600,
      series: [
        {
          show: false
        },
        {
          label: "|v|",
          stroke: "rgb(75,192,192)"
        },
        {
          label: "|a|",
          stroke: "#742774"
        }
      ]
    };

    return <Plot data={plotData} options={plotOptions} />;
  };
}
