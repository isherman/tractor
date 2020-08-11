import * as React from "react";
import * as ReactDOM from "react-dom";
// import { Scene } from "./components/Scene";
import App from "./third_party/protobuf-playground/src/App";
import { HashRouter } from "react-router-dom";

// ReactDOM.render(<Scene />, document.getElementById("scene"));
ReactDOM.render(
  <HashRouter>
    <App
      jsonUrl={"/proto.json"}
      title={"farm-ng"}
      twirpBaseUrl={"http://localhost:9091/api"}
    />
  </HashRouter>,
  document.getElementById("scene")
);
