
foreach(src_prefix
   apriltag
   apriltag_rig_calibrator
   # TODO(isherman|ethanrublee): Relies on TractorState
   # base_to_camera_calibrator
   camera_model
   epipolar
   flow_book_keeper
   local_parameterization
   multi_view_apriltag_rig_calibrator
   pose_utils
   solver
   time_series
   visual_odometer

)
list(APPEND cpp_files ${src_prefix}.cpp)
list(APPEND h_files ${src_prefix}.h)
list(APPEND test_files ${src_prefix}_test.cpp)
endforeach()

add_library(farm-ng-calibration
  ${cpp_files}
  ${h_files}
  eigen_cv.h
)
# TODO(isherman|ethanrublee): Only necessary to support tracking_study.cpp
target_include_directories(farm-ng-calibration PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/../..)
target_link_libraries(farm-ng-calibration
   ${CERES_LIBRARIES} ${GLOG_LIBRARIES} Sophus::Sophus apriltag::apriltag opencv_imgcodecs farm-ng-core farm-ng-perception-core farm-ng-calibration-protobuf)


# TODO add tests!
# add_executable(farm_ng_calibration_test
#   ${test_files}
# )

# target_link_libraries(farm_ng_calibration_test
#     farm-ng-calibration
#     gtest gmock gtest_main
# )
# gtest_discover_tests(farm_ng_calibration_test)
