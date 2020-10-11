import * as React from "react";
import { Card, ListGroup } from "react-bootstrap";
import styles from "./JSONVisualizer.module.scss";
import { SingleElementVisualizerProps } from "../../../registry/visualization";
import { formatValue } from "../../../utils/formatValue";
import { LayoutOptions, LayoutVisualizerComponent } from "./Layout";

const JSONElement: React.FC<SingleElementVisualizerProps> = ({
  value: [timestamp, value]
}) => {
  return (
    <Card bg={"light"} className={[styles.card, "shadow-sm"].join(" ")}>
      <Card.Body>
        <ListGroup horizontal>
          <ListGroup.Item>
            <pre>{JSON.stringify(value, null, 2)}</pre>
          </ListGroup.Item>
        </ListGroup>
      </Card.Body>
      <Card.Footer className={styles.footer}>
        <span className="text-muted">{formatValue(new Date(timestamp))}</span>
      </Card.Footer>
    </Card>
  );
};

export const JSONVisualizer = {
  id: "json",
  types: "*" as const,
  options: LayoutOptions,
  Component: LayoutVisualizerComponent(JSONElement),
  Element: JSONElement
};
