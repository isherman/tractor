import {
  ApriltagConfig,
  ApriltagDetections,
  ApriltagRig,
  TagConfig,
} from "@farm-ng/genproto-perception_core/farm_ng/perception_core/apriltag";
import {
  NamedSE3Pose,
  SE3Pose,
  Vec2,
} from "@farm-ng/genproto-perception_core/farm_ng/perception_core/geometry";
import {
  BaseToCameraInitialization,
  BaseToCameraModel,
  CalibrationParameter,
  CalibratorCommand,
  CalibratorStatus,
  MonocularApriltagRigModel,
  MultiViewApriltagRigModel,
  ViewInitialization,
} from "@farm-ng/genproto-calibration/farm_ng/calibration/calibrator";
import {
  Announce,
  LoggingCommand,
  LoggingStatus,
} from "@farm-ng/genproto-core/farm_ng/core/io";
import { Image } from "@farm-ng/genproto-perception_core/farm_ng/perception_core/image";
import { MotorControllerState } from "@farm-ng/genproto-tractor/farm_ng/tractor/motor";
import { SteeringCommand } from "@farm-ng/genproto-tractor/farm_ng/tractor/steering";
import {
  TrackingCameraPoseFrame,
  TrackingCameraMotionFrame,
  TrackingCameraCommand,
  TrackingCameraConfig,
  CameraConfig,
} from "@farm-ng/genproto-perception_core/farm_ng/perception_core/tracking_camera";
import {
  TractorConfig,
  TractorState,
} from "@farm-ng/genproto-tractor/farm_ng/tractor/tractor";
import { Message } from "../types/common";
import {
  ProgramSupervisorStatus,
  StartProgramRequest,
  StopProgramRequest,
} from "@farm-ng/genproto-frontend_core/farm_ng/frontend_core/program_supervisor";
import {
  CaptureCalibrationDatasetConfiguration,
  CaptureCalibrationDatasetResult,
  CaptureCalibrationDatasetStatus,
} from "@farm-ng/genproto-perception_core/farm_ng/perception_core/capture_calibration_dataset";
import {
  CaptureVideoDatasetConfiguration,
  CaptureVideoDatasetResult,
  CaptureVideoDatasetStatus,
} from "@farm-ng/genproto-perception_core/farm_ng/perception_core/capture_video_dataset";
import {
  CalibrateApriltagRigConfiguration,
  CalibrateApriltagRigResult,
  CalibrateApriltagRigStatus,
} from "@farm-ng/genproto-calibration/farm_ng/calibration/calibrate_apriltag_rig";
import {
  CalibrateBaseToCameraConfiguration,
  CalibrateBaseToCameraResult,
  CalibrateBaseToCameraStatus,
} from "@farm-ng/genproto-calibration/farm_ng/calibration/calibrate_base_to_camera";
import { Event as BusEvent } from "@farm-ng/genproto-core/farm_ng/core/io";
import {
  CalibrateMultiViewApriltagRigConfiguration,
  CalibrateMultiViewApriltagRigResult,
  CalibrateMultiViewApriltagRigStatus,
} from "@farm-ng/genproto-calibration/farm_ng/calibration/calibrate_multi_view_apriltag_rig";

export type EventType =
  | Announce
  | ApriltagConfig
  | ApriltagDetections
  | ApriltagRig
  | BaseToCameraInitialization
  | BaseToCameraModel
  | BusEvent
  | CalibrateApriltagRigConfiguration
  | CalibrateApriltagRigResult
  | CalibrateApriltagRigStatus
  | CalibrateBaseToCameraConfiguration
  | CalibrateBaseToCameraResult
  | CalibrateBaseToCameraStatus
  | CalibrateMultiViewApriltagRigConfiguration
  | CalibrateMultiViewApriltagRigResult
  | CalibrateMultiViewApriltagRigStatus
  | CalibrationParameter
  | CalibratorCommand
  | CalibratorStatus
  | CameraConfig
  | CaptureCalibrationDatasetConfiguration
  | CaptureCalibrationDatasetResult
  | CaptureCalibrationDatasetStatus
  | CaptureVideoDatasetConfiguration
  | CaptureVideoDatasetResult
  | CaptureVideoDatasetStatus
  | Image
  | LoggingCommand
  | LoggingStatus
  | MonocularApriltagRigModel
  | MotorControllerState
  | MultiViewApriltagRigModel
  | NamedSE3Pose
  | ProgramSupervisorStatus
  | SE3Pose
  | StartProgramRequest
  | SteeringCommand
  | StopProgramRequest
  | TagConfig
  | TrackingCameraCommand
  | TrackingCameraConfig
  | TrackingCameraMotionFrame
  | TrackingCameraPoseFrame
  | TractorConfig
  | TractorState
  | Vec2
  | ViewInitialization;

// Infer the keys, but restrict values to Message<EventType>
// https://stackoverflow.com/a/54598743
const inferKeys = <T>(
  o: { [K in keyof T]: Message<EventType> }
): { [K in keyof T]: Message<EventType> } => o;

