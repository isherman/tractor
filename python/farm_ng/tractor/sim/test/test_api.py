import requests
from farmng.tractor.v1 import waypoint_pb2

PORT = 5555
BASE_URL = 'http://localhost:' + str(PORT)


def test_get_waypoints():
    response = requests.get(BASE_URL + '/waypoints')
    assert response.status_code == 200
    response_body = response.json()
    assert type(response_body is list)


def test_get_waypoints_pb():
    waypoint = {
        'lat': 42,
        'lng': -1,
        'angle': 0,
    }
    response = requests.post(BASE_URL + '/waypoints', json=waypoint)

    response = requests.get(
        BASE_URL + '/waypoints',
        headers={'Accept': 'application/x-protobuf'},
    )
    assert response.status_code == 200
    response_proto = waypoint_pb2.ListWaypointsResponse()
    response_proto.ParseFromString(response.content)
    assert len(response_proto.waypoints) > 0


def test_get_waypoint():
    waypoint = {
        'lat': 42,
        'lng': -1,
        'angle': 0,
    }
    response = requests.post(BASE_URL + '/waypoints', json=waypoint)
    id = response.json()['id']

    response = requests.get(BASE_URL + f'/waypoints/{id}')
    assert response.status_code == 200
    response_body = response.json()
    assert response_body['lat'] == waypoint['lat']


def test_get_waypoint_pb():
    waypoint = {
        'lat': 42,
        'lng': -1,
        'angle': 0,
    }
    response = requests.post(BASE_URL + '/waypoints', json=waypoint)
    id = response.json()['id']

    response = requests.get(
        BASE_URL + f'/waypoints/{id}', headers={'Accept': 'application/x-protobuf'},
    )
    assert response.status_code == 200
    waypoint_proto = waypoint_pb2.Waypoint()
    waypoint_proto.ParseFromString(response.content)
    assert waypoint_proto.lat == waypoint['lat']


def test_post_waypoint():
    waypoint = {
        'lat': 1,
        'lng': -1,
        'angle': 0,
    }
    response = requests.post(BASE_URL + '/waypoints', json=waypoint)
    assert response.status_code == 200
    response_body = response.json()
    assert response_body['id']
    assert response_body['lat'] == waypoint['lat']


def test_post_waypoint_full():
    waypoint = {
        'lat': 1,
        'lng': -1,
        'angle': 0,
        'delay': '3.000000001s',
        'radius': 1,
    }
    response = requests.post(BASE_URL + '/waypoints', json=waypoint)
    assert response.status_code == 200
    response_body = response.json()
    assert response_body['id']
    assert response_body['delay'] == waypoint['delay']


def test_post_waypoint_request_pb_response_json():
    waypoint_proto = waypoint_pb2.Waypoint(lat=42, lng=-1, angle=0)
    response = requests.post(
        BASE_URL + '/waypoints', data=waypoint_proto.SerializeToString(), headers={'Content-Type': 'application/x-protobuf'},
    )
    assert response.status_code == 200
    response_body = response.json()
    assert response_body['id']
    assert response_body['lat'] == waypoint_proto.lat


def test_post_waypoint_request_pb_response_pb():
    waypoint_proto = waypoint_pb2.Waypoint(lat=42, lng=-1, angle=0)
    response = requests.post(
        BASE_URL + '/waypoints',
        data=waypoint_proto.SerializeToString(),
        headers={
            'Accept': 'application/x-protobuf',
            'Content-Type': 'application/x-protobuf',
        },
    )
    assert response.status_code == 200

    response_proto = waypoint_pb2.Waypoint()
    response_proto.ParseFromString(response.content)
    assert response_proto.id.value
    assert response_proto.lat == waypoint_proto.lat


def test_post_waypoint_invalid_lat():
    waypoint = {
        'lat': -91,
        'lng': -1,
        'angle': 0,
    }
    response = requests.post(BASE_URL + '/waypoints', json=waypoint)
    assert response.status_code == 422
    assert 'lat' in response.text


def test_post_waypoint_invalid_delay():
    waypoint = {
        'lat': -91,
        'lng': -1,
        'angle': 0,
    }
    response = requests.post(BASE_URL + '/waypoints', json=waypoint)
    assert response.status_code == 422
    assert 'lat' in response.text


def test_post_waypoint_bad_request_lat_type_str():
    waypoint = {
        'lat': 'foo',
        'lng': -1,
        'angle': 0,
    }
    response = requests.post(BASE_URL + '/waypoints', json=waypoint)
    assert response.status_code == 400


def test_post_waypoint_bad_request_lat_type_obj():
    waypoint = {
        'lat': {'foo': 'bar'},
        'lng': -1,
        'angle': 0,
    }
    response = requests.post(BASE_URL + '/waypoints', json=waypoint)
    assert response.status_code == 400


def test_delete_waypoint():
    waypoint = {
        'lat': 1,
        'lng': -1,
        'angle': 0,
    }
    response = requests.post(BASE_URL + '/waypoints', json=waypoint)
    id = response.json()['id']

    response = requests.delete(BASE_URL + f'/waypoints/{id}')
    assert response.status_code == 200

    response = requests.delete(BASE_URL + f'/waypoints/{id}')
    assert response.status_code == 404
