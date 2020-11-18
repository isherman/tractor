add_library(farm-ng-tractor SHARED
  base_to_camera_calibrator.h
  base_to_camera_calibrator.cpp
)
target_include_directories(farm-ng-tractor PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/../..)
target_link_libraries(farm-ng-tractor farm-ng-tractor-protobuf farm-ng-calibration)

# TODO add tests!
enable_testing()
include(GoogleTest)
