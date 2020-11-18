find_package(apriltag REQUIRED)
find_package(Eigen3 REQUIRED)
find_package(OpenCV REQUIRED)
find_package(realsense2 REQUIRED)
find_package(Sophus REQUIRED)

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
  frame_grabber.h
  frame_grabber.cpp
  image_loader.cpp
  image_loader.h
  video_streamer.h
  video_streamer.cpp
  eigen_cv.h
  ${h_files}
  ${cpp_files}
  )

target_include_directories(
  farm-ng-perception_core
  PUBLIC
  ${CMAKE_CURRENT_SOURCE_DIR}/../..
  ${EIGEN3_INCLUDE_DIRS})

target_link_libraries(
  farm-ng-perception_core
  farm-ng-perception_core-protobuf
  farm-ng-core
  apriltag::apriltag
  opencv_imgcodecs
  ${OpenCV_LIBS}
  ${realsense2_LIBRARY}
  Sophus::Sophus)

# TODO add tests!
# add_executable(farm-ng-perception_core-test
#   ${test_files}
#  )

# target_link_libraries(farm-ng-perception_core-test
#     farm-ng-perception_core
#     gtest gmock gtest_main
#  )
# gtest_discover_tests(farm-ng-perception_core-test)
