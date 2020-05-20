protos:
	protoc --proto_path=app/schema --proto_path=app/third_party/api-common-protos --proto_path=app/third_party/protoc-gen-validate --js_out=app/frontend/genproto app/schema/farmng/tractor/v1/*
