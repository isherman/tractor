package server

import (
	"context"

	pb "github.com/farm-ng/tractor/genproto"
)

// Server ...
type Server struct{}

// InitiatePeerConnection ...
func (s *Server) InitiatePeerConnection(ctx context.Context, request *pb.InitiatePeerConnectionRequest) (res *pb.InitiatePeerConnectionResponse, err error) {
	return &pb.InitiatePeerConnectionResponse{}, nil
}
