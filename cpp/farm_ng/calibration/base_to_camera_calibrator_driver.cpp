#include <fstream>
#include <iostream>
#include <streambuf>
#include <string>

#include <gflags/gflags.h>
#include <glog/logging.h>

#include <ceres/ceres.h>
#include <google/protobuf/util/json_util.h>
#include <google/protobuf/util/time_util.h>

#include "farm_ng/calibration/apriltag_rig_calibrator.h"
#include "farm_ng/calibration/base_to_camera_calibrator.h"
#include "farm_ng/calibration/local_parameterization.h"
#include "farm_ng/calibration/pose_utils.h"
#include "farm_ng/event_log_reader.h"
#include "farm_ng/ipc.h"
#include "farm_ng/sophus_protobuf.h"

#include "farm_ng_proto/tractor/v1/apriltag.pb.h"
#include "farm_ng_proto/tractor/v1/calibrator.pb.h"
#include "farm_ng_proto/tractor/v1/tractor.pb.h"

DEFINE_string(log, "", "Path to log file, recorded with farm-ng-ipc-logger");
DEFINE_string(
    rig_calibration, "",
    "Path to a rig calibration file, recorded with farm-ng-ipc-logger");

DEFINE_string(out_archive, "default",
              "When running from a log, what archive name should we write to?");

typedef farm_ng_proto::tractor::v1::Event EventPb;
using farm_ng_proto::tractor::v1::ApriltagDetections;
using farm_ng_proto::tractor::v1::BaseToCameraModel;
using farm_ng_proto::tractor::v1::MonocularApriltagRigModel;
using farm_ng_proto::tractor::v1::NamedSE3Pose;
using farm_ng_proto::tractor::v1::Resource;
using farm_ng_proto::tractor::v1::TractorState;

namespace farm_ng {
MonocularApriltagRigModel ReadMonocularApriltagRigModelFromDisk(
    const std::string json_file) {
  std::ifstream rig_in(json_file);
  CHECK(rig_in) << "Could not open json_file: " << json_file;
  std::string rig_json_str((std::istreambuf_iterator<char>(rig_in)),
                           std::istreambuf_iterator<char>());

  CHECK(!rig_json_str.empty()) << "Did not load any text from: " << json_file;
  google::protobuf::util::JsonParseOptions options;

  MonocularApriltagRigModel rig_model;
  auto status = google::protobuf::util::JsonStringToMessage(
      rig_json_str, &rig_model, options);
  CHECK(status.ok()) << status;

  return rig_model;
}

}  // namespace farm_ng
int main(int argc, char** argv) {
  // Initialize Google's logging library.
  gflags::ParseCommandLineFlags(&argc, &argv, true);
  FLAGS_logtostderr = 1;

  google::InitGoogleLogging(argv[0]);
  google::InstallFailureSignalHandler();

  // we're reading from a log, so block event_bus events from reaching the
  // calibator.
  if (FLAGS_log.empty()) {
    LOG(INFO) << "Please specify --log=file";
    return -1;
  }

  if (FLAGS_rig_calibration.empty()) {
    LOG(INFO) << "Please specify --rig_calibration=file";
    return -1;
  }

  farm_ng::SetArchivePath(FLAGS_out_archive);

  Resource rig_calib;
  rig_calib.set_path(FLAGS_rig_calibration);

  Resource calib_dataset;
  calib_dataset.set_path(FLAGS_log);

  BaseToCameraModel model =
      farm_ng::InitialBaseToCameraModelFromEventLog(calib_dataset, rig_calib);
  auto initial_resource_pb =
      farm_ng::ArchiveProtobufAsBinaryResource("base_to_camera/initial", model);
  auto solved_model = farm_ng::SolveBasePoseCamera(model, false);
  auto solved_resource_pb = farm_ng::ArchiveProtobufAsBinaryResource(
      "base_to_camera/solved", solved_model);

  LOG(INFO) << "Wrote results to:\n"
            << initial_resource_pb.ShortDebugString() << "\n"
            << solved_resource_pb.ShortDebugString();
  if (false) {
    // NOTE if you have a good initial guess of the wheel radius and baseline
    // but not the camera, it works reasonably well to first solve for just
    // base_pose_camera, with the base params held constant, then solve for both
    // jointly.
    solved_model = farm_ng::SolveBasePoseCamera(model, true);
    solved_model = farm_ng::SolveBasePoseCamera(solved_model, false);
  }
  return 0;
}
