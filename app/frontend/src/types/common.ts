import { EventType } from "../registry/events";
type Timestamp = number;
type TimestampedEvent<T extends EventType = EventType> = [Timestamp, T];

export type TimestampedEventVector<
  T extends EventType = EventType
> = TimestampedEvent<T>[];
