/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
class WebSocketClient {
  constructor(uri) {
    this.websocket = new WebSocket(uri);
    this.callbacks = {};

    this.websocket.onmessage = (event) => {
      this.emit("message", JSON.parse(event.data));
    };
  }

  on(event, callback) {
    this.callbacks[event] = [...(this.callbacks[event] || []), callback];
  }

  emit(event, data) {
    (this.callbacks[event] || []).forEach((cb) => cb(data));
  }

  send(data) {
    console.log("[ws_send]", data);
    // this.websocket.send(data);
  }
}

export default WebSocketClient;
