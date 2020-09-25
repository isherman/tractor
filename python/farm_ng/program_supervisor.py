import asyncio
import copy
import logging
import re
from collections import namedtuple

from farm_ng_proto.tractor.v1.program_supervisor_pb2 import (
    Program, ProgramExecution, ProgramSupervisorStatus, StartProgramRequest,
    StopProgramRequest)
from google.protobuf.text_format import MessageToString

from farm_ng.ipc import EventBus, EventBusQueue, make_event

event_bus = EventBus('program_supervisor')

logger = logging.getLogger('program_supervisor')
logger.setLevel(logging.INFO)


async def get_message(event_queue, name_pattern, message_type):
    regex = re.compile(name_pattern)
    message = message_type()
    while True:
        event = await event_queue.get()
        if regex.match(event.name) is None:
            continue
        if event.data.Unpack(message):
            print(MessageToString(message, as_one_line=True))
            return message


ProgramInfo = namedtuple("ProgramInfo", "path args name description")

library = {
    1000: ProgramInfo(path="python", args=["-m", "farm_ng.calibrator_program"], name="Apriltag Rig Calibration", description="Lorem ipsum"),
    1100: ProgramInfo(path="sleep", args=["5"], name="Sleep 5", description="Take a nap"),
    1110: ProgramInfo(path="sleep", args=["100"], name="Sleep 100", description="Take a looong nap")
}
libraryPb = [Program(id=_id, name=p.name, description=p.description) for _id, p in library.items()]


class ProgramSupervisor:
    def __init__(self):
        self.status = ProgramSupervisorStatus(stopped=ProgramSupervisorStatus.ProgramStopped(), library=libraryPb)
        self.shutdown = False
        self.child_process = None

    async def run(self):
        with EventBusQueue(event_bus) as event_queue:
            await asyncio.gather(self.send_status(), self.handle_start(event_queue), self.handle_stop(event_queue))

    async def send_status(self):
        while not self.shutdown:
            event = make_event('program_supervisor/status', self.status)
            print(MessageToString(event, as_one_line=True))
            event_bus.send(event)
            await asyncio.sleep(1)

    async def handle_stop(self, event_queue):
        while not self.shutdown:
            stop_request: StopProgramRequest = await get_message(event_queue,
                                                                 "program_supervisor/StopProgramRequest",
                                                                 StopProgramRequest)
            if self.status.WhichOneof("status") != "running":
                logger.info(f"StopProgramRequest received while program status was {self.status.WhichOneof('status')}")
                continue

            if stop_request.id != self.status.running.program.id:
                logger.info(f"StopProgramRequest received for program {stop_request.id} while program {self.status.running.program.id} was running")
                continue

            self.child_process.terminate()

    async def handle_start(self, event_queue):
        while not self.shutdown:
            start_request: StartProgramRequest = await get_message(event_queue, "program_supervisor/StartProgramRequest", StartProgramRequest)
            if self.status.WhichOneof("status") != "stopped":
                logger.info(f"StartProgramRequest received while program status was {self.status.WhichOneof('status')}")
                continue
            program_info = library.get(start_request.id)
            if not program_info:
                logger.info(f"StartProgramRequest received for program {start_request.id} which does not exist.")
                continue
            self.status.running.program.id = start_request.id
            asyncio.get_event_loop().create_task(self.launch_child_process(program_info))

    async def launch_child_process(self, program_info):
        self.child_process = await asyncio.create_subprocess_exec(program_info.path, *program_info.args)
        self.status.running.program.pid = self.child_process.pid
        self.status.running.program.stamp_start.GetCurrentTime()
        await self.monitor_child_process()

    async def monitor_child_process(self):
        await self.child_process.wait()
        self.status.stopped.last_program.CopyFrom(self.status.running.program)
        self.status.stopped.last_program.stamp_end.GetCurrentTime()
        self.status.stopped.last_program.exit_code = self.child_process.returncode

        self.child_process = None


if __name__ == "__main__":
    supervisor = ProgramSupervisor()
    asyncio.get_event_loop().run_until_complete(supervisor.run())
