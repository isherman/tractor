#include <chrono>
#include <iomanip>
#include <iostream>
#include <mutex>

#include <glog/logging.h>
#include <google/protobuf/util/time_util.h>
#include <librealsense2/rsutil.h>
#include <librealsense2/rs.hpp>

#include <opencv2/opencv.hpp>

#include "apriltag.h"
#include "apriltag_pose.h"
#include "tag36h11.h"

#include <farm_ng/ipc.h>
#include <farm_ng/sophus_protobuf.h>

#include <farm_ng_proto/tractor/v1/apriltag.pb.h>
#include <farm_ng_proto/tractor/v1/geometry.pb.h>
#include <farm_ng_proto/tractor/v1/tracking_camera.pb.h>

using farm_ng_proto::tractor::v1::Event;
using farm_ng_proto::tractor::v1::NamedSE3Pose;
using farm_ng_proto::tractor::v1::Vec2;

using farm_ng_proto::tractor::v1::ApriltagDetection;
using farm_ng_proto::tractor::v1::ApriltagDetections;
using farm_ng_proto::tractor::v1::TrackingCameraPoseFrame;

namespace farm_ng {

// Convert rs2::frame to cv::Mat
// https://raw.githubusercontent.com/IntelRealSense/librealsense/master/wrappers/opencv/cv-helpers.hpp
cv::Mat frame_to_mat(const rs2::frame& f) {
  using namespace cv;
  using namespace rs2;

  auto vf = f.as<video_frame>();
  const int w = vf.get_width();
  const int h = vf.get_height();
  if (f.get_profile().format() == RS2_FORMAT_BGR8) {
    return Mat(Size(w, h), CV_8UC3, (void*)f.get_data(), Mat::AUTO_STEP);
  } else if (f.get_profile().format() == RS2_FORMAT_RGB8) {
    auto r_rgb = Mat(Size(w, h), CV_8UC3, (void*)f.get_data(), Mat::AUTO_STEP);
    Mat r_bgr;
    cvtColor(r_rgb, r_bgr, COLOR_RGB2BGR);
    return r_bgr;
  } else if (f.get_profile().format() == RS2_FORMAT_Z16) {
    return Mat(Size(w, h), CV_16UC1, (void*)f.get_data(), Mat::AUTO_STEP);
  } else if (f.get_profile().format() == RS2_FORMAT_Y8) {
    return Mat(Size(w, h), CV_8UC1, (void*)f.get_data(), Mat::AUTO_STEP);
  } else if (f.get_profile().format() == RS2_FORMAT_DISPARITY32) {
    return Mat(Size(w, h), CV_32FC1, (void*)f.get_data(), Mat::AUTO_STEP);
  }

  throw std::runtime_error("Frame format is not supported yet!");
}

void SetVec3FromRs(farm_ng_proto::tractor::v1::Vec3* out, rs2_vector vec) {
  out->set_x(vec.x);
  out->set_y(vec.y);
  out->set_z(vec.z);
}

void SetQuatFromRs(farm_ng_proto::tractor::v1::Quaternion* out,
                   rs2_quaternion vec) {
  out->set_w(vec.w);
  out->set_x(vec.x);
  out->set_y(vec.y);
  out->set_z(vec.z);
}

void SetCameraModelFromRs(farm_ng_proto::tractor::v1::CameraModel* out,
                          const rs2_intrinsics& intrinsics) {
  out->set_image_width(intrinsics.width);
  out->set_image_height(intrinsics.height);
  out->set_cx(intrinsics.ppx);
  out->set_cy(intrinsics.ppy);
  out->set_fx(intrinsics.fx);
  out->set_fy(intrinsics.fy);
  switch (intrinsics.model) {
    case RS2_DISTORTION_KANNALA_BRANDT4:
      out->set_distortion_model(farm_ng_proto::tractor::v1::CameraModel::
                                    DISTORTION_MODEL_KANNALA_BRANDT4);
      break;
    default:
      CHECK(false) << "Unhandled intrinsics model: "
                   << rs2_distortion_to_string(intrinsics.model);
  }
  for (int i = 0; i < 5; ++i) {
    out->add_distortion_coefficients(intrinsics.coeffs[i]);
  }
}

TrackingCameraPoseFrame::Confidence ToConfidence(int x) {
  switch (x) {
    case 0:
      return TrackingCameraPoseFrame::CONFIDENCE_FAILED;
    case 1:
      return TrackingCameraPoseFrame::CONFIDENCE_LOW;
    case 2:
      return TrackingCameraPoseFrame::CONFIDENCE_MEDIUM;
    case 3:
      return TrackingCameraPoseFrame::CONFIDENCE_HIGH;
    default:
      return TrackingCameraPoseFrame::CONFIDENCE_UNSPECIFIED;
  }
}

TrackingCameraPoseFrame ToPoseFrame(const rs2::pose_frame& rs_pose_frame) {
  TrackingCameraPoseFrame pose_frame;
  pose_frame.set_frame_number(rs_pose_frame.get_frame_number());
  *pose_frame.mutable_stamp_pose() =
      google::protobuf::util::TimeUtil::MillisecondsToTimestamp(
          rs_pose_frame.get_timestamp());
  auto pose_data = rs_pose_frame.get_pose_data();
  SetVec3FromRs(pose_frame.mutable_start_pose_current()->mutable_position(),
                pose_data.translation);
  SetQuatFromRs(pose_frame.mutable_start_pose_current()->mutable_rotation(),
                pose_data.rotation);
  SetVec3FromRs(pose_frame.mutable_velocity(), pose_data.velocity);
  SetVec3FromRs(pose_frame.mutable_acceleration(), pose_data.acceleration);
  SetVec3FromRs(pose_frame.mutable_angular_velocity(),
                pose_data.angular_velocity);
  SetVec3FromRs(pose_frame.mutable_angular_acceleration(),
                pose_data.angular_acceleration);
  pose_frame.set_tracker_confidence(ToConfidence(pose_data.tracker_confidence));
  pose_frame.set_mapper_confidence(ToConfidence(pose_data.mapper_confidence));
  return pose_frame;
}

Event ToNamedPoseEvent(const rs2::pose_frame& rs_pose_frame) {
  // TODO(ethanrublee) support front and rear cameras.
  NamedSE3Pose vodom_pose_t265;
  // here we distinguish where visual_odom frame by which camera it refers to,
  // will have to connect each camera pose to the mobile base with an extrinsic
  // transform
  vodom_pose_t265.set_frame_b("odometry/tracking_camera/front");
  vodom_pose_t265.set_frame_a("tracking_camera/front");
  auto pose_data = rs_pose_frame.get_pose_data();
  SetVec3FromRs(vodom_pose_t265.mutable_a_pose_b()->mutable_position(),
                pose_data.translation);
  SetQuatFromRs(vodom_pose_t265.mutable_a_pose_b()->mutable_rotation(),
                pose_data.rotation);

  Sophus::SE3d se3;
  ProtoToSophus(vodom_pose_t265.a_pose_b(), &se3);
  SophusToProto(se3.inverse(), vodom_pose_t265.mutable_a_pose_b());

  Event event =
      farm_ng::MakeEvent("pose/tracking_camera/front", vodom_pose_t265);
  *event.mutable_stamp() =
      google::protobuf::util::TimeUtil::MillisecondsToTimestamp(
          rs_pose_frame.get_timestamp());
  return event;
}

//
// Re-compute homography between ideal standard tag image and undistorted tag
// corners for estimage_tag_pose().
//
// @param[in]  c is 4 pairs of tag corners on ideal image and undistorted input
// image.
// @param[out] H is the output homography between ideal and undistorted input
// image.
// @see        static void apriltag_manager::undistort(...)
//
bool homography_compute2(const double c[4][4], matd_t* H) {
  double A[] = {
      c[0][0],
      c[0][1],
      1,
      0,
      0,
      0,
      -c[0][0] * c[0][2],
      -c[0][1] * c[0][2],
      c[0][2],
      0,
      0,
      0,
      c[0][0],
      c[0][1],
      1,
      -c[0][0] * c[0][3],
      -c[0][1] * c[0][3],
      c[0][3],
      c[1][0],
      c[1][1],
      1,
      0,
      0,
      0,
      -c[1][0] * c[1][2],
      -c[1][1] * c[1][2],
      c[1][2],
      0,
      0,
      0,
      c[1][0],
      c[1][1],
      1,
      -c[1][0] * c[1][3],
      -c[1][1] * c[1][3],
      c[1][3],
      c[2][0],
      c[2][1],
      1,
      0,
      0,
      0,
      -c[2][0] * c[2][2],
      -c[2][1] * c[2][2],
      c[2][2],
      0,
      0,
      0,
      c[2][0],
      c[2][1],
      1,
      -c[2][0] * c[2][3],
      -c[2][1] * c[2][3],
      c[2][3],
      c[3][0],
      c[3][1],
      1,
      0,
      0,
      0,
      -c[3][0] * c[3][2],
      -c[3][1] * c[3][2],
      c[3][2],
      0,
      0,
      0,
      c[3][0],
      c[3][1],
      1,
      -c[3][0] * c[3][3],
      -c[3][1] * c[3][3],
      c[3][3],
  };

  double epsilon = 1e-10;

  // Eliminate.
  for (int col = 0; col < 8; col++) {
    // Find best row to swap with.
    double max_val = 0;
    int max_val_idx = -1;
    for (int row = col; row < 8; row++) {
      double val = fabs(A[row * 9 + col]);
      if (val > max_val) {
        max_val = val;
        max_val_idx = row;
      }
    }

    if (max_val < epsilon) {
      return false;
    }

    // Swap to get best row.
    if (max_val_idx != col) {
      for (int i = col; i < 9; i++) {
        double tmp = A[col * 9 + i];
        A[col * 9 + i] = A[max_val_idx * 9 + i];
        A[max_val_idx * 9 + i] = tmp;
      }
    }

    // Do eliminate.
    for (int i = col + 1; i < 8; i++) {
      double f = A[i * 9 + col] / A[col * 9 + col];
      A[i * 9 + col] = 0;
      for (int j = col + 1; j < 9; j++) {
        A[i * 9 + j] -= f * A[col * 9 + j];
      }
    }
  }

  // Back solve.
  for (int col = 7; col >= 0; col--) {
    double sum = 0;
    for (int i = col + 1; i < 8; i++) {
      sum += A[col * 9 + i] * A[i * 9 + 8];
    }
    A[col * 9 + 8] = (A[col * 9 + 8] - sum) / A[col * 9 + col];
  }
  H->data[0] = A[8];
  H->data[1] = A[17];
  H->data[2] = A[26];
  H->data[3] = A[35];
  H->data[4] = A[44];
  H->data[5] = A[53];
  H->data[6] = A[62];
  H->data[7] = A[71];
  H->data[8] = 1;
  return true;
}

class TagLibrary {
 public:
  double TagSize(int tag_id) const { return 0.16; }
};

void deproject(double pt[2], const rs2_intrinsics& intr, const double px[2]) {
  float fpt[3], fpx[2] = {(float)px[0], (float)px[1]};
  rs2_deproject_pixel_to_point(fpt, &intr, fpx, 1.0f);
  pt[0] = fpt[0];
  pt[1] = fpt[1];
}

bool undistort(apriltag_detection_t& src, const rs2_intrinsics& intr) {
  deproject(src.c, intr, src.c);

  double corr_arr[4][4];
  for (int c = 0; c < 4; ++c) {
    deproject(src.p[c], intr, src.p[c]);

    corr_arr[c][0] =
        (c == 0 || c == 3) ? -1 : 1;  // tag corners in an ideal image
    corr_arr[c][1] =
        (c == 0 || c == 1) ? -1 : 1;  // tag corners in an ideal image
    corr_arr[c][2] =
        src.p[c][0];  // tag corners in undistorted image focal length = 1
    corr_arr[c][3] =
        src.p[c][1];  // tag corners in undistorted image focal length = 1
  }
  if (src.H == nullptr) {
    src.H = matd_create(3, 3);
  }
  return homography_compute2(corr_arr, src.H);
}

void apriltag_pose_destroy(apriltag_pose_t* p) {
  matd_destroy(p->R);
  matd_destroy(p->t);
  delete p;
}

Sophus::SE3d ApriltagPoseToSE3d(const apriltag_pose_t& pose) {
  typedef Eigen::Map<Eigen::Matrix<double, 3, 3, Eigen::RowMajor>>
      Map33RowMajor;
  return Sophus::SE3d(
      Map33RowMajor(pose.R->data),
      Eigen::Vector3d(pose.t->data[0], pose.t->data[1], pose.t->data[2]));
}
Event GenerateExtrinsicPoseEvent() {
  NamedSE3Pose base_pose_t265;
  base_pose_t265.set_frame_a("odometry/wheel");
  base_pose_t265.set_frame_b("tracking_camera/front/left");
  Sophus::SE3d se3(Sophus::SE3d::rotZ(-M_PI / 2.0));
  se3 = se3 * Sophus::SE3d::rotX(M_PI / 2.0);
  // se3 = se3 * Sophus::SE3d::rotZ(M_PI);
  se3.translation().x() = -1.0;
  se3.translation().z() = 1.0;
  // for good diagram of t265:
  // https://github.com/IntelRealSense/librealsense/blob/development/doc/t265.md

  SophusToProto(se3, base_pose_t265.mutable_a_pose_b());
  Event event = farm_ng::MakeEvent("pose/extrinsic_calibrator", base_pose_t265);
  return event;
}

// https://github.com/IntelRealSense/librealsense/blob/master/examples/pose-apriltag/rs-pose-apriltag.cpp
// Note this function mutates detection, by undistorting the points and
// populating the homography
boost::optional<Sophus::SE3d> EstimateCameraPoseTag(
    const rs2_intrinsics& intr, const TagLibrary& tag_library,
    apriltag_detection_t* detection) {
  apriltag_detection_info_t info;
  info.fx = info.fy = 1;  // undistorted image with focal length = 1
  info.cx = info.cy = 0;  // undistorted image with principal point at (0,0)
  info.det = detection;
  info.tagsize = tag_library.TagSize(info.det->id);
  // recompute tag corners on an undistorted image focal length = 1
  if (!undistort(*info.det, intr)) {
    LOG(WARNING) << "Tag with id: " << info.det->id << " can not compute pose.";
    return boost::none;
  }
  auto pose = std::shared_ptr<apriltag_pose_t>(new apriltag_pose_t(),
                                               apriltag_pose_destroy);
  // estimate tag pose in camera coordinate
  estimate_pose_for_tag_homography(&info, pose.get());
  return ApriltagPoseToSE3d(*pose);
}

class ApriltagDetector {
  // see
  // https://github.com/AprilRobotics/apriltag/blob/master/example/opencv_demo.cc
 public:
  ApriltagDetector(rs2_intrinsics intrinsics, EventBus* event_bus = nullptr)
      : event_bus_(event_bus), intrinsics_(intrinsics) {
    SetCameraModelFromRs(&camera_model_, intrinsics_);
    tag_family_ = tag36h11_create();
    tag_detector_ = apriltag_detector_create();
    apriltag_detector_add_family(tag_detector_, tag_family_);
    tag_detector_->quad_decimate = 2.0;
    tag_detector_->quad_sigma = 0.8;
    tag_detector_->nthreads = 1;
    tag_detector_->debug = false;
    tag_detector_->refine_edges = true;
  }

