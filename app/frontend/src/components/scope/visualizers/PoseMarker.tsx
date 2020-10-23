/* eslint-disable no-console */
import * as React from "react";
import { SingleElementVisualizerProps } from "../../../registry/visualization";
import { OverlayOptions, OverlayVisualizerComponent } from "./Overlay";
import { PoseMarker } from "../../../../genproto/farm_ng_proto/tractor/v1/markers";
import { Cylinder } from "drei";
import { toColor, toVector3 } from "../../../utils/protoConversions";
import { Vector3 } from "three";
// import { useMemo } from "react";

const PoseMarker3DElement: React.FC<SingleElementVisualizerProps<
  PoseMarker
>> = (props) => {
  const {
    value: [, value]
  } = props;

  // const xCylinder = useMemo(() => {
  //   const cylinder = new Cylinder
  // }, [])

  return (
    <>
      {value.axes && (
        <group>
          <Cylinder
            position={[-value.axes.length / 2, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
            args={[value.axes.radius, value.axes.radius, value.axes.length]}
          >
            <meshBasicMaterial attach="material" color={"red"} />
          </Cylinder>
          <Cylinder
            position={[0, value.axes.length / 2, 0]}
            rotation={[0, 0, 0]}
            args={[value.axes.radius, value.axes.radius, value.axes.length]}
          >
            <meshBasicMaterial attach="material" color={"green"} />
          </Cylinder>
          <Cylinder
            position={[0, 0, value.axes.length / 2]}
            rotation={[Math.PI / 2, 0, 0]}
            args={[value.axes.radius, value.axes.radius, value.axes.length]}
          >
            <meshBasicMaterial attach="material" color={"blue"} />
          </Cylinder>
        </group>
      )}
      {value.arrow && (
        <arrowHelper
          args={[
            toVector3(value.pose?.position).normalize(),
            new Vector3(0, 0, 0),
            toVector3(value.pose?.position).length(),
            toColor(value.arrow.color).getHex(),
            value.arrow.headLength,
            value.arrow.headRadius * 2
          ]}
        />
      )}
    </>
  );
};

const PoseMarkerElement: React.FC<SingleElementVisualizerProps<
  PoseMarker
>> = () => {
  return <p>TODO</p>;
};

export const PoseMarkerVisualizer = {
  id: "PoseMarker",
  types: ["type.googleapis.com/farm_ng_proto.tractor.v1.PoseMarker"],
  options: OverlayOptions,
  Component: OverlayVisualizerComponent(PoseMarkerElement),
  Element: PoseMarkerElement,
  Marker3D: PoseMarker3DElement
};
