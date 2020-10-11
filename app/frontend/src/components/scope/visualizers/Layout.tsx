import * as React from "react";
import { EventType } from "../../../registry/events";
import {
  SingleElementVisualizerProps,
  VisualizerProps
} from "../../../registry/visualization";
import { Grid, GridProps } from "./Grid";
import { Overlay, OverlayProps } from "./Overlay";

interface IProps {
  view: "grid" | "overlay";
}

type LayoutProps<T extends EventType> = IProps &
  (GridProps<T> | OverlayProps<T>);

export const Layout = <T extends EventType>(
  props: LayoutProps<T>
): React.ReactElement<LayoutProps<T>> => {
  return props.view === "grid" ? <Grid {...props} /> : <Overlay {...props} />;
};

export const LayoutVisualizerComponent = <T extends EventType>(
  Element: React.FC<SingleElementVisualizerProps<T>>
): React.FC<VisualizerProps<T>> => (props) => {
  const view = props.options[0].value as "overlay" | "grid";
  return <Layout view={view} Element={Element} {...props} />;
};

export const LayoutOptions = [{ label: "view", options: ["overlay", "grid"] }];
