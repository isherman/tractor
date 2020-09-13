#include <chrono>
#include <iomanip>
#include <iostream>
#include <mutex>

#include <glog/logging.h>
#include <google/protobuf/util/time_util.h>
#include <librealsense2/rs.hpp>
#include <librealsense2/rsutil.h>

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
// Re-compute homography between ideal standard tag image and undistorted tag corners for estimage_tag_pose().
//
// @param[in]  c is 4 pairs of tag corners on ideal image and undistorted input image.
// @param[out] H is the output homography between ideal and undistorted input image.
// @see        static void apriltag_manager::undistort(...)
//
void homography_compute2(const double c[4][4], matd_t* H) {
    double A[] =  {
        c[0][0], c[0][1], 1,       0,       0, 0, -c[0][0]*c[0][2], -c[0][1]*c[0][2], c[0][2],
        0,       0, 0, c[0][0], c[0][1], 1, -c[0][0]*c[0][3], -c[0][1]*c[0][3], c[0][3],
        c[1][0], c[1][1], 1,       0,       0, 0, -c[1][0]*c[1][2], -c[1][1]*c[1][2], c[1][2],
        0,       0, 0, c[1][0], c[1][1], 1, -c[1][0]*c[1][3], -c[1][1]*c[1][3], c[1][3],
        c[2][0], c[2][1], 1,       0,       0, 0, -c[2][0]*c[2][2], -c[2][1]*c[2][2], c[2][2],
        0,       0, 0, c[2][0], c[2][1], 1, -c[2][0]*c[2][3], -c[2][1]*c[2][3], c[2][3],
        c[3][0], c[3][1], 1,       0,       0, 0, -c[3][0]*c[3][2], -c[3][1]*c[3][2], c[3][2],
        0,       0, 0, c[3][0], c[3][1], 1, -c[3][0]*c[3][3], -c[3][1]*c[3][3], c[3][3],
    };

    double epsilon = 1e-10;

    // Eliminate.
    for (int col = 0; col < 8; col++) {
        // Find best row to swap with.
        double max_val = 0;
        int max_val_idx = -1;
        for (int row = col; row < 8; row++) {
            double val = fabs(A[row*9 + col]);
            if (val > max_val) {
                max_val = val;
                max_val_idx = row;
            }
        }

        if (max_val < epsilon) {
            fprintf(stderr, "WRN: Matrix is singular.\n");
        }

        // Swap to get best row.
        if (max_val_idx != col) {
            for (int i = col; i < 9; i++) {
                double tmp = A[col*9 + i];
                A[col*9 + i] = A[max_val_idx*9 + i];
                A[max_val_idx*9 + i] = tmp;
            }
        }

        // Do eliminate.
        for (int i = col + 1; i < 8; i++) {
            double f = A[i*9 + col]/A[col*9 + col];
            A[i*9 + col] = 0;
            for (int j = col + 1; j < 9; j++) {
                A[i*9 + j] -= f*A[col*9 + j];
            }
        }
    }

    // Back solve.
    for (int col = 7; col >=0; col--) {
        double sum = 0;
        for (int i = col + 1; i < 8; i++) {
            sum += A[col*9 + i]*A[i*9 + 8];
        }
        A[col*9 + 8] = (A[col*9 + 8] - sum)/A[col*9 + col];
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
}

typedef rs2_extrinsics transformation;
transformation to_transform(const double R[9], const double t[3]) {
    transformation tf;
    for(int r=0; r<9; ++r){ tf.rotation[r] = static_cast<float>(R[r]); }
    for(int i=0; i<3; ++i){ tf.translation[i] = static_cast<float>(t[i]); }
    return tf;
}

transformation to_transform(const rs2_quaternion& q, const rs2_vector& t) {
    transformation tf;
    tf.rotation[0] = q.w * q.w + q.x * q.x - q.y * q.y - q.z * q.z;
    tf.rotation[1] = 2 * (q.x * q.y - q.w * q.z);
    tf.rotation[2] = 2 * (q.x * q.z + q.w * q.y);
    tf.rotation[3] = 2 * (q.x * q.y + q.w * q.z);
    tf.rotation[4] = q.w * q.w - q.x * q.x + q.y * q.y - q.z * q.z;
    tf.rotation[5] = 2 * (q.y * q.z - q.w * q.x);
    tf.rotation[6] = 2 * (q.x * q.z - q.w * q.y);
    tf.rotation[7] = 2 * (q.y * q.z + q.w * q.x);
    tf.rotation[8] = q.w * q.w - q.x * q.x - q.y * q.y + q.z * q.z;
    tf.translation[0] = t.x;
    tf.translation[1] = t.y;
    tf.translation[2] = t.z;
    return tf;
}

transformation operator*(const transformation& a, const transformation& b) {
    transformation tf;
    tf.rotation[0] = a.rotation[0] * b.rotation[0] + a.rotation[1] * b.rotation[3] + a.rotation[2] * b.rotation[6];
    tf.rotation[1] = a.rotation[0] * b.rotation[1] + a.rotation[1] * b.rotation[4] + a.rotation[2] * b.rotation[7];
    tf.rotation[2] = a.rotation[0] * b.rotation[2] + a.rotation[1] * b.rotation[5] + a.rotation[2] * b.rotation[8];
    tf.rotation[3] = a.rotation[3] * b.rotation[0] + a.rotation[4] * b.rotation[3] + a.rotation[5] * b.rotation[6];
    tf.rotation[4] = a.rotation[3] * b.rotation[1] + a.rotation[4] * b.rotation[4] + a.rotation[5] * b.rotation[7];
    tf.rotation[5] = a.rotation[3] * b.rotation[2] + a.rotation[4] * b.rotation[5] + a.rotation[5] * b.rotation[8];
    tf.rotation[6] = a.rotation[6] * b.rotation[0] + a.rotation[7] * b.rotation[3] + a.rotation[8] * b.rotation[6];
    tf.rotation[7] = a.rotation[6] * b.rotation[1] + a.rotation[7] * b.rotation[4] + a.rotation[8] * b.rotation[7];
    tf.rotation[8] = a.rotation[6] * b.rotation[2] + a.rotation[7] * b.rotation[5] + a.rotation[8] * b.rotation[8];

    tf.translation[0] = a.rotation[0] * b.translation[0] + a.rotation[1] * b.translation[1] + a.rotation[2] * b.translation[2] + a.translation[0];
    tf.translation[1] = a.rotation[3] * b.translation[0] + a.rotation[4] * b.translation[1] + a.rotation[5] * b.translation[2] + a.translation[1];
    tf.translation[2] = a.rotation[6] * b.translation[0] + a.rotation[7] * b.translation[1] + a.rotation[8] * b.translation[2] + a.translation[2];
    return tf;
}

#define FORMAT_VALUE     std::fixed << std::right << std::setprecision(3) << std::setw(6)

std::string print(const transformation& tf) {
    std::stringstream ss; ss << "R:";
    for(const auto& r : tf.rotation){ ss << FORMAT_VALUE << r << ","; }
    ss << "|t:";
    for(const auto& t : tf.translation){ ss << FORMAT_VALUE << t << ","; }
    return ss.str();
}

// https://github.com/IntelRealSense/librealsense/blob/master/examples/pose-apriltag/rs-pose-apriltag.cpp
class apriltag_manager {
public:
    apriltag_manager(const rs2_intrinsics& _intr,  const rs2_extrinsics _extr_b2f, double tagsize)
    : intr(_intr), tf_body_to_fisheye(_extr_b2f) {
        tf = tag36h11_create();
        td = apriltag_detector_create();
        apriltag_detector_add_family(td, tf);

        td->quad_decimate = 1.0;
        td->quad_sigma    = 0.0;
        td->nthreads      = 1;
        td->debug         = 0;
        td->refine_edges  = 1;

        info.tagsize      = tagsize;
        info.fx = info.fy = 1;       //undistorted image with focal length = 1
        info.cx = info.cy = 0;       //undistorted image with principal point at (0,0)
    }
    ~apriltag_manager() {
        apriltag_detector_destroy(td);
        tag36h11_destroy(tf);
    }

    struct apriltag_array_t {
        std::shared_ptr<zarray_t>                     det;
        std::vector<std::shared_ptr<apriltag_pose_t>> pose_raw;       //tag pose from library
        std::vector<transformation>                   pose_in_camera; //tag pose in camera coordinate
        std::vector<transformation>                   pose_in_world;  //tag pose in world coordinate

        apriltag_detection_t* get(int t) const { apriltag_detection_t* ptr; zarray_get(det.get(), t, &ptr); return ptr; }
        int get_id(int t) const { return get(t)->id; }
        int size() const { return pose_in_camera.size(); }
    };

    static void apriltag_pose_destroy(apriltag_pose_t* p){ matd_destroy(p->R); matd_destroy(p->t); delete p;}

    apriltag_array_t detect(std::shared_ptr<zarray_t> detections) const {
        apriltag_array_t tags;
        tags.det = detections;
        tags.pose_in_camera.resize(zarray_size(tags.det.get()));
        tags.pose_raw.resize(tags.size());

        auto info_ = info;
        for(int t=0, num_of_tags=(int)tags.size(); t<num_of_tags; ++t)
        {
            tags.pose_raw[t] = std::shared_ptr<apriltag_pose_t>(new apriltag_pose_t(), apriltag_pose_destroy);

            undistort(*(info_.det = tags.get(t)), intr);                      //recompute tag corners on an undistorted image focal length = 1
            //estimate_tag_pose(&info_, tags.pose_raw[t].get());              //(alternative) estimate tag pose in camera coordinate
            estimate_pose_for_tag_homography(&info_, tags.pose_raw[t].get()); //estimate tag pose in camera coordinate
            for(auto c : {1,2,4,5,7,8}){ tags.pose_raw[t]->R->data[c] *= -1; }

            tags.pose_in_camera[t] = to_transform(tags.pose_raw[t]->R->data, tags.pose_raw[t]->t->data);
        }

        if(camera_pose){ compute_tag_pose_in_world(tags, *camera_pose); }
        return tags;
    }

protected:
    apriltag_family_t        *tf;
    apriltag_detector_t      *td;
    apriltag_detection_info_t info;
    rs2_intrinsics            intr;
    transformation            tf_body_to_fisheye;

    void compute_tag_pose_in_world(apriltag_array_t& tags, const rs2_pose& camera_world_pose) const {
        tags.pose_in_world.resize(tags.size());
        for(int t=0, num_of_tags=tags.size(); t<num_of_tags; ++t){
            auto tf_fisheye_to_tag = tags.pose_in_camera[t];
            auto tf_world_to_body = to_transform(camera_world_pose.rotation, camera_world_pose.translation);
            tags.pose_in_world[t] = tf_world_to_body * tf_body_to_fisheye * tf_fisheye_to_tag;
        }
    }

    static void undistort(apriltag_detection_t& src, const rs2_intrinsics& intr) {
        deproject(src.c, intr, src.c);

        double corr_arr[4][4];
        for(int c=0; c<4; ++c){
            deproject(src.p[c], intr, src.p[c]);

            corr_arr[c][0] = (c==0 || c==3) ? -1 : 1; // tag corners in an ideal image
            corr_arr[c][1] = (c==0 || c==1) ? -1 : 1; // tag corners in an ideal image
            corr_arr[c][2] = src.p[c][0];             // tag corners in undistorted image focal length = 1
            corr_arr[c][3] = src.p[c][1];             // tag corners in undistorted image focal length = 1
        }
        if(src.H == nullptr) { src.H = matd_create(3, 3); }
        homography_compute2(corr_arr, src.H);
    }

    static void deproject(double pt[2], const rs2_intrinsics& intr, const double px[2]) {
        float fpt[3], fpx[2] = { (float)px[0], (float)px[1] };
        rs2_deproject_pixel_to_point(fpt, &intr, fpx, 1.0f);
        pt[0] = fpt[0];
        pt[1] = fpt[1];
    }
};

class ApriltagDetector {
  // see
  // https://github.com/AprilRobotics/apriltag/blob/master/example/opencv_demo.cc
 public:
  ApriltagDetector() {
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

  ApriltagDetections Detect(cv::Mat gray) {
    CHECK_EQ(gray.channels(), 1);
    CHECK_EQ(gray.type(), CV_8UC1);

    auto start = std::chrono::high_resolution_clock::now();

    // Make an image_u8_t header for the Mat data
    image_u8_t im = {.width = gray.cols,
                     .height = gray.rows,
                     .stride = gray.cols,
                     .buf = gray.data};

    std::shared_ptr<zarray_t> detections(apriltag_detector_detect(tag_detector_, &im), apriltag_detection_destroy);



    // copy detections into protobuf
    ApriltagDetections pb_out;
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
    }
    auto stop = std::chrono::high_resolution_clock::now();
    auto duration =
        std::chrono::duration_cast<std::chrono::microseconds>(stop - start);
    LOG_EVERY_N(INFO, 10) << "april tag detection took: " << duration.count()
                          << " microseconds\n"
                          << pb_out.ShortDebugString();
    return pb_out;
  }

 private:
  apriltag_family_t* tag_family_;
  apriltag_detector_t* tag_detector_;
  apriltag_manager manager_;
};

class TrackingCameraClient {
 public:
  TrackingCameraClient(boost::asio::io_service& io_service)
      : io_service_(io_service), event_bus_(GetEventBus(io_service_, "tracking-camera")) {
    // TODO(ethanrublee) look up image size from realsense profile.
    std::string cmd0 =
        std::string("appsrc !") + " videoconvert ! " +
        //" x264enc bitrate=600 speed-preset=ultrafast tune=zerolatency
        // key-int-max=15 ! video/x-h264,profile=constrained-baseline ! queue
        // max-size-time=100000000 ! h264parse ! "
        " omxh264enc control-rate=1 bitrate=1000000 ! " +
        " video/x-h264, stream-format=byte-stream !" +
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
                                             detector_.Detect(frame_0));
            *event.mutable_stamp() = stamp;

            event_bus_.Send(event);
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
  ApriltagDetector detector_;
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
