/* eslint-disable no-console */
import * as React from "react";
import { Card } from "./Card";
import { SingleElementVisualizerProps } from "../../../registry/visualization";
import { Image } from "../../../../genproto/farm_ng_proto/tractor/v1/image";
import { useEffect, useState } from "react";
import { LayoutOptions, LayoutVisualizerComponent } from "./Layout";
import styles from "./Image.module.scss";

const ImageElement: React.FC<SingleElementVisualizerProps<Image>> = ({
  value: [timestamp, value],
  resources
}) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async (): Promise<void> => {
      const resource = value.resource;
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

  return (
    <Card json={value} timestamp={timestamp}>
      <img src={imgSrc || undefined} className={styles.image} />
    </Card>
  );
};

export const ImageVisualizer = {
  id: "Image",
  types: ["type.googleapis.com/farm_ng_proto.tractor.v1.Image"],
  options: LayoutOptions,
  Component: LayoutVisualizerComponent(ImageElement),
  Element: ImageElement
};
