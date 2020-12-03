import logging

import grpc

from farm_ng.calibration.hal_pb2 import CapturePoseRequest
from farm_ng.calibration.hal_pb2 import CapturePoseResponse
from farm_ng.calibration.hal_pb2_grpc import RobotBaseToCameraHALServiceStub
from farm_ng.perception.geometry_pb2 import NamedSE3Pose
from farm_ng.perception.geometry_pb2 import SE3Pose
from farm_ng.perception.geometry_pb2 import Vec3


def pose_iterator():
    for x in range(3):
        yield CapturePoseRequest(
            base_pose_tool_flange=NamedSE3Pose(
                frame_a='base', frame_b='flange', a_pose_b=SE3Pose(position=Vec3(x=x)),
            ),
        )


def run():
    with grpc.insecure_channel('localhost:50051') as channel:
        stub = RobotBaseToCameraHALServiceStub(channel)
        for response in stub.CapturePose(pose_iterator()):
            print(CapturePoseResponse.Status.Name(response.status))


if __name__ == '__main__':
    logging.basicConfig()
    run()
