find_package(Protobuf REQUIRED)
find_package(Boost REQUIRED system filesystem)
find_package(Glog REQUIRED)
find_package(gflags REQUIRED)
find_package(realsense2 REQUIRED)
find_package(OpenCV REQUIRED)
find_package(apriltag REQUIRED)
find_package(Ceres REQUIRED)
find_package(Sophus REQUIRED)

add_subdirectory(calibration)

# TODO: Enable
# add_executable(tracking_camera tracking_camera.cpp)
# target_link_libraries(tracking_camera farm-ng-calibration ${Boost_FILESYSTEM_LIBRARY} ${Boost_SYSTEM_LIBRARY} ${realsense2_LIBRARY}  ${OpenCV_LIBS} Sophus::Sophus ${GLOG_LIBRARIES})

add_executable(capture_calibration_dataset capture_calibration_dataset.cpp tracking_camera_utils.cpp tracking_camera_utils.h)
target_link_libraries(capture_calibration_dataset farm-ng-calibration-protobuf farm-ng-perception_core-protobuf farm-ng-core gflags)

add_executable(capture_video_dataset capture_video_dataset.cpp tracking_camera_utils.cpp tracking_camera_utils.h)
target_link_libraries(capture_video_dataset farm-ng-core farm-ng-calibration-protobuf gflags)

add_executable(calibrate_apriltag_rig calibrate_apriltag_rig.cpp)
target_link_libraries(calibrate_apriltag_rig farm-ng-calibration gflags)

add_executable(calibrate_multi_view_apriltag_rig calibrate_multi_view_apriltag_rig.cpp)
target_link_libraries(calibrate_multi_view_apriltag_rig farm-ng-calibration gflags)

# add_executable(calibrate_base_to_camera calibrate_base_to_camera.cpp)
# target_link_libraries(calibrate_base_to_camera farm-ng-calibration gflags)

# TODO add tests!
enable_testing()
include(GoogleTest)
