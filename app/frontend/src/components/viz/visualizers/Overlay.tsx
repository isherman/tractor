import * as React from "react";
import { useState } from "react";
import RangeSlider from "react-bootstrap-range-slider";
import { RangeSliderProps } from "react-bootstrap-range-slider";
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
): React.ReactElement<OverlayProps<T>> => {
  const { element: Component, values } = props;

  const [index, setIndex] = useState(0);
  const value = values[index];
  const handleChange: RangeSliderProps["onChange"] = (_, v) => setIndex(v);

  return (
    <div>
      <RangeSlider
        value={index}
        onChange={handleChange}
        min={0}
        max={values.length - 1}
        step={1}
        tooltip={"off"}
      />
      <Component value={value} {...props} />
    </div>
  );
};
