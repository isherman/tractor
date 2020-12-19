import asyncio
import collections
import os
import struct
import unittest

from google.protobuf.timestamp_pb2 import Timestamp

from farm_ng.core.blobstore import Blobstore
from farm_ng.core.io_pb2 import Event
from farm_ng.core.io_pb2 import LoggingCommand
from farm_ng.core.ipc import get_event_bus
from farm_ng.core.ipc import make_event
from farm_ng.core.resource_pb2 import BUCKET_LOGS

event_bus = get_event_bus('ipc-publisher')
event_bus.add_subscriptions(['.*'])


async def run():
    await asyncio.sleep(3)
    blobstore = Blobstore()
    event = make_event(
        'logger/command', LoggingCommand(
            record_start=LoggingCommand.RecordStart(
                archive_path=os.path.join(blobstore.bucket_relative_path(BUCKET_LOGS), 'default'),
            ),
        ),
    )
    event_bus.send(event)

    for n in range(5):
        t = Timestamp()
        t.FromSeconds(n)
        event = make_event(f'ipc_publisher/status/{n}', t, stamp=t)
        event_bus.send(event)
        print(f'Sending {n}')
        await asyncio.sleep(1)


class Test(unittest.TestCase):
    def test(self):
        logs_path = os.path.join('/blobstore', 'logs', 'default')
        print('LOGS_PATH: ', logs_path)
        self.assertTrue(os.path.isdir(logs_path))
        logs = os.listdir(logs_path)
        self.assertEqual(len(logs), 1)
        log_path = os.path.join(logs_path, logs[0])

        counter = collections.Counter()
        with open(log_path, 'rb') as f:
            while True:
                header = f.read(2)
                if header == b'':
                    break
                size, = struct.unpack('<H', header)
                message = f.read(size)
                event = Event()
                event.ParseFromString(message)
                counter[event.name] += 1
        for i in range(5):
            self.assertEqual(counter[f'ipc_publisher/status/{i}'], 1)


def main():
    event_bus.event_loop().run_until_complete(run())
    unittest.main()


if __name__ == '__main__':
    main()
