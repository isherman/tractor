# TODO: Make pylint handle protobuf generated code properly, possibly with pylint-protobuf
# pylint: disable=no-member
import asyncio
import json
import logging
import os
from dataclasses import dataclass
from typing import Dict
from typing import Optional
from typing import Set

import google.protobuf.json_format
import numpy as np
import tornado.gen
import tornado.ioloop
import tornado.platform.asyncio
import tornado.tcpclient
import tornado.web
import tornado.websocket
from farm_ng.tractor.controller import TractorMoveToGoalController
from farm_ng.tractor.kinematics import TractorKinematics
from farmng.tractor.v1 import waypoint_pb2
from google.protobuf import duration_pb2
from google.protobuf import wrappers_pb2
from liegroups import SE3
from tornado.httputil import HTTPServerRequest
from validate.validator import validate
from validate.validator import ValidationFailed

logger = logging.getLogger('fe')
logger.setLevel(logging.INFO)


def parse_request(request: HTTPServerRequest):
    if request.headers['Content-Type'] == 'application/json':
        return (json.loads(request.body), None)
    if request.headers['Content-Type'] == 'application/x-protobuf':
        return (None, request.body)
    raise tornado.web.HTTPError(
        400, reason='Content-Type must be application/json or application/x-protobuf',
    )


def parse_request_to_validated_proto(request: HTTPServerRequest, proto_cls):
    (request_json, request_proto_str) = parse_request(request)
    request_proto = proto_cls()
    try:
        if request_json:
            google.protobuf.json_format.ParseDict(
                request_json, request_proto,
            )
        else:
            request_proto.ParseFromString(request_proto_str)
    except(google.protobuf.json_format.ParseError, google.protobuf.message.DecodeError):
        raise tornado.web.HTTPError(400)

    try:
        validate(request_proto)(request_proto)
    except ValidationFailed as e:
        raise tornado.web.HTTPError(422, reason=str(e))

    return request_proto


def serialize_response(response: google.protobuf.message.Message, request: HTTPServerRequest):
    if 'application/x-protobuf' in request.headers.get_list('Accept'):
        return response.SerializeToString()
    else:
        return google.protobuf.json_format.MessageToDict(response, including_default_value_fields=True)


class Application(tornado.web.Application):
    def __init__(self):
        third_party_path = os.path.join(
            os.environ['FARM_NG_ROOT'],
            'jsm/third_party',
        )

        handlers = [
            # GET request, called from root directory localhost:8080/
            (r'/', MainHandler),
            (r'/waypoints/?', WaypointsHandler),
            (r'/waypoints/([0-9]+)/?', WaypointHandler),
            (r'/simsocket', SimSocketHandler),
            (
                r'/third_party/(.*)', tornado.web.StaticFileHandler,
                dict(path=third_party_path),
            ),
        ]

        settings = dict(
            cookie_secret='__TODO:_GENERATE_YOUR_OWN_RANDOM_VALUE_HERE__',
            template_path=os.path.join(os.path.dirname(__file__), 'templates'),
            static_path=os.path.join(os.path.dirname(__file__), 'static'),
            # xsrf_cookies=True,
            xsrf_cookies=False,
            debug=True,
        )
        super().__init__(handlers, **settings)


class Database:
    def __init__(self):
        self._waypoints: Dict[int, 'Waypoint'] = {}
        self._id = 0

    def _nextId(self):
        self._id += 1
        return self._id

    def saveWaypoint(self, waypoint):
        waypoint.id = self._nextId()
        self._waypoints[waypoint.id] = waypoint
        return waypoint

    def getWaypoint(self, waypoint_id):
        return self._waypoints.get(waypoint_id)

    def getAllWaypoints(self):
        return self._waypoints.values()

    def deleteWaypoint(self, waypoint_id):
        if waypoint_id not in self._waypoints:
            return False

        del self._waypoints[waypoint_id]
        return True


database = Database()


