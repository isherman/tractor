#include <iostream>
#include <optional>
#include <sstream>

#include <gflags/gflags.h>
#include <glog/logging.h>

#include "farm_ng/blobstore.h"
#include "farm_ng/calibration/apriltag_rig_calibrator.h"
#include "farm_ng/event_log_reader.h"
#include "farm_ng/ipc.h"

#include "farm_ng_proto/tractor/v1/apriltag.pb.h"
#include "farm_ng_proto/tractor/v1/calibrate_apriltag_rig.pb.h"
#include "farm_ng_proto/tractor/v1/calibrator.pb.h"
#include "farm_ng_proto/tractor/v1/capture_calibration_dataset.pb.h"

DEFINE_bool(interactive, false, "receive program args via eventbus");
DEFINE_string(calibration_dataset, "",
              "The path to a serialized CaptureCalibrationDatasetResult");

DEFINE_string(tag_ids, "", "List of tag ids, comma separated list of ints.");
DEFINE_string(name, "rig", "Name of the rig.");

DEFINE_int32(
    root_tag_id, -1,
    "The root tag id, -1 will result in root_tag_id == first value in tag_ids");

typedef farm_ng_proto::tractor::v1::Event EventPb;
using farm_ng_proto::tractor::v1::ApriltagDetections;
using farm_ng_proto::tractor::v1::CalibrateApriltagRigConfiguration;
using farm_ng_proto::tractor::v1::CalibrateApriltagRigResult;
using farm_ng_proto::tractor::v1::CalibrateApriltagRigStatus;
using farm_ng_proto::tractor::v1::CaptureCalibrationDatasetResult;
using farm_ng_proto::tractor::v1::MonocularApriltagRigModel;

namespace farm_ng {

namespace {
bool is_calibration_event(const std::string& s) {
  return s.rfind("calibrator/", 0) == 0;
}
}  // namespace

class CalibrateApriltagRigProgram {
 public:
  CalibrateApriltagRigProgram(
      EventBus& bus,
      std::optional<CalibrateApriltagRigConfiguration> configuration)
      : bus_(bus), timer_(bus_.get_io_service()) {
    if (configuration.has_value()) {
      set_configuration(configuration.value());
    } else {
      status_.mutable_input_required_configuration()->set_name(FLAGS_name);
      status_.mutable_input_required_configuration()->set_root_tag_id(
          FLAGS_root_tag_id);
    }
    bus_.GetEventSignal()->connect(std::bind(
        &CalibrateApriltagRigProgram::on_event, this, std::placeholders::_1));
    on_timer(boost::system::error_code());
  }

  ~CalibrateApriltagRigProgram() {
    if (bus_.get_io_service().stopped()) {
      LOG(INFO) << "bus was stopped for some reason...";
      bus_.get_io_service().reset();
    }
    farm_ng::RequestStopLogging(bus_);
    LOG(INFO) << "Requested Stop logging";
    int n_jobs = bus_.get_io_service().poll();
    LOG(INFO) << "Ran " << n_jobs << " jobs.";
  }

  void OnLogEvent(const EventPb& event, ApriltagRigCalibrator* calibrator) {
    if (!is_calibration_event(event.name())) {
      return;
    }
    ApriltagDetections detections;
    if (!event.data().UnpackTo(&detections)) {
      return;
    }
  }

  // reads the event log from the CalibrationDatasetResult, and
  // populates a MonocularApriltagRigModel to be solved.
  ApriltagRigModel LoadCalibrationDataset() {
    auto dataset_result =
        ReadProtobufFromResource<CaptureCalibrationDatasetResult>(
            configuration_.calibration_dataset());

    EventLogReader log_reader(dataset_result.dataset());
    ApriltagRigCalibrator calibrator(&bus_, configuration_);
    while (true) {
      EventPb event;
      try {
        bus_.get_io_service().poll();
        event = log_reader.ReadNext();
        OnLogEvent(event, &calibrator);
      } catch (std::runtime_error& e) {
        break;
      }
    }
    return calibrator.PoseInitialization();
  }

