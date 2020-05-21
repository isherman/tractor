protos:
	scripts/build-protos.sh

swagger:
	docker run golang go get -v github.com/golang/example/hello/...

test:
	./env.sh pytest

.PHONY: protos test
