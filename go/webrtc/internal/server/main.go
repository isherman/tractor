package server

import (
	"context"

	pb "github.com/farm-ng/tractor/genproto"
)

// Server implements the Haberdasher service
type Server struct{}

// StartStream ...
func (s *Server) StartStream(ctx context.Context, request *pb.StartStreamRequest) (res *pb.StartStreamResponse, err error) {
	return &pb.StartStreamResponse{}, nil
}
