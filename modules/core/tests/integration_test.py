import collections
import os
import pathlib
import struct
import subprocess
import tempfile
import unittest

from farm_ng.core.io_pb2 import Event


class TestCase(unittest.TestCase):
    def test_ipclogger(self):
        with tempfile.TemporaryDirectory() as blobstore:
            process = subprocess.run(
                '/usr/local/bin/docker-compose up --build --abort-on-container-exit ipc_logger ipc_publisher',
                shell=True,
                cwd=pathlib.Path(__file__).parent.absolute(),
                env={'BLOBSTORE_ROOT': blobstore, 'UID': str(os.getuid()), 'GID': str(os.getgid())},
            )
            self.assertEqual(process.returncode, 0)
            logs_path = os.path.join(blobstore, 'logs', 'default')
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


if __name__ == '__main__':
    unittest.main()
