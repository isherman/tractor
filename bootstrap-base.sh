#!/bin/bash -ex
SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  DIR="$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  # if $SOURCE was a relative symlink, we need to resolve it
  # relative to the path where the symlink file was located
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE"
done
export FARM_NG_ROOT=$( cd "$( dirname "${SOURCE}" )" >/dev/null 2>&1 && pwd )

# System dependencies
# TODO(isherman): Should these be stored along with the dependencies that require them (e.g. Ceres)?
sudo apt-get update --fix-missing && apt-get install -y --no-install-recommends \
     build-essential \
     cmake \
     curl \
     libdbus-glib-1-dev \
     libeigen3-dev \
     libgoogle-glog-dev \
     libsuitesparse-dev \
     sudo \
     git \

# Realsense
if ! dpkg -s librealsense2-dev > /dev/null 2>&1; then
  sudo apt-get update && sudo apt-get install -y software-properties-common apt-utils gnupg2
  sudo apt-key adv --keyserver keys.gnupg.net --recv-key F6E65AC044F831AC80A06380C8B3A55A6F3EFCDE || sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-key
  sudo add-apt-repository "deb http://realsense-hw-public.s3.amazonaws.com/Debian/apt-repo bionic main" -u
  sudo apt-get update && sudo apt-get install -y librealsense2-dev librealsense2-utils
fi

# Yarn
if ! dpkg -s yarn > /dev/null 2>&1; then
  curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
  echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
  sudo apt-get update && sudo apt-get install -y yarn
fi

# Virtualenv
if ! pip3 show virtualenv > /dev/null 2>&1; then
  sudo apt-get update && sudo apt-get install -y python3-pip
  pip3 install virtualenv
fi

# Node
if ! nodejs --version | grep 12.18.3; then
  curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
  sudo apt-get update && sudo apt-get install -y nodejs
  nodejs --version
fi
