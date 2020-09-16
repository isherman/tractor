import * as React from "react";
import { VisualizerProps } from "../../../registry/visualization";

export const DefaultVisualizer: React.FC<VisualizerProps> = ({ values }) => {
  if (!values) {
    return null;
  }
  return <div>{JSON.stringify(values[0])}</div>;
};
