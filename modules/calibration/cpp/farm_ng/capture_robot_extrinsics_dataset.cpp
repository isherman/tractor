#include <thread>

#include <glog/logging.h>
#include <grpc/grpc.h>
#include <grpcpp/channel.h>
#include <grpcpp/client_context.h>
#include <grpcpp/create_channel.h>
#include <grpcpp/security/credentials.h>
#include <sophus/se3.hpp>

#include "farm_ng/calibration/capture_robot_extrinsics_dataset.pb.h"
#include "farm_ng/calibration/robot_hal.grpc.pb.h"
#include "farm_ng/core/blobstore.h"
#include "farm_ng/perception/sophus_protobuf.h"

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
    std::cout << "Got response " << response.ShortDebugString() << "\n"
              << std::endl;

    return {stream->Finish(), response};
  }

 private:
  std::unique_ptr<RobotHALService::Stub> stub_;
};

std::vector<CapturePoseRequest> CapturePoseRequestsFromSampledWorkspace(
    SampledCartesianWorkspace sampled_workspace) {
  std::vector<CapturePoseRequest> pose_requests;
  int sample_count_x = std::max(sampled_workspace.sample_count_x(), 1);
  int sample_count_y = std::max(sampled_workspace.sample_count_y(), 1);
  int sample_count_z = std::max(sampled_workspace.sample_count_z(), 1);

  auto target_coordinate = [=](int i, double size, int sample_count) -> double {
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
        Sophus::SE3d base_pose_workspace;
        ProtoToSophus(sampled_workspace.workspace().base_pose_workspace(),
                      &base_pose_workspace);
        Sophus::SE3d workspace_pose_target = Sophus::SE3d::trans(
            target_coordinate(ix, sampled_workspace.workspace().size().x(),
                              sample_count_x),
            target_coordinate(iy, sampled_workspace.workspace().size().y(),
                              sample_count_y),
            target_coordinate(iz, sampled_workspace.workspace().size().z(),
                              sample_count_z));

        CapturePoseRequest pose_request;
        NamedSE3Pose* pose = pose_request.add_poses();
        SophusToProto(base_pose_workspace * workspace_pose_target, "root",
                      "target", pose);
        pose_requests.push_back(pose_request);
      }
    }
  }
  return pose_requests;
}

class CaptureRobotExtrinsicsDatasetProgram {
 public:
  CaptureRobotExtrinsicsDatasetProgram(
      std::shared_ptr<RobotHalClient> client,
      const CaptureRobotExtrinsicsDatasetConfiguration& configuration)
      : client_(client), configuration_(configuration) {}

  void Run() {
    auto requests = CapturePoseRequestsFromSampledWorkspace(
        configuration_.sampled_workspace());

    for (auto& request : requests) {
      auto [status, response] = client_->CapturePoseSync(request);

      // TODO(isherman): Pipe this into calibration
      CHECK(status.ok());
      CHECK_EQ(response.status(), CapturePoseResponse::STATUS_SUCCESS);
      CHECK_GT(response.image_rgb().resource().data().length(), 0);
      CHECK_GT(response.image_rgb().camera_model().image_width(), 0);
    }
  }

 private:
  std::shared_ptr<RobotHalClient> client_;
  CaptureRobotExtrinsicsDatasetConfiguration configuration_;
};

}  // namespace farm_ng::calibration

int main(int argc, char* argv[]) {
  if (argc < 2) {
    std::cerr << "Must pass absolute path to configuration" << std::endl;
    return 1;
  }
  std::string configuration_path = argv[1];
  std::string server_address = "localhost:50051";
  auto credentials = grpc::InsecureChannelCredentials();
  auto channel = grpc::CreateChannel(server_address, credentials);
  auto client = std::make_shared<farm_ng::calibration::RobotHalClient>(channel);
  auto configuration = ReadProtobufFromJsonFile<
      farm_ng::calibration::CaptureRobotExtrinsicsDatasetConfiguration>(
      configuration_path);
  auto program = farm_ng::calibration::CaptureRobotExtrinsicsDatasetProgram(
      client, configuration);
  program.Run();

  return 0;
}
