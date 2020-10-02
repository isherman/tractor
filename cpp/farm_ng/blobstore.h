#ifndef FARM_NG_BLOBSTORE_H_
#define FARM_NG_BLOBSTORE_H_

#include <map>

#include <google/protobuf/text_format.h>
#include <google/protobuf/util/json_util.h>
#include <boost/filesystem.hpp>
#include "glog/logging.h"

#include "farm_ng_proto/tractor/v1/resource.pb.h"

namespace farm_ng {

using farm_ng_proto::tractor::v1::Resource;

// TODO use proto enum here.
enum class BucketId { kLogs, kCalibrationDatasets, kApriltagRigModels };

boost::filesystem::path GetBlobstoreRoot();
boost::filesystem::path GetBucketRelativePath(BucketId id);
boost::filesystem::path GetBucketAbsolutePath(BucketId id);

void WriteProtobufToJsonFile(const boost::filesystem::path& path,
                             const google::protobuf::Message& proto);

void WriteProtobufToBinaryFile(const boost::filesystem::path& path,
                               const google::protobuf::Message& proto);

// Returns a bucket-relative path guaranteed to be unique, with a parent
// directory created if necessary.
boost::filesystem::path MakePathUnique(boost::filesystem::path root,
                                       boost::filesystem::path path);
template <typename ProtobufT>
farm_ng_proto::tractor::v1::Resource WriteProtobufAsJsonResource(
    BucketId id, const std::string& path, const ProtobufT& message) {
  farm_ng_proto::tractor::v1::Resource resource;
  resource.set_content_type("application/protobuf; type=type.googleapis.com/" +
                            ProtobufT::descriptor()->full_name());

  boost::filesystem::path write_path =
      MakePathUnique(GetBucketAbsolutePath(id), path);
  write_path += ".json";
  resource.set_path((GetBucketRelativePath(id) / write_path).string());
  WriteProtobufToJsonFile(GetBucketAbsolutePath(id) / write_path, message);
  return resource;
}

template <typename ProtobufT>
farm_ng_proto::tractor::v1::Resource WriteProtobufAsBinaryResource(
    BucketId id, const std::string& path, const ProtobufT& message) {
  farm_ng_proto::tractor::v1::Resource resource;
  resource.set_content_type("application/protobuf; type=type.googleapis.com/" +
                            ProtobufT::descriptor()->full_name());

  boost::filesystem::path write_path =
      MakePathUnique(GetBucketAbsolutePath(id), path);
  write_path += ".pb";
  resource.set_path((GetBucketRelativePath(id) / write_path).string());
  WriteProtobufToBinaryFile(GetBucketAbsolutePath(id) / write_path, message);
  return resource;
}

template <typename ProtobufT>
ProtobufT ReadProtobufFromJsonFile(const boost::filesystem::path& path) {
  std::ifstream json_in(path.string());
  CHECK(json_in) << "Could not open path: " << path.string();
  std::string json_str((std::istreambuf_iterator<char>(json_in)),
                       std::istreambuf_iterator<char>());

  CHECK(!json_str.empty()) << "Did not load any text from: " << path.string();
  google::protobuf::util::JsonParseOptions options;

  ProtobufT message;
  auto status =
      google::protobuf::util::JsonStringToMessage(json_str, &message, options);
  CHECK(status.ok()) << status;

  return message;
}

template <typename ProtobufT>
ProtobufT ReadProtobufFromResource(
    const farm_ng_proto::tractor::v1::Resource& resource) {
  // TODO check the content_type to switch parser between binary or protobuf.
  CHECK_EQ("application/protobuf; type=type.googleapis.com/" +
               ProtobufT::descriptor()->full_name(),
           resource.content_type())
      << resource.DebugString();
  return ReadProtobufFromJsonFile<ProtobufT>(GetBlobstoreRoot() /
                                             resource.path());
}
}  // namespace farm_ng

#endif
