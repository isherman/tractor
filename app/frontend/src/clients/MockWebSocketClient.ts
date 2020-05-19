import { IWebSocketClient } from "../models/IWebSocketClient";
import { IWebSocketMessage } from "../models/IWebSocketMessage";

type ICallback = (data: IWebSocketMessage) => void;

type ICallbackMap = {
  [event: string]: ICallback[];
};

export class MockWebSocketClient implements IWebSocketClient {
  private callbacks: ICallbackMap = {};

  constructor() {
    this.simulateTractorUpdates();
  }

  public on(event: string, callback: ICallback): void {
    this.callbacks[event] = [...(this.callbacks[event] || []), callback];
  }

  public send(data: IWebSocketMessage): void {
    // eslint-disable-next-line no-console
    console.log("[ws_send]", data);
  }

  private emit(event: string, data: IWebSocketMessage): void {
    (this.callbacks[event] || []).forEach((cb) => cb(data));
  }

  private simulateTractorUpdates(): void {
    let x = 0;
    let y = 0;

    /* eslint-disable @typescript-eslint/camelcase */
    setInterval(() => {
      x += (Math.random() - 0.5) * 0.1;
      y += (Math.random() - 0.5) * 0.1;
      this.emit("message", {
        world_translation_tractor: [x, y, 0],
        world_quaternion_tractor: [0, 0, 0, 1]
      });
    }, 200);
    /* eslint-enable @typescript-eslint/camelcase */
  }
}
