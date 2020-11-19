# Get directory where this script is located
SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  DIR="$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  # if $SOURCE was a relative symlink, we need to resolve it
  # relative to the path where the symlink file was located
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE"
done
export FARM_NG_ROOT=$( cd "$( dirname "${SOURCE}" )" >/dev/null 2>&1 && pwd )

. $FARM_NG_ROOT/env/bin/activate

# Some pre-commit checks not supported on ARM
if [ `dpkg --print-architecture` == "arm64" ]; then
  export SKIP=proto-lint
fi

export PYTHONPATH=$FARM_NG_ROOT/env/lib
export PYTHONPATH=modules/calibration/python:$PYTHONPATH
export PYTHONPATH=build/modules/calibration/protos/python:$PYTHONPATH
export PYTHONPATH=modules/core/python:$PYTHONPATH
export PYTHONPATH=build/modules/core/protos/python:$PYTHONPATH
export PYTHONPATH=modules/frontend_core/python:$PYTHONPATH
export PYTHONPATH=build/modules/frontend_core/protos/python:$PYTHONPATH
export PYTHONPATH=modules/perception_core/python:$PYTHONPATH
export PYTHONPATH=build/modules/perception_core/protos/python:$PYTHONPATH
export PYTHONPATH=modules/tractor/python:$PYTHONPATH
export PYTHONPATH=build/modules/tractor/protos/python:$PYTHONPATH
export LD_LIBRARY_PATH=$FARM_NG_ROOT/env/lib
export PATH=$PATH:/usr/local/go/bin

# Set BLOBSTORE_ROOT if it's not already set
: ${BLOBSTORE_ROOT:=`dirname $FARM_NG_ROOT`/tractor-data}
export BLOBSTORE_ROOT


# # Bootstrap blobstore if necessary
# for config in `python -m farm_ng.tractor.config list`
# do
#   configpath=$BLOBSTORE_ROOT/configurations/$config.json
#   if [ ! -f $configpath  ]; then
#     echo "No configuration detected at $configpath; generating now."
#     mkdir -p `dirname $configpath`
# 	  python -m farm_ng.tractor.config gen$config > $configpath
#   fi
# done
