import { TimeSkewVisualizer } from "../components/scope/visualizers/TimeSkewVisualizer";
import { JSONVisualizer } from "../components/scope/visualizers/JSONVisualizer";
import { SteeringCommandVisualizer } from "../components/scope/visualizers/SteeringCommandVisualizer";
import { TimestampedEvent, TimestampedEventVector } from "../types/common";
import { EventType, EventTypeId, eventTypeIds } from "./events";
import { ResourceArchive } from "../models/ResourceArchive";
import { ImageVisualizer } from "../components/scope/visualizers/ImageVisualizer";
import { ApriltagDetectionsVisualizer } from "../components/scope/visualizers/ApriltagDetectionsVisualizer";
import { NamedSE3PoseVisualizer } from "../components/scope/visualizers/NamedSE3PoseVisualizer";
import { TrackingCameraPoseFrameVisualizer } from "../components/scope/visualizers/TrackingCameraPoseFrameVisualizer";
import { CalibrateApriltagRigStatusVisualizer } from "../components/scope/visualizers/CalibrateApriltagRigStatus";
import { CalibrateBaseToCameraStatusVisualizer } from "../components/scope/visualizers/CalibrateBaseToCameraStatus";

export interface VisualizerOptionConfig {
  label: string;
  options: string[];
}
export type VisualizerOption = VisualizerOptionConfig & { value: string };

export interface SingleElementVisualizerProps<T extends EventType = EventType> {
  value: TimestampedEvent<T>;
  options: VisualizerOption[];
  resources: ResourceArchive | null;
}

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
  [CalibrateBaseToCameraStatusVisualizer.id]: new CalibrateBaseToCameraStatusVisualizer() as Visualizer,
  [CalibrateApriltagRigStatusVisualizer.id]: new CalibrateApriltagRigStatusVisualizer() as Visualizer,
  [TrackingCameraPoseFrameVisualizer.id]: new TrackingCameraPoseFrameVisualizer() as Visualizer,
  [NamedSE3PoseVisualizer.id]: new NamedSE3PoseVisualizer() as Visualizer,
  [ImageVisualizer.id]: new ImageVisualizer() as Visualizer,
  [ApriltagDetectionsVisualizer.id]: new ApriltagDetectionsVisualizer() as Visualizer,
  [SteeringCommandVisualizer.id]: new SteeringCommandVisualizer() as Visualizer,
  [JSONVisualizer.id]: new JSONVisualizer() as Visualizer,
  [TimeSkewVisualizer.id]: new TimeSkewVisualizer() as Visualizer
};
export const visualizerIds = Object.keys(visualizerRegistry);
export type VisualizerId = typeof visualizerIds[number];

export function visualizersForEventType(
  eventType: EventTypeId | null
): Visualizer[] {
  return Object.entries(visualizerRegistry)
    .filter(([k, v]) => {
      // This visualizer explicitly supports this event type
      if (eventType && v.types.includes(eventType)) {
        return true;
      }
      // This visualizer supports all known event types
      if (eventType && v.types === "*" && eventTypeIds.includes(eventType)) {
        return true;
      }
      // This is an unknown event type, but at least we can visualize its timestamp
      if (k === TimeSkewVisualizer.id) {
        return true;
      }
      return false;
    })
    .map(([_, v]) => v);
}
