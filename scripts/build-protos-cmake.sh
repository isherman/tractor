#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )"
CMD="cmake"
CMD_ARGS="-DBUILD_ONLY_PROTO=TRUE .."

TAG="protoc"

docker build -t $TAG -f $DIR/scripts/Dockerfile.protoc $DIR/scripts
mkdir -p $DIR/build-protos
docker run \
       --rm -v $DIR:/src:rw,Z -u $(id -u):$(id -g) --workdir /src/build-protos \
       --entrypoint $CMD $TAG $CMD_ARGS
CMD="make"
CMD_ARGS="all"
docker run \
       --rm -v $DIR:/src:rw,Z -u $(id -u):$(id -g) --workdir /src/build-protos \
       --entrypoint $CMD $TAG $CMD_ARGS
