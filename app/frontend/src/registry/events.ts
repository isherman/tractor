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
export interface EventTypesMap extends GenericEventTypeMap {
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
