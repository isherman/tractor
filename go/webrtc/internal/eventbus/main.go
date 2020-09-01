package eventbus

import (
	"fmt"
	"log"
	"net"
	"sync"
	"time"

	pb "github.com/farm-ng/tractor/genproto"
	"github.com/golang/protobuf/ptypes"
	"google.golang.org/protobuf/proto"
)

const (
	maxDatagramSize = 1024
)

type EventBus struct {
	announceAddress    string
	announcements      map[string]*pb.Announce
	announcementsMutex *sync.Mutex
	State              map[string]*pb.Event
	eventChan          chan<- *pb.Event
	multicastSender    *net.UDPConn
	multicastListener  *net.UDPConn
	listenConn         *net.UDPConn
}

// NewEventBus returns a new EventBus.
//
// A channel may be provided for event callbacks. This channel must be serviced, or the bus will hang.
func NewEventBus(announceAddress string, eventChan chan<- *pb.Event) *EventBus {
	return &EventBus{
		announceAddress:    announceAddress,
		announcements:      make(map[string]*pb.Announce),
		announcementsMutex: &sync.Mutex{},
		State:              make(map[string]*pb.Event),
		eventChan:          eventChan,
	}
}

func (bus *EventBus) Start() {
	addr, err := net.ResolveUDPAddr("udp", bus.announceAddress)
	if err != nil {
		log.Fatal(err)
	}
	bus.multicastSender, err = net.DialUDP("udp", nil, addr)
	if err != nil {
		log.Fatal(err)
	}
	bus.multicastSender.SetReadBuffer(maxDatagramSize)
	bus.multicastListener, err = net.ListenMulticastUDP("udp", nil, addr)
	if err != nil {
		log.Fatal(err)
	}
	bus.multicastListener.SetReadBuffer(maxDatagramSize)

	addr, err = net.ResolveUDPAddr("udp", "0.0.0.0:0")
	if err != nil {
		log.Fatal(err)
	}
	bus.listenConn, err = net.ListenUDP("udp", addr)
	if err != nil {
		log.Fatal(err)
	}
	bus.listenConn.SetReadBuffer(maxDatagramSize)

	log.Println("Starting eventbus...")
	go bus.announce()
	go bus.handleAnnouncements()
	go bus.handleEvents()
	select {}
}

func (bus *EventBus) SendEvent(e *pb.Event) {
	event_bytes, err := proto.Marshal(e)
	if err != nil {
		log.Fatalln("Could not marshal event: ", e)
	}

	bus.announcementsMutex.Lock()
	for _, a := range bus.announcements {
		bus.listenConn.WriteToUDP(event_bytes, &net.UDPAddr{
			IP:   []byte(a.Host),
			Port: int(a.Port),
		})
	}
	bus.announcementsMutex.Unlock()
}

func (bus *EventBus) announce() {
	announce := &pb.Announce{
		Host:    bus.listenConn.LocalAddr().(*net.UDPAddr).IP.String(),
		Port:    int32(bus.listenConn.LocalAddr().(*net.UDPAddr).Port),
		Service: "go-ipc",
		Stamp:   ptypes.TimestampNow(),
	}
	announceBytes, err := proto.Marshal(announce)
	if err != nil {
		log.Fatalln("Failed to encode announcement: ", err)
	}

	for {
		// log.Println("announcing: ", announce)
		bus.multicastSender.Write(announceBytes)

		bus.announcementsMutex.Lock()
		for key, a := range bus.announcements {
			receiveTime, err := ptypes.Timestamp(a.RecvStamp)
			if err != nil {
				log.Fatalln("Invalid receive timestamp: ", err)
			}
			if time.Now().Sub(receiveTime) > time.Second*10 {
				log.Println("deleting stale: ", key)
				delete(bus.announcements, key)
				continue
			}
			bus.listenConn.WriteToUDP(announceBytes, &net.UDPAddr{
				IP:   []byte(a.Host),
				Port: int(a.Port),
			})
			// log.Println("announcing to: ", a.Host, a.Port)
		}
		bus.announcementsMutex.Unlock()

		time.Sleep(1 * time.Second)
	}
}

func (bus *EventBus) handleAnnouncements() {
	for {
		buf := make([]byte, maxDatagramSize)
		n, src, err := bus.multicastListener.ReadFromUDP(buf)
		if err != nil {
			log.Fatalln("ReadFromUDP failed:", err)
		}
		announce := &pb.Announce{}
		now := ptypes.TimestampNow()
		err = proto.Unmarshal(buf[:n], announce)
		if err != nil {
			log.Fatalln("Failed to parse announcement:", err, announce)
		}
		announce.RecvStamp = now
		// log.Println("received announcement: ", announce)
		bus.announcementsMutex.Lock()
		bus.announcements[fmt.Sprintf("%s:%d", src.IP, src.Port)] = announce
		bus.announcementsMutex.Unlock()
	}
}

func (bus *EventBus) handleEvents() {
	for {
		buf := make([]byte, maxDatagramSize)
		n, _, err := bus.listenConn.ReadFromUDP(buf)
		if err != nil {
			log.Fatalln("ReadFromUDP failed:", err)
		}
		event := &pb.Event{}
		err = proto.Unmarshal(buf[:n], event)
		if err != nil {
			log.Fatalln("Failed to parse event:", err, event)
		}
		bus.State[event.Name] = event
		if bus.eventChan != nil {
			bus.eventChan <- event
		}
	}
}
