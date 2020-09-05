# based on https://github.com/OpenAgricultureFoundation/python-wifi-connect
# which is based on https://github.com/balena-io/wifi-connect
import logging
import socket
import sys
import time
import uuid

import NetworkManager

logger = logging.getLogger('network-manager')
logger.setLevel(logging.INFO)

ap_connection_id = 'farm_ng-' + socket.gethostname()
ap_SSID = ap_connection_id
ap_password = 'shellyandhelly'
ap_ip = '192.168.42.1'

ap_config = {
    '802-11-wireless': {
        'mode': 'ap',
        'security': '801-22-wireless-security',
        'ssid': ap_SSID,
    },
    '802-11-wireless-security': {
        'key-mgmt': 'wpa-psk',
        'psk': ap_password,
    },
    'connection': {
        'autoconnect': False,
        'id': ap_connection_id,
        'interface-name': 'wlan0',
        'type': '802-11-wireless',
        'uuid': str(uuid.uuid4()),
    },
    'ipv4': {
        'address-data': [{'address': ap_ip, 'prefix': 24}],
        'addresses': [[ap_ip, 24, ap_ip]],
        'gateway': ap_ip,
        'method': 'shared',
    },
    'ipv6': {'method': 'auto'},
}


def find_connection(id):
    # print(id)
    connections = NetworkManager.Settings.ListConnections()
    connections = {x.GetSettings()['connection']['id']: x for x in connections}
    # print(connections)
    return connections.get(id)


def get_ap_connection():
    connection = find_connection(ap_connection_id)
    if not connection:
        NetworkManager.Settings.AddConnection(ap_config)
        logger.info(f'Added connection: {ap_config}')
        print(ap_connection_id)
        connection = find_connection(ap_connection_id)
    if not connection:
        raise Exception('Could not get ap connection.')
    return connection


def activate_connection(connection):
    # Find a suitable device
    connection_type = connection.GetSettings()['connection']['type']
    device_type = {'802-11-wireless': NetworkManager.NM_DEVICE_TYPE_WIFI}.get(connection_type, connection_type)
    devices = NetworkManager.NetworkManager.GetDevices()
    device = next((d for d in devices if d.DeviceType == device_type), None)

    if not device:
        raise Exception(f'No suitable and available {connection_type} device found')

    # Activate connection
    NetworkManager.NetworkManager.ActivateConnection(connection, device, '/')
    logger.info(f'Activated connection={connection}, dev={device}.')

    # Check for success
    i = 0
    while device.State != NetworkManager.NM_DEVICE_STATE_ACTIVATED:
        if i % 5 == 0:
            print('Waiting for connection to become active...')
        if i > 30:
            break
        time.sleep(1)
        i += 1

    if device.State != NetworkManager.NM_DEVICE_STATE_ACTIVATED:
        raise Exception(f'Enabling connection {ap_connection_id} failed.')

    print(f'Connection {ap_SSID} is active.')


def disable_connection():
    current = next(
        (
            c for c in NetworkManager.NetworkManager.ActiveConnections if c.Connection.GetSettings()
            ['connection']['interface-name'] == 'wlan0'
        ), None,
    )

    if current:
        print(f"Deactivating connection {current.Connection.GetSettings()['connection']['id']}")
        NetworkManager.NetworkManager.DeactivateConnection(current)


def enable_ap():
    activate_connection(get_ap_connection())


def enable_connection(name):
    connection = find_connection(name)
    if not connection:
        raise Exception(f'The connection {name} does not exist.')
    enable_connection(connection)


def print_connections():
    connections = NetworkManager.Settings.ListConnections()
    for c in connections:
        print(c.GetSettings()['connection']['id'])


if __name__ == '__main__':
    logging.basicConfig(stream=sys.stdout, level=logging.INFO)

    if sys.argv[1] == 'list':
        print_connections()
    elif sys.argv[1] == 'ap':
        enable_ap()
    elif sys.argv[1] == 'connect':
        if not sys.argv[2]:
            logger.error("'connect' expects another positional argument, e.g. 'connect homewifi'.")
        enable_connection(sys.argv[2])
    else:
        logger.error("Please invoke with 'list', 'ap', or 'connect <connection-id>'")
        sys.exit(1)
