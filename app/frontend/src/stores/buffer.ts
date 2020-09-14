import { Vec2 } from "../../genproto/farm_ng_proto/tractor/v1/geometry";
import { EventType } from "../data/registry";

type Timestamp = number;
type TimestampedEvent<T extends EventType = EventType> = [Timestamp, T];
export type TimestampedEventVector<
  T extends EventType = EventType
> = TimestampedEvent<T>[];
type Buffer = { [k: string]: TimestampedEventVector };

// Generate some dummy data

const currentTime = Date.now();
const startTime = currentTime - 60 * 1000;
const numTimestamps = 1000;
const timestamps = Array(numTimestamps)
  .fill(0)
  .map((_, i) => startTime + (i * (currentTime - startTime)) / numTimestamps);

const vec2DummyData = (t: Timestamp): Vec2 => {
  return Vec2.fromJSON({
    x: Math.sin(2 * t) + Math.sin(Math.PI * t),
    y: Math.sin(2 * t) + Math.cos(Math.PI * t)
  });
};

export const buffer: Buffer = {
  tractor: timestamps.map((t) => [t, vec2DummyData(t)]),
  steering: timestamps.map((t) => [t + 1, vec2DummyData(t)])
};
