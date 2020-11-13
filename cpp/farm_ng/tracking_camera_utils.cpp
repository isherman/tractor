#include "farm_ng/tracking_camera_utils.h"

#include <glog/logging.h>

#include "farm_ng/v1/tracking_camera.pb.h"

namespace farm_ng {
using farm_ng::v1::TrackingCameraCommand;
using farm_ng::v1::TrackingCameraCommand_RecordStart_Mode;

void RequestStartCapturing(EventBus& bus,
                           TrackingCameraCommand_RecordStart_Mode mode) {
  TrackingCameraCommand command;
  command.mutable_record_start()->set_mode(mode);
  RequestStartCapturing(bus, command);
}
void RequestStartCapturing(EventBus& bus, TrackingCameraCommand command) {
  LOG(INFO) << "RequestStartCapturing: "
            << farm_ng::MakeEvent("tracking_camera/command", command)
                   .ShortDebugString();
  bus.Send(farm_ng::MakeEvent("tracking_camera/command", command));
}

void RequestStopCapturing(EventBus& bus) {
  TrackingCameraCommand command;
  command.mutable_record_stop();
  bus.Send(farm_ng::MakeEvent("tracking_camera/command", command));
}

}  // namespace farm_ng
