import {
  ApriltagConfig,
  ApriltagDetections,
  ApriltagRig,
  TagConfig,
} from "@farm-ng/genproto/farm_ng/v1/apriltag";
import {
  NamedSE3Pose,
  SE3Pose,
  Vec2,
} from "@farm-ng/genproto/farm_ng/v1/geometry";
import {
  BaseToCameraInitialization,
  BaseToCameraModel,
  CalibrationParameter,
  CalibratorCommand,
  CalibratorStatus,
  MonocularApriltagRigModel,
  MultiViewApriltagRigModel,
  ViewInitialization,
} from "@farm-ng/genproto/farm_ng/v1/calibrator";
import {
  Announce,
  LoggingCommand,
  LoggingStatus,
} from "@farm-ng/genproto/farm_ng/v1/io";
import { Image } from "@farm-ng/genproto/farm_ng/v1/image";
import { MotorControllerState } from "@farm-ng/genproto/farm_ng/v1/motor";
import { SteeringCommand } from "@farm-ng/genproto/farm_ng/v1/steering";
import {
  TrackingCameraPoseFrame,
  TrackingCameraMotionFrame,
  TrackingCameraCommand,
  TrackingCameraConfig,
  CameraConfig,
} from "@farm-ng/genproto/farm_ng/v1/tracking_camera";
import {
  TractorConfig,
  TractorState,
} from "@farm-ng/genproto/farm_ng/v1/tractor";
import { Message } from "../types/common";
import {
  ProgramSupervisorStatus,
  StartProgramRequest,
  StopProgramRequest,
} from "@farm-ng/genproto/farm_ng/v1/program_supervisor";
import {
  CaptureCalibrationDatasetConfiguration,
  CaptureCalibrationDatasetResult,
  CaptureCalibrationDatasetStatus,
} from "@farm-ng/genproto/farm_ng/v1/capture_calibration_dataset";
import {
  CaptureVideoDatasetConfiguration,
  CaptureVideoDatasetResult,
  CaptureVideoDatasetStatus,
} from "@farm-ng/genproto/farm_ng/v1/capture_video_dataset";
import {
  CalibrateApriltagRigConfiguration,
  CalibrateApriltagRigResult,
  CalibrateApriltagRigStatus,
} from "@farm-ng/genproto/farm_ng/v1/calibrate_apriltag_rig";
import {
  CalibrateBaseToCameraConfiguration,
  CalibrateBaseToCameraResult,
  CalibrateBaseToCameraStatus,
} from "@farm-ng/genproto/farm_ng/v1/calibrate_base_to_camera";
import { Event as BusEvent } from "@farm-ng/genproto/farm_ng/v1/io";
import {
  CalibrateMultiViewApriltagRigConfiguration,
  CalibrateMultiViewApriltagRigResult,
  CalibrateMultiViewApriltagRigStatus,
} from "@farm-ng/genproto/farm_ng/v1/calibrate_multi_view_apriltag_rig";

export type EventType =
  | BusEvent
  | SteeringCommand
  | TrackingCameraPoseFrame
  | TrackingCameraMotionFrame
  | SE3Pose
  | NamedSE3Pose
  | MotorControllerState
  | ApriltagDetections
  | TractorState
  | Announce
  | Vec2
  | Image
  | TractorConfig
  | ApriltagConfig
  | TrackingCameraConfig
  | CameraConfig
  | TagConfig
  | CalibrationParameter
  | ViewInitialization
  | LoggingCommand
  | TrackingCameraCommand
  | CalibratorCommand
  | CalibratorStatus
  | LoggingStatus
  | ProgramSupervisorStatus
  | StartProgramRequest
  | ApriltagRig
  | StopProgramRequest
  | MonocularApriltagRigModel
  | MultiViewApriltagRigModel
  | BaseToCameraModel
  | BaseToCameraInitialization
  | CaptureCalibrationDatasetConfiguration
  | CaptureCalibrationDatasetStatus
  | CaptureCalibrationDatasetResult
  | CaptureVideoDatasetConfiguration
  | CaptureVideoDatasetStatus
  | CaptureVideoDatasetResult
  | CalibrateApriltagRigConfiguration
  | CalibrateApriltagRigStatus
  | CalibrateApriltagRigResult
  | CalibrateBaseToCameraConfiguration
  | CalibrateBaseToCameraStatus
  | CalibrateBaseToCameraResult
  | CalibrateMultiViewApriltagRigConfiguration
  | CalibrateMultiViewApriltagRigStatus
  | CalibrateMultiViewApriltagRigResult;

// Infer the keys, but restrict values to Message<EventType>
// https://stackoverflow.com/a/54598743
const inferKeys = <T>(
  o: { [K in keyof T]: Message<EventType> }
): { [K in keyof T]: Message<EventType> } => o;

