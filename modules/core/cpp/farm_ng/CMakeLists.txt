add_subdirectory(core)

add_executable(ipc_logger ipc_logger.cpp)
target_link_libraries(ipc_logger farm_ng_core)

add_executable(log_playback log_playback.cpp)
target_link_libraries(log_playback farm_ng_core)

find_package(CLI11 CONFIG REQUIRED)
find_package(fmt REQUIRED)

add_executable(logger_example logger_example.cpp)
target_link_libraries(logger_example farm_ng_core CLI11::CLI11 fmt::fmt)
