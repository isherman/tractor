FROM ubuntu:18.04

RUN apt-get update --fix-missing && \
  apt-get install -y --no-install-recommends \
  apt-utils \
  build-essential \
  ca-certificates \
  curl \
  git \
  wget \
  sudo \
  && apt-get clean

RUN useradd -ms /bin/bash -G sudo farmer
RUN echo 'farmer:farmer' | chpasswd
USER farmer
WORKDIR /home/farmer

RUN git clone --branch master --recursive https://github.com/farm-ng/tractor.git

WORKDIR /home/farmer/tractor
