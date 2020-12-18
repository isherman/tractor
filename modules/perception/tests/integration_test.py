# import subprocess
import unittest


class TestCase(unittest.TestCase):

    # def test_io(self):
    #     exitcode = subprocess.call("docker-compose up --build --abort-on-container-exit", shell=True)
    #     self.assertEqual(exitcode, 0)

    def test_resource(self):
        self.assertTrue(True)


if __name__ == '__main__':
    unittest.main()
