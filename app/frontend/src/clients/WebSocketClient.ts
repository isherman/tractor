/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */

import { IWebSocketClient } from "../models/IWebSocketClient";

type ICallback = (data: any) => void;

type ICallbackMap = {
  [event: string]: ICallback[]
};


class WebSocketClient implements IWebSocketClient {
  private websocket: WebSocket;
  private callbacks: ICallbackMap = {}

  constructor(uri: string) {
    this.websocket = new WebSocket(uri);

    this.websocket.onmessage = (event) => {
      this.emit("message", JSON.parse(event.data));
    };
  }

  public on(event: string, callback: ICallback) {
    this.callbacks[event] = [...(this.callbacks[event] || []), callback];
  }

  public send(data: any) {
    console.log("[ws_send]", data);
    // this.websocket.send(data);
  }

  private emit(event: string, data: any) {
    (this.callbacks[event] || []).forEach((cb) => cb(data));
  }
}

export default WebSocketClient;
