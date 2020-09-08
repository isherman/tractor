import { BusEvent } from "./BusEvent";
import { observable, ObservableMap } from "mobx";
import { decodeAnyEvent } from "./decodeAnyEvent";
import { BusEventEmitter } from "./BusEventEmitter";

interface StreamSnapshot {
  latestEvent: BusEvent | null;
  latestEventTime?: Date;
  eventsSinceLastSnapshot: number;
}

const snapshotPeriod = 1000; // ms

// A store for eventbus events.
// Accumulate events (and metadata) in a snapshot, then every snapshotPeriod update the
// observable with the latest snapshot.
export class BusEventStore {
  @observable lastSnapshot = new ObservableMap<string, StreamSnapshot>();
  nextSnapshot = new Map<string, StreamSnapshot>();

  constructor(transport: BusEventEmitter) {
    transport.on("*", (event) => {
      this.nextSnapshot.set(event.name, {
        latestEvent: decodeAnyEvent(event),
        latestEventTime: event.stamp,
        eventsSinceLastSnapshot:
          (this.nextSnapshot.get(event.name)?.eventsSinceLastSnapshot || 0) + 1
      });
    });

    setInterval(() => {
      this.lastSnapshot.replace(this.nextSnapshot);
      this.nextSnapshot.forEach((value, key) => {
        this.nextSnapshot.set(key, { ...value, eventsSinceLastSnapshot: 0 });
      });
    }, snapshotPeriod);
  }
}
