find_package(Protobuf REQUIRED)

macro(farm_ng_add_protobufs target)
  set(multi_value_args PROTO_FILES DEPENDENCIES)
  cmake_parse_arguments(FARM_NG_ADD_PROTOBUFS "" "" "${multi_value_args}" ${ARGN})
  set(${target}_PROTOBUF_IMPORT_DIRS ${CMAKE_CURRENT_SOURCE_DIR} CACHE STRING "Path to this project's protobuf sources")
  foreach(_dep_target ${FARM_NG_ADD_PROTOBUFS_DEPENDENCIES})
    list(APPEND DEP_PROTO_INCLUDES  -I ${${_dep_target}_PROTOBUF_IMPORT_DIRS})
  endforeach()

  if(BUILD_ONLY_PROTO)
    set(additional_args
      --python_out=./
      #--go_out: github.com/farm-ng/core/genproto/resource.pb.go: generated file does not match prefix "github.com/farm_ng/genproto"
      #--go_out=module=github.com/farm_ng/genproto:./
      #--twirp_out=paths=source_relative:go/genproto
      --ts_proto_out=./
      --ts_proto_opt=forceLong=long
      )
  else()
    set(additional_args)
  endif()
  foreach (_proto_path ${FARM_NG_ADD_PROTOBUFS_PROTO_FILES})
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
      ARGS ${additional_args} --cpp_out ${CMAKE_CURRENT_BINARY_DIR} -I ${CMAKE_CURRENT_SOURCE_DIR} ${DEP_PROTO_INCLUDES} ${_full_proto_path}
      DEPENDS ${_full_proto_path} ${PROTOBUF_PROTOC_EXECUTABLE}
      COMMENT "Generating cpp protobuf ${HDR} ${SRC} from ${_proto_path}"
      VERBATIM)
  endforeach()

  add_library(${target} SHARED ${PROTO_SRCS} ${PROTO_HDRS})
  target_include_directories(${target} PUBLIC ${CMAKE_CURRENT_BINARY_DIR})
  target_link_libraries(${target} ${Protobuf_LIBRARIES} ${FARM_NG_ADD_PROTOBUFS_DEPENDENCIES})
endmacro()
