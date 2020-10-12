import * as React from "react";
import { ListGroup } from "react-bootstrap";
import { Card } from "./Card";
import { SingleElementVisualizerProps } from "../../../registry/visualization";
import {
  StandardComponentOptions,
  StandardComponent
} from "./StandardComponent";

const AnyElement: React.FC<SingleElementVisualizerProps> = ({
  value: [timestamp, value]
}) => {
  return (
    <Card timestamp={timestamp}>
      <ListGroup horizontal>
        <ListGroup.Item>
          <pre>{JSON.stringify(value, null, 2)}</pre>
        </ListGroup.Item>
      </ListGroup>
    </Card>
  );
};

export const AnyVisualizer = {
  id: "Any",
  types: "*" as const,
  options: StandardComponentOptions,
  Component: StandardComponent(AnyElement),
  Element: AnyElement
};
