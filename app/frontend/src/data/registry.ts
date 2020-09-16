import { ApriltagDetections } from "../../genproto/farm_ng_proto/tractor/v1/apriltag";
import {
  NamedSE3Pose,
  Vec2
} from "../../genproto/farm_ng_proto/tractor/v1/geometry";
import { Announce } from "../../genproto/farm_ng_proto/tractor/v1/io";
import { MotorControllerState } from "../../genproto/farm_ng_proto/tractor/v1/motor";
import { SteeringCommand } from "../../genproto/farm_ng_proto/tractor/v1/steering";
import {
  TrackingCameraPoseFrame,
  TrackingCameraMotionFrame
} from "../../genproto/farm_ng_proto/tractor/v1/tracking_camera";
import { TractorState } from "../../genproto/farm_ng_proto/tractor/v1/tractor";
import { TimeSkewVisualizer } from "../components/viz/visualizers/TimeSkewVisualizer";
import { JSONVisualizer } from "../components/viz/visualizers/JSONVisualizer";
import { Vec2PlotVisualizer } from "../components/viz/visualizers/Vec2PlotVisualizer";
import { SteeringCommandVisualizer } from "../components/viz/visualizers/SteeringCommandVisualizer";

export type EventType =
  | SteeringCommand
  | TrackingCameraPoseFrame
  | TrackingCameraMotionFrame
  | NamedSE3Pose
  | MotorControllerState
  | ApriltagDetections
  | TractorState
  | Announce
  | Vec2;

export const eventTypeIds = [
  "type.googleapis.com/farm_ng_proto.tractor.v1.SteeringCommand",
  "type.googleapis.com/farm_ng_proto.tractor.v1.TrackingCameraPoseFrame",
  "type.googleapis.com/farm_ng_proto.tractor.v1.TrackingCameraMotionFrame",
  "type.googleapis.com/farm_ng_proto.tractor.v1.NamedSE3Pose",
  "type.googleapis.com/farm_ng_proto.tractor.v1.MotorControllerState",
  "type.googleapis.com/farm_ng_proto.tractor.v1.ApriltagDetections",
  "type.googleapis.com/farm_ng_proto.tractor.v1.TractorState",
  "type.googleapis.com/farm_ng_proto.tractor.v1.Announce",
  "type.googleapis.com/farm_ng_proto.tractor.v1.Vec2"
] as const;
export type EventTypeId = typeof eventTypeIds[number];

type GenericEventTypeMap = {
  [k in EventTypeId]: EventType;
};
interface EventTypesMap extends GenericEventTypeMap {
  "type.googleapis.com/farm_ng_proto.tractor.v1.SteeringCommand": SteeringCommand;
  "type.googleapis.com/farm_ng_proto.tractor.v1.TrackingCameraPoseFrame": TrackingCameraPoseFrame;
  "type.googleapis.com/farm_ng_proto.tractor.v1.TrackingCameraMotionFrame": TrackingCameraMotionFrame;
  "type.googleapis.com/farm_ng_proto.tractor.v1.NamedSE3Pose": NamedSE3Pose;
  "type.googleapis.com/farm_ng_proto.tractor.v1.MotorControllerState": MotorControllerState;
  "type.googleapis.com/farm_ng_proto.tractor.v1.ApriltagDetections": ApriltagDetections;
  "type.googleapis.com/farm_ng_proto.tractor.v1.TractorState": TractorState;
  "type.googleapis.com/farm_ng_proto.tractor.v1.Announce": Announce;
  "type.googleapis.com/farm_ng_proto.tractor.v1.Vec2": Vec2;
}

type Timestamp = number;
type TimestampedEvent<T extends EventType = EventType> = [Timestamp, T];

export type TimestampedEventVector<
  T extends EventType = EventType
> = TimestampedEvent<T>[];

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

export const visualizerIds = ["plot", "timeSkew", "json", "steeringPlot"];
export type VisualizerId = typeof visualizerIds[number];

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
