import { TimeSkewVisualizer } from "../components/viz/visualizers/TimeSkewVisualizer";
import { JSONVisualizer } from "../components/viz/visualizers/JSONVisualizer";
import { Vec2PlotVisualizer } from "../components/viz/visualizers/Vec2PlotVisualizer";
import { SteeringCommandVisualizer } from "../components/viz/visualizers/SteeringCommandVisualizer";
import { TimestampedEventVector } from "../types/common";
import { EventType, EventTypeId } from "./events";
import { ResourceArchive } from "../models/ResourceArchive";
import { ImageVisualizer } from "../components/viz/visualizers/ImageVisualizer";

export interface VisualizerOptionConfig {
  label: string;
  options: string[];
}
export type VisualizerOption = VisualizerOptionConfig & { value: string };

export interface VisualizerProps<T extends EventType = EventType> {
  values: TimestampedEventVector<T>;
  options: VisualizerOption[];
  resources: ResourceArchive | null;
}

export interface Visualizer<T extends EventType = EventType> {
  component: React.FC<VisualizerProps<T>>;
  options: VisualizerOptionConfig[];
  types: EventTypeId[] | "*";
}

export const visualizerRegistry: { [k: string]: Visualizer } = {
  [Vec2PlotVisualizer.id]: new Vec2PlotVisualizer() as Visualizer,
  [ImageVisualizer.id]: new ImageVisualizer() as Visualizer,
  [SteeringCommandVisualizer.id]: new SteeringCommandVisualizer() as Visualizer,
  [JSONVisualizer.id]: new JSONVisualizer() as Visualizer,
  [TimeSkewVisualizer.id]: new TimeSkewVisualizer() as Visualizer
};
export const visualizerIds = Object.keys(visualizerRegistry);
export type VisualizerId = typeof visualizerIds[number];
