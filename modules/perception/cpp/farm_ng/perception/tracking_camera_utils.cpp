#include "farm_ng/perception/tracking_camera_utils.h"

#include <glog/logging.h>

#include "farm_ng/perception/camera_pipeline.pb.h"

namespace farm_ng {
using farm_ng::perception::CameraPipelineCommand;
using farm_ng::perception::CameraPipelineCommand_RecordStart_Mode;

void RequestStartCapturing(EventBus& bus,
                           CameraPipelineCommand_RecordStart_Mode mode) {
  CameraPipelineCommand command;
  command.mutable_record_start()->set_mode(mode);
  RequestStartCapturing(bus, command);
}
void RequestStartCapturing(EventBus& bus, CameraPipelineCommand command) {
  LOG(INFO) << "RequestStartCapturing: "
            << farm_ng::MakeEvent("tracking_camera/command", command)
                   .ShortDebugString();
  bus.Send(farm_ng::MakeEvent("tracking_camera/command", command));
}

void RequestStopCapturing(EventBus& bus) {
  CameraPipelineCommand command;
  command.mutable_record_stop();
  bus.Send(farm_ng::MakeEvent("tracking_camera/command", command));
}

}  // namespace farm_ng
