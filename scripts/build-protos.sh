#!/usr/bin/env bash
set -e

mkdir -p build/frontend/genproto
mkdir -p build/go/github.com/farm-ng/genproto
mkdir -p build/python/genproto

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
CMD="protoc"
CMD_ARGS="--proto_path=protos
          --proto_path=modules/core/protos
          --proto_path=modules/perception_core/protos
          --python_out=build/python/genproto
          --go_out=build/go/github.com/farm-ng/genproto
          --go_opt=module=github.com/farm-ng/genproto
          --twirp_out=build/go
          --ts_proto_out=build/frontend/genproto
          --ts_proto_opt=forceLong=long
          modules/core/protos/farm_ng/v1/*.proto
          modules/perception_core/protos/farm_ng/v1/*.proto
          protos/farm_ng/v1/*.proto
          protos/farm_ng_proto/tractor/v1/*.proto"

TAG="protoc"

docker build -t $TAG -f $DIR/Dockerfile.protoc $DIR
docker run \
       --rm -v $PWD:/src:rw,Z -u $(id -u):$(id -g) --workdir /src \
       --entrypoint $CMD $TAG $CMD_ARGS

cp "scripts/go.mod" "build/go/github.com/farm-ng/genproto/."
