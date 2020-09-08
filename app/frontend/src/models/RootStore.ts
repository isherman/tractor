import { MediaStreamStore } from "./MediaStreamStore";
import { BusEventStore } from "./BusEventStore";
import { useContext, createContext } from "react";
import { BusEventEmitter } from "./BusEventEmitter";
import { MediaStreamEmitter } from "./MediaStreamEmitter";

// A single root store allows us to use a single React.Context to share
// our stores with the entire component tree. Based on the pattern from:
// https://mobx.js.org/best/store.html#combining-multiple-stores
export class RootStore {
  public busEventStore: BusEventStore;
  public mediaStreamStore: MediaStreamStore;

  constructor(
    busEventEmitter: BusEventEmitter,
    mediaStreamEmitter: MediaStreamEmitter
  ) {
    this.busEventStore = new BusEventStore(busEventEmitter);
    this.mediaStreamStore = new MediaStreamStore(mediaStreamEmitter);
  }
}

export const RootStoreContext = createContext<RootStore>(
  new RootStore(new BusEventEmitter(), new MediaStreamEmitter())
);
export const RootStoreProvider = RootStoreContext.Provider;
export const useRootStore = (): RootStore => useContext(RootStoreContext);
