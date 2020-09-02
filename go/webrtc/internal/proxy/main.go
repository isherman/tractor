package proxy

import (
	"fmt"
	"log"
	"net"
	"sync"
	"time"

	pb "github.com/farm-ng/tractor/genproto"
	"github.com/farm-ng/tractor/webrtc/internal/eventbus"
	"github.com/pion/rtp"
	"github.com/pion/webrtc/v3"
	"google.golang.org/protobuf/proto"
)

func uniqueId() int64 {
	return time.Now().UnixNano() / 1e6
}

type eventCallback func([]byte)
type rtpCallback func(*rtp.Packet)

// Proxy is a webRTC proxy that proxies EventBus events to/from a webRTC data channel and
// RTP packets to a webRTC video channel.
type Proxy struct {
	eventBus            *eventbus.EventBus
	eventSource         chan *pb.Event
	eventCallbacks      map[string]eventCallback
	eventCallbacksMutex *sync.Mutex
	ssrc                uint32
	rtpListener         *net.UDPConn
	rtpCallbacks        map[string]rtpCallback
	rtpCallbacksMutex   *sync.Mutex
}

func NewProxy(eventBus *eventbus.EventBus, eventSource chan *pb.Event, ssrc uint32, rtpListener *net.UDPConn) *Proxy {
	return &Proxy{
		eventBus:            eventBus,
		eventSource:         eventSource,
		eventCallbacks:      make(map[string]eventCallback),
		eventCallbacksMutex: &sync.Mutex{},
		ssrc:                ssrc,
		rtpListener:         rtpListener,
		rtpCallbacks:        make(map[string]rtpCallback),
		rtpCallbacksMutex:   &sync.Mutex{},
	}
}

// Start begins reading continously from the EventBus and RTP stream
// TODO: Support reconnection with EventBus and RTP
func (p *Proxy) Start() {
	// Continuously read from the event bus and publish to all registered event callbacks
	go func() {
		for {
			select {
			case e := <-p.eventSource:
				eventBytes, err := proto.Marshal(e)
				if err != nil {
					log.Fatalln("Could not marshal event: ", e)
				}
				p.eventCallbacksMutex.Lock()
				for _, cb := range p.eventCallbacks {
					cb(eventBytes)
				}
				p.eventCallbacksMutex.Unlock()
			}
		}
	}()

	// Continuously read from the RTP stream and publish to all registered RTP callbacks
	inboundRTPPacket := make([]byte, 4096)
	go func() {
		for {
			n, _, err := p.rtpListener.ReadFrom(inboundRTPPacket)
			if err != nil {
				log.Printf("error during read: %s", err)
				panic(err)
			}

			packet := &rtp.Packet{}
			if err := packet.Unmarshal(inboundRTPPacket[:n]); err != nil {
				panic(err)
			}

			p.rtpCallbacksMutex.Lock()
			for _, cb := range p.rtpCallbacks {
				cb(packet)
			}
			p.rtpCallbacksMutex.Unlock()
		}
	}()
}

