/* eslint-disable no-console */
import * as React from "react";
import { useState, useEffect } from "react";
import { Card, ListGroup } from "react-bootstrap";
import RangeSlider from "react-bootstrap-range-slider";
import styles from "./JSONVisualizer.module.scss";
import {
  Visualizer,
  VisualizerId,
  VisualizerOptionConfig,
  VisualizerProps
} from "../../../registry/visualization";
import { Image } from "../../../../genproto/farm_ng_proto/tractor/v1/image";
import { formatValue } from "../../../utils/formatValue";

export class ImageVisualizer implements Visualizer<Image> {
  static id: VisualizerId = "image";
  types = "*" as const;

  options: VisualizerOptionConfig[] = [
    { label: "view", options: ["overlay", "row"] }
  ];

  component: React.FC<VisualizerProps<Image>> = ({
    values,
    options,
    resources
  }) => {
    if (!values) {
      return null;
    }

    const [index, setIndex] = useState(0);
    const [imgSrc, setImgSrc] = useState<string | null>(null);

    useEffect(() => {
      const fetchImage = async (): Promise<void> => {
        const resource = values[index][1].resource;
        if (resources && resource) {
          try {
            setImgSrc(await resources.getDataUrl(resource.path));
          } catch (e) {
            console.error(`Error loading resource ${resource.path}: ${e}`);
          }
        }
      };
      fetchImage();
    }, [values, resources, index]);

    if (options[0].value === "overlay") {
      return (
        <Card bg={"light"} className={"shadow-sm"}>
          <Card.Body>
            <ListGroup horizontal>
              <ListGroup.Item>
                <img src={imgSrc || undefined} />
              </ListGroup.Item>
              <ListGroup.Item>
                {JSON.stringify(values[index][0])}
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
