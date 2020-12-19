#!/bin/bash
TMPDIR=$(mktemp -d)
BLOBSTORE_ROOT=$TMPDIR docker-compose up --abort-on-container-exit ipc_logger ipc_publisher_test
rm -rf $TMPDIR