export const eventRegistry = inferKeys({
  "type.googleapis.com/farm_ng.v1.Event": BusEvent,
  "type.googleapis.com/farm_ng.v1.SteeringCommand": SteeringCommand,
  "type.googleapis.com/farm_ng.v1.TrackingCameraPoseFrame": TrackingCameraPoseFrame,
  "type.googleapis.com/farm_ng.v1.TrackingCameraMotionFrame": TrackingCameraMotionFrame,
  "type.googleapis.com/farm_ng.v1.SE3Pose": SE3Pose,
  "type.googleapis.com/farm_ng.v1.NamedSE3Pose": NamedSE3Pose,
  "type.googleapis.com/farm_ng.v1.MotorControllerState": MotorControllerState,
  "type.googleapis.com/farm_ng.v1.ApriltagDetections": ApriltagDetections,
  "type.googleapis.com/farm_ng.v1.ApriltagRig": ApriltagRig,
  "type.googleapis.com/farm_ng.v1.TractorState": TractorState,
  "type.googleapis.com/farm_ng.v1.Announce": Announce,
  "type.googleapis.com/farm_ng.v1.Vec2": Vec2,
  "type.googleapis.com/farm_ng.v1.Image": Image,
  "type.googleapis.com/farm_ng.v1.TractorConfig": TractorConfig,
  "type.googleapis.com/farm_ng.v1.ApriltagConfig": ApriltagConfig,
  "type.googleapis.com/farm_ng.v1.TrackingCameraConfig": TrackingCameraConfig,
  "type.googleapis.com/farm_ng.v1.CameraConfig": CameraConfig,
  "type.googleapis.com/farm_ng.v1.TagConfig": TagConfig,
  "type.googleapis.com/farm_ng.v1.ViewInitialization": ViewInitialization,
  "type.googleapis.com/farm_ng.v1.BaseToCameraInitialization": BaseToCameraInitialization,
  "type.googleapis.com/farm_ng.v1.CalibrationParameter": CalibrationParameter,
  "type.googleapis.com/farm_ng.v1.LoggingCommand": LoggingCommand,
  "type.googleapis.com/farm_ng.v1.TrackingCameraCommand": TrackingCameraCommand,
  "type.googleapis.com/farm_ng.v1.CalibratorCommand": CalibratorCommand,
  "type.googleapis.com/farm_ng.v1.CalibratorStatus": CalibratorStatus,
  "type.googleapis.com/farm_ng.v1.LoggingStatus": LoggingStatus,
  "type.googleapis.com/farm_ng.v1.MonocularApriltagRigModel": MonocularApriltagRigModel,
  "type.googleapis.com/farm_ng.v1.MultiViewApriltagRigModel": MultiViewApriltagRigModel,
  "type.googleapis.com/farm_ng.v1.BaseToCameraModel": BaseToCameraModel,
  "type.googleapis.com/farm_ng.v1.ProgramSupervisorStatus": ProgramSupervisorStatus,
  "type.googleapis.com/farm_ng.v1.StartProgramRequest": StartProgramRequest,
  "type.googleapis.com/farm_ng.v1.StopProgramRequest": StopProgramRequest,
  "type.googleapis.com/farm_ng.v1.CaptureCalibrationDatasetConfiguration": CaptureCalibrationDatasetConfiguration,
  "type.googleapis.com/farm_ng.v1.CaptureCalibrationDatasetStatus": CaptureCalibrationDatasetStatus,
  "type.googleapis.com/farm_ng.v1.CaptureCalibrationDatasetResult": CaptureCalibrationDatasetResult,
  "type.googleapis.com/farm_ng.v1.CaptureVideoDatasetConfiguration": CaptureVideoDatasetConfiguration,
  "type.googleapis.com/farm_ng.v1.CaptureVideoDatasetStatus": CaptureVideoDatasetStatus,
  "type.googleapis.com/farm_ng.v1.CaptureVideoDatasetResult": CaptureVideoDatasetResult,
  "type.googleapis.com/farm_ng.v1.CalibrateApriltagRigConfiguration": CalibrateApriltagRigConfiguration,
  "type.googleapis.com/farm_ng.v1.CalibrateApriltagRigStatus": CalibrateApriltagRigStatus,
  "type.googleapis.com/farm_ng.v1.CalibrateApriltagRigResult": CalibrateApriltagRigResult,
  "type.googleapis.com/farm_ng.v1.CalibrateBaseToCameraConfiguration": CalibrateBaseToCameraConfiguration,
  "type.googleapis.com/farm_ng.v1.CalibrateBaseToCameraStatus": CalibrateBaseToCameraStatus,
  "type.googleapis.com/farm_ng.v1.CalibrateBaseToCameraResult": CalibrateBaseToCameraResult,
  "type.googleapis.com/farm_ng.v1.CalibrateMultiViewApriltagRigConfiguration": CalibrateMultiViewApriltagRigConfiguration,
  "type.googleapis.com/farm_ng.v1.CalibrateMultiViewApriltagRigStatus": CalibrateMultiViewApriltagRigStatus,
  "type.googleapis.com/farm_ng.v1.CalibrateMultiViewApriltagRigResult": CalibrateMultiViewApriltagRigResult,
});

export const eventTypeIds = Object.keys(
  eventRegistry
) as (keyof typeof eventRegistry)[];
export type EventTypeId = typeof eventTypeIds[number];
