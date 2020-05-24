#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
TAG="test-integration"

docker build -t $TAG -f $DIR/Dockerfile.test-integration $DIR/..
docker run \
       --rm -p 8989:8989 -v $PWD:/src:rw,Z -u $(id -u):$(id -g) --workdir /src --name $TAG -d \
       $TAG

# Give server a moment to start up
sleep 1

make --ignore-errors test TEST_FILTER=integration

echo "Tests complete. Stopping docker..."
docker kill $TAG
