#include <iostream>
#include <optional>
#include <sstream>

#include <gflags/gflags.h>
#include <glog/logging.h>

#include "farm_ng/blobstore.h"
#include "farm_ng/event_log_reader.h"
#include "farm_ng/ipc.h"

#include "farm_ng_proto/tractor/v1/apriltag.pb.h"
#include "farm_ng_proto/tractor/v1/calibrate_apriltag_rig.pb.h"
#include "farm_ng_proto/tractor/v1/calibrate_base_to_camera.pb.h"
#include "farm_ng_proto/tractor/v1/calibrator.pb.h"
#include "farm_ng_proto/tractor/v1/capture_calibration_dataset.pb.h"

typedef farm_ng_proto::tractor::v1::Event EventPb;
using farm_ng_proto::tractor::v1::ApriltagDetections;
using farm_ng_proto::tractor::v1::BaseToCameraModel;
using farm_ng_proto::tractor::v1::CalibrateApriltagRigResult;
using farm_ng_proto::tractor::v1::CalibrateBaseToCameraConfiguration;
using farm_ng_proto::tractor::v1::CalibrateBaseToCameraResult;
using farm_ng_proto::tractor::v1::CalibrateBaseToCameraStatus;
using farm_ng_proto::tractor::v1::CaptureCalibrationDatasetResult;
using farm_ng_proto::tractor::v1::MonocularApriltagRigModel;
using farm_ng_proto::tractor::v1::ViewDirection;
using farm_ng_proto::tractor::v1::ViewDirection_Name;
using farm_ng_proto::tractor::v1::ViewDirection_Parse;

DEFINE_bool(interactive, false, "receive program args via eventbus");
DEFINE_string(calibration_dataset, "",
              "The path to a serialized CaptureCalibrationDatasetResult");
DEFINE_string(apriltag_rig_result, "",
              "The path to a serialized ApriltagRigCalibrationResult");
DEFINE_double(wheel_baseline, 0.0, "The wheel baseline parameter");
DEFINE_bool(wheel_baseline_constant, true,
            "Hold the wheel baseline parameter constant");
DEFINE_double(wheel_radius, 0.0, "The wheel radius parameter");
DEFINE_bool(wheel_radius_constant, true,
            "Hold the wheel radius parameter constant");
DEFINE_double(
    base_pose_camera_tx, 0.0,
    "The x component of translation to use for base_to_camera initialization");
DEFINE_bool(base_pose_camera_tx_constant, false,
            "Hold the base_pose_camera_tx parameter constant");
DEFINE_double(
    base_pose_camera_ty, 0.0,
    "The y component of translation to use for base_to_camera initialization");
DEFINE_bool(base_pose_camera_ty_constant, false,
            "Hold the base_pose_camera_ty parameter constant");
DEFINE_double(
    base_pose_camera_tz, 0.0,
    "The z component of translation to use for base_to_camera initialization");
DEFINE_bool(base_pose_camera_tz_constant, false,
            "Hold the base_pose_camera_tz parameter constant");
DEFINE_string(
    camera_direction, ViewDirection_Name(ViewDirection::VIEW_DIRECTION_FRONT),
    "The orientation of the camera, used for base_to_camera initialization. "
    "Must be a valid ViewDirection enum key.");
DEFINE_string(name, "base_to_camera", "Name of the calibration.");

namespace farm_ng {
class CalibrateBaseToCameraProgram {
 public:
  CalibrateBaseToCameraProgram(
      EventBus& bus,
      std::optional<CalibrateBaseToCameraConfiguration> configuration)
      : bus_(bus), timer_(bus_.get_io_service()) {
    if (configuration.has_value()) {
      set_configuration(configuration.value());
    } else {
      status_.mutable_input_required_configuration()->set_name(FLAGS_name);
      status_.mutable_input_required_configuration()->set_root_tag_id(
          FLAGS_root_tag_id);
    }
    bus_.GetEventSignal()->connect(std::bind(
        &CalibrateBaseToCameraProgram::on_event, this, std::placeholders::_1));
    on_timer(boost::system::error_code());
  }

  ~CalibrateBaseToCameraProgram() {
    if (bus_.get_io_service().stopped()) {
      LOG(INFO) << "bus was stopped for some reason...";
      bus_.get_io_service().reset();
    }
    farm_ng::RequestStopLogging(bus_);
    LOG(INFO) << "Requested Stop logging";
    int n_jobs = bus_.get_io_service().poll();
    LOG(INFO) << "Ran " << n_jobs << " jobs.";
  }

  void OnLogEvent(const EventPb& event, MonocularApriltagRigModel* model) {}

