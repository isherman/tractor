#!/bin/bash

set -e

# TODO: Fix brittle relative paths
yarn pbjs \
  --target static-module \
  --wrap es6 \
  --out genproto/protos.js \
  --path ../third_party/protoc-gen-validate \
  --path ../third_party/api-common-protos \
  ../schema/farmng/tractor/v1/mission.proto
yarn pbts -o genproto/protos.d.ts genproto/protos.js
