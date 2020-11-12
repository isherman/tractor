set(${PROJECT_NAME}_PROTOBUF_IMPORT_DIRS ${CMAKE_CURRENT_SOURCE_DIR} CACHE STRING "Path to this project's protobuf sources")

set(PROTO_FILES
  ./farm_ng_proto/perception_core/v1/apriltag.proto
  ./farm_ng_proto/perception_core/v1/camera_model.proto
  ./farm_ng_proto/perception_core/v1/geometry.proto
  ./farm_ng_proto/perception_core/v1/image.proto
  ./farm_ng_proto/perception_core/v1/tracking_camera.proto
 )

foreach (_proto_path ${PROTO_FILES})
  get_filename_component(_file_we ${_proto_path} NAME_WE)
  get_filename_component(_file_dir ${_proto_path} DIRECTORY)
  SET(SRC ${_file_dir}/${_file_we}.pb.cc)
  SET(HDR ${_file_dir}/${_file_we}.pb.h)
  list(APPEND PROTO_SRCS ${CMAKE_CURRENT_BINARY_DIR}/${SRC})
  list(APPEND PROTO_HDRS ${CMAKE_CURRENT_BINARY_DIR}/${HDR})
  SET(_full_proto_path ${CMAKE_CURRENT_SOURCE_DIR}/${_proto_path})
  add_custom_command(
        OUTPUT ${CMAKE_CURRENT_BINARY_DIR}/${HDR} ${CMAKE_CURRENT_BINARY_DIR}/${SRC}
        COMMAND ${PROTOBUF_PROTOC_EXECUTABLE}
        ARGS --cpp_out ${CMAKE_CURRENT_BINARY_DIR} -I ${CMAKE_CURRENT_SOURCE_DIR} -I ${farm-ng-core_PROTOBUF_IMPORT_DIRS} ${_full_proto_path}
        DEPENDS ${_full_proto_path} ${PROTOBUF_PROTOC_EXECUTABLE}
        COMMENT "Generating cpp protobuf ${HDR} ${SRC} from ${_proto_path}"
        VERBATIM)
endforeach()

add_library(farm-ng-perception_core-protobuf SHARED ${PROTO_SRCS} ${PROTO_HDRS})
target_include_directories(farm-ng-perception_core-protobuf PUBLIC ${CMAKE_CURRENT_BINARY_DIR})
target_link_libraries(farm-ng-perception_core-protobuf farm-ng-core-protobuf ${Protobuf_LIBRARIES})
