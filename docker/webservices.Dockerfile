# Build backend
FROM golang:1.15-alpine AS backend_build

# Install system dependencies
RUN apk add --no-cache git protobuf protobuf-dev

WORKDIR /farm_ng

# Copy source
COPY modules modules
COPY scripts scripts
COPY third_party/api-common-protos/google third_party/api-common-protos/google

# COPY protos /protos
# COPY third_party/api-common-protos/google /protos/google

# Build protos
RUN go get -u github.com/golang/protobuf/protoc-gen-go
RUN go get -u github.com/twitchtv/twirp/protoc-gen-twirp

RUN mkdir -p build/go/github.com/farm-ng/genproto
RUN protoc \
  --proto_path=modules/calibration/protos \
  --proto_path=modules/core/protos \
  --proto_path=modules/frontend_core/protos \
  --proto_path=modules/perception_core/protos \
  --proto_path=modules/tractor/protos \
  --proto_path=third_party/api-common-protos \
  --go_out=build/go/github.com/farm-ng/genproto \
  --go_opt=module=github.com/farm-ng/genproto \
  --twirp_out=build/go \
  modules/calibration/protos/farm_ng/v1/*.proto \
  modules/core/protos/farm_ng/v1/*.proto \
  modules/frontend_core/protos/farm_ng/v1/*.proto \
  modules/perception_core/protos/farm_ng/v1/*.proto \
  modules/tractor/protos/farm_ng/v1/*.proto

RUN cp scripts/go.mod.template build/go/github.com/farm-ng/genproto/go.mod

# Build the server as a static binary
WORKDIR /farm_ng/modules/frontend_core/go/webrtc
RUN CGO_ENABLED=0 go build -o /bin/proxy-server cmd/proxy-server/main.go

# Build frontend
FROM node:12-alpine AS frontend_build

WORKDIR /farm_ng

RUN apk add --no-cache git protobuf protobuf-dev
RUN npm install -g long ts-proto@^1.37.0

COPY modules modules
COPY scripts scripts
COPY third_party/api-common-protos/google third_party/api-common-protos/google

RUN mkdir -p build/ts/genproto
RUN protoc \
  --proto_path=modules/calibration/protos \
  --proto_path=modules/core/protos \
  --proto_path=modules/frontend_core/protos \
  --proto_path=modules/perception_core/protos \
  --proto_path=modules/tractor/protos \
  --proto_path=third_party/api-common-protos \
  --ts_proto_out=build/ts/genproto \
  --ts_proto_opt=forceLong=long \
  modules/calibration/protos/farm_ng/v1/*.proto \
  modules/core/protos/farm_ng/v1/*.proto \
  modules/frontend_core/protos/farm_ng/v1/*.proto \
  modules/perception_core/protos/farm_ng/v1/*.proto \
  modules/tractor/protos/farm_ng/v1/*.proto

RUN cp scripts/package.json.template build/ts/genproto/package.json
RUN cd build/ts/genproto && yarn
RUN	cd modules/frontend_core/frontend && yarn && yarn build

# Copy binary into a single layer image
FROM scratch
COPY --from=backend_build /bin/proxy-server /bin/proxy-server
COPY --from=frontend_build /farm_ng/modules/frontend_core/frontend/dist /farm_ng/build/frontend
ENTRYPOINT ["/bin/proxy-server"]
