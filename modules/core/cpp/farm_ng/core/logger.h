#ifndef FARM_NG_LOGGER_H_
#define FARM_NG_LOGGER_H_

#include <boost/preprocessor/comparison/equal.hpp>
#include <boost/preprocessor/control/if.hpp>
#include <boost/preprocessor/variadic/size.hpp>

#include "farm_ng/core/format.h"

// Begin (Impl details)
#define FARM_NG_IMPL_LOG_PRINTLN_ZERO()

#define FARM_NG_IMPL_LOG_PRINTLN_ONE(cstr) \
  ::fmt::print(FMT_STRING(cstr));          \
  ::fmt::print("\n")

#define FARM_NG_IMPL_LOG_PRINTLN_ARGS(cstr, ...) \
  ::fmt::print(FMT_STRING(cstr), __VA_ARGS__);   \
  ::fmt::print("\n")

#define FARM_NG_IMPL_LOG_PRINTLN_VARG(cstr, ...)                              \
  BOOST_PP_IF(BOOST_PP_EQUAL(BOOST_PP_VARIADIC_SIZE(cstr, ##__VA_ARGS__), 1), \
              FARM_NG_IMPL_LOG_PRINTLN_ONE(cstr),                             \
              FARM_NG_IMPL_LOG_PRINTLN_ARGS(cstr, ##__VA_ARGS__))

#define FARM_NG_IMPL_LOG_PRINTLN(...)                                          \
  BOOST_PP_IF(BOOST_PP_EQUAL(BOOST_PP_VARIADIC_SIZE(dummy, ##__VA_ARGS__), 1), \
              FARM_NG_IMPL_LOG_PRINTLN_ZERO(),                                 \
              FARM_NG_IMPL_LOG_PRINTLN_VARG(__VA_ARGS__))

#define FARM_NG_IMPL_LOG_HEADER(msg)                        \
  FARM_NG_IMPL_LOG_PRINTLN("[FARM_NG {} in {}:{}]", msg, \
                           __FILE__, __LINE__)

#define FARM_NG_IMPL_CHECK_OP(symbol, name_str, lhs, rhs, ...)               \
  do {                                                                       \
    if (!((lhs)symbol(rhs))) {                                               \
      FARM_NG_IMPL_LOG_HEADER("CHECK_" name_str " failed");                  \
      FARM_NG_IMPL_LOG_PRINTLN("Not true: {} " #symbol " {}\n{}\nvs.\n{}\n", \
                               #lhs, #rhs, lhs, rhs);                        \
      FARM_NG_IMPL_LOG_PRINTLN(__VA_ARGS__);                                 \
      FARM_NG_ABORT();                                                       \
    }                                                                        \
  } while (false)
// End (Impl details)

#define FARM_NG_ABORT() ::std::abort();

// Begin (Start LOG macros)
#define FARM_NG_LOG_INFO(cstr, ...)    \
  FARM_NG_IMPL_LOG_HEADER("LOG INFO"); \
  FARM_NG_IMPL_LOG_PRINTLN(cstr, ##__VA_ARGS__)

#define FARM_NG_LOG_INFO_EVERY_N(N, cstr, ...)                \
  do {                                                        \
    static std::atomic<int> counter(0);                       \
    ++counter;                                                \
    if (counter > (N)) {                                      \
      counter -= (N);                                         \
    }                                                         \
    if (counter == 1) {                                       \
      FARM_NG_IMPL_LOG_HEADER("LOG INFO EVERY N( =" #N " )"); \
      FARM_NG_IMPL_LOG_PRINTLN(cstr, ##__VA_ARGS__);          \
    }                                                         \
  } while (false)

// for now this is just the same log level as LOG_INFO
#define FARM_NG_LOG_VERBOSE(cstr, ...)    \
  FARM_NG_IMPL_LOG_HEADER("LOG VERBOSE"); \
  FARM_NG_IMPL_LOG_PRINTLN(cstr, ##__VA_ARGS__)

// for now this is just the same log level as LOG_INFO
#define FARM_NG_LOG_WARNING(cstr, ...)    \
  FARM_NG_IMPL_LOG_HEADER("LOG WARNING"); \
  FARM_NG_IMPL_LOG_PRINTLN(cstr, ##__VA_ARGS__)

// for now this is just the same log level as LOG_INFO
#define FARM_NG_LOG_ERROR(cstr, ...)    \
  FARM_NG_IMPL_LOG_HEADER("LOG ERROR"); \
  FARM_NG_IMPL_LOG_PRINTLN(cstr, ##__VA_ARGS__)

// End (LOG macros)

// Begin (Start ASSERT macros)
#define FARM_NG_FATAL(cstr, ...)                 \
  FARM_NG_IMPL_LOG_HEADER("FATAL error");        \
  FARM_NG_IMPL_LOG_PRINTLN(cstr, ##__VA_ARGS__); \
  FARM_NG_ABORT()

#define FARM_NG_CHECK(condition, ...)                             \
  do {                                                            \
    if (!(condition)) {                                           \
      FARM_NG_IMPL_LOG_HEADER("FARM_NG_CHECK failed");            \
      FARM_NG_IMPL_LOG_PRINTLN("bool({}) not true.", #condition); \
      FARM_NG_IMPL_LOG_PRINTLN(__VA_ARGS__);                      \
      FARM_NG_ABORT();                                            \
    }                                                             \
  } while (false)

#define FARM_NG_CHECK_EQ(lhs, rhs, ...) \
  FARM_NG_IMPL_CHECK_OP(==, "EQ", lhs, rhs, __VA_ARGS__)

#define FARM_NG_CHECK_NE(lhs, rhs, ...) \
  FARM_NG_IMPL_CHECK_OP(!=, "NE", lhs, rhs, __VA_ARGS__)

#define FARM_NG_CHECK_LE(lhs, rhs, ...) \
  FARM_NG_IMPL_CHECK_OP(<=, "LE", lhs, rhs, __VA_ARGS__)

#define FARM_NG_CHECK_LT(lhs, rhs, ...) \
  FARM_NG_IMPL_CHECK_OP(<, "LT", lhs, rhs, __VA_ARGS__)

#define FARM_NG_CHECK_GE(lhs, rhs, ...) \
  FARM_NG_IMPL_CHECK_OP(>=, "GE", lhs, rhs, __VA_ARGS__)

#define FARM_NG_CHECK_GT(lhs, rhs, ...) \
  FARM_NG_IMPL_CHECK_OP(>, "GT", lhs, rhs, __VA_ARGS__)
// End (Start ASSERT macros)

#endif
