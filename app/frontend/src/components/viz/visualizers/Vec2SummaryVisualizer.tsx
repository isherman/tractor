import * as React from "react";
import { Vec2 } from "../../../../genproto/farm_ng_proto/tractor/v1/geometry";
import { VisualizerProps } from "../../../data/registry";

export const Vec2SummaryVisualizer: React.FC<VisualizerProps<Vec2>> = ({
  values
}) => {
  if (!values) {
    return null;
  }
  const first = values[0];
  const last = values[values.length - 1];
  return (
    <div>
      <span>{`${first[0]}: {x: ${first[1].x}, y: ${first[1].y}}`}</span>
      <span>...</span>
      <span>{`${last[0]}: {x: ${last[1].x}, y: ${last[1].y}}`}</span>
    </div>
  );
};