  ~ApriltagDetector() {
    apriltag_detector_destroy(tag_detector_);
    tag36h11_destroy(tag_family_);
  }

  ApriltagDetections Detect(cv::Mat gray, bool save_image = false) {
    CHECK_EQ(gray.channels(), 1);
    CHECK_EQ(gray.type(), CV_8UC1);

    auto start = std::chrono::high_resolution_clock::now();

    // Make an image_u8_t header for the Mat data
    image_u8_t im = {.width = gray.cols,
                     .height = gray.rows,
                     .stride = gray.cols,
                     .buf = gray.data};

    std::shared_ptr<zarray_t> detections(
        apriltag_detector_detect(tag_detector_, &im),
        apriltag_detections_destroy);

    // copy detections into protobuf
    ApriltagDetections pb_out;
    pb_out.mutable_image()->mutable_camera_model()->CopyFrom(camera_model_);
    if (event_bus_ && save_image) {
      pb_out.mutable_image()->mutable_resource()->CopyFrom(
          event_bus_->GetUniqueResource("tracking_camera_left_apriltag", "png",
                                        "image/png"));
      LOG(INFO) << pb_out.image().resource().ShortDebugString();
      cv::imwrite(pb_out.image().resource().archive_path() + "/" +
                      pb_out.image().resource().path(),
                  gray);
    }
    for (int i = 0; i < zarray_size(detections.get()); i++) {
      apriltag_detection_t* det;
      zarray_get(detections.get(), i, &det);

      ApriltagDetection* detection = pb_out.add_detections();
      for (int j = 0; j < 4; j++) {
        Vec2* p_j = detection->add_p();
        p_j->set_x(det->p[j][0]);
        p_j->set_y(det->p[j][1]);
      }
      detection->mutable_c()->set_x(det->c[0]);
      detection->mutable_c()->set_y(det->c[1]);
      detection->set_id(det->id);
      detection->set_hamming(static_cast<uint8_t>(det->hamming));
      detection->set_decision_margin(det->decision_margin);
      // estimation comes last because this mutates det
      auto pose = EstimateCameraPoseTag(intrinsics_, TagLibrary(), det);
      if (pose) {
        auto* named_pose = detection->mutable_pose();
        SophusToProto(*pose, named_pose->mutable_a_pose_b());
        named_pose->set_frame_a("tracking_camera/front/left");
        named_pose->set_frame_b("tag/" + std::to_string(det->id));
        if (event_bus_) {
          event_bus_->Send(MakeEvent(
              "pose/tracking_camera/front/left/tag/" + std::to_string(det->id),
              *named_pose));
        }
      }
    }
    auto stop = std::chrono::high_resolution_clock::now();
    auto duration =
        std::chrono::duration_cast<std::chrono::microseconds>(stop - start);
    LOG_EVERY_N(INFO, 100) << "april tag detection took: " << duration.count()
                           << " microseconds\n"
                           << pb_out.ShortDebugString();
    return pb_out;
  }

