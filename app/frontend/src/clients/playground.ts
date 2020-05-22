/* eslint-disable no-console */

// A sandbox for playing with Twirp clients
// TODO: Turn this into tests

import { WaypointServiceClientImpl } from "../../genproto/farmng/tractor/v1/waypoint_service";
import { createTwirpClient } from "./createTwirpClient";

const protobufClient = createTwirpClient(WaypointServiceClientImpl, "protobuf");

export async function callServices(): Promise<void> {
  const client = protobufClient;

  const createWaypoint = await client.CreateWaypoint({
    waypoint: {
      lat: 42,
      lng: -1,
      angle: 1,
      delay: undefined,
      radius: undefined,
      id: undefined
    }
  });
  console.log("CreateWaypoint", createWaypoint);

  const listWaypoints = await client.ListWaypoints({});
  console.log("ListWaypoints", listWaypoints);

  try {
    const getWaypoint = await client.GetWaypoint({ waypoint: 1 });
    console.log("GetWaypoint", getWaypoint);
  } catch (error) {
    console.error("GetWaypoint", error);
  }
  try {
    const deleteWaypoint = await client.DeleteWaypoint({ waypoint: 99999 });
    console.log("DeleteWaypoint", deleteWaypoint);
  } catch (error) {
    console.error("DeleteWaypoint", error);
  }
}
