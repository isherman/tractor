#ifndef FARM_NG_CALIBRATION_BASE_TO_CAMERA_CALIBRATOR_H_
#define FARM_NG_CALIBRATION_BASE_TO_CAMERA_CALIBRATOR_H_

#include "farm_ng_proto/tractor/v1/calibrator.pb.h"
#include "farm_ng_proto/tractor/v1/resource.pb.h"

namespace farm_ng {
using farm_ng_proto::tractor::v1::BaseToCameraModel;
using farm_ng_proto::tractor::v1::Resource;

BaseToCameraModel SolveBasePoseCamera(BaseToCameraModel model,
                                      bool hold_base_parameters_const);

BaseToCameraModel InitialBaseToCameraModelFromEventLog(
    const Resource& event_log_resource, const Resource& apriltag_rig_resource);

}  // namespace farm_ng
#endif
