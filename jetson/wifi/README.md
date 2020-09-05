# Enable the tractor's hotspot

Pre-requisite: The tractor is connected to a wifi network.

1. Connect your computer to the same wifi network as the tractor and SSH into the tractor via its hostname. 
2. Run `python start-hotspot.py`. This will terminate your SSH session. 
3. Connect your computer to the `farm_ng-<tractor hostname>` wifi network.
4. Your computer will be assigned an address in the `192.168.48/24` subnet.
5. The tractor is reachable at `192.168.48.1`.

# Connect the tractor to a wifi network

Pre-requisite: The tractor's hotspot is enabled

1. Connect your computer to the `farm_ng-<tractor hostname>` wifi network.
2. SSH into the tractor via its hostname or IP address (192.168.48.1)
3. Run `python network-manager.py list` and find the SSID of the wifi network.
4. Run `python network-manager.py deactivate farm_ng-`hostname` && python network-manager.py activate <connection>`.