  // reads the event log from the CalibrationDatasetResult, and
  // populates a MonocularApriltagRigModel to be solved.
  BaseToCameraModel LoadCalibrationDataset() {
    auto dataset_result =
        ReadProtobufFromResource<CaptureCalibrationDatasetResult>(
            configuration_.calibration_dataset());

    EventLogReader log_reader(dataset_result.dataset());
    BaseToCameraModel model;
    while (true) {
      EventPb event;
      try {
        bus_.get_io_service().poll();
        event = log_reader.ReadNext();
        OnLogEvent(event, &model);
      } catch (std::runtime_error& e) {
        break;
      }
    }
    return model;
  }
  CalibrateBaseToCameraResult SolveBaseToCameraModel(MonocularApriltagRigModel,
                                                     BaseToCameraModel) {
    CalibrateBaseToCameraResult result;
    return result;
  }
  int run() {
    if (status_.has_input_required_configuration()) {
      set_configuration(
          WaitForConfiguration<CalibrateBaseToCameraConfiguration>(bus_));
    }
    WaitForServices(bus_, {"ipc-logger"});
    LoggingStatus log = StartLogging(bus_, configuration_.name());

    MonocularApriltagRigModel rig_model = LoadRigModel();
    BaseToCameraModel initial_model = LoadCalibrationDataset();

    CalibrateBaseToCameraResult result =
        SolveBaseToCameraModel(rig_model, initial_model);

    auto result_resource = WriteProtobufAsBinaryResource(
        BucketId::kBaseToCameraModels, configuration_.name(), result);
    status_.mutable_result()->CopyFrom(result_resource);
    send_status();
    return 0;
  }

  void send_status() {
    bus_.Send(MakeEvent(CalibrateBaseToCameraProgram::id + "/status", status_));
  }

  void on_timer(const boost::system::error_code& error) {
    if (error) {
      LOG(WARNING) << "timer error: " << __PRETTY_FUNCTION__ << error;
      return;
    }
    timer_.expires_from_now(boost::posix_time::millisec(1000));
    timer_.async_wait(std::bind(&CalibrateBaseToCameraProgram::on_timer, this,
                                std::placeholders::_1));

    send_status();
  }

  bool on_configuration(const EventPb& event) {
    CalibrateBaseToCameraConfiguration configuration;
    if (!event.data().UnpackTo(&configuration)) {
      return false;
    }
    VLOG(2) << configuration.ShortDebugString();
    set_configuration(configuration);
    return true;
  }

  void set_configuration(CalibrateBaseToCameraConfiguration configuration) {
    configuration_ = configuration;
    status_.clear_input_required_configuration();
    send_status();
  }

  void on_event(const EventPb& event) {
    if (!event.name().rfind(CalibrateBaseToCameraProgram::id + "/", 0) == 0) {
      return;
    }
    if (on_configuration(event)) {
      return;
    }
  }

  // TODO: Is this the right pattern? Does it meet style guide requirements?
  // https://google.github.io/styleguide/cppguide.html#Static_and_Global_Variables
  static constexpr const char* id = "calibrate_base_to_camera";

 private:
  EventBus& bus_;
  boost::asio::deadline_timer timer_;
  CalibrateBaseToCameraConfiguration configuration_;
  CalibrateBaseToCameraStatus status_;
  CalibrateBaseToCameraResult result_;
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
    farm_ng::EventBus& bus = farm_ng::GetEventBus(
        io_service, farm_ng::CalibrateBaseToCameraProgram::id);
    std::optional<CalibrateBaseToCameraConfiguration> configuration;
    if (!FLAGS_interactive) {
      CalibrateBaseToCameraConfiguration flags_config;
      flags_config.mutable_calibration_dataset()->set_path(
          FLAGS_calibration_dataset);
      flags_config.mutable_calibration_dataset()->set_path(
          FLAGS_apriltag_rig_result);
      flags_config.mutable_wheel_baseline()->set_value(FLAGS_wheel_baseline);
      flags_config.mutable_wheel_baseline()->set_constant(
          FLAGS_wheel_baseline_constant);
      flags_config.mutable_wheel_radius()->set_value(FLAGS_wheel_radius);
      flags_config.mutable_wheel_radius()->set_constant(
          FLAGS_wheel_radius_constant);
      flags_config.mutable_base_pose_camera_initialization()
          ->mutable_x()
          ->set_value(FLAGS_base_pose_camera_tx);
      flags_config.mutable_base_pose_camera_initialization()
          ->mutable_x()
          ->set_constant(FLAGS_base_pose_camera_tx_constant);
      flags_config.mutable_base_pose_camera_initialization()
          ->mutable_y()
          ->set_value(FLAGS_base_pose_camera_ty);
      flags_config.mutable_base_pose_camera_initialization()
          ->mutable_y()
          ->set_constant(FLAGS_base_pose_camera_ty_constant);
      flags_config.mutable_base_pose_camera_initialization()
          ->mutable_z()
          ->set_value(FLAGS_base_pose_camera_tz);
      flags_config.mutable_base_pose_camera_initialization()
          ->mutable_z()
          ->set_constant(FLAGS_base_pose_camera_tz_constant);

      ViewDirection camera_direction;
      CHECK(ViewDirection_Parse(FLAGS_camera_direction, &camera_direction));
      flags_config.mutable_base_pose_camera_initialization()
          ->set_view_direction(camera_direction);
      flags_config.set_name(FLAGS_name);
      configuration = flags_config;
    }
    farm_ng::CalibrateBaseToCameraProgram program(bus, configuration);
    return program.run();
  } catch (std::runtime_error& e) {
    LOG(WARNING) << "caught error." << e.what()
                 << " stopped: " << io_service.stopped();
    return 1;
  }
}
