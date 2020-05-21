import tornado.web
from farm_ng.tractor.sim.models.waypoint import Waypoint
from farm_ng.tractor.sim.utils.database import database
from farm_ng.tractor.sim.utils.middleware import parse_request_to_validated_proto
from farm_ng.tractor.sim.utils.middleware import serialize_response
from farmng.tractor.v1 import waypoint_pb2


class WaypointsHandler(tornado.web.RequestHandler):
    def get(self):
        response = waypoint_pb2.ListWaypointsResponse(
            waypoints=[
                waypoint.toProto() for waypoint in database.getAllWaypoints()
            ],
        )
        self.write(serialize_response(response, self.request))

    def post(self):
        waypoint_proto = parse_request_to_validated_proto(
            self.request, waypoint_pb2.Waypoint,
        )
        waypoint = Waypoint.fromProto(waypoint_proto)
        result = database.saveWaypoint(waypoint)
        self.write(serialize_response(result.toProto(), self.request))
