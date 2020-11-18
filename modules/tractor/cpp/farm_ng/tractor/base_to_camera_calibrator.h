#ifndef FARM_NG_CALIBRATION_BASE_TO_CAMERA_CALIBRATOR_H_
#define FARM_NG_CALIBRATION_BASE_TO_CAMERA_CALIBRATOR_H_

#include "farm_ng/calibration/calibrator.pb.h"
#include "farm_ng/core/resource.pb.h"
#include "farm_ng/tractor/tractor.pb.h"

namespace farm_ng {
using farm_ng::calibration::BaseToCameraInitialization;
using farm_ng::calibration::BaseToCameraModel;
using farm_ng::tractor::TractorState;
using farm_ng::core::Resource;

void CopyTractorStateToWheelState(
    const TractorState& tractor_state,
    BaseToCameraModel::WheelMeasurement* wheel_measurement);

struct BasePoseCameraSolverOptions {
  bool hold_base_pose_camera_constant = false;
  bool hold_base_parameters_constant = false;
};
BaseToCameraModel SolveBasePoseCamera(
    BaseToCameraModel model,
    BasePoseCameraSolverOptions options = BasePoseCameraSolverOptions());

BaseToCameraModel InitialBaseToCameraModelFromEventLog(
    const BaseToCameraInitialization& initialization,
    const Resource& event_log_resource, const Resource& apriltag_rig_resource);

}  // namespace farm_ng
#endif
