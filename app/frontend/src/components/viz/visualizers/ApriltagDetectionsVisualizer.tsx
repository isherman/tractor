/* eslint-disable no-console */
import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Card } from "react-bootstrap";
import RangeSlider from "react-bootstrap-range-slider";
import styles from "./ApriltagDetectionsVisualizer.module.scss";
import {
  Visualizer,
  VisualizerId,
  VisualizerOptionConfig,
  VisualizerProps
} from "../../../registry/visualization";
import { formatValue } from "../../../utils/formatValue";
import { ApriltagDetections } from "../../../../genproto/farm_ng_proto/tractor/v1/apriltag";
import { EventTypeId } from "../../../registry/events";
import { autorun } from "mobx";
import { drawAprilTagDetections } from "../../../utils/drawApriltagDetections";
import { JsonPopover } from "../../JsonPopover";

export class ApriltagDetectionsVisualizer
  implements Visualizer<ApriltagDetections> {
  static id: VisualizerId = "apriltagDetections";
  types: EventTypeId[] = [
    "type.googleapis.com/farm_ng_proto.tractor.v1.ApriltagDetections"
  ];

  options: VisualizerOptionConfig[] = [
    { label: "view", options: ["overlay", "row"] }
  ];

  component: React.FC<VisualizerProps<ApriltagDetections>> = ({
    values,
    options,
    resources
  }) => {
    if (!values) {
      return null;
    }

    const [index, setIndex] = useState(0);
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const viewOption = options[0].value as "overlay" | "row";

    useEffect(() => {
      const fetchImage = async (): Promise<void> => {
        const resource = values[index][1].image?.resource;
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

    const resize = (): void => {
      const imageElement = imageRef?.current;
      const canvasElement = canvasRef?.current;
      if (imageElement && canvasElement) {
        canvasElement.width = imageElement.clientWidth;
        canvasElement.height = imageElement.clientHeight;
      }
    };

    useEffect(
      () =>
        autorun(() => {
          const canvas = canvasRef.current;
          if (!canvas) {
            return;
          }

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            return;
          }

          resize();

          const { imageWidth: width, imageHeight: height } =
            values[index][1].image?.cameraModel || {};

          drawAprilTagDetections(
            values[index][1],
            ctx,
            canvas,
            width && height ? { width, height } : undefined,
            2
          );
        }),
      [canvasRef, values, index, imgSrc]
    );

    if (viewOption === "overlay") {
      return (
        <Card bg={"light"} className={[styles.card, "shadow-sm"].join(" ")}>
          <Card.Body>
            <RangeSlider
              value={index}
              onChange={(e) => setIndex(parseInt(e.target.value))}
              min={0}
              max={values.length - 1}
              step={1}
              tooltip={"off"}
            />
            <div className={styles.annotatedImageContainer}>
              <div className={styles.annotatedImage}>
                <img
                  ref={imageRef}
                  src={imgSrc || undefined}
                  className={styles.image}
                />
                <canvas ref={canvasRef} className={styles.canvas}></canvas>
              </div>
            </div>
          </Card.Body>
          <Card.Footer className={styles.footer}>
            <span className="text-muted">
              {formatValue(new Date(values[index][0]))}
            </span>
            <JsonPopover json={values[index][1]} />
          </Card.Footer>
        </Card>
      );
    } else if (viewOption === "row") {
      return (
        <div className={styles.row}>
          {values.map((v, index) => (
            <Card
              key={v[0]}
              bg={"light"}
              className={[styles.card, "shadow-sm"].join(" ")}
            >
              <Card.Body>
                <div className={styles.annotatedImageContainer}>
                  <div className={styles.annotatedImage}>
                    <img
                      ref={imageRef}
                      src={imgSrc || undefined}
                      className={styles.image}
                    />
                    <canvas ref={canvasRef} className={styles.canvas}></canvas>
                  </div>
                </div>
              </Card.Body>
              <Card.Footer className={styles.footer}>
                <span className="text-muted">
                  {formatValue(new Date(values[index][0]))}
                </span>
                <JsonPopover json={values[index][1]} />
              </Card.Footer>
            </Card>
          ))}
        </div>
      );
    } else {
      return null;
    }
  };
}
