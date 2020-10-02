#ifndef FARM_NG_BLOBSTORE_H_
#define FARM_NG_BLOBSTORE_H_

#include <map>

#include <google/protobuf/text_format.h>
#include <google/protobuf/util/json_util.h>
#include <boost/filesystem.hpp>

#include "farm_ng_proto/tractor/v1/resource.pb.h"

namespace farm_ng {

using farm_ng_proto::tractor::v1::Resource;

enum class BucketId { kLogs, kCalibrationDatasets };

const std::map<BucketId, std::string> kBucketPaths{
    {BucketId::kLogs, "logs"},
    {BucketId::kCalibrationDatasets, "calibration-datasets"}};

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

template <typename ProtobufT>
void WriteProtobufToJsonFile(const boost::filesystem::path& path,
                             const ProtobufT& proto) {
  google::protobuf::util::JsonPrintOptions print_options;
  print_options.add_whitespace = true;
  print_options.always_print_primitive_fields = true;
  std::string json_str;
  google::protobuf::util::MessageToJsonString(proto, &json_str, print_options);
  std::ofstream outf(path.string());
  outf << json_str;
}

template <typename ProtobufT>
void WriteProtobufToBinaryFile(const boost::filesystem::path& path,
                               const ProtobufT& proto) {
  std::string binary_str;
  proto.SerializeToString(&binary_str);
  std::ofstream outf(path.string(), std::ofstream::binary);
  outf << binary_str;
}

// Returns a bucket-relative path guaranteed to be unique, with a parent
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

template <typename ProtobufT>
farm_ng_proto::tractor::v1::Resource WriteProtobufAsJsonResource(
    BucketId id, const std::string& path, const ProtobufT& message) {
  farm_ng_proto::tractor::v1::Resource resource;
  resource.set_content_type("application/protobuf; type=type.googleapis.com/" +
                            ProtobufT::descriptor()->full_name());

  boost::filesystem::path write_path = MakePathUnique(GetBucketAbsolutePath(id), path);
  write_path += ".json";
  resource.set_path((kBucketPaths.at(id) / write_path).string());
  WriteProtobufToJsonFile(GetBucketAbsolutePath(id) / write_path, message);
  return resource;
}

template <typename ProtobufT>
farm_ng_proto::tractor::v1::Resource WriteProtobufAsBinaryResource(
    BucketId id, const std::string& path, const ProtobufT& message) {
  farm_ng_proto::tractor::v1::Resource resource;
  resource.set_content_type("application/protobuf; type=type.googleapis.com/" +
                            ProtobufT::descriptor()->full_name());

  boost::filesystem::path write_path = MakePathUnique(GetBucketAbsolutePath(id), path);
  write_path += ".pb";
  resource.set_path((kBucketPaths.at(id) / write_path).string());
  WriteProtobufToBinaryFile(GetBucketAbsolutePath(id) / write_path, message);
  return resource;
}

}  // namespace farm_ng

#endif
