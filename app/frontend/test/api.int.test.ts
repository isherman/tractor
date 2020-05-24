import "jest";
import "node-fetch";
import { WaypointServiceClientImpl } from "../genproto/farmng/tractor/v1/waypoint_service";
import { createTwirpClient } from "../src/clients/createTwirpClient";

describe("WaypointService", () => {
  const protobufClient = createTwirpClient(
    WaypointServiceClientImpl,
    "protobuf"
  );

  async function createWaypoint(): Promise<number> {
    const response = await protobufClient.CreateWaypoint({
      waypoint: {
        lat: 42,
        lng: -1,
        angle: 1,
        delay: undefined,
        radius: undefined,
        id: undefined
      }
    });
    if (!response.id) {
      throw Error("Could not create waypoint");
    }
    return response.id;
  }

  it("CreateWaypoint succeeds", async () => {
    const id = await createWaypoint();
    expect(id).not.toBe(0);
  });

  it("ListWaypoints succeeds", async () => {
    const id = await createWaypoint();
    const response = await protobufClient.ListWaypoints({});
    expect(response.waypoints.length).toBeGreaterThan(0);
    expect(response.waypoints.some((waypoint) => waypoint.id === id));
  });

  it("GetWaypoint succeeds", async () => {
    const id = await createWaypoint();
    const response = await protobufClient.GetWaypoint({ waypoint: id });
    expect(response.id).toEqual(id);
  });

  it("DeleteWaypoint succeeds", async () => {
    const id = await createWaypoint();
    await protobufClient.DeleteWaypoint({ waypoint: id });
    expect(async () => {
      await protobufClient.GetWaypoint({ waypoint: id });
    }).rejects.toThrow();
  });
});
