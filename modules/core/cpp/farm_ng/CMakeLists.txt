find_package(Boost REQUIRED system filesystem)
find_package(Glog REQUIRED)
find_package(gflags REQUIRED)

add_library(farm-ng-core SHARED
  blobstore.cpp
  blobstore.h
  event_log_reader.cpp
  event_log_reader.h
  event_log.cpp
  event_log.h
  init.cpp
  init.h
  ipc.cpp
  ipc.h
  )

target_include_directories(farm-ng-core PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/..)
target_link_libraries(farm-ng-core farm-ng-core-protobuf gflags dl ${Boost_FILESYSTEM_LIBRARY} ${Boost_SYSTEM_LIBRARY} ${GLOG_LIBRARIES})

add_executable(ipc_logger ipc_logger.cpp)
target_link_libraries(ipc_logger farm-ng-core farm-ng-core-protobuf ${Boost_SYSTEM_LIBRARY})

add_executable(log_playback log_playback.cpp)
target_link_libraries(log_playback farm-ng-core farm-ng-core-protobuf ${Boost_SYSTEM_LIBRARY} gflags)


# TODO add tests!
enable_testing()
include(GoogleTest)
