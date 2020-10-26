# TODO: Choose a different base image
FROM ubuntu:18.04

ARG DEBIAN_FRONTEND=noninteractive
WORKDIR /farm_ng

RUN apt-get update --fix-missing && \
  apt-get install -y --no-install-recommends \
  build-essential \
  git \
  libdbus-glib-1-dev \
  libprotobuf-dev \
  protobuf-compiler \
  python3-dev \
  python3-pip \
  && apt-get clean

RUN pip3 install virtualenv

COPY setup.bash bootstrap*.sh env.sh requirements*.txt ./
RUN ./bootstrap-venv.sh

COPY python python
COPY protos /protos
RUN protoc \
  --proto_path=/protos \
  --python_out=python/genproto \
  /protos/farm_ng_proto/tractor/v1/*.proto

ENTRYPOINT ["./env.sh", "python", "-m"]
CMD ["farm_ng.ipc"]

# TODO: Shrink w/ multi-stage build
# TODO: Program_supervisor needs access to all binaries?
