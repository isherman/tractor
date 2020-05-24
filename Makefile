protos:
	scripts/build-protos.sh

test:
	./env.sh pytest
	cd app/frontend && yarn test

.PHONY: protos test
