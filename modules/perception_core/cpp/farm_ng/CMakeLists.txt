find_package(Protobuf REQUIRED)
find_package(Boost REQUIRED system filesystem)
find_package(Glog REQUIRED)
find_package(gflags REQUIRED)
find_package(realsense2 REQUIRED)
find_package(OpenCV REQUIRED)
find_package(Sophus REQUIRED)
find_package(Eigen3 REQUIRED)
find_package(apriltag REQUIRED)

foreach(src_prefix
   apriltag
   camera_model
   pose_utils
   time_series
   tracking_camera_utils
)
  list(APPEND cpp_files ${src_prefix}.cpp)
  list(APPEND h_files ${src_prefix}.h)
  list(APPEND test_files ${src_prefix}_test.cpp)
endforeach()

add_library(farm-ng-perception_core SHARED
  image_loader.cpp
  image_loader.h
  video_streamer.h
  video_streamer.cpp
  eigen_cv.h
  ${h_files}
  ${cpp_files}
  )

target_include_directories(farm-ng-perception_core PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/.. ${EIGEN3_INCLUDE_DIRS} )
target_link_libraries(farm-ng-perception_core apriltag::apriltag  Sophus::Sophus opencv_imgcodecs farm-ng-core farm-ng-perception_core-protobuf gflags dl ${OpenCV_LIBS} ${Boost_FILESYSTEM_LIBRARY} ${Boost_SYSTEM_LIBRARY} ${realsense2_LIBRARY} ${GLOG_LIBRARIES})

add_executable(capture_video_dataset capture_video_dataset.cpp)
target_link_libraries(capture_video_dataset farm-ng-core farm-ng-perception_core farm-ng-perception_core-protobuf gflags)

# TODO add tests!
enable_testing()
include(GoogleTest)

add_executable(farm-ng-perception_core-test
  ${test_files}
 )

target_link_libraries(farm-ng-perception_core-test
    farm-ng-perception_core
    gtest gmock gtest_main
 )
gtest_discover_tests(farm-ng-perception_core-test)
