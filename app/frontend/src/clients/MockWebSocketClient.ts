/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */

import { IWebSocketClient } from "../models/IWebSocketClient";

type ICallback = (data: any) => void;

type ICallbackMap = {
  [event: string]: ICallback[]
};

export class MockWebSocketClient implements IWebSocketClient{
  private callbacks: ICallbackMap = {}

  constructor() {
    this.simulateTractorUpdates();
  }

  public on(event: string, callback: ICallback) {
    this.callbacks[event] = [...(this.callbacks[event] || []), callback];
  }

  public send(data: any) {
    console.log("[ws_send]", data);
  }

  private emit(event: string, data: any) {
    (this.callbacks[event] || []).forEach((cb) => cb(data));
  }

  private simulateTractorUpdates() {
    let x = 0;
    let y = 0;

    setInterval(() => {
      x += (Math.random() - 0.5) * 0.1;
      y += (Math.random() - 0.5) * 0.1;
      this.emit("message", {
        world_translation_tractor: [x, y, 0],
        world_quaternion_tractor: [0, 0, 0, 1]
      });
    }, 200);
  }
}
