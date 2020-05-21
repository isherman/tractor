import { farmng } from "../genproto/protos";

export interface ISetWaypoint {
  waypoint: number[];
}

export type IWebSocketMessage = farmng.tractor.v1.Status | ISetWaypoint;
