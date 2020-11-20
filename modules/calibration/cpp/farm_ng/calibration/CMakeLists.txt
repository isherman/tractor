find_package(Ceres REQUIRED)

foreach(src_prefix
      apriltag_rig_calibrator
      epipolar
      flow_book_keeper
      local_parameterization
      multi_view_apriltag_rig_calibrator
      solver
      visual_odometer)
   list(APPEND cpp_files ${src_prefix}.cpp)
   list(APPEND h_files ${src_prefix}.h)
   list(APPEND test_files ${src_prefix}_test.cpp)
endforeach()

add_library(farm-ng-calibration
  ${cpp_files}
  ${h_files}
)
target_include_directories(farm-ng-calibration PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/../..)
target_link_libraries(farm-ng-calibration farm-ng-calibration-protobuf farm-ng-perception ${CERES_LIBRARIES})


# TODO add tests!
# add_executable(farm_ng_calibration_test
#   ${test_files}
# )

# target_link_libraries(farm_ng_calibration_test
#     farm-ng-calibration
#     gtest gmock gtest_main
# )
# gtest_discover_tests(farm_ng_calibration_test)
