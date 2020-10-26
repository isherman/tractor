FROM golang:1.15-alpine AS build

# Install tools required for project
# Run `docker build --no-cache .` to update dependencies
RUN apk add --no-cache git protobuf protobuf-dev

# Copy source
COPY go /go
COPY protos /protos
COPY third_party/api-common-protos/google /protos/google

# Build protos
RUN go get -u github.com/golang/protobuf/protoc-gen-go
RUN go get -u github.com/twitchtv/twirp/protoc-gen-twirp
RUN protoc \
  --proto_path=/protos \
  --go_out=module=github.com/farm_ng/genproto:/go/genproto \
  --twirp_out=paths=source_relative:/go/genproto \
  /protos/farm_ng_proto/tractor/v1/*.proto

# Build static binary
WORKDIR /go/webrtc
RUN CGO_ENABLED=0 go build -o /bin/proxy-server cmd/proxy-server/main.go

# Copy binary into a single layer image
FROM scratch
COPY --from=build /bin/proxy-server /bin/proxy-server
ENTRYPOINT ["/bin/proxy-server"]
