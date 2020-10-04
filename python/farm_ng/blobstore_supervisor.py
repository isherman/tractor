import asyncio
import logging
import os
import stat
import sys
import time

from farm_ng.ipc import get_event_bus
from farm_ng.ipc import make_event
from watchdog.events import LoggingEventHandler
from watchdog.events import PatternMatchingEventHandler
from watchdog.observers import Observer

logger = logging.getLogger('farm_ng.blobstore_supervisor')

logger.setLevel(logging.INFO)


class BlobstoreEventHandler(PatternMatchingEventHandler):
    def __init__(
        self, event_bus, patterns=None, ignore_patterns=None,
        ignore_directories=False, case_sensitive=False,
    ):
        super().__init__(
            patterns, ignore_patterns,
            ignore_directories, case_sensitive,
        )
        self.event_bus = event_bus

    def on_created(self, event):
        super().on_created(event)
        LoggingEventHandler.on_created(event)

        if (event.is_directory):
            return

        file_path = event.src_path
        file_stat = os.stat(file_path)
        logging.info('Setting immutable: %s', file_path)
        os.chflags(file_path, file_stat.st_flags | stat.UF_IMMUTABLE)

    def on_moved(self, event):
        super().on_moved(event)
        LoggingEventHandler.on_moved(event)

    def on_deleted(self, event):
        super().on_deleted(event)
        LoggingEventHandler.on_deleted(event)

    def on_modified(self, event):
        super().on_modified(event)
        LoggingEventHandler.on_modified(event)

        configuration_changed = True  # TODO

        if configuration_changed:
            with open(event.src_pth) as f:
                new_config = f.read()  # TODO: Parse
                self.event_bus.send(make_event('configuration/new', new_config))


class BlobstoreSupervisor():
    """Performs blobstore administrative functions, including:
    - Ensuring new files are marked immutable on the filesystem
    - Publishing new configurations on the eventbus
    """

    def __init__(self, blobstore_root):
        self.event_bus = get_event_bus('farm_ng.blobstore_supervisor')

        event_handler = BlobstoreEventHandler(self.event_bus, ignore_patterns=['*.swp'])
        observer = Observer()
        observer.schedule(event_handler, blobstore_root, recursive=True)
        observer.start()
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            observer.stop()
        observer.join()


def main():
    logging.basicConfig(stream=sys.stdout, level=logging.INFO)

    blobstore_root = os.getenv('BLOBSTORE_ROOT', None)
    if not blobstore_root:
        logging.error('BLOBSTORE_ROOT is not defined')
        sys.exit(1)
    logging.info(f'Supervising {blobstore_root}')
    event_loop = asyncio.get_event_loop()
    supervisor = BlobstoreSupervisor(blobstore_root, event_loop)
    logger.info('Created blobstore supervisor %s', supervisor)
    event_loop.run_forever()


if __name__ == '__main__':
    main()
