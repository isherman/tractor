# TODO: Make pylint handle protobuf generated code properly, possibly with pylint-protobuf
# pylint: disable=no-member
import asyncio
import json
import logging
import os
from typing import Any
from typing import Dict
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
from genproto.farmng.tractor.v1 import waypoint_pb2
from liegroups import SE3
from validate.validator import validate
from validate.validator import ValidationFailed

logger = logging.getLogger('fe')
logger.setLevel(logging.INFO)


def parse_request(request):
    if request.headers['Content-Type'] == 'application/json':
        return (json.loads(request.body), None)
    if request.headers['Content-Type'] == 'application/x-protobuf':
        return (None, request.body)
    raise tornado.web.HTTPError(
        400, reason='Content-Type must be application/json or application/x-protobuf',
    )


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
    waypoints: Dict[int, Any] = {}
    id = 1

    @staticmethod
    def nextId():
        id = Database.id
        Database.id += 1
        return id


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('index.html')


class WaypointsHandler(tornado.web.RequestHandler):
    def get(self):
        waypoints = [
            google.protobuf.json_format.MessageToDict(
                waypoint,
            ) for waypoint in Database.waypoints.values()
        ]
        self.write({'waypoints': waypoints})

    def post(self):
        (waypoint_json, waypoint_proto) = parse_request(self.request)
        waypoint = waypoint_pb2.Waypoint()
        try:
            if waypoint_json:
                google.protobuf.json_format.ParseDict(waypoint_json, waypoint)
            else:
                waypoint.ParseFromString(waypoint_proto)
        except(google.protobuf.json_format.ParseError, google.protobuf.message.DecodeError):
            raise tornado.web.HTTPError(400)

        try:
            validate(waypoint)(waypoint)
        except ValidationFailed as e:
            raise tornado.web.HTTPError(422, reason=str(e))

        # DESERIALIZE TO IN-MEMORY REPRESENTATION

        waypoint.id.value = Database.nextId()
        Database.waypoints[waypoint.id.value] = waypoint

        self.write(google.protobuf.json_format.MessageToJson(waypoint))


class WaypointHandler(tornado.web.RequestHandler):
    def get(self, waypoint_id):
        id = int(waypoint_id)
        if id not in Database.waypoints:
            raise tornado.web.HTTPError(404)

        # SERIALIZE IN-MEMORY-REPRESENTATION

        waypoint = google.protobuf.json_format.MessageToJson(
            Database.waypoints[id],
        )
        self.write(waypoint)

    def delete(self, waypoint_id):
        id = int(waypoint_id)
        if id not in Database.waypoints:
            raise tornado.web.HTTPError(404)

        del Database.waypoints[id]


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
