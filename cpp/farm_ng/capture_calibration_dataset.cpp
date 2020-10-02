#include <iostream>
#include <optional>
#include <sstream>

#include <gflags/gflags.h>
#include <glog/logging.h>

#include "farm_ng/blobstore.h"
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

  // TODO: This doesn't work yet
  void handle_signal(const boost::system::error_code& error,
                     int signal_number) {
    std::cout << "Received (error, signal) " << error << " , " << signal_number
              << std::endl;
    bus_.get_io_service().stop();
    bus_.get_io_service().reset();
    RequestStopCapturing(bus_);
    std::cout << "Requested stop capturing" << std::endl;
    RequestStopLogging(bus_);
    std::cout << "Requested stop logging" << std::endl;
    exit(1);
  }

  int run() {
    boost::asio::signal_set signals(bus_.get_io_service(), SIGTERM, SIGINT);
    signals.async_wait(
        std::bind(&CaptureCalibrationDatasetProgram::handle_signal, this,
                  std::placeholders::_1, std::placeholders::_2));

    if (status_.has_input_required_configuration()) {
      set_configuration(
          WaitForConfiguration<CaptureCalibrationDatasetConfiguration>(bus_));
    }
    WaitForServices(bus_, {"ipc-logger", "tracking-camera"});
    RequestStartCapturing(bus_);
    LoggingStatus log = StartLogging(bus_, configuration_.name());
    while (status_.num_frames() < configuration_.num_frames()) {
      bus_.get_io_service().run_one();
    }

    status_.mutable_result()->set_num_frames(status_.num_frames());
    status_.mutable_result()->mutable_tag_ids()->CopyFrom(status_.tag_ids());
    status_.mutable_result()->mutable_stamp_end()->CopyFrom(MakeTimestampNow());
    status_.mutable_result()->mutable_dataset()->set_path(
        log.recording().archive_path());
    auto resource =
        WriteProtobufAsJsonResource(BucketId::kCalibrationDatasets,
                                    configuration_.name(), status_.result());
    VLOG(1) << resource.ShortDebugString();
    status_.mutable_result()->mutable_resource()->CopyFrom(resource);
    send_status();

    RequestStopCapturing(bus_);
    StopLogging(bus_);

    return 0;
  }

  // using 'calibrator' for compatibility w/ existing code
  void send_status() { bus_.Send(MakeEvent("calibrator/status", status_)); }

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
    VLOG(2) << configuration.ShortDebugString();
    set_configuration(configuration);
    return true;
  }

  void set_configuration(CaptureCalibrationDatasetConfiguration configuration) {
    configuration_ = configuration;
    status_.clear_input_required_configuration();
    send_status();
  }

  void on_event(const EventPb& event) {
    // using 'calibrator' for compatibility w/ existing code
    if (!event.name().rfind("calibrator/", 0) == 0) {
      return;
    }
    if (on_apriltag_detections(event)) {
      return;
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
  CaptureCalibrationDatasetResult result_;
};

}  // namespace farm_ng

int main(int argc, char* argv[]) {
  gflags::ParseCommandLineFlags(&argc, &argv, true);
  FLAGS_logtostderr = 1;

  google::InitGoogleLogging(argv[0]);
  google::InstallFailureSignalHandler();

  boost::asio::io_service io_service;
  farm_ng::EventBus& bus = farm_ng::GetEventBus(
      io_service,
      "calibrator");  // using 'calibrator' for compatibility w/ existing code

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
