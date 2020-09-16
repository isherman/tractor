import { Vec2 } from "../../genproto/farm_ng_proto/tractor/v1/geometry";
import { SteeringCommand } from "../../genproto/farm_ng_proto/tractor/v1/steering";
import { TimeSkewVisualizer } from "../components/viz/visualizers/TimeSkewVisualizer";
import { JSONVisualizer } from "../components/viz/visualizers/JSONVisualizer";
import { Vec2PlotVisualizer } from "../components/viz/visualizers/Vec2PlotVisualizer";
import { SteeringCommandVisualizer } from "../components/viz/visualizers/SteeringCommandVisualizer";
import { TimestampedEventVector } from "../types/common";
import { EventType, EventTypeId, EventTypesMap } from "./events";

export const visualizerIds = ["plot", "timeSkew", "json", "steeringPlot"];
export type VisualizerId = typeof visualizerIds[number];

export interface VisualizerOptionConfig {
  label: string;
  options: string[];
}
export type VisualizerOption = VisualizerOptionConfig & { value: string };

export interface VisualizerProps<T extends EventType = EventType> {
  values: TimestampedEventVector<T>;
  options: VisualizerOption[];
}

export interface Visualizer<T extends EventType = EventType> {
  name: string;
  component: React.FC<VisualizerProps<T>>;
  options: VisualizerOptionConfig[];
}

type VisualizerRegistry = {
  [K in VisualizerId]: Visualizer;
};
export const visualizerRegistry: VisualizerRegistry = {
  plot: new Vec2PlotVisualizer() as Visualizer,
  json: new JSONVisualizer(),
  timeSkew: new TimeSkewVisualizer(),
  steeringPlot: new SteeringCommandVisualizer() as Visualizer
};
export const visualizerRegistryGlobals = [
  visualizerRegistry.json,
  visualizerRegistry.timeSkew
];

type GenericVisualizerMap = {
  [K in EventTypeId]?: Visualizer<EventTypesMap[K]>[];
};
export const visualizerMap: GenericVisualizerMap = {
  "type.googleapis.com/farm_ng_proto.tractor.v1.Vec2": [
    visualizerRegistry.plot as Visualizer<Vec2>
  ],
  "type.googleapis.com/farm_ng_proto.tractor.v1.SteeringCommand": [
    visualizerRegistry.steeringPlot as Visualizer<SteeringCommand>
  ]
};
