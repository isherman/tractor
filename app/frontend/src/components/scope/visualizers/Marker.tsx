/* eslint-disable no-console */
import * as React from "react";
import {
  SingleElementVisualizerProps,
  visualizersForEventType
} from "../../../registry/visualization";
import { Marker } from "../../../../genproto/farm_ng_proto/tractor/v1/markers";
import { EventTypeId } from "../../../registry/events";
import { decodeAnyEvent } from "../../../models/decodeAnyEvent";
import { toQuaternion, toVector3 } from "../../../utils/protoConversions";
import {
  Standard3DComponent,
  Standard3DComponentOptions,
  Standard3DElement
} from "./StandardComponent";

const MarkerMarker3D: React.FC<SingleElementVisualizerProps<Marker>> = (
  props
) => {
  const {
    value: [timestamp, value]
  } = props;

  if (!value.data) {
    return null;
  }

  const visualizer = visualizersForEventType(
    value.data.typeUrl as EventTypeId
  )[0];

  if (!visualizer || !visualizer.Marker3D) {
    return null;
  }

  const data = decodeAnyEvent(value);
  if (!data) {
    console.error(`Could not decode bus event`, value);
    return null;
  }

  return (
    <group
      position={toVector3(value.worldPoseSelf?.position)}
      quaternion={toQuaternion(value.worldPoseSelf?.rotation)}
    >
      {React.createElement(visualizer.Marker3D, {
        ...props,
        value: [timestamp, data]
      })}
    </group>
  );
};

export const MarkerVisualizer = {
  id: "Marker",
  types: ["type.googleapis.com/farm_ng_proto.tractor.v1.Marker"],
  options: Standard3DComponentOptions,
  Component: Standard3DComponent(MarkerMarker3D),
  Element: Standard3DElement(MarkerMarker3D),
  Marker3D: MarkerMarker3D
};
