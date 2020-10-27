# Build on top of cpp image because programd depends on cpp binaries
FROM farm_ng_cpp

WORKDIR /farm_ng

# Install system dependencies
RUN apt-get update --fix-missing && \
  apt-get install -y --no-install-recommends \
  libdbus-glib-1-dev \
  python3-dev \
  python3-pip \
  && apt-get clean

# Install python deps in a virtualenv
COPY setup.bash env.sh requirements.txt ./
RUN pip3 install virtualenv
RUN virtualenv ./env
RUN . ./env/bin/activate
RUN pip install -r ./requirements.txt

# Build protos
COPY python python
COPY protos /protos
RUN protoc \
  --proto_path=/protos \
  --python_out=python/genproto \
  /protos/farm_ng_proto/tractor/v1/*.proto

ENTRYPOINT ["./env.sh", "python", "-m"]
CMD ["farm_ng.ipc"]

# TODO(isherman): Reduce size of final image with multi-stage build
# https://pythonspeed.com/articles/smaller-python-docker-images/
