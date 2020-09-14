import * as React from "react";
import { VisualizerProps } from "../../../data/registry";

export const DefaultVisualizer: React.FC<VisualizerProps> = ({ values }) => {
  if (!values) {
    return null;
  }
  return <div>{JSON.stringify(values[0])}</div>;
};
