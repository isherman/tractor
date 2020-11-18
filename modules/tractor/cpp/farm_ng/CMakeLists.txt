find_package(gflags REQUIRED)
find_package(OpenCV REQUIRED)

# TODO(isherman|ethanrublee): Enable
# add_executable(tracking_study tracking_study.cpp )
# target_link_libraries(tracking_study farm-ng-tractor-protobuf farm-ng-calibration gflags ${OpenCV_LIBS})

# TODO add tests!
enable_testing()
include(GoogleTest)
