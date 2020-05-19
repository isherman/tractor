import { IWebSocketClient } from "../models/IWebSocketClient";
import { IWebSocketMessage } from "../models/IWebSocketMessage";

type ICallback = (data: IWebSocketMessage) => void;

type ICallbackMap = {
  [event: string]: ICallback[];
};

class WebSocketClient implements IWebSocketClient {
  private websocket: WebSocket;
  private callbacks: ICallbackMap = {};

  constructor(uri: string) {
    this.websocket = new WebSocket(uri);

    this.websocket.onmessage = (event): void => {
      this.emit("message", JSON.parse(event.data));
    };
  }

  public on(event: string, callback: ICallback): void {
    this.callbacks[event] = [...(this.callbacks[event] || []), callback];
  }

  public send(data: IWebSocketMessage): void {
    // eslint-disable-next-line no-console
    console.log("[ws_send]", data);

    // this.websocket.send(data);
  }

  private emit(event: string, data: IWebSocketMessage): void {
    (this.callbacks[event] || []).forEach((cb) => cb(data));
  }
}

export default WebSocketClient;
