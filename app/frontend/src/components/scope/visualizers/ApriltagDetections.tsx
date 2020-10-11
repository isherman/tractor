/* eslint-disable no-console */
import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Card } from "./Card";
import styles from "./ApriltagDetections.module.scss";
import { SingleElementVisualizerProps } from "../../../registry/visualization";
import { ApriltagDetections } from "../../../../genproto/farm_ng_proto/tractor/v1/apriltag";
import { autorun } from "mobx";
import { drawAprilTagDetections } from "../../../utils/drawApriltagDetections";
import { LayoutOptions, LayoutVisualizerComponent } from "./Layout";

const ApriltagDetectionsElement: React.FC<SingleElementVisualizerProps<
  ApriltagDetections
>> = ({ value: [timestamp, value], resources }) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const fetchImage = async (): Promise<void> => {
      const resource = value.image?.resource;
      if (resources && resource) {
        try {
          setImgSrc(await resources.getDataUrl(resource.path));
        } catch (e) {
          console.error(`Error loading resource ${resource.path}: ${e}`);
        }
      }
    };
    fetchImage();
  }, [value, resources]);

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
          value.image?.cameraModel || {};

        drawAprilTagDetections(
          value,
          ctx,
          canvas,
          width && height ? { width, height } : undefined,
          2
        );
      }),
    [canvasRef, value, imgSrc]
  );

  return (
    <Card json={value} timestamp={timestamp}>
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
    </Card>
  );
};

export const ApriltagDetectionsVisualizer = {
  id: "apriltagDetections",
  types: ["type.googleapis.com/farm_ng_proto.tractor.v1.ApriltagDetections"],
  options: LayoutOptions,
  Component: LayoutVisualizerComponent(ApriltagDetectionsElement),
  Element: ApriltagDetectionsElement
};
