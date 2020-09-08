import * as React from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { App } from "./components/App";
import { getWebRTCEmitters } from "./models/getWebRTCEmitters";
import { RootStore, RootStoreProvider } from "./models/RootStore";
import "./App.scss";

const [busEventEmitter, mediaStreamEmitter] = getWebRTCEmitters(
  `http://${window.location.hostname}:9900/twirp/farm_ng_proto.tractor.v1.WebRTCProxyService/InitiatePeerConnection`
);
const rootStore = new RootStore(busEventEmitter, mediaStreamEmitter);

ReactDOM.render(
  <BrowserRouter>
    <RootStoreProvider value={rootStore}>
      <App />
    </RootStoreProvider>
  </BrowserRouter>,
  document.getElementById("root")
);
