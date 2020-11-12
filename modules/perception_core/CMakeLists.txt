cmake_minimum_required(VERSION 3.10)
project(farm-ng-perception_core)

include(CMakeToolsHelpers OPTIONAL)

list(APPEND CMAKE_MODULE_PATH ${PROJECT_SOURCE_DIR}/cmake)

set(PKG_CONFIG_USE_CMAKE_PREFIX_PATH ON)
set(BUILD_SHARED_LIBS ON)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall -Wextra -Wno-unused-parameter -Wno-unused-but-set-variable -Wno-unused-variable -Wno-unused-function -Wno-maybe-uninitialized -Wno-implicit-fallthrough")
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

find_package(Protobuf REQUIRED)
find_package(Boost REQUIRED system filesystem regex)
# find_package(Glog REQUIRED)
find_package(gflags REQUIRED)

enable_testing()
include(GoogleTest)

include_directories(${Protobuf_INCLUDE_DIRS})
include_directories(${CMAKE_CURRENT_BINARY_DIR}/protos)

# See https://stackoverflow.com/questions/42978414/
# HACK: rely on the protobuf target; this is brittle
# TODO: rely on a better target (or the project existence)
if(NOT TARGET farm-ng-core-protobuf)
  add_subdirectory(../core ${CMAKE_CURRENT_BINARY_DIR}/core)
endif()

add_subdirectory(protos)
# include_directories(cpp)
# add_subdirectory(cpp/farm_ng)
