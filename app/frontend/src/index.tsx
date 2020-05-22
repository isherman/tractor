import * as React from "react";
import * as ReactDOM from "react-dom";
import { Scene } from "./components/Scene";

ReactDOM.render(<Scene />, document.getElementById("scene"));

// TEMPORARY, FOR TESTING
import { callServices } from "./clients/WaypointServiceClient";
callServices();
