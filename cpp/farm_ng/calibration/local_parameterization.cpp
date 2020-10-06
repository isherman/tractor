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

LocalParameterizationSE3::LocalParameterizationSE3(
    const std::array<int, 6>& hold_const)
    : constancy_mask_(hold_const) {
  local_size_ = 0;
  for (int i = 0; i < 6; ++i) {
    if (!constancy_mask_[i]) local_size_++;
  }
}
LocalParameterizationSE3::~LocalParameterizationSE3() {}

namespace {
struct SE3Plus {
  SE3Plus(const std::array<int, 6>& constancy_mask)
      : constancy_mask_(constancy_mask) {}

  template <typename Scalar>
  bool operator()(const Scalar* T_raw, const Scalar* delta_raw,
                  Scalar* T_plus_delta_raw) const {
    Eigen::Matrix<Scalar, 6, 1> delta;
    for (int i = 0; i < 6; ++i) {
      if (constancy_mask_[i]) {
        delta[i] = Scalar(0.0);
      } else {
        delta[i] = delta_raw[i];
      }
    }
    Eigen::Map<Sophus::SE3<Scalar> const> const T(T_raw);
    Eigen::Map<Sophus::SE3<Scalar>> T_plus_delta(T_plus_delta_raw);
    T_plus_delta = T * Sophus::SE3<Scalar>::exp(delta);
    return true;
  }
  const std::array<int, 6>& constancy_mask_;
};

// Utility class for computing Dx_this_mul_exp_x_at_0 using
// ceres::internal::AutoDifferentiate
struct SE3PlusAt0 {
  SE3PlusAt0(SE3d T, std::array<int, 6> constancy_mask)
      : T_(T), constancy_mask_(constancy_mask) {}
  template <typename Scalar>
  bool operator()(const Scalar* delta_raw, Scalar* T_plus_delta_raw) const {
    Sophus::SE3<Scalar> T = T_.cast<Scalar>();
    return SE3Plus(constancy_mask_)(T.data(), delta_raw, T_plus_delta_raw);
  }
  SE3d T_;
  const std::array<int, 6>& constancy_mask_;
};
}  // namespace

bool LocalParameterizationSE3::Plus(double const* T_raw,
                                    double const* delta_raw,
                                    double* T_plus_delta_raw) const {
  return SE3Plus(constancy_mask_)(T_raw, delta_raw, T_plus_delta_raw);
}

// Jacobian of SE3 plus operation for Ceres
//
// Dx T * exp(x)  with  x=0
//
bool LocalParameterizationSE3::ComputeJacobian(double const* T_raw,
                                               double* jacobian_raw) const {
  // Compared using ceres autodiff versus the generated code in Sophus.
  // This is as fast or faster, and seems to be slight bit more accurate (but
  // really down in the precision bit flipping). This allows for derivative of
  // exp(x)*T or T*exp(x)
  using ParameterDims = typename ceres::SizedCostFunction<7, 6>::ParameterDims;
  std::array<double, 6> zero({0.0, 0.0, 0.0, 0.0, 0.0, 0.0});
  std::array<const double*, 1> parameters({zero.data()});
  constexpr int kOutput = 7;
  double output[kOutput];

  ceres::internal::AutoDifferentiate<kOutput, ParameterDims>(
      SE3PlusAt0(Eigen::Map<SE3d const>(T_raw), constancy_mask_),
      parameters.data(), kOutput, output, &jacobian_raw);
  return true;
}

int LocalParameterizationSE3::GlobalSize() const {
  return SE3d::num_parameters;
}
int LocalParameterizationSE3::LocalSize() const {
  return SE3d::DoF;
}  // return local_size_; }

}  // namespace farm_ng