 private:
  EventBus* event_bus_;
  rs2_intrinsics intrinsics_;
  farm_ng_proto::tractor::v1::CameraModel camera_model_;
  apriltag_family_t* tag_family_;
  apriltag_detector_t* tag_detector_;
};

class TrackingCameraClient {
 public:
  TrackingCameraClient(boost::asio::io_service& io_service)
      : io_service_(io_service),
        event_bus_(GetEventBus(io_service_, "tracking-camera")) {
    // TODO(ethanrublee) look up image size from realsense profile.

    std::string cmd0 =
        std::string("appsrc !") + " videoconvert ! " +
        " x264enc bitrate=600 speed-preset=ultrafast tune=zerolatency "
        "key-int-max=15 ! video/x-h264,profile=constrained-baseline ! queue "
        "max-size-time=100000000 ! h264parse ! "
        /*
                " omxh264enc control-rate=1 bitrate=1000000 ! " +
                " video/x-h264, stream-format=byte-stream !" +
         */
        " rtph264pay pt=96 mtu=1400 config-interval=10 !" +
        " udpsink host=239.20.20.20 auto-multicast=true port=5000";
    std::cerr << "Running gstreamer with pipeline:\n" << cmd0 << std::endl;
    std::cerr << "To view streamer run:\n"
              << "gst-launch-1.0 udpsrc multicast-group=239.20.20.20 port=5000 "
                 "! application/x-rtp,encoding-name=H264,payload=96 ! "
                 "rtph264depay ! h264parse ! queue ! avdec_h264 ! xvimagesink "
                 "sync=false async=false -e"
              << std::endl;

    writer_.reset(new cv::VideoWriter(cmd0,
                                      0,   // fourcc
                                      10,  // fps
                                      cv::Size(848, 800),
                                      false  // isColor
                                      ));

    // Create a configuration for configuring the pipeline with a non default
    // profile
    rs2::config cfg;
    // Add pose stream
    cfg.enable_stream(RS2_STREAM_POSE, RS2_FORMAT_6DOF);
    // Enable both image streams
    // Note: It is not currently possible to enable only one
    cfg.enable_stream(RS2_STREAM_FISHEYE, 1, RS2_FORMAT_Y8);
    cfg.enable_stream(RS2_STREAM_FISHEYE, 2, RS2_FORMAT_Y8);

    auto profile = cfg.resolve(pipe_);
    auto tm2 = profile.get_device().as<rs2::tm2>();
    auto pose_sensor = tm2.first<rs2::pose_sensor>();

    // Start pipe and get camera calibrations
    const int fisheye_sensor_idx = 1;  // for the left fisheye lens of T265
    auto fisheye_stream =
        profile.get_stream(RS2_STREAM_FISHEYE, fisheye_sensor_idx);
    auto fisheye_intrinsics =
        fisheye_stream.as<rs2::video_stream_profile>().get_intrinsics();

    detector_.reset(new ApriltagDetector(fisheye_intrinsics, &event_bus_));
    LOG(INFO) << " intrinsics model: "
              << rs2_distortion_to_string(fisheye_intrinsics.model)
              << " width=" << fisheye_intrinsics.width
              << " height=" << fisheye_intrinsics.height
              << " ppx=" << fisheye_intrinsics.ppx
              << " ppx=" << fisheye_intrinsics.ppy
              << " fx=" << fisheye_intrinsics.fx
              << " fy=" << fisheye_intrinsics.fy
              << " coeffs=" << fisheye_intrinsics.coeffs[0] << ", "
              << fisheye_intrinsics.coeffs[1] << ", "
              << fisheye_intrinsics.coeffs[2] << ", "
              << fisheye_intrinsics.coeffs[3] << ", "
              << fisheye_intrinsics.coeffs[4];

    // setting options for slam:
    // https://github.com/IntelRealSense/librealsense/issues/1011
    // and what to set:
    //  https://github.com/IntelRealSense/realsense-ros/issues/779 "
    // I would suggest leaving mapping enabled, but disabling
    // relocalization and jumping. This may avoid the conflict with
    // RTabMap while still giving good results."

    pose_sensor.set_option(RS2_OPTION_ENABLE_POSE_JUMPING, 0);
    pose_sensor.set_option(RS2_OPTION_ENABLE_RELOCALIZATION, 0);

    // Start pipeline with chosen configuration
    pipe_.start(cfg, std::bind(&TrackingCameraClient::frame_callback, this,
                               std::placeholders::_1));
  }

