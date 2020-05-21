#!/bin/bash

set -e

yarn pbjs \
  --target static-module \
  --wrap es6 \
  --out genproto/protos.js \
  $FARM_NG_ROOT/protos/farmng/tractor/v1/*.proto
yarn pbts -o genproto/protos.d.ts genproto/protos.js
