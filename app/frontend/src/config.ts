/* eslint-disable import/prefer-default-export */

// import MockWebSocketClient from "./clients/MockWebSocketClient";

// const webSocketClient = new MockWebSocketClient();

import WebSocketClient from "./clients/WebSocketClient";

const webSocketClient = new WebSocketClient("ws://localhost:8989/simsocket");

export { webSocketClient };
