import logging
from concurrent import futures

import grpc

from farm_ng.calibration.robot_hal_pb2 import CapturePoseResponse
from farm_ng.calibration.robot_hal_pb2 import RobotExtrinsicCalibrationResultResponse
from farm_ng.calibration.robot_hal_pb2_grpc import RobotHALServiceServicer
from farm_ng.calibration.robot_hal_pb2_grpc import add_RobotHALServiceServicer_to_server


class RobotHALServer(RobotHALServiceServicer):

    def CapturePose(self, request_iterator, context):
        for request in request_iterator:
            yield CapturePoseResponse(status=CapturePoseResponse.Status.STATUS_SUCCESS)

    def RobotExtrinsicCalibrationResult(self, request_iterator, context):
        for request in request_iterator:
            yield RobotExtrinsicCalibrationResultResponse(status=RobotExtrinsicCalibrationResultResponse.Status.STATUS_ACCEPTED)


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    add_RobotHALServiceServicer_to_server(RobotHALServer(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    server.wait_for_termination()


if __name__ == '__main__':
    logging.basicConfig()
    serve()
