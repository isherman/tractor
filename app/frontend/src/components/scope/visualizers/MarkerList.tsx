/* eslint-disable no-console */
import * as React from "react";
import { SingleElementVisualizerProps } from "../../../registry/visualization";
import { OverlayOptions, OverlayVisualizerComponent } from "./Overlay";
import { MarkerList } from "../../../../genproto/farm_ng_proto/tractor/v1/markers";
import { MarkerVisualizer } from "./Marker";
import { Card } from "./Card";
import { Scene } from "./Scene";

const MarkerList3DElement: React.FC<SingleElementVisualizerProps<
  MarkerList
>> = (props) => {
  const {
    value: [, value]
  } = props;
  return (
    <group>
      {value.markers.map((marker, index) => (
        <MarkerVisualizer.Marker3D key={index} value={[0, marker]} />
      ))}
    </group>
  );
};

const MarkerListElement: React.FC<SingleElementVisualizerProps<MarkerList>> = ({
  value: [timestamp, value]
}) => {
  return (
    <Card timestamp={timestamp} json={value}>
      <Scene>
        <MarkerList3DElement value={[timestamp, value]} />
      </Scene>
    </Card>
  );
};

export const MarkerListVisualizer = {
  id: "MarkerList",
  types: ["type.googleapis.com/farm_ng_proto.tractor.v1.MarkerList"],
  options: OverlayOptions,
  Component: OverlayVisualizerComponent(MarkerListElement),
  Element: MarkerListElement,
  Marker3D: MarkerList3DElement
};
