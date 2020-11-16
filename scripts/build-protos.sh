#!/usr/bin/env bash
set -e

mkdir -p build/ts/genproto
mkdir -p build/go/github.com/farm-ng/genproto
mkdir -p build/python/genproto

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
CMD="protoc"
CMD_ARGS="--proto_path=modules/calibration/protos
          --proto_path=modules/core/protos
          --proto_path=modules/frontend_core/protos
          --proto_path=modules/perception_core/protos
          --proto_path=modules/tractor/protos
          --proto_path=third_party/api-common-protos
          --python_out=build/python/genproto
          --go_out=build/go/github.com/farm-ng/genproto
          --go_opt=module=github.com/farm-ng/genproto
          --twirp_out=build/go
          --ts_proto_out=build/ts/genproto
          --ts_proto_opt=forceLong=long
          modules/calibration/protos/farm_ng/v1/*.proto
          modules/core/protos/farm_ng/v1/*.proto
          modules/frontend_core/protos/farm_ng/v1/*.proto
          modules/perception_core/protos/farm_ng/v1/*.proto
          modules/tractor/protos/farm_ng/v1/*.proto"

TAG="protoc"

docker build -t $TAG -f $DIR/Dockerfile.protoc $DIR
docker run \
       --rm -v $PWD:/src:rw,Z -u $(id -u):$(id -g) --workdir /src \
       --entrypoint $CMD $TAG $CMD_ARGS

cp scripts/go.mod.template build/go/github.com/farm-ng/genproto/go.mod
cp scripts/package.json.template build/ts/genproto/package.json
cd build/ts/genproto && yarn
