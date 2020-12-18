import asyncio
import os

from google.protobuf.timestamp_pb2 import Timestamp

from farm_ng.core.blobstore import Blobstore
from farm_ng.core.io_pb2 import LoggingCommand
from farm_ng.core.ipc import get_event_bus
from farm_ng.core.ipc import make_event
from farm_ng.core.resource_pb2 import BUCKET_LOGS

event_bus = get_event_bus('ipc-publisher')
event_bus.add_subscriptions(['.*'])


async def run(n_messages):
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

    for n in range(n_messages):
        t = Timestamp()
        t.FromSeconds(n)
        event = make_event(f'ipc_publisher/status/{n}', t, stamp=t)
        event_bus.send(event)
        print(f'Sending {n}')
        await asyncio.sleep(1)


def main():
    event_bus.event_loop().run_until_complete(run(5))


if __name__ == '__main__':
    main()
