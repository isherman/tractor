cmake_minimum_required(VERSION 3.10)
project(farm_ng_root)

include(CMakeToolsHelpers OPTIONAL)

set(PKG_CONFIG_USE_CMAKE_PREFIX_PATH ON)
set(BUILD_SHARED_LIBS ON)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall -Wextra -Wno-unused-parameter -Wno-unused-but-set-variable -Wno-unused-variable -Wno-unused-function -Wno-maybe-uninitialized -Wno-implicit-fallthrough")
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

list(APPEND CMAKE_MODULE_PATH ${CMAKE_CURRENT_SOURCE_DIR}/cmake)
include(cmake/farm_ng_modules.cmake)

if(BUILD_ONLY_PROTO)
  message(STATUS "Build only proto.")
  add_subdirectory(modules/core/protos)
  add_subdirectory(modules/perception/protos)
  add_subdirectory(modules/calibration/protos)
  add_subdirectory(modules/tractor/protos)
  add_subdirectory(modules/frontend/protos)
  return()
endif()

add_subdirectory(third_party)
add_subdirectory(third_party/googletest)

add_subdirectory(modules/core)
add_subdirectory(modules/perception)
add_subdirectory(modules/calibration)
add_subdirectory(modules/tractor)
add_subdirectory(modules/frontend)
