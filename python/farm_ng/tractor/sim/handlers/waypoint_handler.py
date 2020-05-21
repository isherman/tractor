import tornado.web
from farm_ng.tractor.sim.utils.database import database
from farm_ng.tractor.sim.utils.middleware import serialize_response


class WaypointHandler(tornado.web.RequestHandler):
    def get(self, waypoint_id):
        id = int(waypoint_id)
        waypoint = database.getWaypoint(id)
        if not waypoint:
            raise tornado.web.HTTPError(404)

        self.write(serialize_response(waypoint.toProto(), self.request))

    def delete(self, waypoint_id):
        id = int(waypoint_id)
        success = database.deleteWaypoint(id)
        if not success:
            raise tornado.web.HTTPError(404)
