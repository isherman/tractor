#include "farm_ng/blobstore.h"

namespace farm_ng {

// TODO construct this from lower case of enum name?
const std::map<BucketId, std::string> kBucketPaths{
    {BucketId::kLogs, "logs"},
    {BucketId::kCalibrationDatasets, "calibration-datasets"},
    {BucketId::kApriltagRigModels, "apriltag_rig_models"},
    {BucketId::kBaseToCameraModels, "base_to_camera_models"},
    {BucketId::kVideoDatasets, "video_datasets"},
    {BucketId::kConfigurations, "configurations"},
};

boost::filesystem::path GetBlobstoreRoot() {
  boost::filesystem::path root;
  if (const char* env_root = std::getenv("BLOBSTORE_ROOT")) {
    root = env_root;
  } else {
    root = "/tmp/farm-ng-log/";
  }
  return root;
}

boost::filesystem::path GetBucketRelativePath(BucketId id) {
  return kBucketPaths.at(id);
}

boost::filesystem::path GetBucketAbsolutePath(BucketId id) {
  return GetBlobstoreRoot() / GetBucketRelativePath(id);
}

void WriteProtobufToJsonFile(const boost::filesystem::path& path,
                             const google::protobuf::Message& proto) {
  google::protobuf::util::JsonPrintOptions print_options;
  print_options.add_whitespace = true;
  print_options.always_print_primitive_fields = true;
  std::string json_str;
  google::protobuf::util::MessageToJsonString(proto, &json_str, print_options);
  std::ofstream outf(path.string());
  outf << json_str;
}

void WriteProtobufToBinaryFile(const boost::filesystem::path& path,
                               const google::protobuf::Message& proto) {
  std::string binary_str;
  proto.SerializeToString(&binary_str);
  std::ofstream outf(path.string(), std::ofstream::binary);
  outf << binary_str;
}

// Returns a bucket - relative path guaranteed to be unique,
//  with a parent
// directory created if necessary.
boost::filesystem::path MakePathUnique(boost::filesystem::path root,
                                       boost::filesystem::path path) {
  boost::filesystem::path out_path = path;
  int suffix = 1;
  while (boost::filesystem::exists(root / out_path)) {
    out_path =
        boost::filesystem::path(out_path.string() + std::to_string(suffix));
    suffix++;
  }

  if (!boost::filesystem::exists((root / out_path).parent_path())) {
    if (!boost::filesystem::create_directories(
            (root / out_path).parent_path())) {
      throw std::runtime_error(std::string("Could not create directory: ") +
                               (root / out_path).parent_path().string());
    }
  }

  return out_path;
}

}  // namespace farm_ng
