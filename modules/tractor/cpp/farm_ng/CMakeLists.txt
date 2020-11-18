add_subdirectory(tractor)

add_executable(tracking_study tracking_study.cpp)
target_link_libraries(tracking_study farm-ng-tractor)

add_executable(calibrate_base_to_camera calibrate_base_to_camera.cpp)
target_link_libraries(calibrate_base_to_camera farm-ng-tractor)
