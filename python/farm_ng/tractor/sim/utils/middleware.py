import json

import google.protobuf.json_format
import tornado.web
from tornado.httputil import HTTPServerRequest
from validate.validator import validate
from validate.validator import ValidationFailed


def parse_request(request: HTTPServerRequest):
    if request.headers['Content-Type'] == 'application/json':
        return (json.loads(request.body), None)
    if request.headers['Content-Type'] == 'application/x-protobuf':
        return (None, request.body)
    raise tornado.web.HTTPError(
        400, reason='Content-Type must be application/json or application/x-protobuf',
    )


def parse_request_to_validated_proto(request: HTTPServerRequest, proto_cls):
    (request_json, request_proto_str) = parse_request(request)
    request_proto = proto_cls()
    try:
        if request_json:
            google.protobuf.json_format.ParseDict(
                request_json, request_proto,
            )
        else:
            request_proto.ParseFromString(request_proto_str)
    except(google.protobuf.json_format.ParseError, google.protobuf.message.DecodeError):
        raise tornado.web.HTTPError(400)

    try:
        validate(request_proto)(request_proto)
    except ValidationFailed as e:
        raise tornado.web.HTTPError(422, reason=str(e))

    return request_proto


def serialize_response(response: google.protobuf.message.Message, request: HTTPServerRequest):
    if 'application/x-protobuf' in request.headers.get_list('Accept'):
        return response.SerializeToString()
    else:
        return google.protobuf.json_format.MessageToDict(response, including_default_value_fields=True)
