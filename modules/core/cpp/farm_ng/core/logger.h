#ifndef FARM_NG_LOGGER_H_
#define FARM_NG_LOGGER_H_

#undef FMT_STRING_ALIAS
#define FMT_STRING_ALIAS 1

#include <fmt/core.h>
#include <fmt/format.h>


// Begin (Impl details)
#define FARM_NG_LOG_IMPL_PRINTLN(cstr, ...) \
  ::fmt::print(FMT_STRING(cstr "\n"), ##__VA_ARGS__)

#define FARM_NG_LOG_IMPL_HEADER(msg)                                  \
  FARM_NG_LOG_IMPL_PRINTLN("[FARM_NG {} in {}:{} {}]", msg, __FILE__, \
                           __LINE__, __PRETTY_FUNCTION__)
// End (Impl details)

#define FARM_NG_ABORT() std::abort();

// Begin (Start LOG macros)
#define FARM_NG_LOG_INFO(cstr, ...)    \
  FARM_NG_LOG_IMPL_HEADER("LOG INFO"); \
  FARM_NG_LOG_IMPL_PRINTLN(cstr, ##__VA_ARGS__);
// End (LOG macros)

// Begin (Start ASSERT macros)
#define FARM_NG_FATAL(cstr, ...)                 \
  do {                                           \
    FARM_NG_LOG_IMPL_HEADER("FATAL error");      \
    FARM_NG_LOG_IMPL_PRINTLN(cstr, __VA_ARGS__); \
    FARM_NG_ABORT();                             \
  } while (true)

#define FARM_NG_CHECK(condition, cstr, ...)                \
  do {                                                     \
    if (!condition) {                                      \
      FARM_NG_LOG_IMPL_HEADER("CHECK failed");             \
      FARM_NG_LOG_IMPL_PRINTLN("Not true: {}", condition); \
      FARM_NG_LOG_IMPL_PRINTLN(cstr, ##__VA_ARGS__);       \
      FARM_NG_ABORT();                                     \
    }                                                      \
  } while (true)

#define FARM_NG_CHECK_EQ(lhs, rhs, cstr, ...)                                  \
  do {                                                                         \
    if (!((lhs) == (rhs))) {                                                   \
      FARM_NG_LOG_IMPL_HEADER("CHECK_EQ failed");                              \
      FARM_NG_LOG_IMPL_PRINTLN("Not true: {} == {}\n{}\nvs.\n{}\n" cstr, #lhs, \
                               #rhs, lhs, rhs);                                \
      FARM_NG_LOG_IMPL_PRINTLN(cstr, ##__VA_ARGS__);                           \
      FARM_NG_ABORT();                                                         \
    }                                                                          \
  } while (true)
// End (Start ASSERT macros)

namespace farm_ng {
namespace core {}
}  // namespace farm_ng

#endif
