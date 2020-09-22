import * as React from "react";
import { useState } from "react";
import RangeSlider from "react-bootstrap-range-slider";
import { EventType } from "../../../registry/events";
import {
  SingleElementVisualizerProps,
  VisualizerProps
} from "../../../registry/visualization";

export interface IProps<T extends EventType> {
  element: React.FC<SingleElementVisualizerProps<T>>;
}
export type OverlayProps<T extends EventType> = IProps<T> & VisualizerProps<T>;

export const Overlay = <T extends EventType>(
  props: OverlayProps<T>
): React.ReactElement<OverlayProps<T>> | null => {
  const { element: Component, values } = props;

  const [index, setIndex] = useState(0);
  const value = values[index];

  // An external change (e.g. to the throttle) made the current index invalid.
  if (!value) {
    setIndex(0);
    return null;
  }

  return (
    <div>
      <RangeSlider
        value={index}
        onChange={(_, v) => setIndex(v)}
        min={0}
        max={values.length - 1}
        step={1}
        tooltip={"off"}
      />
      <Component value={value} {...props} />
    </div>
  );
};
