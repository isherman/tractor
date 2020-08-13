package main

import (
	"net/http"

	"github.com/rs/cors"

	"github.com/farm-ng/tractor/genproto"
	"github.com/farm-ng/tractor/webrtc/internal/server"
)

func main() {
	server := &server.Server{}
	twirpHandler := genproto.NewWebRTCProxyServiceServer(server, nil)

	// Enable CORS
	corsWrapper := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"POST"},
		AllowedHeaders: []string{"Content-Type"},
	})

	http.ListenAndServe(":9900", corsWrapper.Handler(twirpHandler))
}
