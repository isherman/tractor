#include <iostream>
#include <sstream>

#include <gflags/gflags.h>
#include <glog/logging.h>

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
using farm_ng_proto::tractor::v1::CaptureCalibrationDatasetStatus;

namespace farm_ng {
class CaptureCalibrationDatasetProgram {
 public:
  CaptureCalibrationDatasetProgram(EventBus& bus)
      : bus_(bus), timer_(bus_.get_io_service()) {
    on_timer(boost::system::error_code());
  }

  void send_status() {
    bus_.Send(MakeEvent("capture_calibration_dataset/status", status_));
  }

  CaptureCalibrationDatasetStatus get_status() { return status_; }

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
    VLOG(2) << detections.ShortDebugString();

    status_.set_num_frames(status_.num_frames() + 1);
    send_status();
    return true;
  }

  void on_event(const EventPb& event) {
    if (!event.name().rfind("calibrator/", 0) == 0) {
      return;
    }
    if (on_apriltag_detections(event)) {
      return;
    }
  }

 private:
  EventBus& bus_;
  boost::asio::deadline_timer timer_;
  CaptureCalibrationDatasetStatus status_;
};

}  // namespace farm_ng

int main(int argc, char* argv[]) {
  gflags::ParseCommandLineFlags(&argc, &argv, true);
  FLAGS_logtostderr = 1;

  google::InitGoogleLogging(argv[0]);
  google::InstallFailureSignalHandler();

  boost::asio::io_service io_service;
  auto& bus = farm_ng::GetEventBus(io_service, "capture_calibration_dataset");

  CaptureCalibrationDatasetConfiguration configuration;
  if (FLAGS_interactive) {
    configuration =
        farm_ng::WaitForConfiguration<CaptureCalibrationDatasetConfiguration>(
            bus);
  } else {
    configuration.set_num_frames(FLAGS_num_frames);
    configuration.set_name(FLAGS_name);
  }

  farm_ng::CaptureCalibrationDatasetProgram program(bus);

  farm_ng::WaitForServices(bus, {"ipc-logger", "tracking-camera"});
  farm_ng::StartLogging(bus, configuration.name());
  farm_ng::StartCapturing(bus);
  while (program.get_status().num_frames() > configuration.num_frames()) {
    io_service.run_one();
  }
  farm_ng::StopCapturing(bus);
  farm_ng::StopLogging(bus);

  return 0;
}
