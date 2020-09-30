#include <iostream>
#include <sstream>

#include <gflags/gflags.h>
#include <glog/logging.h>
#include <google/protobuf/util/json_util.h>

#include "farm_ng/event_log_reader.h"
#include "farm_ng/ipc.h"

#include "farm_ng_proto/tractor/v1/apriltag.pb.h"
#include "farm_ng_proto/tractor/v1/io.pb.h"
#include "farm_ng_proto/tractor/v1/programs.pb.h"
#include "farm_ng_proto/tractor/v1/tracking_camera.pb.h"

DEFINE_bool(interactive, false, "receive program args via eventbus");
DEFINE_string(name, "default", "a dataset name, used in the output archive name");
DEFINE_int32(num_frames, 16, "number of frames to capture");

typedef farm_ng_proto::tractor::v1::Event EventPb;
using farm_ng_proto::tractor::v1::ApriltagDetection;
using farm_ng_proto::tractor::v1::ApriltagDetections;
using farm_ng_proto::tractor::v1::CaptureCalibrationDatasetConfiguration;
using farm_ng_proto::tractor::v1::CaptureCalibrationDatasetStatus;
using farm_ng_proto::tractor::v1::LoggingCommand;
using farm_ng_proto::tractor::v1::LoggingStatus;
using farm_ng_proto::tractor::v1::TrackingCameraCommand;

namespace farm_ng {
class CaptureCalibrationDatasetProgram {
 public:
  CaptureCalibrationDatasetProgram(EventBus& bus)
      : bus_(bus),
        timer_(bus_.get_io_service()) {
        on_timer(boost::system::error_code());
  }

  void send_status() {
    bus_.Send(MakeEvent("capture_calibration_dataset/status", status_));
  }

  CaptureCalibrationDatasetStatus get_status() {
    return status_;
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

// TODO: Move somewhere re-usable
void WaitForServices(EventBus& bus,
                     const std::vector<std::string>& service_names_in) {
  std::vector<std::string> service_names(service_names_in.begin(), service_names_in.end());

  // Wait on ourself too
  service_names.push_back(bus.GetName());

  LOG(INFO) << "Waiting for services: ";
  for (const auto& name : service_names) {
    LOG(INFO) << "   " << name;
  }
  bool has_all = false;
  while (!has_all) {
    std::vector<bool> has_service(service_names.size(), false);
    for (const auto& announce : bus.GetAnnouncements()) {
      for (size_t i = 0; i < service_names.size(); ++i) {
        if (announce.second.service() == service_names[i]) {
          has_service[i] = true;
        }
      }
    }
    has_all = true;
    for (auto x : has_service) {
      has_all &= x;
    }
    bus.get_io_service().poll();
  }
}

// TODO: Move somewhere re-usable
LoggingStatus WaitForLoggerStatus(
    EventBus& bus, std::function<bool(const LoggingStatus&)> predicate) {
  LoggingStatus status;
  while (true) {
    bus.get_io_service().run_one();
    if (bus.GetState().count("logger/status") &&
        bus.GetState().at("logger/status").data().UnpackTo(&status) &&
        predicate(status)) {
      LOG(INFO) << "Logger status: " << status.ShortDebugString();
      return status;
    }
  }
}

// TODO: Move somewhere re-usable
LoggingStatus WaitForLoggerStart(EventBus& bus,
                                 const std::string& archive_path) {
  return WaitForLoggerStatus(bus, [archive_path](const LoggingStatus& status) {
    return (status.has_recording() &&
            status.recording().archive_path() == archive_path);
  });
}

// TODO: Move somewhere re-usable
LoggingStatus WaitForLoggerStop(EventBus& bus) {
  return WaitForLoggerStatus(bus, [](const LoggingStatus& status) {
    return (status.state_case() == LoggingStatus::kStopped);
  });
}

// TODO: Move somewhere re-usable
LoggingStatus StartLogging(EventBus& bus, const std::string& archive_path) {
  WaitForLoggerStop(bus);
  LoggingCommand command;
  command.mutable_record_start()->set_archive_path(archive_path);
  bus.Send(farm_ng::MakeEvent("logger/command", command));
  return WaitForLoggerStart(bus, archive_path);
}

// TODO: Move somewhere re-usable
LoggingStatus StopLogging(EventBus& bus) {
  LoggingCommand command;
  command.mutable_record_stop();
  bus.Send(farm_ng::MakeEvent("logger/command", command));
  return WaitForLoggerStop(bus);
}

void StartCapturing(EventBus& bus) {
  TrackingCameraCommand command;
  command.mutable_record_start()->set_mode(TrackingCameraCommand::RecordStart::MODE_APRILTAG_STABLE);
  bus.Send(farm_ng::MakeEvent("tracking_camera/command", command));
}

void StopCapturing(EventBus& bus) {
  TrackingCameraCommand command;
  command.mutable_record_stop();
  bus.Send(farm_ng::MakeEvent("tracking_camera/command", command));
}

}  // namespace farm_ng

int main(int argc, char* argv[]) {
  gflags::ParseCommandLineFlags(&argc, &argv, true);
  FLAGS_logtostderr = 1;

  google::InitGoogleLogging(argv[0]);
  google::InstallFailureSignalHandler();

  boost::asio::io_service io_service;
  farm_ng::EventBus& bus =
      farm_ng::GetEventBus(io_service, "capture_calibration_dataset");

  CaptureCalibrationDatasetConfiguration configuration;
  if (FLAGS_interactive) {
    // TODO: Get configuration on eventbus
    // configuration=
  } else {
    configuration.set_num_frames(FLAGS_num_frames);
    configuration.set_name(FLAGS_name);
  }

  farm_ng::CaptureCalibrationDatasetProgram program(bus);

  // Wait for dependencies to be ready
  farm_ng::WaitForServices(bus, {"ipc-logger", "tracking-camera"});

  // Ask the logger to start logging and block until it does
  farm_ng::StartLogging(bus, configuration.name());

  // Ask the camera to start capturing
  farm_ng::StartCapturing(bus);

  // Count the number of apriltag detections
  while (program.get_status().num_frames() > configuration.num_frames()) {
    io_service.run_one();
  }

  // Ask the camera to stop capturing
  farm_ng::StopCapturing(bus);

  // Ask the logger to stop logging and block until it does
  farm_ng::StopLogging(bus);

  return 0;
}
