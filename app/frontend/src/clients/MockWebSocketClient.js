/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
class MockWebSocketClient {
  constructor() {
    this.callbacks = {};

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

  on(event, callback) {
    this.callbacks[event] = [...(this.callbacks[event] || []), callback];
  }

  emit(event, data) {
    (this.callbacks[event] || []).forEach((cb) => cb(data));
  }

  send(data) {
    console.log("[ws_send]", data);
  }
}

export default MockWebSocketClient;
