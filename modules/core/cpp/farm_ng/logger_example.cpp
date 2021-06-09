#include "farm_ng/core/event_log.h"
#include "farm_ng/core/init.h"
#include "farm_ng/core/ipc.h"
#include "farm_ng/core/logger.h"

#include <CLI/CLI.hpp>

typedef farm_ng::core::Event EventPb;

void Cleanup(farm_ng::core::EventBus& bus) {}

int main(int argc, char* argv[]) {
  return farm_ng::core::MainNoGFlags(
      argc, argv,
      [&](farm_ng::core::EventBus& bus) {
        CLI::App app{"Farm-ng Logger - Example"};

        std::string mode;
        app.add_option("--mode", mode, std::string("Mode to try out."))
            ->required();

        CLI11_PARSE(app, argc, argv);

        std::cerr << "mode: " << mode << std::endl;
        if (mode == "log") {
          std::cerr << "foo" << std::endl;
          FARM_NG_LOG_INFO("foo {}", 42);
        } else if (mode == "fatal") {
            FARM_NG_FATAL("This is a fatal error! (details {})", 1.441);
        } else if (mode == "check") {
            FARM_NG_CHECK(false, "False is not true! (details: `{}`, `{}`)", false, true);
        } else if (mode == "check_eq") {
            int x = 1;
            int y = 2;
            FARM_NG_CHECK_EQ(x, y, "");
        }

        return 0;
      },
      &Cleanup);
}
