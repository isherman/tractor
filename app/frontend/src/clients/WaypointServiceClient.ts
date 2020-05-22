/* eslint-disable no-console */
import { WaypointServiceClientImpl } from "../../genproto/farmng/tractor/v1/waypoint_service";
import { createTwirpClient } from "./createTwirpClient";

const protobufClient = createTwirpClient(
  WaypointServiceClientImpl,
  "WaypointService",
  "protobuf"
);

export async function callServices(): Promise<void> {
  const client = protobufClient;
  console.log(
    "CreateWaypoint",
    await client.CreateWaypoint({
      waypoint: {
        lat: 42,
        lng: -1,
        angle: 1,
        delay: undefined,
        radius: undefined,
        id: undefined
      }
    })
  );

  console.log("ListWaypoints", await client.ListWaypoints({}));
  console.log("GetWaypoint", await client.GetWaypoint({ waypoint: 1 }));
  console.log("DeleteWaypoint", await client.DeleteWaypoint({ waypoint: 1 }));
}
