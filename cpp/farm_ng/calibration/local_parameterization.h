#ifndef FARM_NG_CALIBRATION_LOCAL_PARAMETERIZATION_SE3_H_
#define FARM_NG_CALIBRATION_LOCAL_PARAMETERIZATION_SE3_H_

#include <array>

#include <ceres/local_parameterization.h>

namespace farm_ng {

class LocalParameterizationAbs : public ceres::LocalParameterization {
 public:
  LocalParameterizationAbs(int size);

  virtual ~LocalParameterizationAbs();

  bool Plus(const double* x, const double* delta, double* x_plus_delta) const;

  bool ComputeJacobian(const double* x, double* jacobian) const;

  virtual int GlobalSize() const;

  virtual int LocalSize() const;
  int size_;
};

// https://github.com/strasdat/Sophus/blob/master/test/ceres/local_parameterization_se3.hpp
class LocalParameterizationSE3 : public ceres::LocalParameterization {
 public:
  // Set constancy_mask to 1 to hold const at the corresponding tangent vector
  // index {tx, ty, tz, rx, ry, rz}
  explicit LocalParameterizationSE3(const std::array<int, 6>& constancy_mask = {
                                        0});
  ~LocalParameterizationSE3();

  // SE3 plus operation for Ceres, note this premultiplies by exp(x) so that
  // holding a value constant is with respect to the parent frame.
  //
  //  a_T_b' = a_T_b * exp(b_x_b')
  //
  bool Plus(double const* T_raw, double const* delta_raw,
            double* T_plus_delta_raw) const override;

  // Jacobian of SE3 plus operation for Ceres
  //
  // Dx T * exp(x)  with  x=0
  //
  bool ComputeJacobian(double const* T_raw,
                       double* jacobian_raw) const override;

  int GlobalSize() const override;
  int LocalSize() const override;

 private:
  std::array<int, 6> constancy_mask_;
  int local_size_;
};

}  // namespace farm_ng

#endif  // FARM_NG_CALIBRATION_LOCAL_PARAMETERIZATION_SE3_H_
