package proxy

import (
	"fmt"
	"io"
	"math/rand"
	"net"
	"time"

	"github.com/pion/rtp"
	"github.com/pion/webrtc/v3"
)

// Proxy ...
type Proxy struct{}

// Start ...
// TODO: Return errors rather than panic, support graceful shutdown
func (p *Proxy) Start(offer webrtc.SessionDescription) webrtc.SessionDescription {
	// We make our own mediaEngine so we can place the sender's codecs in it.  This because we must use the
	// dynamic media type from the sender in our answer. This is not required if we are the offerer
	mediaEngine := webrtc.MediaEngine{}
	err := mediaEngine.PopulateFromSDP(offer)
	if err != nil {
		panic(err)
	}

	// Search for VP8 Payload type. If the offer doesn't support VP8 exit since
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
	// This isn't strictly necessary, but doing so allows us to use a more idiomatic API to
	// read from and write to the data channel. It must be explicitly enabled as a setting since it
	// diverges from the WebRTC API.
	// https://github.com/pion/webrtc/blob/master/examples/data-channels-detach/main.go
	settingEngine := webrtc.SettingEngine{}
	settingEngine.DetachDataChannels()

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

	// Open a UDP Listener for RTP Packets on port 5004
	listener, err := net.ListenUDP("udp", &net.UDPAddr{IP: net.ParseIP("127.0.0.1"), Port: 5004})
	if err != nil {
		panic(err)
	}

	// TODO: Close the listener gracefully
	// defer func() {
	// 	if err = listener.Close(); err != nil {
	// 		panic(err)
	// 	}
	// }()

	fmt.Println("Waiting for RTP Packets, please run GStreamer or ffmpeg now")

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

	// Create a video track, using the same SSRC as the incoming RTP Packet
	videoTrack, err := peerConnection.NewTrack(payloadType, packet.SSRC, "video", "pion")
	if err != nil {
		panic(err)
	}
	if _, err = peerConnection.AddTrack(videoTrack); err != nil {
		panic(err)
	}

	// Register data channel creation handling
	peerConnection.OnDataChannel(func(d *webrtc.DataChannel) {
		fmt.Printf("New DataChannel %s %d\n", d.Label(), d.ID())

		// Register channel opening handling
		d.OnOpen(func() {
			fmt.Printf("Data channel '%s'-'%d' open.\n", d.Label(), d.ID())

			// Detach the data channel
			raw, dErr := d.Detach()
			if dErr != nil {
				panic(dErr)
			}

			// Handle reading from the data channel
			go readLoop(raw)

			// Handle writing to the data channel
			go writeLoop(raw)
		})
	})

	// Set the handler for ICE connection state
	// This will notify you when the peer has connected/disconnected
	peerConnection.OnICEConnectionStateChange(func(connectionState webrtc.ICEConnectionState) {
		fmt.Printf("Connection State has changed %s \n", connectionState.String())
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

	// Sets the LocalDescription, and starts our UDP listeners
	if err = peerConnection.SetLocalDescription(answer); err != nil {
		panic(err)
	}

	// Block until ICE Gathering is complete, disabling trickle ICE
	// we do this because we only can exchange one signaling message
	// in a production application you should exchange ICE Candidates via OnICECandidate
	<-gatherComplete

	// Read RTP packets forever and send them to the WebRTC Client
	go func() {
		for {
			n, _, err := listener.ReadFrom(inboundRTPPacket)
			if err != nil {
				fmt.Printf("error during read: %s", err)
				panic(err)
			}

			packet := &rtp.Packet{}
			if err := packet.Unmarshal(inboundRTPPacket[:n]); err != nil {
				panic(err)
			}
			packet.Header.PayloadType = payloadType

			if writeErr := videoTrack.WriteRTP(packet); writeErr != nil {
				panic(writeErr)
			}
		}
	}()

	return *peerConnection.LocalDescription()
}

// RandSeq generates a random string to serve as dummy data
//
// It returns a deterministic sequence of values each time a program is run.
// Use rand.Seed() function in your real applications.
func randSeq(n int) string {
	letters := []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")
	b := make([]rune, n)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}

const messageSize = 1024

// ReadLoop shows how to read from the datachannel directly
func readLoop(d io.Reader) {
	for {
		buffer := make([]byte, messageSize)
		n, err := d.Read(buffer)
		if err != nil {
			fmt.Println("Datachannel closed; Exit the readloop:", err)
			return
		}

		fmt.Printf("Message from DataChannel: %s\n", string(buffer[:n]))
	}
}

// WriteLoop shows how to write to the datachannel directly
func writeLoop(d io.Writer) {
	for range time.NewTicker(5 * time.Second).C {
		message := randSeq(messageSize)
		fmt.Printf("Sending %s \n", message)

		_, err := d.Write([]byte(message))
		if err != nil {
			panic(err)
		}
	}
}
