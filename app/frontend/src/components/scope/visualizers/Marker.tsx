/* eslint-disable no-console */
import * as React from "react";
import {
  SingleElementVisualizerProps,
  visualizersForEventType
} from "../../../registry/visualization";
import { OverlayOptions, OverlayVisualizerComponent } from "./Overlay";
import { Marker } from "../../../../genproto/farm_ng_proto/tractor/v1/markers";
import { EventTypeId } from "../../../registry/events";
import { decodeAnyEvent } from "../../../models/decodeAnyEvent";
import { toQuaternion, toVector3 } from "../../../utils/protoConversions";

const Marker3DElement: React.FC<SingleElementVisualizerProps<Marker>> = (
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

const MarkerElement: React.FC<SingleElementVisualizerProps<Marker>> = () => {
  return <p>TODO</p>;
};

export const MarkerVisualizer = {
  id: "Marker",
  types: ["type.googleapis.com/farm_ng_proto.tractor.v1.Marker"],
  options: OverlayOptions,
  Component: OverlayVisualizerComponent(MarkerElement),
  Element: MarkerElement,
  Marker3D: Marker3DElement
};