export const eventRegistry = inferKeys({
  "type.googleapis.com/farm_ng.calibration.BaseToCameraInitialization": BaseToCameraInitialization,
  "type.googleapis.com/farm_ng.calibration.BaseToCameraModel": BaseToCameraModel,
  "type.googleapis.com/farm_ng.calibration.CalibrateApriltagRigConfiguration": CalibrateApriltagRigConfiguration,
  "type.googleapis.com/farm_ng.calibration.CalibrateApriltagRigResult": CalibrateApriltagRigResult,
  "type.googleapis.com/farm_ng.calibration.CalibrateApriltagRigStatus": CalibrateApriltagRigStatus,
  "type.googleapis.com/farm_ng.calibration.CalibrateBaseToCameraConfiguration": CalibrateBaseToCameraConfiguration,
  "type.googleapis.com/farm_ng.calibration.CalibrateBaseToCameraResult": CalibrateBaseToCameraResult,
  "type.googleapis.com/farm_ng.calibration.CalibrateBaseToCameraStatus": CalibrateBaseToCameraStatus,
  "type.googleapis.com/farm_ng.calibration.CalibrateMultiViewApriltagRigConfiguration": CalibrateMultiViewApriltagRigConfiguration,
  "type.googleapis.com/farm_ng.calibration.CalibrateMultiViewApriltagRigResult": CalibrateMultiViewApriltagRigResult,
  "type.googleapis.com/farm_ng.calibration.CalibrateMultiViewApriltagRigStatus": CalibrateMultiViewApriltagRigStatus,
  "type.googleapis.com/farm_ng.calibration.CalibrationParameter": CalibrationParameter,
  "type.googleapis.com/farm_ng.calibration.CalibratorCommand": CalibratorCommand,
  "type.googleapis.com/farm_ng.calibration.CalibratorStatus": CalibratorStatus,
  "type.googleapis.com/farm_ng.calibration.MonocularApriltagRigModel": MonocularApriltagRigModel,
  "type.googleapis.com/farm_ng.calibration.MultiViewApriltagRigModel": MultiViewApriltagRigModel,
  "type.googleapis.com/farm_ng.calibration.ViewInitialization": ViewInitialization,
  "type.googleapis.com/farm_ng.core.Announce": Announce,
  "type.googleapis.com/farm_ng.core.Event": BusEvent,
  "type.googleapis.com/farm_ng.core.LoggingCommand": LoggingCommand,
  "type.googleapis.com/farm_ng.core.LoggingStatus": LoggingStatus,
  "type.googleapis.com/farm_ng.frontend_core.ProgramSupervisorStatus": ProgramSupervisorStatus,
  "type.googleapis.com/farm_ng.frontend_core.StartProgramRequest": StartProgramRequest,
  "type.googleapis.com/farm_ng.frontend_core.StopProgramRequest": StopProgramRequest,
  "type.googleapis.com/farm_ng.perception_core.ApriltagConfig": ApriltagConfig,
  "type.googleapis.com/farm_ng.perception_core.ApriltagDetections": ApriltagDetections,
  "type.googleapis.com/farm_ng.perception_core.ApriltagRig": ApriltagRig,
  "type.googleapis.com/farm_ng.perception_core.CameraConfig": CameraConfig,
  "type.googleapis.com/farm_ng.perception_core.CaptureCalibrationDatasetConfiguration": CaptureCalibrationDatasetConfiguration,
  "type.googleapis.com/farm_ng.perception_core.CaptureCalibrationDatasetResult": CaptureCalibrationDatasetResult,
  "type.googleapis.com/farm_ng.perception_core.CaptureCalibrationDatasetStatus": CaptureCalibrationDatasetStatus,
  "type.googleapis.com/farm_ng.perception_core.CaptureVideoDatasetConfiguration": CaptureVideoDatasetConfiguration,
  "type.googleapis.com/farm_ng.perception_core.CaptureVideoDatasetResult": CaptureVideoDatasetResult,
  "type.googleapis.com/farm_ng.perception_core.CaptureVideoDatasetStatus": CaptureVideoDatasetStatus,
  "type.googleapis.com/farm_ng.perception_core.Image": Image,
  "type.googleapis.com/farm_ng.perception_core.NamedSE3Pose": NamedSE3Pose,
  "type.googleapis.com/farm_ng.perception_core.SE3Pose": SE3Pose,
  "type.googleapis.com/farm_ng.perception_core.TagConfig": TagConfig,
  "type.googleapis.com/farm_ng.perception_core.TrackingCameraCommand": TrackingCameraCommand,
  "type.googleapis.com/farm_ng.perception_core.TrackingCameraConfig": TrackingCameraConfig,
  "type.googleapis.com/farm_ng.perception_core.Vec2": Vec2,
  "type.googleapis.com/farm_ng.tractor.MotorControllerState": MotorControllerState,
  "type.googleapis.com/farm_ng.tractor.SteeringCommand": SteeringCommand,
  "type.googleapis.com/farm_ng.tractor.TrackingCameraMotionFrame": TrackingCameraMotionFrame,
  "type.googleapis.com/farm_ng.tractor.TrackingCameraPoseFrame": TrackingCameraPoseFrame,
  "type.googleapis.com/farm_ng.tractor.TractorConfig": TractorConfig,
  "type.googleapis.com/farm_ng.tractor.TractorState": TractorState,
});

export const eventTypeIds = Object.keys(
  eventRegistry
) as (keyof typeof eventRegistry)[];
export type EventTypeId = typeof eventTypeIds[number];
