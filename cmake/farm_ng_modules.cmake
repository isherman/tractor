find_package(Protobuf REQUIRED)

macro(farm_ng_add_protobufs target)
  set(multi_value_args PROTO_FILES DEPENDENCIES)
  cmake_parse_arguments(FARM_NG_ADD_PROTOBUFS "" "" "${multi_value_args}" ${ARGN})
  set(${target}_PROTOBUF_IMPORT_DIRS ${CMAKE_CURRENT_SOURCE_DIR} CACHE STRING "Path to this project's protobuf sources")
  foreach(_dep_target ${FARM_NG_ADD_PROTOBUFS_DEPENDENCIES})
    list(APPEND DEP_PROTO_INCLUDES  -I ${${_dep_target}_PROTOBUF_IMPORT_DIRS})
  endforeach()

  # Create build directories for all supported languages
  list(APPEND _proto_languages cpp python go ts)
  foreach(_proto_language ${_proto_languages})
    set("_proto_output_dir_${_proto_language}" ${CMAKE_CURRENT_BINARY_DIR}/${_proto_language})
    file(MAKE_DIRECTORY "${_proto_output_dir_${_proto_language}}")
  endforeach()

  # Extract the module name from the target
  string(REGEX REPLACE "farm_ng_|_protobuf" "" _module ${target})

  # With this configuration, .pb.go and .twirp.go files are generated in
  # ${_proto_output_dir_go}/github.com/farm-ng/genproto/${_module}.
  # The fully qualified directory structure isn't necessary for Go modules,
  # but the Twirp generator doesn't yet support --go_opt=module
  # (https://github.com/twitchtv/twirp/issues/226).
  set(protoc_args
    --cpp_out ${_proto_output_dir_cpp}
    --python_out=${_proto_output_dir_python}
    --go_out=${_proto_output_dir_go}
    --twirp_out=${_proto_output_dir_go}
    --ts_proto_out=forceLong=long:${_proto_output_dir_ts}
  )

  foreach (_proto_path ${FARM_NG_ADD_PROTOBUFS_PROTO_FILES})
    get_filename_component(_file_we ${_proto_path} NAME_WE)
    get_filename_component(_file_dir ${_proto_path} DIRECTORY)
    SET(SRC ${_file_dir}/${_file_we}.pb.cc)
    SET(HDR ${_file_dir}/${_file_we}.pb.h)
    list(APPEND PROTO_SRCS ${_proto_output_dir_cpp}/${SRC})
    list(APPEND PROTO_HDRS ${_proto_output_dir_cpp}/${HDR})
    SET(_full_proto_path ${CMAKE_CURRENT_SOURCE_DIR}/${_proto_path})
    # TODO(isherman): Should all generated code, in all languages, be OUTPUTs?
    add_custom_command(
      OUTPUT ${_proto_output_dir_cpp}/${HDR} ${_proto_output_dir_cpp}/${SRC}
      COMMAND ${PROTOBUF_PROTOC_EXECUTABLE}
      ARGS ${protoc_args} -I ${CMAKE_CURRENT_SOURCE_DIR} ${DEP_PROTO_INCLUDES} ${_full_proto_path}
      DEPENDS ${_full_proto_path} ${PROTOBUF_PROTOC_EXECUTABLE}
      COMMENT "Generating protobuf code for ${_proto_path}"
      VERBATIM)
  endforeach()

  add_library(${target} SHARED ${PROTO_SRCS} ${PROTO_HDRS})
  target_include_directories(${target} PUBLIC ${_proto_output_dir_cpp})
  target_link_libraries(${target} ${Protobuf_LIBRARIES} ${FARM_NG_ADD_PROTOBUFS_DEPENDENCIES})

  # Copy a go.mod file to expose the generated Go code as a Go module
  configure_file(
    ${CMAKE_HOME_DIRECTORY}/cmake/go.mod.template
    ${_proto_output_dir_go}/github.com/farm-ng/genproto/${_module}/go.mod)

  # Copy a package.json file to expose the generated TS code as an NPM package
  configure_file(
    ${CMAKE_HOME_DIRECTORY}/cmake/package.json.template
    ${_proto_output_dir_ts}/package.json)

endmacro()
