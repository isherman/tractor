import logging
import os
from concurrent import futures

import grpc

from farm_ng.calibration.robot_hal_pb2 import CapturePoseResponse
from farm_ng.calibration.robot_hal_pb2 import RobotExtrinsicCalibrationResultResponse
from farm_ng.calibration.robot_hal_pb2_grpc import RobotHALServiceServicer
from farm_ng.calibration.robot_hal_pb2_grpc import add_RobotHALServiceServicer_to_server
from farm_ng.core.resource_pb2 import Resource
from farm_ng.perception.camera_model_pb2 import CameraModel
from farm_ng.perception.geometry_pb2 import NamedSE3Pose
from farm_ng.perception.geometry_pb2 import Quaternion
from farm_ng.perception.geometry_pb2 import SE3Pose
from farm_ng.perception.geometry_pb2 import Vec3
from farm_ng.perception.image_pb2 import Image

logging.basicConfig(level=os.environ.get('LOGLEVEL', 'INFO'))


class RobotHALServer(RobotHALServiceServicer):
    def CapturePose(self, request_iterator, context):
        for request in request_iterator:
            logging.info('Request received: %s', request)
            yield CapturePoseResponse(
                status=CapturePoseResponse.Status.STATUS_SUCCESS,
                poses=[
                    NamedSE3Pose(
                        frame_a='parent',
                        frame_b='child',
                        a_pose_b=SE3Pose(
                            position=Vec3(x=0, y=0, z=1),
                            rotation=Quaternion(x=0, y=0, z=0, w=1),
                        ),
                    ),
                ],
                image_rgb=Image(
                    resource=Resource(data=b'<png-encoded image bytes>', content_type='image/png'),
                    camera_model=CameraModel(
                        image_width=1920,
                        image_height=1080,
                        cx=(1920 - 1) / 2.0,
                        cy=(540 - 1) / 2.0,
                        fx=1000,
                        fy=1000,
                        distortion_model=CameraModel.DistortionModel.DISTORTION_MODEL_INVERSE_BROWN_CONRADY,
                        distortion_coefficients=[0, 0, 0, 0, 0],
                        frame_name='hd',
                    ),
                ),
            )

    def RobotExtrinsicCalibrationResult(self, request_iterator, context):
        for request in request_iterator:
            yield RobotExtrinsicCalibrationResultResponse(
                status=RobotExtrinsicCalibrationResultResponse.Status.STATUS_ACCEPTED,
            )


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    add_RobotHALServiceServicer_to_server(RobotHALServer(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    server.wait_for_termination()


if __name__ == '__main__':
    logging.basicConfig()
    serve()
