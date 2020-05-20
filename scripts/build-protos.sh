#!/bin/bash
set -e

# Build Python protos w/ protoc
protoc \
  --proto_path=protos \
  --python_out=python/genproto \
  protos/farmng/tractor/v1/*.proto

# Build JS/TS protos with protobuf.js
cd app/frontend && yarn build-protos
