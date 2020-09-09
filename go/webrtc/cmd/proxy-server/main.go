package main

import (
	"log"
	"net"
	"net/http"
	"os"
	"path"
	"time"

	"github.com/rs/cors"

	"github.com/farm-ng/tractor/genproto"
	pb "github.com/farm-ng/tractor/genproto"
	"github.com/farm-ng/tractor/webrtc/internal/api"
	"github.com/farm-ng/tractor/webrtc/internal/eventbus"
	"github.com/farm-ng/tractor/webrtc/internal/proxy"
	"github.com/farm-ng/tractor/webrtc/internal/spa"
	"github.com/gorilla/mux"
)

const (
	eventBusAddr      = "239.20.20.21"
	eventBusPort      = 10000
	rtpAddr           = "239.20.20.20:5000"
	defaultServerAddr = ":8080"
	// Set this too low and we see packet loss in chrome://webrtc-internals, and on the network interface (`netstat -suna`)
	// But what should it be? `sysctl net.core.rmem_max`?
	rtpReadBufferSize  = 1024 * 1024 * 8
	maxRtpDatagramSize = 4096
)

func main() {
	// Create eventbus client
	eventChan := make(chan *pb.Event)
	eventBus := eventbus.NewEventBus((net.UDPAddr{IP: net.ParseIP(eventBusAddr), Port: eventBusPort}), "webrtc-proxy", eventChan, true)
	go eventBus.Start()

	// Create RTP client
	// TODO : Encapsulate this better

	// Open a UDP Listener for RTP Packets
	resolvedRtpAddr, err := net.ResolveUDPAddr("udp", rtpAddr)
	if err != nil {
		panic(err)
	}
	listener, err := net.ListenMulticastUDP("udp", nil, resolvedRtpAddr)
	if err != nil {
		panic(err)
	}
	listener.SetReadBuffer(rtpReadBufferSize)
	log.Println("Waiting for RTP Packets at:", rtpAddr)

	// // Listen for a single RTP Packet, we need this to determine the SSRC
	// inboundRTPPacket := make([]byte, maxRtpDatagramSize)
	// n, _, err := listener.ReadFromUDP(inboundRTPPacket)
	// if err != nil {
	// 	panic(err)
	// }

	// // Unmarshal the incoming packet
	// packet := &rtp.Packet{}
	// if err = packet.Unmarshal(inboundRTPPacket[:n]); err != nil {
	// 	panic(err)
	// }
	// log.Println("RTP packet received. Starting server.")

	proxy := proxy.NewProxy(eventBus, eventChan, 0, listener)
	proxy.Start()
	server := api.NewServer(proxy)
	twirpHandler := genproto.NewWebRTCProxyServiceServer(server, nil)

	// Enable CORS
	corsWrapper := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"POST"},
		AllowedHeaders: []string{"Content-Type"},
	})

	// Serve the twirp services and frontend
	farmNgRoot := os.Getenv("FARM_NG_ROOT")
	if farmNgRoot == "" {
		log.Fatalln("FARM_NG_ROOT must be set.")
	}
	serverAddr := defaultServerAddr
	port := os.Getenv("PORT")
	if port != "" {
		serverAddr = ":" + port
	}

	router := mux.NewRouter()
	api := corsWrapper.Handler(twirpHandler)
	router.PathPrefix("/twirp/").Handler(api)
	spa := spa.Handler{StaticPath: path.Join(farmNgRoot, "build/frontend"), IndexPath: "index.html"}
	router.PathPrefix("/").Handler(spa)

	srv := &http.Server{
		Handler:      router,
		Addr:         serverAddr,
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	log.Println("Serving frontend and API at:", serverAddr)
	log.Fatal(srv.ListenAndServe())
}
