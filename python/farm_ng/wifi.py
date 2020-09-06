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
ap_ip = '192.168.42.1'
wifi_interface = 'wlan0'


def get_ap_config(password):
    return {
        '802-11-wireless': {
            'mode': 'ap',
            'security': '801-22-wireless-security',
            'ssid': ap_SSID,
        },
        '802-11-wireless-security': {
            'key-mgmt': 'wpa-psk',
            'psk': password,
        },
        'connection': {
            'autoconnect': False,
            'id': ap_connection_id,
            'interface-name': wifi_interface,
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
    connections = NetworkManager.Settings.ListConnections()
    connections = {x.GetSettings()['connection']['id']: x for x in connections}
    return connections.get(id)


def refresh_ap_connection(password):
    connection = find_connection(ap_connection_id)

    if connection:
        settings = connection.GetSettings()
        if (settings['802-11-wireless-security']['password'] != password):
            settings['802-11-wireless-security']['password'] = password
            connection.Update(settings)
            connection = find_connection(ap_connection_id)
    else:
        NetworkManager.Settings.AddConnection(get_ap_config(password))
        logger.info(f'Added connection: {ap_connection_id}')
        print(ap_connection_id)
        connection = find_connection(ap_connection_id)

    if not connection:
        raise Exception('Could not get ap connection.')

    return connection


def activate_connection(connection):
    connection_id = connection.GetSettings()['connection']['id']
    device = next((d for d in NetworkManager.NetworkManager.GetDevices() if d.Interface == wifi_interface), None)
    if not device:
        raise Exception(f'No {wifi_interface} device found')

    NetworkManager.NetworkManager.ActivateConnection(connection, device, '/')
    logger.info(f'Activated connection={connection_id}, dev={device.Interface}.')

    i = 0
    while device.State != NetworkManager.NM_DEVICE_STATE_ACTIVATED:
        if i % 5 == 0:
            logger.info('Waiting for connection to become active...')
        if i > 30:
            break
        time.sleep(1)
        i += 1

    if device.State != NetworkManager.NM_DEVICE_STATE_ACTIVATED:
        raise Exception(f'Enabling connection {ap_connection_id} failed.')

    logger.info(f'Connection {connection_id} is active.')


def disable_current_connection():
    current = next(
        (
            c for c in NetworkManager.NetworkManager.ActiveConnections if c.Connection.GetSettings()
            ['connection']['interface-name'] == wifi_interface
        ), None,
    )

    if current:
        logger.info(f"Deactivating connection {current.Connection.GetSettings()['connection']['id']}")
        NetworkManager.NetworkManager.DeactivateConnection(current)


def enable_ap(password):
    connection = refresh_ap_connection(password)
    activate_connection(connection)


def enable_connection(name):
    connection = find_connection(name)
    if not connection:
        raise Exception(f'The connection {name} does not exist.')
    activate_connection(connection)


def print_connections():
    connections = NetworkManager.Settings.ListConnections()
    for c in connections:
        print(c.GetSettings()['connection']['id'])


if __name__ == '__main__':
    logging.basicConfig(stream=sys.stdout, level=logging.INFO)

    if sys.argv[1] == 'list':
        print_connections()
    elif sys.argv[1] == 'ap':
        if not sys.argv[2]:
            logger.error("'ap' expects an additional argument <password>, e.g. 'ap mypassword'.")
        enable_ap(sys.argv[2])
    elif sys.argv[1] == 'connect':
        if not sys.argv[2]:
            logger.error("'connect' expects an additional argument <SSID> e.g. 'connect homewifi'.")
        enable_connection(sys.argv[2])
    else:
        logger.error("Please invoke with 'list', 'ap', or 'connect <connection-id>'")
        sys.exit(1)
