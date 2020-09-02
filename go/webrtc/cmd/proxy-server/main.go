package main

import (
	"net/http"

	"github.com/rs/cors"

	"github.com/farm-ng/tractor/genproto"
	"github.com/farm-ng/tractor/webrtc/internal/proxy"
	"github.com/farm-ng/tractor/webrtc/internal/server"
)

const (
	eventBusAddr = "239.20.20.21:10000"
	rtpHost      = "127.0.0.1"
	rtpPort      = 5000
	serverAddr   = ":9900"
)

func main() {
	proxy := proxy.NewProxy(eventBusAddr, rtpHost, rtpPort)
	server := server.NewServer(proxy)
	twirpHandler := genproto.NewWebRTCProxyServiceServer(server, nil)

	// Enable CORS
	corsWrapper := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"POST"},
		AllowedHeaders: []string{"Content-Type"},
	})

	http.ListenAndServe(serverAddr, corsWrapper.Handler(twirpHandler))
}
