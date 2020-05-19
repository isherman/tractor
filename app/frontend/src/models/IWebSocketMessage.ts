export interface ITractorStatus {
  world_translation_tractor: number[];
  world_quaternion_tractor: number[];
}

export interface ISetWaypoint {
  waypoint: number[];
}

export type IWebSocketMessage = ITractorStatus | ISetWaypoint;
