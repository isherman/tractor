/* eslint-disable no-console */
import { farmng } from "../genproto/protos";
import { RPCImpl } from "protobufjs";

const waypoint: farmng.tractor.v1.Waypoint = new farmng.tractor.v1.Waypoint();
waypoint.lat = 100;
console.log(waypoint.toJSON());

const request = new farmng.tractor.v1.CreateWaypointRequest({
  waypoint: new farmng.tractor.v1.Waypoint({
    angle: 1,
    lat: 2,
    lng: 1000,
    delay: { value: 3 }
  })
});

console.log("request: ", request);

const rpcImpl: RPCImpl = function (method, requestData, callback) {
  console.log({ method, requestData });
  callback(null);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function createWaypoint(): Promise<farmng.tractor.v1.Waypoint> {
  const client = farmng.tractor.v1.Mission.create(rpcImpl, false, false);
  const waypoint = await client.createWaypoint({
    waypoint: {
      angle: 1,
      lat: 2,
      lng: 1000,
      delay: { value: 3 }
    }
  });
  return waypoint;
}