  // The callback is executed on a sensor thread and can be called
  // simultaneously from multiple sensors Therefore any modification to common
  // memory should be done under lock
  void frame_callback(const rs2::frame& frame) {
    if (rs2::frameset fs = frame.as<rs2::frameset>()) {
      rs2::video_frame fisheye_frame = fs.get_fisheye_frame(0);
      // Add a reference to fisheye_frame, cause we're scheduling
      // april tag detection for later.
      fisheye_frame.keep();
      cv::Mat frame_0 = frame_to_mat(fisheye_frame);

      // lock for rest of scope, so we can edit some member state.
      std::lock_guard<std::mutex> lock(mtx_realsense_state_);
      count_ = (count_ + 1) % 3;
      if (count_ == 0) {
        writer_->write(frame_0);
        // we only want to schedule detection if we're not currently
        // detecting.  Apriltag detection takes >30ms on the nano.
        if (!detection_in_progress_) {
          detection_in_progress_ = true;
          auto stamp =
              google::protobuf::util::TimeUtil::MillisecondsToTimestamp(
                  fisheye_frame.get_timestamp());

          // schedule april tag detection, do it as frequently as possible.
          io_service_.post([this, fisheye_frame, stamp] {
            // note this function is called later, in main thread, via
            // io_service_.run();
            cv::Mat frame_0 = frame_to_mat(fisheye_frame);
            Event event = farm_ng::MakeEvent("tracking_camera/front/apriltags",
                                             detector_->Detect(frame_0, true));
            *event.mutable_stamp() = stamp;

            event_bus_.Send(event);
            event_bus_.Send(GenerateExtrinsicPoseEvent());
            // signal that we're done detecting, so can post another frame for
            // detection.
            std::lock_guard<std::mutex> lock(mtx_realsense_state_);
            detection_in_progress_ = false;
          });
        }
      }
    } else if (rs2::pose_frame pose_frame = frame.as<rs2::pose_frame>()) {
      auto pose_data = pose_frame.get_pose_data();
      // Print the x, y, z values of the translation, relative to initial
      // position
      // std::cout << "\r Device Position: " << std::setprecision(3) <<
      // std::fixed << pose_data.translation.x << " " << pose_data.translation.y
      // << " " << pose_data.translation.z << " (meters)";
      event_bus_.Send(farm_ng::MakeEvent("tracking_camera/front/pose",
                                         ToPoseFrame(pose_frame)));
      event_bus_.Send(ToNamedPoseEvent(pose_frame));
    }
  }
  boost::asio::io_service& io_service_;
  EventBus& event_bus_;
  std::unique_ptr<cv::VideoWriter> writer_;
  // Declare RealSense pipeline, encapsulating the actual device and sensors
  rs2::pipeline pipe_;
  std::mutex mtx_realsense_state_;
  int count_ = 0;
  bool detection_in_progress_ = false;
  std::unique_ptr<ApriltagDetector> detector_;
};
}  // namespace farm_ng

int main(int argc, char* argv[]) try {
  // Initialize Google's logging library.
  FLAGS_logtostderr = 1;
  google::InitGoogleLogging(argv[0]);

  // Declare RealSense pipeline, encapsulating the actual device and sensors
  rs2::pipeline pipe;
  boost::asio::io_service io_service;
  farm_ng::TrackingCameraClient client(io_service);
  io_service.run();
  return EXIT_SUCCESS;
} catch (const rs2::error& e) {
  std::cerr << "RealSense error calling " << e.get_failed_function() << "("
            << e.get_failed_args() << "):\n    " << e.what() << std::endl;
  return EXIT_FAILURE;
} catch (const std::exception& e) {
  std::cerr << e.what() << std::endl;
  return EXIT_FAILURE;
}
