#include "farm_ng/calibration/intrinsic_calibrator.h"

#include <ceres/ceres.h>

#include "farm_ng/core/blobstore.h"
#include "farm_ng/core/event_log_reader.h"

#include "farm_ng/perception/apriltag.h"
#include "farm_ng/perception/camera_model.h"
#include "farm_ng/perception/capture_video_dataset.pb.h"
#include "farm_ng/perception/pose_graph.h"

#include "farm_ng/calibration/local_parameterization.h"

namespace farm_ng {
namespace calibration {
using perception::ApriltagRig;
using perception::CameraModel;
using perception::PointsImage;
using perception::PointsTag;
using perception::PoseEdge;
using perception::PoseGraph;
using perception::SE3Map;

using Sophus::SE3d;

struct IntrinsicCostFunctor {
  IntrinsicCostFunctor(const CameraModel& camera,
                       std::array<Eigen::Vector3d, 4> points_tag,
                       std::array<Eigen::Vector2d, 4> points_image,
                       SE3Map camera_pose_tag_rig, SE3Map tag_rig_pose_tag)
      : camera_(camera),
        points_tag_(points_tag),
        points_image_(points_image),
        camera_pose_tag_rig_(camera_pose_tag_rig),
        tag_rig_pose_tag_(tag_rig_pose_tag) {}

  template <class T>
  Eigen::Matrix<T, 4, 2> Project(T const* const raw_camera_model,
                                 T const* const raw_camera_pose_tag_rig,
                                 T const* const raw_tag_rig_pose_tag) const {
    auto camera_pose_tag_rig =
        camera_pose_tag_rig_.Map(raw_camera_pose_tag_rig);
    auto tag_rig_pose_tag = tag_rig_pose_tag_.Map(raw_tag_rig_pose_tag);

    Sophus::SE3<T> camera_pose_tag = camera_pose_tag_rig * tag_rig_pose_tag;

    perception::CameraModelJetMap<T> camera_model(raw_camera_model, camera_);
    Eigen::Matrix<T, 4, 2> points_image;
    for (int i = 0; i < 4; ++i) {
      points_image.row(i) = ProjectPointToPixel(
          camera_model, camera_pose_tag * points_tag_[i].cast<T>());
    }
    return points_image;
  }

  template <class T>
  bool operator()(T const* const raw_camera_model,
                  T const* const raw_camera_pose_tag_rig,
                  T const* const raw_tag_rig_pose_tag, T* raw_residuals) const {
    Eigen::Map<Eigen::Matrix<T, 4, 2>> residuals(raw_residuals);

    Eigen::Matrix<T, 4, 2> points_image = Project(
        raw_camera_model, raw_camera_pose_tag_rig, raw_tag_rig_pose_tag);

    for (int i = 0; i < 4; ++i) {
      residuals.row(i) =
          points_image_[i].cast<T>() - points_image.row(i).transpose();
    }
    return true;
  }
  CameraModel camera_;
  std::array<Eigen::Vector3d, 4> points_tag_;
  std::array<Eigen::Vector2d, 4> points_image_;
  SE3Map camera_pose_tag_rig_;
  SE3Map tag_rig_pose_tag_;
};

class ApriltagRigIdMap {
 public:
  ApriltagRigIdMap() = default;

  struct FrameNames {
    std::string tag_frame;
    std::string rig_frame;
  };

  void AddRig(const ApriltagRig& rig) {
    for (const ApriltagRig::Node& node : rig.nodes()) {
      insert(rig, node);
    }
  }

  std::optional<FrameNames> GetFrameNames(int tag_id) {
    auto it_name = id_frame_map_.find(tag_id);
    if (it_name != id_frame_map_.end()) {
      return it_name->second;
    }
    return std::optional<FrameNames>();
  }

