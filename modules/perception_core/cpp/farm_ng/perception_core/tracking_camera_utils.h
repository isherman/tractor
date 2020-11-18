#ifndef FARM_NG_TRACKING_CAMERA_UTILS_H_
#define FARM_NG_TRACKING_CAMERA_UTILS_H_

#include "farm_ng/core/ipc.h"

#include "farm_ng/perception_core/tracking_camera.pb.h"

namespace farm_ng {

using farm_ng::perception_core::TrackingCameraCommand;
using farm_ng::perception_core::TrackingCameraCommand_RecordStart_Mode;

void RequestStartCapturing(EventBus& bus,
                           TrackingCameraCommand_RecordStart_Mode mode);
void RequestStartCapturing(EventBus& bus, TrackingCameraCommand command);
void RequestStopCapturing(EventBus& bus);

}  // namespace farm_ng

#endif
