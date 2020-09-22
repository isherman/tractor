import argparse
import asyncio
import logging
import sys

from farm_ng.ipc import AnnouceQueue
from farm_ng.ipc import EventBus
from farm_ng.ipc import EventBusQueue
from farm_ng.ipc import make_event
from farm_ng_proto.tractor.v1.calibrator_pb2 import CalibratorCommand
from farm_ng_proto.tractor.v1.io_pb2 import LoggingCommand
from farm_ng_proto.tractor.v1.io_pb2 import LoggingStatus
from farm_ng_proto.tractor.v1.tracking_camera_pb2 import TrackingCameraCommand
from google.protobuf.text_format import MessageToString

logging.basicConfig(stream=sys.stdout, level=logging.INFO)

parser = argparse.ArgumentParser()
parser.add_argument('command', choices=('start', 'stop', 'status'))
parser.add_argument('name')

args = parser.parse_args()

event_bus = EventBus('logging_client')

command = LoggingCommand()
camera_command = TrackingCameraCommand()
calibrator_command = CalibratorCommand()

if args.command == 'start':
    command.record_start.CopyFrom(LoggingCommand.RecordStart())
    command.record_start.name = args.name
    camera_command.record_start.mode = TrackingCameraCommand.RecordStart.MODE_APRILTAG_STABLE
    calibrator_command.apriltag_rig_start.tag_ids[:] = [221, 226, 225, 218, 222]
elif args.command == 'stop':
    command.record_stop = True
    camera_command.record_stop = True
    calibrator_command.stop = True


async def send_logging_command():
    has_logger = False
    has_tracking_camera = False
    has_calibrator = False
    with AnnouceQueue(event_bus) as announce_queue:
        while True:
            announce = await announce_queue.get()
            print(MessageToString(announce, as_one_line=True))
            if announce.service == 'ipc-logger':
                has_logger = True
            if announce.service == 'tracking-camera':
                has_tracking_camera = True
            if announce.service == 'calibrator':
                has_calibrator = True
            if has_logger and has_tracking_camera and has_calibrator:
                break

    with EventBusQueue(event_bus) as event_queue:
        if args.command == 'start':
            event_bus.send(make_event('logger/command', command))
            event_bus.send(make_event('tracking_camera/command', camera_command))
            event_bus.send(make_event('calibrator/command', calibrator_command))
        if args.command == 'stop':
            event_bus.send(make_event('calibrator/command', calibrator_command))
            event_bus.send(make_event('tracking_camera/command', camera_command))
            event_bus.send(make_event('logger/command', command))

        status = LoggingStatus()
        while True:
            event = await event_queue.get()
            if event.data.Unpack(status):
                print(MessageToString(status, as_one_line=True))
                break

asyncio.get_event_loop().run_until_complete(send_logging_command())
