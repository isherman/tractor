FROM node:12-alpine AS build

WORKDIR /farm_ng

RUN apk add --no-cache git protobuf protobuf-dev
RUN npm install -g long ts-proto@^1.37.0
COPY app/frontend app/frontend
COPY protos /protos
RUN protoc \
  --proto_path=/protos \
  --ts_proto_out=app/frontend/genproto \
  --ts_proto_opt=forceLong=long \
  /protos/farm_ng_proto/tractor/v1/*.proto

RUN	cd app/frontend && yarn && yarn build

FROM node:10.12-alpine
COPY --from=build /farm_ng/app/frontend/dist ./dist
