#include <iostream>
#include <optional>
#include <sstream>

#include <gflags/gflags.h>
#include <glog/logging.h>

#include "farm_ng/blobstore.h"
#include "farm_ng/init.h"
#include "farm_ng/ipc.h"

#include "farm_ng_proto/tractor/v1/apriltag.pb.h"
#include "farm_ng_proto/tractor/v1/capture_calibration_dataset.pb.h"

DEFINE_bool(interactive, false, "receive program args via eventbus");
DEFINE_string(name, "default",
              "a dataset name, used in the output archive name");
DEFINE_int32(num_frames, 16, "number of frames to capture");

typedef farm_ng_proto::tractor::v1::Event EventPb;
using farm_ng_proto::tractor::v1::ApriltagDetections;
using farm_ng_proto::tractor::v1::CaptureCalibrationDatasetConfiguration;
using farm_ng_proto::tractor::v1::CaptureCalibrationDatasetResult;
using farm_ng_proto::tractor::v1::CaptureCalibrationDatasetStatus;

namespace farm_ng {
class CaptureCalibrationDatasetProgram {
 public:
  CaptureCalibrationDatasetProgram(
      EventBus& bus,
      std::optional<CaptureCalibrationDatasetConfiguration> configuration)
      : bus_(bus), timer_(bus_.get_io_service()) {
    if (configuration.has_value()) {
      set_configuration(configuration.value());
    } else {
      status_.mutable_input_required_configuration()->set_name(FLAGS_name);
      status_.mutable_input_required_configuration()->set_num_frames(
          FLAGS_num_frames);
    }
    bus_.GetEventSignal()->connect(
        std::bind(&CaptureCalibrationDatasetProgram::on_event, this,
                  std::placeholders::_1));
    on_timer(boost::system::error_code());
  }

  int run() {
    while (status_.has_input_required_configuration()) {
      bus_.get_io_service().run_one();
    }
    LOG(INFO) << "Right here! xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
    WaitForServices(bus_, {"ipc_logger", "tracking_camera"});
    LoggingStatus log = StartLogging(bus_, configuration_.name());
    RequestStartCapturing(bus_);
    while (status_.num_frames() < configuration_.num_frames()) {
      bus_.get_io_service().run_one();
    }

    CaptureCalibrationDatasetResult result;
    result.mutable_configuration()->CopyFrom(configuration_);
    result.set_num_frames(status_.num_frames());
    result.mutable_tag_ids()->CopyFrom(status_.tag_ids());
    result.mutable_stamp_end()->CopyFrom(MakeTimestampNow());
    result.mutable_dataset()->set_path(log.recording().archive_path());

    auto result_resource = WriteProtobufAsJsonResource(
        BucketId::kCalibrationDatasets, configuration_.name(), result);
    VLOG(1) << result_resource.ShortDebugString();
    status_.mutable_result()->CopyFrom(result_resource);
    send_status();
    return 0;
  }

  // using 'calibrator' for compatibility w/ existing code
  void send_status() {
    LOG(INFO) << status_.ShortDebugString();
    bus_.Send(MakeEvent("calibrator/status", status_));
  }

  void on_timer(const boost::system::error_code& error) {
    if (error) {
      LOG(WARNING) << "timer error: " << __PRETTY_FUNCTION__ << error;
      return;
    }
    timer_.expires_from_now(boost::posix_time::millisec(1000));
    timer_.async_wait(std::bind(&CaptureCalibrationDatasetProgram::on_timer,
                                this, std::placeholders::_1));

    send_status();
  }

  bool on_apriltag_detections(const EventPb& event) {
    ApriltagDetections detections;
    if (!event.data().UnpackTo(&detections)) {
      return false;
    }

    if (detections.detections().size() == 0) {
      return true;
    }

    status_.set_num_frames(status_.num_frames() + 1);
    for (auto detection : detections.detections()) {
      int tag_id = detection.id();
      if (std::find(status_.tag_ids().begin(), status_.tag_ids().end(),
                    tag_id) == status_.tag_ids().end()) {
        status_.add_tag_ids(tag_id);
      }
    }

    send_status();
    return true;
  }

  bool on_configuration(const EventPb& event) {
    CaptureCalibrationDatasetConfiguration configuration;
    if (!event.data().UnpackTo(&configuration)) {
      return false;
    }
    LOG(INFO) << event.name() << " " << configuration.ShortDebugString();
    set_configuration(configuration);
    return true;
  }

  void set_configuration(CaptureCalibrationDatasetConfiguration configuration) {
    configuration_ = configuration;
    status_.clear_input_required_configuration();
    send_status();
    LOG(INFO) << "Set configuration woot!";
  }

  void on_event(const EventPb& event) {
    // using 'calibrator' for compatibility w/ existing code
    if (event.name().rfind("calibrator/", 0) == 0) {
      if (on_apriltag_detections(event)) {
        return;
      }
    }
    if (on_configuration(event)) {
      return;
    }
  }

 private:
  EventBus& bus_;
  boost::asio::deadline_timer timer_;
  CaptureCalibrationDatasetConfiguration configuration_;
  CaptureCalibrationDatasetStatus status_;
};

}  // namespace farm_ng

void Cleanup(farm_ng::EventBus& bus) {
  farm_ng::RequestStopCapturing(bus);
  LOG(INFO) << "Requested Stop capture";
  farm_ng::RequestStopLogging(bus);
  LOG(INFO) << "Requested Stop logging";
}
int Main(farm_ng::EventBus& bus) {
  std::optional<CaptureCalibrationDatasetConfiguration> configuration;
  if (!FLAGS_interactive) {
    CaptureCalibrationDatasetConfiguration flags_config;
    flags_config.set_num_frames(FLAGS_num_frames);
    flags_config.set_name(FLAGS_name);
    configuration = flags_config;
  }
  farm_ng::CaptureCalibrationDatasetProgram program(bus, configuration);
  return program.run();
}

int main(int argc, char* argv[]) {
  return farm_ng::Main(argc, argv, &Main, &Cleanup);
}
