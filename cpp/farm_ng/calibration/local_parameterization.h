#ifndef FARM_NG_CALIBRATION_LOCAL_PARAMETERIZATION_SE3_H_
#define FARM_NG_CALIBRATION_LOCAL_PARAMETERIZATION_SE3_H_

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
  ~LocalParameterizationSE3();

  // SE3 plus operation for Ceres
  //
  //  T * exp(x)
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
};

}  // namespace farm_ng

#endif  // FARM_NG_CALIBRATION_LOCAL_PARAMETERIZATION_SE3_H_
