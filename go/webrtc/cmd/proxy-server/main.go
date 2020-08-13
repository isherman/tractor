package main

import (
	"net/http"

	"github.com/farm-ng/tractor/genproto"
	"github.com/farm-ng/tractor/webrtc/internal/server"
)

func main() {
	server := &server.Server{}
	twirpHandler := genproto.NewWebRTCProxyServiceServer(server, nil)
	http.ListenAndServe(":9900", twirpHandler)
}
