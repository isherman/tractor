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
import { Message } from "../types/common";

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

export const eventRegistry: { [k: string]: Message<EventType> } = {
  "type.googleapis.com/farm_ng_proto.tractor.v1.SteeringCommand": SteeringCommand,
  "type.googleapis.com/farm_ng_proto.tractor.v1.TrackingCameraPoseFrame": TrackingCameraPoseFrame,
  "type.googleapis.com/farm_ng_proto.tractor.v1.TrackingCameraMotionFrame": TrackingCameraMotionFrame,
  "type.googleapis.com/farm_ng_proto.tractor.v1.NamedSE3Pose": NamedSE3Pose,
  "type.googleapis.com/farm_ng_proto.tractor.v1.MotorControllerState": MotorControllerState,
  "type.googleapis.com/farm_ng_proto.tractor.v1.ApriltagDetections": ApriltagDetections,
  "type.googleapis.com/farm_ng_proto.tractor.v1.TractorState": TractorState,
  "type.googleapis.com/farm_ng_proto.tractor.v1.Announce": Announce,
  "type.googleapis.com/farm_ng_proto.tractor.v1.Vec2": Vec2
};
export const eventTypeIds = Object.keys(eventRegistry);
export type EventTypeId = typeof eventTypeIds[number];
