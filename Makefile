ifdef TEST_FILTER
	PY_TEST_FILTER=-m $(TEST_FILTER)
	JS_TEST_FILTER=:$(TEST_FILTER)
endif

frontend: protos
	cd app/frontend && yarn && yarn build
	cp -rT app/frontend/dist build/frontend
	cd go/webrtc && go build -o $(FARM_NG_ROOT)/build/go/farm-ng-webservices cmd/proxy-server/main.go

protos:
	scripts/build-protos.sh

test:
	./env.sh pytest $(PY_TEST_FILTER)
	cd app/frontend && yarn test$(JS_TEST_FILTER)

test-integration:
	scripts/test-integration.sh

.PHONY: frontend protos test test-integration
