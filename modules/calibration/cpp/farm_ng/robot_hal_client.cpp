#include <thread>

#include <grpc/grpc.h>
#include <grpcpp/channel.h>
#include <grpcpp/client_context.h>
#include <grpcpp/create_channel.h>
#include <grpcpp/security/credentials.h>

#include "farm_ng/calibration/robot_hal.grpc.pb.h"

namespace farm_ng::calibration {
class RobotHalClient {
 public:
  RobotHalClient(std::shared_ptr<grpc::Channel> channel)
      : stub_(RobotHALService::NewStub(channel)) {}

  void CapturePose() {
    grpc::ClientContext context;

    std::shared_ptr<
        grpc::ClientReaderWriter<CapturePoseRequest, CapturePoseResponse> >
        stream(stub_->CapturePose(&context));

    std::thread writer([stream]() {
      std::vector<CapturePoseRequest> requests;
      CapturePoseRequest request;
      requests.push_back(request);
      for (const CapturePoseRequest& request : requests) {
        std::cout << "Sending capture pose request "
                  << request.ShortDebugString() << std::endl;
        stream->Write(request);
      }
      stream->WritesDone();
    });

    CapturePoseResponse response;
    while (stream->Read(&response)) {
      std::cout << "Got message " << response.ShortDebugString() << std::endl;
    }
    writer.join();
    grpc::Status status = stream->Finish();
    if (!status.ok()) {
      std::cout << "CapturePose rpc failed." << std::endl;
    }
  }

 private:
  std::unique_ptr<RobotHALService::Stub> stub_;
};
}  // namespace farm_ng::calibration

int main(int argc, char* argv[]) {
  farm_ng::calibration::RobotHalClient client(grpc::CreateChannel(
      "localhost:50051", grpc::InsecureChannelCredentials()));

  std::cout << "-------------- CapturePose --------------" << std::endl;
  client.CapturePose();

  return 0;
}
