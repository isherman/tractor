import { Event as BusAnyEvent } from "../../genproto/farm_ng_proto/tractor/v1/io";

// The following hack is a work around for this issue:
// https://github.com/stephenh/ts-proto/issues/108
import * as protobuf from "protobufjs/minimal";
import * as Long from "long";
import { eventRegistry, EventType } from "../registry/events";
import { Message } from "../types/common";

if (protobuf.util.Long !== Long) {
  protobuf.util.Long = Long;
  protobuf.configure();
}

export function decodeAnyEvent<T extends EventType>(
  event: BusAnyEvent
): T | null {
  const { data } = event;
  if (!data || !data.value) return null;
  const decoder = (eventRegistry[data.typeUrl] as Message<T>).decode;
  return decoder(data.value);
}
