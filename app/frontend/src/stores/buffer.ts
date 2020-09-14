import { Vec2 } from "../../genproto/farm_ng_proto/tractor/v1/geometry";
import { Announce } from "../../genproto/farm_ng_proto/tractor/v1/io";
import { EventType, EventTypeId } from "../data/registry";

type Timestamp = number;
type TimestampedEvent<T extends EventType = EventType> = [Timestamp, T];
export type TimestampedEventVector<
  T extends EventType = EventType
> = TimestampedEvent<T>[];
export type NamedTimestampedEventVector = {
  name: string;
  values: TimestampedEventVector;
};
type Buffer = { [k in EventTypeId]?: NamedTimestampedEventVector[] };

// Generate some dummy data

const currentTime = Date.now();
const startTime = currentTime - 60 * 1000;
const numTimestamps = 100;
const timestamps = Array(numTimestamps)
  .fill(0)
  .map(
    (_, i) =>
      startTime +
      (i * (Math.random() / 100 + 0.995) * (currentTime - startTime)) /
        numTimestamps
  );

const vec2DummyData = (t: Timestamp): Vec2 => {
  return Vec2.fromJSON({
    x: Math.sin(2 * t) + Math.sin(Math.PI * t),
    y: Math.sin(2 * t + Math.PI) + Math.sin(Math.PI * t)
  });
};

export const buffer: Buffer = {
  "type.googleapis.com/farm_ng_proto.tractor.v1.Vec2": [
    { name: "tractor", values: timestamps.map((t) => [t, vec2DummyData(t)]) },
    {
      name: "steering",
      values: timestamps.map((t) => [t + 1, vec2DummyData(t)])
    }
  ],
  "type.googleapis.com/farm_ng_proto.tractor.v1.Announce": [
    {
      name: "tractor",
      values: timestamps.map((t) => [t, Announce.fromJSON({})])
    },
    {
      name: "steering",
      values: timestamps.map((t) => [t + 1, Announce.fromJSON({})])
    }
  ]
};
