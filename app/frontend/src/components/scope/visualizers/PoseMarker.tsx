/* eslint-disable no-console */
import * as React from "react";
import { SingleElementVisualizerProps } from "../../../registry/visualization";
import { PoseMarker } from "../../../../genproto/farm_ng_proto/tractor/v1/markers";
import { Cylinder } from "drei";
import { toColor, toVector3 } from "../../../utils/protoConversions";
import { Vector3 } from "three";
import {
  Standard3DComponent,
  Standard3DComponentOptions,
  Standard3DElement
} from "./StandardComponent";

const PoseMarker3DElement: React.FC<SingleElementVisualizerProps<
  PoseMarker
>> = (props) => {
  const {
    value: [, value]
  } = props;

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
        <group>
          {/* <Cylinder
            position={[0, value.arrow.shaftLength / 2, 0]}
            args={[
              value.arrow.shaftRadius,
              value.arrow.shaftRadius,
              value.arrow.shaftLength
            ]}
          >
            <meshBasicMaterial
              attach="material"
              color={toColor(value.arrow.color)}
            />
          </Cylinder>
          <Cone
            position={[0, value.arrow.shaftLength, 0]}
            args={[value.arrow.headRadius, value.arrow.headLength]}
          >
            <meshBasicMaterial
              attach="material"
              color={toColor(value.arrow.color)}
            />
          </Cone> */}
          <arrowHelper
            args={[
              toVector3(value.pose?.position).normalize(),
              new Vector3(0, 0, 0),
              1,
              toColor(value.arrow.color).getHex(),
              value.arrow.headLength,
              value.arrow.headRadius * 2
            ]}
          />
        </group>
      )}
    </>
  );
};

export const PoseMarkerVisualizer = {
  id: "PoseMarker",
  types: ["type.googleapis.com/farm_ng_proto.tractor.v1.PoseMarker"],
  options: Standard3DComponentOptions,
  Component: Standard3DComponent(PoseMarker3DElement),
  Element: Standard3DElement(PoseMarker3DElement),
  Marker3D: PoseMarker3DElement
};
