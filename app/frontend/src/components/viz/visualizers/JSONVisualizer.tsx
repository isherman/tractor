import * as React from "react";
import { useState } from "react";
import { Card, ListGroup } from "react-bootstrap";
import RangeSlider from "react-bootstrap-range-slider";
import styles from "./JSONVisualizer.module.scss";
import {
  Visualizer,
  VisualizerId,
  VisualizerOptionConfig,
  VisualizerProps
} from "../../../registry/visualization";
import { EventType } from "../../../registry/events";
import { formatValue } from "../../../utils/formatValue";

export class JSONVisualizer implements Visualizer {
  static id: VisualizerId = "json";
  types = "*" as const;

  options: VisualizerOptionConfig[] = [
    { label: "view", options: ["overlay", "row"] }
  ];

  component: React.FC<VisualizerProps<EventType>> = ({ values, options }) => {
    if (!values) {
      return null;
    }

    const [index, setIndex] = useState(0);

    if (options[0].value === "overlay") {
      return (
        <Card bg={"light"} className={"shadow-sm"}>
          <Card.Body>
            <ListGroup horizontal>
              <ListGroup.Item>
                {formatValue(new Date(values[index][0]))}
              </ListGroup.Item>
              <ListGroup.Item>
                {JSON.stringify(values[index][1])}
              </ListGroup.Item>
            </ListGroup>
            <RangeSlider
              value={index}
              onChange={(e) => setIndex(parseInt(e.target.value))}
              min={0}
              max={values.length - 1}
              step={1}
              tooltip={"off"}
            />
          </Card.Body>
        </Card>
      );
    } else if (options[0].value === "row") {
      return (
        <div className={styles.row}>
          {values.map((v, index) => (
            <Card key={v[0]} bg={"light"} className={"shadow-sm"}>
              <Card.Body>
                <ListGroup>
                  <ListGroup.Item>
                    {formatValue(new Date(values[index][0]))}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    {JSON.stringify(values[index][1])}
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          ))}
        </div>
      );
    } else {
      return null;
    }
  };
}
