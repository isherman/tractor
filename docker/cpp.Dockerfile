FROM ubuntu:18.04

ARG DEBIAN_FRONTEND=noninteractive
WORKDIR /farm_ng

RUN useradd -m farmer && echo "farmer:farmer" | chpasswd && adduser farmer sudo

RUN apt-get update --fix-missing && \
  apt-get install -y --no-install-recommends \
  build-essential \
  sudo \
  && apt-get clean

COPY setup.bash Makefile bootstrap*.sh requirements*.txt ./
COPY third_party third_party
RUN make bootstrap
RUN make third_party

COPY CMakeLists.txt .
COPY cpp cpp
COPY protos protos
RUN apt-get update --fix-missing && apt-get install -y --no-install-recommends \
  libboost-filesystem-dev \
  libboost-regex-dev \
  libboost-system-dev \
  libprotobuf-dev \
  protobuf-compiler \
  && apt-get clean

RUN	mkdir -p build && cd build && rm -rf ./* && cmake -DCMAKE_PREFIX_PATH=`pwd`/../env -DCMAKE_BUILD_TYPE=Release .. && make -j`nproc --ignore=1`

ENTRYPOINT ["build/cpp/farm_ng/ipc_logger"]
