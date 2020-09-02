package main

import (
	"log"
	"net"
	"net/http"

	"github.com/pion/rtp"
	"github.com/rs/cors"

	"github.com/farm-ng/tractor/genproto"
	pb "github.com/farm-ng/tractor/genproto"
	"github.com/farm-ng/tractor/webrtc/internal/eventbus"
	"github.com/farm-ng/tractor/webrtc/internal/proxy"
	"github.com/farm-ng/tractor/webrtc/internal/server"
)

const (
	eventBusAddr = "239.20.20.21:10000"
	rtpHost      = "127.0.0.1"
	rtpPort      = 5004
	serverAddr   = ":9900"
)

func main() {

	// Create eventbus client
	eventChan := make(chan *pb.Event)
	eventBus := eventbus.NewEventBus(eventBusAddr, eventChan)
	go eventBus.Start()

	// Create RTP client
	// TODO : Encapsulate this better

	// Open a UDP Listener for RTP Packets
	listener, err := net.ListenUDP("udp", &net.UDPAddr{IP: net.ParseIP(rtpHost), Port: rtpPort})
	if err != nil {
		panic(err)
	}
	log.Printf("Waiting for RTP Packets at %s:%d\n", rtpHost, rtpPort)

	// Listen for a single RTP Packet, we need this to determine the SSRC
	inboundRTPPacket := make([]byte, 4096) // UDP MTU
	n, _, err := listener.ReadFromUDP(inboundRTPPacket)
	if err != nil {
		panic(err)
	}

	// Unmarshal the incoming packet
	packet := &rtp.Packet{}
	if err = packet.Unmarshal(inboundRTPPacket[:n]); err != nil {
		panic(err)
	}
	log.Println("RTP packet received. Starting server.")

	proxy := proxy.NewProxy(eventBus, eventChan, packet.SSRC, listener)
	proxy.Start()
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
