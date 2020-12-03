import logging
from concurrent import futures

import grpc

from farm_ng.calibration.hal_pb2 import CalibrationResultResponse
from farm_ng.calibration.hal_pb2 import CapturePoseResponse
from farm_ng.calibration.hal_pb2_grpc import RobotBaseToCameraHALServiceServicer
from farm_ng.calibration.hal_pb2_grpc import add_RobotBaseToCameraHALServiceServicer_to_server


class BaseToCameraCalibrationServer(RobotBaseToCameraHALServiceServicer):

    def CapturePose(self, request_iterator, context):
        for request in request_iterator:
            yield CapturePoseResponse(status=CapturePoseResponse.Status.STATUS_SUCCESS)

    def CalibrationResult(self, request_iterator, context):
        for request in request_iterator:
            yield CalibrationResultResponse(status=CalibrationResultResponse.Status.STATUS_ACCEPTED)


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    add_RobotBaseToCameraHALServiceServicer_to_server(BaseToCameraCalibrationServer(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    server.wait_for_termination()


if __name__ == '__main__':
    logging.basicConfig()
    serve()
