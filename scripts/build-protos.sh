#!/bin/bash
set -e

# Build Python protos w/ protoc
protoc \
  --proto_path=app/schema \
  --proto_path=app/third_party/api-common-protos \
  --proto_path=app/third_party/protoc-gen-validate \
  --python_out=python/genproto \
  app/schema/farmng/tractor/v1/*.proto

# Build JS/TS protos with protobuf.js
cd app/frontend && yarn build-protos
