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
