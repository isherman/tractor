#ifndef FARM_NG_CALIBRATION_KINEMATICS_H_
#define FARM_NG_CALIBRATION_KINEMATICS_H_
#include <sophus/se3.hpp>

namespace farm_ng {
template <typename T>
static Sophus::SE3<T> TractorPoseDelta(
    const Eigen::Matrix<T, 2, 1>& base_parameters,
    const BaseToCameraModel::WheelMeasurement wheel_measurement) {
  const T& wheel_radius = base_parameters[0];
  const T& wheel_baseline = base_parameters[1];
  T vel_left(wheel_measurement.wheel_velocity_rads_left());
  T vel_right(wheel_measurement.wheel_velocity_rads_right());
  T dt(wheel_measurement.dt());
  T v = T(wheel_radius / 2.0) * (vel_left + vel_right);
  T w = (wheel_radius / wheel_baseline) * (vel_right - vel_left);
  Eigen::Matrix<T, 6, 1> x;
  x << v * dt, T(0), T(0), T(0), T(0), w * dt;
  return Sophus::SE3<T>::exp(x);
}
template <typename T>
Sophus::SE3<T> TractorStartPoseTractorEnd(
    const Eigen::Matrix<T, 2, 1>& base_params,
    const BaseToCameraModel::Sample& sample) {
  Sophus::SE3<T> tractor_start_pose_tractor_end =
      Sophus::SE3d::rotZ(0).cast<T>();
  for (const auto& wheel_state : sample.wheel_measurements()) {
    tractor_start_pose_tractor_end =
        tractor_start_pose_tractor_end *
        TractorPoseDelta<T>(base_params, wheel_state);
  }
  return tractor_start_pose_tractor_end;
}
}  // namespace farm_ng
#endif