  int run() {
    if (status_.has_input_required_configuration()) {
      set_configuration(
          WaitForConfiguration<CalibrateApriltagRigConfiguration>(bus_));
    }
    WaitForServices(bus_, {"ipc-logger"});
    LoggingStatus log = StartLogging(bus_, configuration_.name());

    ApriltagRigModel model = LoadCalibrationDataset();

    MonocularApriltagRigModel initial_model_pb;
    model.ToMonocularApriltagRigModel(&initial_model_pb);

    CalibrateApriltagRigResult result;
    result.mutable_configuration()->CopyFrom(configuration_);
    result.mutable_monocular_apriltag_rig_initial()->CopyFrom(
        ArchiveProtobufAsBinaryResource("apriltag_rig_model/initial",
                                        initial_model_pb));
    result.set_rmse(model.rmse);
    result.set_solver_status(model.status);
    result.mutable_stamp_end()->CopyFrom(MakeTimestampNow());
    if (log.has_recording()) {
      result.mutable_event_log()->set_path(log.recording().archive_path());
    }
    status_.mutable_result()->CopyFrom(ArchiveProtobufAsJsonResource(
        "apriltag_rig_model/initial_result", result));
    send_status();

    farm_ng::Solve(&model);
    MonocularApriltagRigModel final_model_pb;
    model.ToMonocularApriltagRigModel(&final_model_pb);
    result.mutable_monocular_apriltag_rig_solved()->CopyFrom(
        ArchiveProtobufAsBinaryResource("apriltag_rig_model/solved",
                                        initial_model_pb));
    result.set_rmse(model.rmse);
    result.set_solver_status(model.status);
    result.mutable_stamp_end()->CopyFrom(MakeTimestampNow());

    auto result_resource = WriteProtobufAsBinaryResource(
        BucketId::kApriltagRigModels, configuration_.name(), result);
    status_.mutable_result()->CopyFrom(result_resource);
    send_status();
    return 0;
  }

  void send_status() {
    bus_.Send(MakeEvent("calibrate_apriltag_rig/status", status_));
  }

  void on_timer(const boost::system::error_code& error) {
    if (error) {
      LOG(WARNING) << "timer error: " << __PRETTY_FUNCTION__ << error;
      return;
    }
    timer_.expires_from_now(boost::posix_time::millisec(1000));
    timer_.async_wait(std::bind(&CalibrateApriltagRigProgram::on_timer, this,
                                std::placeholders::_1));

    send_status();
  }

  bool on_configuration(const EventPb& event) {
    CalibrateApriltagRigConfiguration configuration;
    if (!event.data().UnpackTo(&configuration)) {
      return false;
    }
    VLOG(2) << configuration.ShortDebugString();
    set_configuration(configuration);
    return true;
  }

  void set_configuration(CalibrateApriltagRigConfiguration configuration) {
    configuration_ = configuration;
    status_.clear_input_required_configuration();
    send_status();
  }

  void on_event(const EventPb& event) {
    if (!event.name().rfind("calibrate_apriltag_rig/", 0) == 0) {
      return;
    }
    if (on_configuration(event)) {
      return;
    }
  }

 private:
  EventBus& bus_;
  boost::asio::deadline_timer timer_;
  CalibrateApriltagRigConfiguration configuration_;
  CalibrateApriltagRigStatus status_;
  CalibrateApriltagRigResult result_;
};

}  // namespace farm_ng

int main(int argc, char* argv[]) {
  gflags::ParseCommandLineFlags(&argc, &argv, true);
  FLAGS_logtostderr = 1;

  google::InitGoogleLogging(argv[0]);
  google::InstallFailureSignalHandler();

  boost::asio::io_service io_service;

  boost::asio::signal_set signals(io_service, SIGTERM, SIGINT);
  signals.async_wait([&io_service](const boost::system::error_code& error,
                                   int signal_number) {
    std::cout << "Received (error, signal) " << error << " , " << signal_number
              << std::endl;
    io_service.stop();
    throw std::runtime_error("signal caught: " + std::to_string(signal_number));
  });

  try {
    farm_ng::EventBus& bus =
        farm_ng::GetEventBus(io_service, "calibrate_apriltag_rig");
    std::optional<CalibrateApriltagRigConfiguration> configuration;
    if (!FLAGS_interactive) {
      CalibrateApriltagRigConfiguration flags_config;
      std::stringstream tag_ids_stream(FLAGS_tag_ids);
      while (tag_ids_stream.good()) {
        std::string tag_id;
        std::getline(tag_ids_stream, tag_id, ',');
        flags_config.add_tag_ids(stoi(tag_id));
      }
      flags_config.mutable_calibration_dataset()->set_path(
          FLAGS_calibration_dataset);
      flags_config.set_root_tag_id(FLAGS_root_tag_id);
      flags_config.set_name(FLAGS_name);
      configuration = flags_config;
    }
    farm_ng::CalibrateApriltagRigProgram program(bus, configuration);
    return program.run();
  } catch (std::runtime_error& e) {
    LOG(WARNING) << "caught error." << e.what()
                 << " stopped: " << io_service.stopped();
    return 1;
  }
}
