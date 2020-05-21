protos:
	scripts/build-protos.sh

test:
	./env.sh pytest

.PHONY: protos test
