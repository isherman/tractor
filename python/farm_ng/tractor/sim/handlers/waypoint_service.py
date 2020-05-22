from gensrv.farmng.tractor.v1.waypoint_service_twirp_srv import Errors
from gensrv.farmng.tractor.v1.waypoint_service_twirp_srv import TwirpServerException
from gensrv.farmng.tractor.v1.waypoint_service_twirp_srv import WaypointServiceImpl


class WaypointService(WaypointServiceImpl):
    def CreateWaypoint(self, create_waypoint_request):
        raise TwirpServerException(
            Errors.Unimplemented,
            'CreateWaypoint is unimplemented!!',
        )

    def ListWaypoints(self, list_waypoints_request):
        raise TwirpServerException(
            Errors.Unimplemented,
            'ListWaypoints is unimplemented',
        )

    def GetWaypoint(self, get_waypoint_request):
        raise TwirpServerException(
            Errors.Unimplemented,
            'GetWaypoint is unimplemented',
        )

    def DeleteWaypoint(self, delete_waypoint_request):
        raise TwirpServerException(
            Errors.Unimplemented,
            'DeleteWaypoint is unimplemented',
        )

    # def Repeat(self, request):
    #     return pb.EchoResponse(output=request.input)
