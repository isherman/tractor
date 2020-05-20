#!/bin/bash

set -e

# TODO: Fix brittle relative paths
yarn pbjs \
  --target static-module \
  --wrap es6 \
  --out genproto/protos.js \
  ../../protos/farmng/tractor/v1/*.proto
yarn pbts -o genproto/protos.d.ts genproto/protos.js
