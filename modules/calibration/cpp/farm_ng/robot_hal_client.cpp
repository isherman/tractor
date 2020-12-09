#include <thread>

#include <glog/logging.h>

#include <grpc/grpc.h>
#include <grpcpp/channel.h>
#include <grpcpp/client_context.h>
#include <grpcpp/create_channel.h>
#include <grpcpp/security/credentials.h>

#include "farm_ng/calibration/robot_hal.grpc.pb.h"
#include "farm_ng/calibration/workspace.pb.h"
#include "farm_ng/core/blobstore.h"

using farm_ng::core::ReadProtobufFromJsonFile;
using farm_ng::perception::NamedSE3Pose;

namespace farm_ng::calibration {
class RobotHalClient {
 public:
  RobotHalClient(std::shared_ptr<grpc::Channel> channel)
      : stub_(RobotHALService::NewStub(channel)) {}

  std::tuple<grpc::Status, CapturePoseResponse> CapturePoseSync(
      const CapturePoseRequest& request) {
    grpc::ClientContext context;

    std::shared_ptr<
        grpc::ClientReaderWriter<CapturePoseRequest, CapturePoseResponse> >
        stream(stub_->CapturePose(&context));

    stream->Write(request);
    stream->WritesDone();

    // Block waiting for response
    CapturePoseResponse response;
    stream->Read(&response);
    std::cout << "Got response " << response.ShortDebugString() << std::endl;

    return {stream->Finish(), response};
  }

 private:
  std::unique_ptr<RobotHALService::Stub> stub_;
};

std::vector<CapturePoseRequest> CapturePoseRequestsFromConfiguration(
    SampledCartesianWorkspace config) {
  std::vector<CapturePoseRequest> pose_requests;
  int sample_count_x = std::max(config.sample_count_x(), 1);
  int sample_count_y = std::max(config.sample_count_y(), 1);
  int sample_count_z = std::max(config.sample_count_z(), 1);

  auto coordinate = [=](int i, double size, int sample_count) -> double {
    if (i == 0) {
      return 0;
    }
    if (i == sample_count - 1) {
      return size;
    }
    return i * size / (sample_count - 1);
  };

  for (double ix = 0; ix < sample_count_x; ix++) {
    for (double iy = 0; iy < sample_count_y; iy++) {
      for (double iz = 0; iz < sample_count_z; iz++) {
        CapturePoseRequest pose_request;
        NamedSE3Pose* pose = pose_request.add_poses();
        pose->mutable_a_pose_b()->mutable_position()->set_x(
            coordinate(ix, config.workspace().size().x(), sample_count_x));
        pose->mutable_a_pose_b()->mutable_position()->set_y(
            coordinate(iy, config.workspace().size().y(), sample_count_y));
        pose->mutable_a_pose_b()->mutable_position()->set_z(
            coordinate(iz, config.workspace().size().z(), sample_count_z));
        // TODO: add to workspace.origin
        // TODO: rotation
        // SophusToProto(se3, "workspace_origin", "target", pose)
        pose_requests.push_back(pose_request);
      }
    }
  }
  return pose_requests;
}

class CalibrateRobotExtrinsicsProgram {
 public:
  CalibrateRobotExtrinsicsProgram(std::shared_ptr<RobotHalClient> client)
      : client_(client) {}

  void Run() {
    auto config =
        ReadProtobufFromJsonFile<SampledCartesianWorkspace>("workspace.json");

    auto capture_pose_requests = CapturePoseRequestsFromConfiguration(config);

    for (auto& pose : capture_pose_requests) {
      auto [status, response] = client_->CapturePoseSync(pose);

      // TODO(isherman): Pipe this into calibration
      CHECK(status.ok());
      CHECK_EQ(response.status(), CapturePoseResponse::STATUS_SUCCESS);
      CHECK_GT(response.image_rgb().resource().bytes().length(), 0);
      CHECK_GT(response.image_rgb().camera_model().image_width(), 0);
    }
  }

 private:
  std::shared_ptr<RobotHalClient> client_;
};

}  // namespace farm_ng::calibration

int main(int argc, char* argv[]) {
  std::string server_address = "localhost:50051";
  auto credentials = grpc::InsecureChannelCredentials();
  auto channel = grpc::CreateChannel(server_address, credentials);
  auto client = std::make_shared<farm_ng::calibration::RobotHalClient>(channel);
  auto program = farm_ng::calibration::CalibrateRobotExtrinsicsProgram(client);
  program.Run();

  return 0;
}