@dataclass
class Duration:
    seconds: int
    nanos: int

    @staticmethod
    def fromProto(proto: duration_pb2.Duration) -> 'Duration':
        return Duration(seconds=proto.seconds, nanos=proto.nanos)

    def toProto(self) -> duration_pb2.Duration:
        return duration_pb2.Duration(seconds=self.seconds, nanos=self.nanos)


@dataclass
class Waypoint:
    """
    Models like this should exist on-robot, separate from their serialized representation.
    Models provide helper functions to (de)serialize to/from the network, database, etc.
    """
    id: int
    lat: float
    lng: float
    angle: float
    delay: Optional[Duration]
    radius: Optional[float]

    @staticmethod
    def fromProto(proto: waypoint_pb2.Waypoint) -> 'Waypoint':
        return Waypoint(
            id=proto.id.value if proto.HasField('id') else None,
            lat=proto.lat,
            lng=proto.lng,
            angle=proto.angle,
            delay=Duration.fromProto(
                proto.delay,
            ) if proto.HasField('delay') else None,
            radius=proto.radius.value if proto.HasField('radius') else None,
        )

    def toProto(self) -> waypoint_pb2.Waypoint:
        return waypoint_pb2.Waypoint(
            id=wrappers_pb2.UInt64Value(
                value=self.id,
            ) if self.id else None,
            lat=self.lat,
            lng=self.lng,
            angle=self.angle,
            delay=self.delay.toProto() if self.delay else None,
            radius=wrappers_pb2.DoubleValue(
                value=self.radius,
            ) if self.radius else None,
        )


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('index.html')


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


class SimSocketHandler(tornado.websocket.WebSocketHandler):
    waiters: Set[tornado.websocket.WebSocketHandler] = set()

    def get_compression_options(self):
        # Non-None enables compression with default options.
        return {}

    def open(self):
        SimSocketHandler.waiters.add(self)

    def on_close(self):
        SimSocketHandler.waiters.remove(self)

    @classmethod
    def send_updates(cls, status_msg):
        logger.debug('sending message to %d waiters', len(cls.waiters))
        for waiter in cls.waiters:
            try:
                waiter.write_message(status_msg)
            except RuntimeError as e:
                logger.error('Error sending message, %s', e, exc_info=True)


class TractorSimulator:
    def __init__(self):
        self.model = TractorKinematics()
        self.controller = TractorMoveToGoalController(self.model)
        self.v_left = 0.0
        self.v_right = 0.0
        self.world_pose_tractor = SE3.identity()
        self.world_pose_tractor_goal = SE3.identity()

    async def loop(self):
        dt = 0.01
        t = 0.0
        count = 0
        while True:

            if np.linalg.norm(
                    self.world_pose_tractor.inv().dot(
                        self.world_pose_tractor_goal,
                    ).trans,
            ) < 0.05:
                new_goal = np.random.uniform(
                    [-10, -10], [10, 10],
                )
                self.world_pose_tractor_goal.trans[:2] = new_goal

            if count % 10 == 0:
                self.controller.set_goal(self.world_pose_tractor_goal)
                self.v_left, self.v_right = self.controller.update(
                    self.world_pose_tractor,
                )

            self.v_left += np.random.uniform(0.0, 0.5)
            self.v_right += np.random.uniform(0.0, 0.5)

            SimSocketHandler.send_updates(
                dict(
                    world_translation_tractor=self.world_pose_tractor.trans.tolist(),
                    world_quaternion_tractor=self.world_pose_tractor.rot.to_quaternion(
                        ordering='xyzw',
                    ).tolist(),
                    t=t,
                ),
            )
            t += dt
            self.world_pose_tractor = self.model.evolve_world_pose_tractor(
                self.world_pose_tractor, self.v_left, self.v_right, dt,
            )
            count += 1
            await asyncio.sleep(dt)


def main():
    tornado.platform.asyncio.AsyncIOMainLoop().install()
    ioloop = asyncio.get_event_loop()

    app = Application()
    app.listen(8989)
    sim = TractorSimulator()
    ioloop.create_task(sim.loop())
    ioloop.run_forever()


if __name__ == '__main__':
    main()
