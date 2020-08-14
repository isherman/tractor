module github.com/farm-ng/tractor/webrtc

go 1.14

require (
	github.com/farm-ng/tractor/genproto v0.0.0-00010101000000-000000000000
	github.com/pion/rtp v1.6.0
	github.com/pion/webrtc/v3 v3.0.0-beta.1
	github.com/rs/cors v1.7.0
	github.com/twitchtv/twirp v5.12.1+incompatible
	golang.org/x/text v0.3.0 // indirect
	rsc.io/quote v1.5.2
)

replace github.com/farm-ng/tractor/genproto => ../genproto
