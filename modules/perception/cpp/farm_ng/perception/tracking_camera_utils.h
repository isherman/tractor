#ifndef FARM_NG_TRACKING_CAMERA_UTILS_H_
#define FARM_NG_TRACKING_CAMERA_UTILS_H_

#include "farm_ng/core/ipc.h"

#include "farm_ng/perception/camera_pipeline.pb.h"

namespace farm_ng {

using farm_ng::perception::CameraPipelineCommand;
using farm_ng::perception::CameraPipelineCommand_RecordStart_Mode;

void RequestStartCapturing(EventBus& bus,
                           CameraPipelineCommand_RecordStart_Mode mode);
void RequestStartCapturing(EventBus& bus, CameraPipelineCommand command);
void RequestStopCapturing(EventBus& bus);

}  // namespace farm_ng

#endif
