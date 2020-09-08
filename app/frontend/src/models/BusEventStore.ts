import { BusEvent } from "./BusEvent";
import { observable } from "mobx";
import { decodeAnyEvent } from "./decodeAnyEvent";
import { BusEventEmitter } from "./BusEventEmitter";

// A store for eventbus events
export class BusEventStore {
  @observable state: Map<string, BusEvent> = new Map();

  constructor(transport: BusEventEmitter) {
    transport.on("*", (event) => {
      const value = decodeAnyEvent(event);
      if (value) {
        this.state.set(event.name, value);
      }
    });
  }
}
