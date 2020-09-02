# To try it

```bash
# install go
# (tested with 1.14, where go modules are enabled by default)

# build protobufs and twirp server stubs for Go
make protos

# start the twirp server
cd go/webrtc
go run cmd/proxy-server/main.go

# Send some test video
gst-launch-1.0 videotestsrc ! 'video/x-raw, width=640, height=480' ! videoconvert ! video/x-raw,format=I420 ! vp8enc error-resilient=partitions keyframe-max-dist=10 auto-alt-ref=true cpu-used=5 deadline=1 ! rtpvp8pay ! udpsink host=127.0.0.1 port=5000
# OR
ffmpeg -re -f lavfi -i testsrc=size=640x480:rate=30 -vcodec libvpx -cpu-used 5 -deadline 1 -g 10 -error-resilient 1 -auto-alt-ref 1 -f rtp rtp://127.0.0.1:5000

# Run https://jsfiddle.net/y5aq6hnm/1/
# You should see video streaming to the browser and data streaming both directions
```
