#include "farm_ng/calibration/base_to_camera_calibrator.h"

#include <ceres/ceres.h>

#include <google/protobuf/util/time_util.h>

#include "farm_ng/blobstore.h"

#include "farm_ng/event_log_reader.h"
#include "farm_ng/ipc.h"
#include "farm_ng/sophus_protobuf.h"

#include "farm_ng/calibration/apriltag_rig_calibrator.h"
#include "farm_ng/calibration/kinematics.h"
#include "farm_ng/calibration/local_parameterization.h"
#include "farm_ng/calibration/pose_utils.h"

#include "farm_ng_proto/tractor/v1/tractor.pb.h"

namespace farm_ng {

typedef farm_ng_proto::tractor::v1::Event EventPb;
using farm_ng_proto::tractor::v1::ApriltagDetections;
using farm_ng_proto::tractor::v1::BaseToCameraModel;
using farm_ng_proto::tractor::v1::MonocularApriltagRigModel;
using farm_ng_proto::tractor::v1::NamedSE3Pose;
using farm_ng_proto::tractor::v1::SolverStatus;
using farm_ng_proto::tractor::v1::TractorState;
using Sophus::SE3d;

struct BasePoseCameraCostFunctor {
  BasePoseCameraCostFunctor(const BaseToCameraModel::Sample& sample)
      : sample_(sample) {
    SE3d camera_pose_rig_end;
    SE3d camera_pose_rig_start;
    ProtoToSophus(sample.camera_pose_rig_start().a_pose_b(),
                  &camera_pose_rig_start);
    ProtoToSophus(sample.camera_pose_rig_end().a_pose_b(),
                  &camera_pose_rig_end);
    camera_end_pose_camera_start_ =
        camera_pose_rig_end * camera_pose_rig_start.inverse();
  }

  template <class T>
  bool operator()(T const* const raw_camera_pose_base,
                  T const* const raw_base_params, T* raw_residuals) const {
    Eigen::Map<Sophus::SE3<T> const> const camera_pose_base(
        raw_camera_pose_base);
    auto base_pose_camera = camera_pose_base.inverse();
    Eigen::Map<Eigen::Matrix<T, 2, 1> const> const base_params(raw_base_params);
    const Sophus::SE3<T> camera_end_pose_camera_start(
        camera_end_pose_camera_start_.cast<T>());
    Eigen::Map<Eigen::Matrix<T, 6, 1>> residuals(raw_residuals);

    Sophus::SE3<T> tractor_start_pose_tractor_end =
        TractorStartPoseTractorEnd<T>(base_params, sample_);

    auto tractor_start_pose_tractor_start =
        tractor_start_pose_tractor_end * base_pose_camera *
        camera_end_pose_camera_start * camera_pose_base;

    residuals = tractor_start_pose_tractor_start.log();
    return true;
  }
  BaseToCameraModel::Sample sample_;
  SE3d camera_end_pose_camera_start_;
};

class BaseToCameraIterationCallback : public ceres::IterationCallback {
 public:
  explicit BaseToCameraIterationCallback(const SE3d* camera_pose_base,
                                         const Eigen::Vector2d* base_parameters)
      : camera_pose_base_(camera_pose_base),
        base_parameters_(base_parameters) {}

  ~BaseToCameraIterationCallback() {}

  ceres::CallbackReturnType operator()(
      const ceres::IterationSummary& summary = ceres::IterationSummary()) {
    SE3Pose pose_pb;
    SophusToProto(camera_pose_base_->inverse(), &pose_pb);
    LOG(INFO) << "base_pose_camera: " << pose_pb.ShortDebugString()
              << " wheel_radius (inches): " << (*base_parameters_)[0] / 0.0254
              << " wheel_baseline (inches): "
              << (*base_parameters_)[1] / 0.0254;
    return ceres::SOLVER_CONTINUE;
  }

