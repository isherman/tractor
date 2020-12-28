import { Event as BusEvent } from "@farm-ng/genproto-core/farm_ng/core/io";
import { EventType, eventTypeIdFromMessage } from "../registry/events";
import { DeepPartial, Message } from "../types/common";

export class BusClient {
  constructor(private dataChannel: RTCDataChannel) {}

  public send<T extends EventType>(
    value: DeepPartial<T>,
    name: string,
    MessageT: Message<T>
  ): void {
    const typeUrl = eventTypeIdFromMessage(MessageT);
    if (!typeUrl) {
      console.error("Failed to lookup typeUrl: ", name, value, MessageT);
      return;
    }
    const event = {
      ...BusEvent.fromPartial({ name, stamp: new Date() }),
      data: {
        typeUrl,
        value: MessageT.encode(MessageT.fromPartial(value)).finish(),
      },
    };
    this.dataChannel.send(BusEvent.encode(event).finish());
  }
}