// AddPeer accepts an offer SDP from a peer, registers callbacks for RTP and EventBus events, and returns an
// answer SDP.
// TODO: Handle peers that go away
// TODO: Return errors rather than panic
// TODO: Clean up logging
// TODO: Support graceful shutdown
func (p *Proxy) AddPeer(offer webrtc.SessionDescription) webrtc.SessionDescription {
	log.Println("Adding peer.")

	// We make our own mediaEngine so we can place the offerer's codecs in it.  This because we must use the
	// dynamic media type from the offerer in our answer. This is not required if we are the offerer
	mediaEngine := webrtc.MediaEngine{}
	err := mediaEngine.PopulateFromSDP(offer)
	if err != nil {
		panic(err)
	}

	// Search for VP8 Payload type. If the offer doesn't support VP8, exit,
	// since they won't be able to decode anything we send them
	var payloadType uint8
	for _, videoCodec := range mediaEngine.GetCodecsByKind(webrtc.RTPCodecTypeVideo) {
		if videoCodec.Name == "VP8" {
			payloadType = videoCodec.PayloadType
			break
		}
	}
	if payloadType == 0 {
		panic("Remote peer does not support VP8")
	}

	// Create a SettingEngine and enable Detach.
	// Detach allows us to use a more idiomatic API to read from and write to the data channel.
	// It must be explicitly enabled as a setting since it diverges from the WebRTC API
	// https://github.com/pion/webrtc/blob/master/examples/data-channels-detach/main.go
	settingEngine := webrtc.SettingEngine{}
	settingEngine.DetachDataChannels()

	// Without a persistent signaling channel, the connection will disconnect after 5s and fail after 30s.
	// TODO: Remove when persistent signaling is enabled
	// See https://godoc.org/github.com/pions/webrtc#SettingEngine.SetICETimeouts
	settingEngine.SetICETimeouts(60*time.Minute, 60*time.Second, 2*time.Second)

	// Create a new RTCPeerConnection
	api := webrtc.NewAPI(webrtc.WithSettingEngine(settingEngine), webrtc.WithMediaEngine(mediaEngine))
	peerConnection, err := api.NewPeerConnection(webrtc.Configuration{
		ICEServers: []webrtc.ICEServer{
			{
				URLs: []string{"stun:stun.l.google.com:19302"},
			},
		},
	})
	if err != nil {
		panic(err)
	}

	// Create a video track, using the payloadType of the offer and the SSRC of the RTP stream
	videoTrack, err := peerConnection.NewTrack(payloadType, p.ssrc, "video", "pion")
	if err != nil {
		panic(err)
	}
	if _, err = peerConnection.AddTrack(videoTrack); err != nil {
		panic(err)
	}

	// Register a new consumer with the RTP stream and service the received packets
	rtpCallback := func(packet *rtp.Packet) {
		packet.Header.PayloadType = payloadType
		err := videoTrack.WriteRTP(packet)
		if err != nil {
			panic(err)
		}
	}
	p.rtpCallbacksMutex.Lock()
	p.rtpCallbacks[fmt.Sprint(uniqueId())] = rtpCallback
	p.rtpCallbacksMutex.Unlock()

	// Register data channel creation handling
	peerConnection.OnDataChannel(func(d *webrtc.DataChannel) {
		log.Printf("New DataChannel %s %d\n", d.Label(), d.ID())

		// Register channel opening handling
		d.OnOpen(func() {
			log.Printf("Data channel '%s'-'%d' open.\n", d.Label(), d.ID())

			// Detach the data channel
			raw, dErr := d.Detach()
			if dErr != nil {
				panic(dErr)
			}

			// Handle reading from the data channel and writing to the eventbus
			const messageSize = 1024
			go func() {
				for {
					buffer := make([]byte, messageSize)
					n, err := raw.Read(buffer)
					if err != nil {
						log.Println("Datachannel closed; Exiting writeToEventBus:", err)
						return
					}

					event := &pb.Event{}
					err = proto.Unmarshal(buffer[:n], event)
					if err != nil {
						log.Println("Received invalid event on the data channel:", err)
						continue
					}

					p.eventBus.SendEvent(event)
				}
			}()

			// Handle reading from the eventbus and writing to the data channel
			eventCallback := func(eventBytes []byte) {
				_, err = raw.Write(eventBytes)
				if err != nil {
					log.Fatalln("Could not write event to datachannel: ", err)
				}
			}
			p.eventCallbacksMutex.Lock()
			p.eventCallbacks[fmt.Sprint(uniqueId())] = eventCallback
			p.eventCallbacksMutex.Unlock()
		})
	})

	// Set the handler for ICE connection state
	// This will notify you when the peer has connected/disconnected
	peerConnection.OnICEConnectionStateChange(func(connectionState webrtc.ICEConnectionState) {
		log.Printf("Connection State has changed %s \n", connectionState.String())
	})

	// Set the remote SessionDescription
	if err = peerConnection.SetRemoteDescription(offer); err != nil {
		panic(err)
	}

	// Create answer
	answer, err := peerConnection.CreateAnswer(nil)
	if err != nil {
		panic(err)
	}

	// Create channel that is blocked until ICE Gathering is complete
	gatherComplete := webrtc.GatheringCompletePromise(peerConnection)

	// Set the LocalDescription
	if err = peerConnection.SetLocalDescription(answer); err != nil {
		panic(err)
	}

	// Block until ICE Gathering is complete, disabling trickle ICE
	// we do this because we only can exchange one signaling message
	// in a production application you should exchange ICE Candidates via OnICECandidate
	<-gatherComplete

	return *peerConnection.LocalDescription()
}