 private:
  void insert(const ApriltagRig& rig, const ApriltagRig::Node& node) {
    auto it_inserted = id_frame_map_.insert(
        std::make_pair(node.id(), FrameNames{node.frame_name(), rig.name()}));
    CHECK(it_inserted.second)
        << "Failed to insert duplicate node: " << node.ShortDebugString();
  }
  std::map<int, FrameNames> id_frame_map_;
};

std::string CameraFrameName(const CameraModel& camera_model, int frame_count) {
  return camera_model.frame_name() + "/" + std::to_string(frame_count);
}
std::tuple<PoseGraph, ApriltagRigIdMap> InitialPoseGraphFromModel(
    const IntrinsicModel& model) {
  PoseGraph pose_graph;
  ApriltagRigIdMap id_map;
  for (const auto& apriltag_rig : model.apriltag_rigs()) {
    id_map.AddRig(apriltag_rig);
    for (const ApriltagRig::Node& node : apriltag_rig.nodes()) {
      pose_graph.AddPose(node.pose());
    }
  }

  for (int i = 0; i < model.detections_size(); ++i) {
    const auto& detections = model.detections(i);
    std::string camera_frame_name = CameraFrameName(model.camera_model(), i);
    for (const auto& detection : detections.detections()) {
      auto frame_names = id_map.GetFrameNames(detection.id());
      if (!frame_names) {
        continue;
      }

      SE3d camera_pose_tag;
      perception::ProtoToSophus(detection.pose().a_pose_b(), &camera_pose_tag);
      if (detection.pose().frame_b() == model.camera_model().frame_name()) {
        camera_pose_tag = camera_pose_tag.inverse();

      } else {
        CHECK_EQ(detection.pose().frame_a(), model.camera_model().frame_name());
      }
      std::optional<SE3d> tag_pose_rig = pose_graph.AverageAPoseB(
          frame_names->tag_frame, frame_names->rig_frame);
      if (!tag_pose_rig) {
        continue;
      }
      SE3d camera_pose_rig = camera_pose_tag * (*tag_pose_rig);
      pose_graph.AddPose(camera_frame_name, frame_names->rig_frame,
                         camera_pose_rig);
    }
    for (const auto& apriltag_rig : model.apriltag_rigs()) {
      auto camera_pose_rig =
          pose_graph.AverageAPoseB(camera_frame_name, apriltag_rig.name());
    }
  }
  return {pose_graph, id_map};
}

IntrinsicModel SolveIntrinsicsModel(IntrinsicModel model) {
  perception::CameraModelJetMap<double> camera_model_param(
      model.camera_model());
  PoseGraph pose_graph;
  ApriltagRigIdMap id_map;
  std::tie(pose_graph, id_map) = InitialPoseGraphFromModel(model);

  ceres::Problem problem;
  problem.AddParameterBlock(camera_model_param.data(),
                            camera_model_param.data_size(), nullptr);
  for (PoseEdge* pose_edge : pose_graph.MutablePoseEdges()) {
    LOG(INFO) << *pose_edge;
    problem.AddParameterBlock(pose_edge->GetAPoseB().data(),
                              SE3d::num_parameters,
                              new LocalParameterizationSE3);
    problem.SetParameterBlockConstant(pose_edge->GetAPoseB().data());
  }

  for (int i = 0; i < model.detections_size(); ++i) {
    std::string camera_frame = CameraFrameName(model.camera_model(), i);
    for (const auto& detection : model.detections(i).detections()) {
      auto frame_names = id_map.GetFrameNames(detection.id());
      if (!frame_names) {
        continue;
      }
      PoseEdge* tag_to_tag_rig = pose_graph.MutablePoseEdge(
          frame_names->tag_frame, frame_names->rig_frame);

      PoseEdge* camera_to_tag_rig =
          pose_graph.MutablePoseEdge(camera_frame, frame_names->rig_frame);

      ceres::CostFunction* cost_function1 = new ceres::AutoDiffCostFunction<
          IntrinsicCostFunctor,
          8,  // 2*4 residuals
          perception::CameraModelJetMap<double>::num_parameters,  // camera
                                                                  // intrinsics
          Sophus::SE3d::num_parameters,  // camera_to_rig
          Sophus::SE3d::num_parameters   // tag_to_rig
          >(new IntrinsicCostFunctor(
          model.camera_model(), PointsTag(detection), PointsImage(detection),
          camera_to_tag_rig->GetAPoseBMap(camera_frame, frame_names->rig_frame),
          tag_to_tag_rig->GetAPoseBMap(frame_names->rig_frame,
                                       frame_names->tag_frame)));
      problem.AddResidualBlock(cost_function1, new ceres::CauchyLoss(1.0),
                               camera_model_param.data(),
                               camera_to_tag_rig->GetAPoseB().data(),
                               tag_to_tag_rig->GetAPoseB().data());
    }
  }

  // Set solver options (precision / method)
  ceres::Solver::Options options;
  options.linear_solver_type = ceres::SPARSE_SCHUR;
  options.gradient_tolerance = 1e-18;
  options.function_tolerance = 1e-18;
  options.parameter_tolerance = 1e-18;
  options.max_num_iterations = 2000;

  // Solve
  ceres::Solver::Summary summary;
  options.logging_type = ceres::PER_MINIMIZER_ITERATION;
  options.minimizer_progress_to_stdout = true;
  ceres::Solve(options, &problem, &summary);
  LOG(INFO) << summary.FullReport() << std::endl;
  if (summary.termination_type == ceres::CONVERGENCE) {
    model.set_solver_status(SolverStatus::SOLVER_STATUS_CONVERGED);
  } else {
    model.set_solver_status(SolverStatus::SOLVER_STATUS_FAILED);
  }
  LOG(INFO) << " Initial model: " << model.camera_model().ShortDebugString();

  LOG(INFO) << " Solved model: "
            << camera_model_param.GetCameraModel().ShortDebugString();
  model.mutable_camera_model()->CopyFrom(camera_model_param.GetCameraModel());

  return model;
}

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
      if (config.filter_stable_tags() &&
          !filter.AddApriltags(detections, 2, 21)) {
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
