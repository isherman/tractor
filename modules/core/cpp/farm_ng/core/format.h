#ifndef FARM_NG_FORMAT_H_
#define FARM_NG_FORMAT_H_

#undef FMT_STRING_ALIAS
#define FMT_STRING_ALIAS 1

#undef FMT_HEADER_ONLY
#define FMT_HEADER_ONLY 1

#include <fmt/core.h>
#include <fmt/format.h>
#include <fmt/ostream.h>

// Formats the `cstr` using the libfmt library.
//
// See here for details: https://fmt.dev/latest/syntax.html
//
// Note that compile-time format check is performed, and hence cstr needs to be
// a string literal. If no compile-time check is required, and/or the string is
// a variable, call ``::fmt::format(str, ...);`` instead.
//
#define FARM_NG_FORMAT(cstr, ...) ::fmt::format(FMT_STRING(cstr), __VA_ARGS__)

#endif
