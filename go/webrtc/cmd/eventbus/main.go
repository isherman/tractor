package main

import (
	"log"

	pb "github.com/farm-ng/tractor/genproto"
	"github.com/farm-ng/tractor/webrtc/internal/eventbus"
)

const (
	srvAddr = "239.20.20.21:10000"
)

func main() {
	c := make(chan *pb.Event)
	b := eventbus.NewEventBus(srvAddr, c)
	go func() {
		for {
			select {
			case e := <-c:
				handleEvent(e)
			}
		}

	}()
	b.Start()
}

func handleEvent(e *pb.Event) {
	log.Println(e)
}
