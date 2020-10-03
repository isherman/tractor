#include "farm_ng/calibration/local_parameterization.h"

#include <ceres/ceres.h>
#include <sophus/se3.hpp>

namespace farm_ng {
using Sophus::SE3d;
using Sophus::Vector6d;

LocalParameterizationAbs::LocalParameterizationAbs(int size) : size_(size) {}

LocalParameterizationAbs::~LocalParameterizationAbs() {}

bool LocalParameterizationAbs::Plus(const double* x, const double* delta,
                                    double* x_plus_delta) const {
  ceres::VectorRef(x_plus_delta, size_) =
      (ceres::ConstVectorRef(x, size_) + ceres::ConstVectorRef(delta, size_))
          .cwiseAbs();

  return true;
}

bool LocalParameterizationAbs::ComputeJacobian(const double* x,
                                               double* jacobian) const {
  ceres::MatrixRef(jacobian, size_, size_).setIdentity();
  return true;
}

int LocalParameterizationAbs::GlobalSize() const { return size_; }

int LocalParameterizationAbs::LocalSize() const { return size_; }

LocalParameterizationSE3::~LocalParameterizationSE3() {}

// SE3 plus operation for Ceres
//
//  T * exp(x)
//
bool LocalParameterizationSE3::Plus(double const* T_raw,
                                    double const* delta_raw,
                                    double* T_plus_delta_raw) const {
  Eigen::Map<SE3d const> const T(T_raw);
  Eigen::Map<Vector6d const> const delta(delta_raw);
  Eigen::Map<SE3d> T_plus_delta(T_plus_delta_raw);
  T_plus_delta = T * SE3d::exp(delta);
  return true;
}

// Jacobian of SE3 plus operation for Ceres
//
// Dx T * exp(x)  with  x=0
//
bool LocalParameterizationSE3::ComputeJacobian(double const* T_raw,
                                               double* jacobian_raw) const {
  Eigen::Map<SE3d const> T(T_raw);
  Eigen::Map<Eigen::Matrix<double, 7, 6, Eigen::RowMajor>> jacobian(
      jacobian_raw);
  jacobian = T.Dx_this_mul_exp_x_at_0();
  return true;
}

int LocalParameterizationSE3::GlobalSize() const {
  return SE3d::num_parameters;
}
int LocalParameterizationSE3::LocalSize() const { return SE3d::DoF; }

}  // namespace farm_ng
