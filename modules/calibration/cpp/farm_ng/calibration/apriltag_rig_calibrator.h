#ifndef FARM_NG_CALIBRATION_APRILTAG_RIG_CALIBRATOR_H_
#define FARM_NG_CALIBRATION_APRILTAG_RIG_CALIBRATOR_H_
#include <array>
#include <string>
#include <unordered_set>
#include <vector>

#include <sophus/se3.hpp>

#include "farm_ng/perception_core/apriltag.pb.h"
#include "farm_ng/calibration/calibrate_apriltag_rig.pb.h"
#include "farm_ng/calibration/calibrator.pb.h"
#include "farm_ng/perception_core/image.pb.h"

namespace farm_ng {
using farm_ng::calibration::ApriltagRigTagStats;
using farm_ng::calibration::CalibrateApriltagRigConfiguration;
using farm_ng::calibration::MonocularApriltagRigModel;
using farm_ng::calibration::SolverStatus;
using farm_ng::perception_core::ApriltagDetections;
using farm_ng::perception_core::ApriltagRig;
using farm_ng::perception_core::Image;
using farm_ng::perception_core::NamedSE3Pose;
using Sophus::SE3d;

struct ApriltagRigModel {
  int root_id;
  std::string rig_name;
  std::string camera_frame_name;
  std::vector<ApriltagDetections> all_detections;
  std::unordered_map<int, SE3d> tag_pose_root;
  std::unordered_map<int, double> tag_size;
  std::unordered_map<int, std::array<Eigen::Vector3d, 4>> points_tag;
  std::vector<Sophus::optional<SE3d>> camera_poses_root;

  std::vector<Image> reprojection_images;

  SolverStatus status;
  std::unordered_map<int, ApriltagRigTagStats> per_tag_stats;
  double rmse;

  void ToMonocularApriltagRigModel(MonocularApriltagRigModel* rig) const;
};

void ModelError(ApriltagRigModel& model);

Sophus::optional<NamedSE3Pose> EstimateCameraPoseRig(
    const ApriltagRig& rig, const ApriltagDetections& detections);

class ApriltagRigCalibrator {
 public:
  ApriltagRigCalibrator(const CalibrateApriltagRigConfiguration& config);

  void PoseInit(const std::vector<std::unordered_map<int, SE3d>>& frames,
                std::unordered_map<int, SE3d>& tag_mean_pose_root,
                std::vector<Sophus::optional<SE3d>>& camera_poses_root);

  ApriltagRigModel PoseInitialization();
  void AddFrame(ApriltagDetections detections);

  int NumFrames() const;

  std::string rig_name_ = "rig";  // TODO(ethanrublee) set from command/config.
  int root_id_;
  std::unordered_set<int> ids_;
  std::vector<ApriltagDetections> all_detections_;
};

bool Solve(ApriltagRigModel* model);

}  // namespace farm_ng
#endif
