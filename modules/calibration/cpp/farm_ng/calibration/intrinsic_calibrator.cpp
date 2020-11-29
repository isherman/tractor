#include "farm_ng/calibration/intrinsic_calibrator.h"

#include <ceres/ceres.h>

#include "farm_ng/core/blobstore.h"
#include "farm_ng/core/event_log_reader.h"

#include "farm_ng/perception/apriltag.h"
#include "farm_ng/perception/camera_model.h"
#include "farm_ng/perception/capture_video_dataset.pb.h"
#include "farm_ng/perception/pose_graph.h"

namespace farm_ng {
namespace calibration {
using perception::ApriltagRig;
using perception::PoseGraph;
using Sophus::SE3d;

IntrinsicModel SolveIntrinsicsModel(IntrinsicModel model) {
  perception::CameraModelJetMap<double> camera_model_param(
      model.camera_model());
  ceres::Problem problem;
  problem.AddParameterBlock(camera_model_param.data(),
                            camera_model_param.data_size(), nullptr);

  std::map<int, std::pair<std::string, std::string> > id_frame_map;
  PoseGraph pose_graph;
  for (const auto& apriltag_rig : model.apriltag_rigs()) {
    for (const ApriltagRig::Node& node : apriltag_rig.nodes()) {
      pose_graph.AddPose(node.pose());

      id_frame_map[node.id()] =
          std::make_pair(node.frame_name(), apriltag_rig.name());
    }
  }
  for (auto id_name : id_frame_map) {
    LOG(INFO) << "id: " << id_name.first << " -> " << id_name.second.first
              << " " << id_name.second.second;
  }
  int count = 0;
  for (const auto& detections : model.detections()) {
    std::string camera_frame_name =
        model.camera_model().frame_name() + "/" + std::to_string(count++);
    for (const auto& detection : detections.detections()) {
      int tag_id = detection.id();
      auto it_name = id_frame_map.find(tag_id);
      if (it_name != id_frame_map.end()) {
        SE3d camera_pose_tag;
        perception::ProtoToSophus(detection.pose().a_pose_b(),
                                  &camera_pose_tag);
        if (detection.pose().frame_b() == model.camera_model().frame_name()) {
          camera_pose_tag = camera_pose_tag.inverse();

        } else {
          CHECK_EQ(detection.pose().frame_a(),
                   model.camera_model().frame_name());
        }

        const auto& rig_frame = it_name->second.second;
        std::optional<SE3d> tag_pose_rig =
            pose_graph.AverageAPoseB(it_name->second.first, rig_frame);
        if (!tag_pose_rig) {
          continue;
        }
        SE3d camera_pose_rig = camera_pose_tag * (*tag_pose_rig);
        pose_graph.AddPose(camera_frame_name, rig_frame, camera_pose_rig);
      }
    }
    for (const auto& apriltag_rig : model.apriltag_rigs()) {
      auto camera_pose_rig =
          pose_graph.AverageAPoseB(camera_frame_name, apriltag_rig.name());
      if (camera_pose_rig) {
        LOG(INFO) << camera_frame_name << " <- " << apriltag_rig.name() << " "
                  << camera_pose_rig->translation().transpose() << " q: "
                  << camera_pose_rig->unit_quaternion().vec().transpose();
      }
    }
  }

  return model;
}  // namespace calibration
IntrinsicModel InitialIntrinsicModelFromConfig(
    const CalibrateIntrinsicsConfiguration& config) {
  auto dataset_result =
      core::ReadProtobufFromResource<perception::CaptureVideoDatasetResult>(
          config.video_dataset());

  IntrinsicModel intrinsic_model;
  intrinsic_model.set_solver_status(SolverStatus::SOLVER_STATUS_INITIAL);
  intrinsic_model.set_rmse(0);

  for (auto rig_resource : dataset_result.configuration().apriltag_rigs()) {
    intrinsic_model.add_apriltag_rigs()->CopyFrom(
        core::ReadProtobufFromResource<perception::ApriltagRig>(rig_resource));
  }

  core::EventLogReader log_reader(dataset_result.dataset());
  perception::ApriltagsFilter filter;

  while (true) {
    core::Event event;
    try {
      event = log_reader.ReadNext();
    } catch (std::runtime_error& e) {
      break;
    }
    perception::ApriltagDetections detections;
    if (event.data().UnpackTo(&detections)) {
      if (detections.image().camera_model().frame_name() !=
          config.camera_name()) {
        continue;
      }
      if (!filter.AddApriltags(detections, 2, 21)) {
        continue;
      }
      intrinsic_model.add_detections()->CopyFrom(detections);
      LOG(INFO) << intrinsic_model.detections_size();
      if (!intrinsic_model.camera_model().image_height()) {
        LOG(INFO) << "Initial model: "
                  << detections.image().camera_model().ShortDebugString();
        intrinsic_model.mutable_camera_model()->CopyFrom(
            detections.image().camera_model());
      } else {
        CHECK_EQ(intrinsic_model.camera_model().image_height(),
                 detections.image().camera_model().image_height());
        CHECK_EQ(intrinsic_model.camera_model().image_width(),
                 detections.image().camera_model().image_width());
      }
    }
  }

  return intrinsic_model;
}
}  // namespace calibration
}  // namespace farm_ng
