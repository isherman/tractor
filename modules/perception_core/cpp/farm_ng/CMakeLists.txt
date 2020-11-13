find_package(Protobuf REQUIRED)
find_package(Boost REQUIRED system filesystem)
find_package(Glog REQUIRED)
find_package(gflags REQUIRED)
find_package(realsense2 REQUIRED)
find_package(OpenCV REQUIRED)
find_package(Sophus REQUIRED)

add_library(farm-ng-perception-core SHARED
  image_loader.cpp
  image_loader.h
  video_streamer.h
  video_streamer.cpp
  )

target_include_directories(farm-ng-perception-core PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/..)
target_link_libraries(farm-ng-perception-core farm-ng-core farm-ng-perception_core-protobuf gflags dl ${OpenCV_LIBS} ${Boost_FILESYSTEM_LIBRARY} ${Boost_SYSTEM_LIBRARY} ${realsense2_LIBRARY} ${GLOG_LIBRARIES})

# TODO add tests!
enable_testing()
include(GoogleTest)
