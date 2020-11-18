#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )"
CMD="cmake"
CMD_ARGS=".."

TAG="protoc"

docker build -t $TAG -f $DIR/scripts/Dockerfile.protoc $DIR/scripts
mkdir -p $DIR/build
docker run \
       --rm -v $DIR:/src:rw,Z -u $(id -u):$(id -g) --workdir /src/build \
       --entrypoint $CMD $TAG $CMD_ARGS
CMD="make"
CMD_ARGS="all"
docker run \
       --rm -v $DIR:/src:rw,Z -u $(id -u):$(id -g) --workdir /src/build \
       --entrypoint $CMD $TAG $CMD_ARGS
