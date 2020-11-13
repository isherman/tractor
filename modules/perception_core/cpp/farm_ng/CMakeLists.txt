find_package(Protobuf REQUIRED)

# TODO(isherman): Which of these is required?
find_package(Boost REQUIRED system filesystem regex)

find_package(Glog REQUIRED)
find_package(gflags REQUIRED)
find_package(realsense2 REQUIRED)
find_package(OpenCV REQUIRED)
find_package(Sophus REQUIRED)

add_library(farm-ng-perception-core SHARED
  frame_grabber.cpp
  frame_grabber.h
  image_loader.cpp
  image_loader.h
  tracking_camera_utils.cpp
  tracking_camera_utils.h
  video_streamer.h
  video_streamer.cpp
  )

target_include_directories(farm-ng-perception-core PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/..)
target_link_libraries(farm-ng-perception-core farm-ng-core farm-ng-perception_core-protobuf gflags dl ${OpenCV_LIBS} ${Boost_FILESYSTEM_LIBRARY} ${Boost_SYSTEM_LIBRARY} ${GLOG_LIBRARIES})
