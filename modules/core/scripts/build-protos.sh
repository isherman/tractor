#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
MODULE="core"
CMD="protoc"
CMD_ARGS="--proto_path=protos
          --python_out=python/genproto
          protos/farm_ng_proto/tractor/v1/*.proto"

TAG="protoc-${MODULE}"

docker build -t $TAG -f $DIR/Dockerfile.protoc $DIR
docker run \
       --rm -v $PWD:/src:rw,Z -u $(id -u):$(id -g) --workdir /src \
       --entrypoint $CMD $TAG $CMD_ARGS
