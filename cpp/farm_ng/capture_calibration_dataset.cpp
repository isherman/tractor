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
DEFINE_string(tag_ids, "221, 226, 225, 218, 222",
              "comma-separated list of tag ids to capture detections of");
DEFINE_int32(num_frames, 16, "number of frames to capture");
DEFINE_double(apriltag_size, 0.16, "apriltag width/height (in m)");
DEFINE_string(log, "", "log file to use as input (not supported in interactive mode)");
DEFINE_string(out_archive, "default", "archive name to write to (not supported in interactive mode)");

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
  CaptureCalibrationDatasetProgram(EventBus& bus, const std::unordered_set<int> tag_ids, int num_frames, double apriltag_size)
      : bus_(bus),
        bus_connection_(bus_.GetEventSignal()->connect(
            std::bind(&CaptureCalibrationDatasetProgram::on_event, this, std::placeholders::_1))),
        timer_(bus_.get_io_service()),
        tag_ids_(tag_ids),
        num_frames_(num_frames),
        apriltag_size_(apriltag_size) {
    on_timer(boost::system::error_code());
  }

  boost::signals2::connection& bus_connection() { return bus_connection_; }

  void send_status() {
    bus_.Send(MakeEvent("capture_calibration_dataset/status", status_));
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

    for (auto it = detections.mutable_detections()->begin();
         it != detections.mutable_detections()->end();) {
      if (it->tag_size() == 0.0) {
        it->set_tag_size(apriltag_size_);
      }
      // Skip any detections of tag ids we don't care about
      if (tag_ids_.count(it->id()) == 0) {
        it = detections.mutable_detections()->erase(it);
      } else {
        ++it;
      }
    }
    all_detections_.push_back(std::move(detections));

    status_.set_num_frames(all_detections_.size());
    send_status();

    if (status_.num_frames() >= num_frames_) {
      // TODO: Write dataset to disk
      // TODO: Exit event loop
    }

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
  boost::signals2::connection bus_connection_;
  boost::asio::deadline_timer timer_;
  CaptureCalibrationDatasetStatus status_;

  // Tag IDs we wish to capture detections of
  std::unordered_set<int> tag_ids_;

  // Number of frames to capture
  int num_frames_;

  // Width/height of apriltags
  double apriltag_size_;

  // Captured frames
  std::vector<ApriltagDetections> all_detections_;
};

// TODO: Move somewhere re-usable
void WaitForServices(EventBus& bus,
                     const std::vector<std::string>& service_names) {
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

  std::unordered_set<int> tag_ids;
  int num_frames;
  double apriltag_size;
  if (FLAGS_interactive) {
    // TODO: Get initialization event on eventbus
    // tag_ids =
    // num_frames =
    // apriltag_size =
  } else {
    num_frames = FLAGS_num_frames;
    std::stringstream tag_ids_stream(FLAGS_tag_ids);
    while (tag_ids_stream.good()) {
      std::string tag_id;
      std::getline(tag_ids_stream, tag_id, ',');
      tag_ids.insert(stoi(tag_id));
    }
    apriltag_size = FLAGS_apriltag_size;
  }

  farm_ng::CaptureCalibrationDatasetProgram program(bus, tag_ids, num_frames, apriltag_size);

  // We're reading from a log, so block eventbus events
  if (!FLAGS_log.empty()) {
    boost::signals2::shared_connection_block block_external_events(
        program.bus_connection(), true);
  }

  // Wait for dependencies to be ready
  // QUESTION: Is there a convention of waiting for our own service?
  farm_ng::WaitForServices(bus, {"ipc-logger", "tracking-camera", "capture_calibration_dataset"});

  // Ask the logger to start logging and block until it does
  farm_ng::StartLogging(bus, FLAGS_out_archive);

  if (!FLAGS_log.empty()) {
    LOG(INFO) << "Using log : " << FLAGS_log;
    farm_ng::EventLogReader log_reader(FLAGS_log);
    while (true) {
      EventPb event;
      try {
        io_service.poll();
        event = log_reader.ReadNext();
        program.on_event(event);
      } catch (std::runtime_error& e) {
        break;
      }
    }
  } else {
    // Ask the camera to start capturing
    farm_ng::StartCapturing(bus);

    // Record images detections as they arrive
    // Write this dataset to disk after num_frames
    io_service.run();

    // Ask the camera to stop capturing
    farm_ng::StopCapturing(bus);
  }

  // Ask the logger to stop logging and block until it does
  farm_ng::StopLogging(bus);
  return 0;
}
