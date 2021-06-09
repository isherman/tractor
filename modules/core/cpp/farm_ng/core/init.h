#ifndef FARM_NG_INIT_H_
#define FARM_NG_INIT_H_
#include <boost/asio/io_service.hpp>

#include <functional>

#include "farm_ng/core/ipc.h"

namespace farm_ng {
namespace core {

void GlogFailureFunction();

int Main(int argc, char** argv, std::function<int(EventBus&)> main_func,
         void (*cleanup_func)(EventBus&));

int MainNoGFlags(int argc, char** argv, std::function<int(EventBus&)> main_func,
                 void (*cleanup_func)(EventBus&));

}  // namespace core
}  // namespace farm_ng

#endif
