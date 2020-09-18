import { decodeAnyEvent } from "../models/decodeAnyEvent";
import { Event as BusAnyEvent } from "../../genproto/farm_ng_proto/tractor/v1/io";
import { Buffer } from "../types/common";
import { EventTypeId } from "../registry/events";

export class UploadBuffer {
  public bufferStart: Date | null = null;
  public bufferEnd: Date | null = null;
  public data: Buffer = {};

  public add(event: BusAnyEvent): void {
    if (!event || !event.data || !event.stamp) return;
    this.bufferStart = this.bufferStart || event.stamp;
    this.bufferEnd = event.stamp;
    const typeUrl = event.data.typeUrl as EventTypeId;
    if (!this.data[typeUrl]) this.data[typeUrl] = {};
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (!this.data[typeUrl]![event.name]) this.data[typeUrl]![event.name] = [];
    const decodedEvent = decodeAnyEvent(event);
    if (!decodedEvent) return;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.data[typeUrl]![event.name].push([event.stamp.getTime(), decodedEvent]);
  }
}
