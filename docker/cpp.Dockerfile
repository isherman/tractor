FROM ubuntu:18.04

WORKDIR /farm_ng

# Install system dependencies
RUN apt-get update --fix-missing && \
  apt-get install -y --no-install-recommends \
  apt-utils \
  build-essential \
  cmake \
  curl \
  gnupg2 \
  libboost-filesystem-dev \
  libboost-regex-dev \
  libboost-system-dev \
  libeigen3-dev \
  libgoogle-glog-dev \
  libprotobuf-dev \
  libsuitesparse-dev \
  protobuf-compiler \
  software-properties-common \
  git \
  && apt-get clean

# Install Realsense drivers
RUN apt-key adv --keyserver keys.gnupg.net --recv-key F6E65AC044F831AC80A06380C8B3A55A6F3EFCDE || sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-key
RUN add-apt-repository "deb http://realsense-hw-public.s3.amazonaws.com/Debian/apt-repo bionic main" -u
RUN apt-get update && apt-get install -y librealsense2-dev librealsense2-utils

# Build third-party code
COPY third_party third_party
RUN cd third_party && ./install.sh

# Build first-party code
COPY CMakeLists.txt .
COPY cpp cpp
COPY protos protos
RUN	mkdir -p build && \
  cd build && \
  cmake -DCMAKE_PREFIX_PATH=`pwd`/../env -DCMAKE_BUILD_TYPE=Release .. && \
  make -j`nproc --ignore=1`

ENTRYPOINT ["build/cpp/farm_ng/ipc_logger"]

# TODO(isherman): Reduce size of final image with multi-stage build
# https://devblogs.microsoft.com/cppblog/using-multi-stage-containers-for-c-development/