 private:
  const SE3d* camera_pose_base_;
  const Eigen::Vector2d* base_parameters_;
};

BaseToCameraModel SolveBasePoseCamera(BaseToCameraModel model,
                                      bool hold_base_parameters_const) {
  SE3d base_pose_camera;
  ProtoToSophus(model.base_pose_camera().a_pose_b(), &base_pose_camera);
  SE3d camera_pose_base = base_pose_camera.inverse();
  Eigen::Vector2d base_parameters(model.wheel_radius(), model.wheel_baseline());

  ceres::Problem problem;

  // here we hold Z constant, through the local parameterization.
  problem.AddParameterBlock(camera_pose_base.data(), SE3d::num_parameters,
                            new LocalParameterizationSE3({0, 0, 1, 0, 0, 0}));

  problem.AddParameterBlock(base_parameters.data(), 2,
                            new LocalParameterizationAbs(2));
  if (hold_base_parameters_const) {
    problem.SetParameterBlockConstant(base_parameters.data());
  }
  for (const auto& sample : model.samples()) {
    ceres::CostFunction* cost_function1 =
        new ceres::AutoDiffCostFunction<BasePoseCameraCostFunctor, 6,
                                        Sophus::SE3d::num_parameters, 2>(
            new BasePoseCameraCostFunctor(sample));
    problem.AddResidualBlock(cost_function1, nullptr, camera_pose_base.data(),
                             base_parameters.data());
  }

  BaseToCameraIterationCallback callback(&camera_pose_base, &base_parameters);
  // Set solver options (precision / method)
  ceres::Solver::Options options;
  options.gradient_tolerance = 1e-8;
  options.function_tolerance = 1e-8;
  options.parameter_tolerance = 1e-8;
  options.max_num_iterations = 2000;
  options.callbacks.push_back(&callback);

  // Solve
  ceres::Solver::Summary summary;
  options.logging_type = ceres::PER_MINIMIZER_ITERATION;
  options.minimizer_progress_to_stdout = true;
  options.update_state_every_iteration = true;
  ceres::Solve(options, &problem, &summary);
  base_pose_camera = camera_pose_base.inverse();
  LOG(INFO) << summary.FullReport() << std::endl;
  double rmse = std::sqrt(summary.final_cost / summary.num_residuals);

  if (summary.IsSolutionUsable()) {
    model.set_solver_status(SolverStatus::SOLVER_STATUS_CONVERGED);
  } else {
    model.set_solver_status(SolverStatus::SOLVER_STATUS_FAILED);
  }

  model.set_rmse(rmse);
  model.set_wheel_radius(base_parameters[0]);
  model.set_wheel_baseline(base_parameters[1]);
  SophusToProto(base_pose_camera,
                model.mutable_base_pose_camera()->mutable_a_pose_b());

  for (auto& sample : *model.mutable_samples()) {
    sample.mutable_odometry_trajectory_base()->Clear();
    SE3d odometry_pose_base;
    for (const auto& wheel_measurement : sample.wheel_measurements()) {
      auto base_pose_delta =
          TractorPoseDelta(base_parameters, wheel_measurement);
      odometry_pose_base = odometry_pose_base * base_pose_delta;
      SophusToProto(odometry_pose_base, wheel_measurement.stamp(),
                    sample.mutable_odometry_trajectory_base()->add_a_poses_b());
    }

    sample.mutable_visual_odometry_trajectory_base()->Clear();

    SE3d camera_pose_rig_start;
    ProtoToSophus(sample.camera_pose_rig_start().a_pose_b(),
                  &camera_pose_rig_start);

    SophusToProto(
        SE3d(), sample.camera_pose_rig_start().a_pose_b().stamp(),
        sample.mutable_visual_odometry_trajectory_base()->add_a_poses_b());

    for (const auto& camera_pose_rig_pb :
         sample.camera_trajectory_rig().a_poses_b()) {
      SE3d camera_pose_rig;
      ProtoToSophus(camera_pose_rig_pb, &camera_pose_rig);
      SophusToProto(
          base_pose_camera * camera_pose_rig_start * camera_pose_rig.inverse() *
              base_pose_camera.inverse(),
          camera_pose_rig_pb.stamp(),
          sample.mutable_visual_odometry_trajectory_base()->add_a_poses_b());
    }
    {
      SE3d camera_pose_rig_end;
      ProtoToSophus(sample.camera_pose_rig_end().a_pose_b(),
                    &camera_pose_rig_end);
      SophusToProto(
          base_pose_camera * camera_pose_rig_start *
              camera_pose_rig_end.inverse() * base_pose_camera.inverse(),
          sample.camera_pose_rig_end().a_pose_b().stamp(),
          sample.mutable_visual_odometry_trajectory_base()->add_a_poses_b());
    }
  }
  LOG(INFO) << "root mean of residual error: " << rmse;
  callback();
  return model;
}

void CopyTractorStateToWheelState(
    const TractorState& tractor_state,
    BaseToCameraModel::WheelMeasurement* wheel_measurement) {
  wheel_measurement->set_wheel_velocity_rads_left(
      tractor_state.wheel_velocity_rads_left());

  wheel_measurement->set_wheel_velocity_rads_right(
      tractor_state.wheel_velocity_rads_right());

  wheel_measurement->set_dt(tractor_state.dt());

  wheel_measurement->mutable_stamp()->CopyFrom(tractor_state.stamp());
}

BaseToCameraModel InitialBaseToCameraModelFromEventLog(
    const Resource& event_log_resource, const Resource& apriltag_rig_resource) {
  auto rig_model = ReadProtobufFromResource<MonocularApriltagRigModel>(
      apriltag_rig_resource);

  EventLogReader log_reader(event_log_resource);
  BaseToCameraModel model;
  bool with_initialization = true;
  if (with_initialization) {
    model.set_wheel_radius((17.0 / 2.0) * 0.0254);
    model.set_wheel_baseline(42 * 0.0254);
    SophusToProto(Sophus::SE3d::transZ(1.0) * Sophus::SE3d::rotZ(-M_PI / 2.0) *
                      Sophus::SE3d::rotX(M_PI / 2.0) * Sophus::SE3d::rotY(M_PI),
                  "tractor/base", rig_model.camera_frame_name(),
                  model.mutable_base_pose_camera());

  } else {
    // this works, but takes a long time, and is scary!
    model.set_wheel_radius(1);
    model.set_wheel_baseline(1);
  }
  model.set_solver_status(SolverStatus::SOLVER_STATUS_INITIAL);
  BaseToCameraModel::Sample sample;

  bool has_start = false;

  // Set this to add the april tag trajectory to sample, useful for
  // visualization of pose error.
  bool full_apriltag_trajectory = true;

  while (true) {
    EventPb event;
    try {
      event = log_reader.ReadNext();
      TractorState tractor_state;
      if (event.data().UnpackTo(&tractor_state)) {
        if (has_start) {
          farm_ng::CopyTractorStateToWheelState(
              tractor_state, sample.add_wheel_measurements());

          // TODO(ethanrublee) Tractor state is offset by some time in the log,
          // due to the latency of detecting april tags.
          // Align the tractor state to the detection.
          if (false) {
            LOG(INFO)
                << "Difference in time: "
                << google::protobuf::util::TimeUtil::DurationToMicroseconds(
                       tractor_state.stamp() -
                       sample.camera_pose_rig_start().a_pose_b().stamp()) *
                       1e-6;
          }
        }
        // LOG(INFO) << tractor_state.ShortDebugString();
      } else {
        bool calibration_sample =
            farm_ng::StartsWith(event.name(), "calibrator");
        if (!calibration_sample && !full_apriltag_trajectory) {
          continue;
        }
        ApriltagDetections detections;
        if (!event.data().UnpackTo(&detections)) {
          continue;
        }
        if (detections.detections_size() == 0) {
          continue;
        }
        // LOG(INFO) << event.ShortDebugString();
        Sophus::optional<NamedSE3Pose> o_camera_pose_rig =
            farm_ng::EstimateCameraPoseRig(rig_model.rig(), detections);
        if (!o_camera_pose_rig) {
          continue;
        }
        // set our event stamp as the pose stamp.
        o_camera_pose_rig->mutable_a_pose_b()->mutable_stamp()->CopyFrom(
            event.stamp());
        if (!has_start && calibration_sample) {
          sample.mutable_camera_trajectory_rig()->set_frame_a(
              o_camera_pose_rig->frame_a());
          sample.mutable_camera_trajectory_rig()->set_frame_b(
              o_camera_pose_rig->frame_b());

          sample.mutable_camera_pose_rig_start()->CopyFrom(*o_camera_pose_rig);
          has_start = true;
        } else if (has_start && !calibration_sample &&
                   full_apriltag_trajectory) {
          CHECK_EQ(sample.camera_trajectory_rig().frame_a(),
                   o_camera_pose_rig->frame_a());
          CHECK_EQ(sample.camera_trajectory_rig().frame_b(),
                   o_camera_pose_rig->frame_b());
          sample.mutable_camera_trajectory_rig()->add_a_poses_b()->CopyFrom(
              o_camera_pose_rig->a_pose_b());
        } else if (has_start && calibration_sample) {
          sample.mutable_camera_pose_rig_end()->CopyFrom(*o_camera_pose_rig);
          model.add_samples()->CopyFrom(sample);
          LOG(INFO) << "n wheel measurments: "
                    << sample.wheel_measurements().size();
          sample.Clear();
          sample.mutable_camera_pose_rig_start()->CopyFrom(*o_camera_pose_rig);
          sample.mutable_camera_trajectory_rig()->set_frame_a(
              o_camera_pose_rig->frame_a());
          sample.mutable_camera_trajectory_rig()->set_frame_b(
              o_camera_pose_rig->frame_b());
        }
      }
    } catch (std::runtime_error& e) {
      break;
    }
  }
  return model;
}

}  // namespace farm_ng
