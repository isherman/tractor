find_package(Boost REQUIRED system filesystem)
find_package(gflags REQUIRED)
find_package(Glog REQUIRED)

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
  ipc.h)

target_include_directories(farm-ng-core PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/../..)
target_link_libraries(
  farm-ng-core
  farm-ng-core-protobuf
  ${Boost_FILESYSTEM_LIBRARY}
  ${Boost_SYSTEM_LIBRARY}
  dl
  gflags
  ${GLOG_LIBRARIES}
)

# TODO add tests!
enable_testing()
include(GoogleTest)
