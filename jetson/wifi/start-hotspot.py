import NetworkManager
import uuid
import os, socket, sys

connection_ID = 'farm_ng-'+socket.gethostname()

hotspot = {
 '802-11-wireless': {'mode': 'ap',
                     'security': '801-22-wireless-security',
                     'ssid': connection_ID},
 '802-11-wireless-security': {'key-mgmt': 'wpa-psk',
                              'psk': 'shellyandhelly',
                              },
 'connection': {'autoconnect': False,
                'id': connection_ID,
                'interface-name': 'wlan0',
                'type': '802-11-wireless',
                'uuid': str(uuid.uuid4())},
 'ipv4': {'address-data': [{'address': '192.168.42.1', 'prefix': 24}],
          'addresses': [['192.168.42.1', 24, '192.168.42.1']],
          'gateway': '192.168.42.1',
          'method': 'shared'},
 'ipv6': {'method': 'auto'}
}

def getHotspotConnection():
    connections = NetworkManager.Settings.ListConnections()
    connections = dict([(x.GetSettings()['connection']['id'], x) for x in connections])
    return connections.get(connection_ID)

conn = getHotspotConnection()
if not conn:
    NetworkManager.Settings.AddConnection(hotspot)
    print(f"Added connection: {hotspot}")
    conn = getHotspotConnection()

# Find a suitable device
ctype = conn.GetSettings()['connection']['type']
dtype = {'802-11-wireless': NetworkManager.NM_DEVICE_TYPE_WIFI}.get(ctype,ctype)
devices = NetworkManager.NetworkManager.GetDevices()

for dev in devices:
    if dev.DeviceType == dtype:
        break
else:
    print("No suitable and available %s device found" % ctype)
    sys.exit(1)

# And connect
NetworkManager.NetworkManager.ActivateConnection(conn, dev, "/")
print(f"Activated connection={conn}, dev={dev}.")


