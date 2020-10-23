/* eslint-disable no-console */
import * as React from "react";
import { SingleElementVisualizerProps } from "../../../registry/visualization";
import { PointMarker } from "../../../../genproto/farm_ng_proto/tractor/v1/markers";
import { Sphere } from "drei";
import { toColor } from "../../../utils/protoConversions";
import {
  Standard3DComponent,
  Standard3DComponentOptions,
  Standard3DElement
} from "./StandardComponent";

const PointMarkerMarker3D: React.FC<SingleElementVisualizerProps<
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

export const PointMarkerVisualizer = {
  id: "PointMarker",
  types: ["type.googleapis.com/farm_ng_proto.tractor.v1.PointMarker"],
  options: Standard3DComponentOptions,
  Component: Standard3DComponent(PointMarkerMarker3D),
  Element: Standard3DElement(PointMarkerMarker3D),
  Marker3D: PointMarkerMarker3D
};
