#include <thread>

#include <gflags/gflags.h>
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
#include "farm_ng/core/event_log.h"
#include "farm_ng/core/init.h"
#include "farm_ng/core/ipc.h"

#include "farm_ng/perception/sophus_protobuf.h"

DEFINE_bool(interactive, false, "receive program args via eventbus");

// TODO should this be a resource path, relative to blobstore?
// TODO(isherman): Make this relative to the blobstore, update dockerfile
DEFINE_string(configuration_path, "/host/config.json",
              "Path to the configuration file.");

using farm_ng::core::MakeEvent;
using farm_ng::core::ReadProtobufFromJsonFile;
using farm_ng::perception::Image;
using farm_ng::perception::NamedSE3Pose;
typedef farm_ng::core::Event EventPb;

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
        ProtoToSophus(
            sampled_workspace.workspace().base_pose_workspace().a_pose_b(),
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
      core::EventBus& bus,
      const CaptureRobotExtrinsicsDatasetConfiguration& configuration)
      : bus_(bus),
        timer_(bus_.get_io_service()),
        configuration_(configuration) {
    if (FLAGS_interactive) {
      status_.mutable_input_required_configuration()->CopyFrom(configuration);
    } else {
      set_configuration(configuration);
    }
    bus_.AddSubscriptions({bus_.GetName()});

    bus_.GetEventSignal()->connect(
        std::bind(&CaptureRobotExtrinsicsDatasetProgram::on_event, this,
                  std::placeholders::_1));
    on_timer(boost::system::error_code());
  }
  void send_status() {
    bus_.Send(MakeEvent(bus_.GetName() + "/status", status_));
  }

  void on_timer(const boost::system::error_code& error) {
    if (error) {
      LOG(WARNING) << "timer error: " << __PRETTY_FUNCTION__ << error;
      return;
    }
    timer_.expires_from_now(boost::posix_time::millisec(1000));
    timer_.async_wait(std::bind(&CaptureRobotExtrinsicsDatasetProgram::on_timer,
                                this, std::placeholders::_1));

    send_status();
  }

  bool on_configuration(const EventPb& event) {
    CaptureRobotExtrinsicsDatasetConfiguration configuration;
    if (!event.data().UnpackTo(&configuration)) {
      return false;
    }
    LOG(INFO) << configuration.ShortDebugString();
    set_configuration(configuration);
    return true;
  }

  void set_configuration(
      const CaptureRobotExtrinsicsDatasetConfiguration& configuration) {
    configuration_ = configuration;
    status_.clear_input_required_configuration();
    send_status();
  }

  void on_event(const EventPb& event) {
    if (on_configuration(event)) {
      return;
    }
  }

  int run() {
    while (status_.has_input_required_configuration()) {
      bus_.get_io_service().run_one();
    }

    WaitForServices(bus_, {});

    auto credentials = grpc::InsecureChannelCredentials();
    auto channel =
        grpc::CreateChannel(configuration_.hal_service_address(), credentials);
    farm_ng::calibration::RobotHalClient client(channel);

    std::string log_path = (core::GetBucketRelativePath(core::BUCKET_LOGS) /
                            boost::filesystem::path(configuration_.name()))
                               .string();

    core::SetArchivePath(log_path);

    // TODO(isherman): Replace "bi" with an appropriate content-type for farm-ng
    // binary logs
    auto resource_path =
        farm_ng::core::GetUniqueArchiveResource("events", "log", "bi");

    core::EventLogWriter log_writer(resource_path.second);

    auto requests = CapturePoseRequestsFromSampledWorkspace(
        configuration_.sampled_workspace());

    for (auto& request : requests) {
      bus_.get_io_service().poll();

      log_writer.Write(core::MakeEvent("capture/request", request));
      auto [status, response] = client.CapturePoseSync(request);
      log_writer.Write(core::MakeEvent("capture/response", response));

      // TODO(isherman): Pipe this into calibration
      CHECK(status.ok());
      CHECK_EQ(response.status(), CapturePoseResponse::STATUS_SUCCESS);
      for (const Image& image : response.images()) {
        CHECK_GT(image.resource().data().length(), 0);
        CHECK_GT(image.camera_model().image_width(), 0);
      }
    }
    return 0;
  }

 private:
  core::EventBus& bus_;
  boost::asio::deadline_timer timer_;

  CaptureRobotExtrinsicsDatasetConfiguration configuration_;
  CaptureRobotExtrinsicsDatasetStatus status_;
};

}  // namespace farm_ng::calibration

int Main(farm_ng::core::EventBus& bus) {
  auto configuration = ReadProtobufFromJsonFile<
      farm_ng::calibration::CaptureRobotExtrinsicsDatasetConfiguration>(
      FLAGS_configuration_path);

  farm_ng::calibration::CaptureRobotExtrinsicsDatasetProgram program(
      bus, configuration);
  return program.run();
}

void Cleanup(farm_ng::core::EventBus& bus) { LOG(INFO) << "Cleanup"; }

int main(int argc, char* argv[]) {
  return farm_ng::core::Main(argc, argv, &Main, &Cleanup);
}
