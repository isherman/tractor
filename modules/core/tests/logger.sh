#!/bin/bash
TMPDIR=$(mktemp -d)
OVERRIDE="docker-compose.ipc_publisher_test.yml"
SERVICE_DEPS="ipc_logger"

_UID=`id -u` _GID=`id -g` BLOBSTORE_ROOT=$TMPDIR \
docker-compose \
-f docker-compose.yml \
-f $OVERRIDE \
up --abort-on-container-exit $SERVICE_DEPS test_runner

rm -rf $TMPDIR
