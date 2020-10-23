/* eslint-disable no-console */
import * as React from "react";
import { SingleElementVisualizerProps } from "../../../registry/visualization";
import { OverlayOptions, OverlayVisualizerComponent } from "./Overlay";
import { PointMarker } from "../../../../genproto/farm_ng_proto/tractor/v1/markers";
import { Sphere } from "drei";
import { toColor } from "../../../utils/protoConversions";

const PointMarker3DElement: React.FC<SingleElementVisualizerProps<
  PointMarker
>> = (props) => {
  const {
    value: [, value]
  } = props;
  return (
    <Sphere args={[value.radius]}>
      <meshBasicMaterial attach="material" color={toColor(value.color)} />
    </Sphere>
  );
};

const PointMarkerElement: React.FC<SingleElementVisualizerProps<
  PointMarker
>> = () => {
  return <p>TODO</p>;
};

export const PointMarkerVisualizer = {
  id: "PointMarker",
  types: ["type.googleapis.com/farm_ng_proto.tractor.v1.PointMarker"],
  options: OverlayOptions,
  Component: OverlayVisualizerComponent(PointMarkerElement),
  Element: PointMarkerElement,
  Marker3D: PointMarker3DElement
};
