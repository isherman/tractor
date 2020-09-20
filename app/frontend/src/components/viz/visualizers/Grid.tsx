import * as React from "react";
import { useState } from "react";
import { EventType } from "../../../registry/events";
import {
  SingleElementVisualizerProps,
  VisualizerProps
} from "../../../registry/visualization";

const defaultPageSize = 12;

interface IProps<T extends EventType> {
  element: React.FC<SingleElementVisualizerProps<T>>;
  pageSize?: number;
}
export type GridProps<T extends EventType> = IProps<T> & VisualizerProps<T>;

export const Grid = <T extends EventType>(
  props: GridProps<T>
): React.ReactElement<GridProps<T>> => {
  const { element: Component, values } = props;
  const pageSize = props.pageSize || defaultPageSize;

  const [page, setPage] = useState(0);
  const decrementPage = (): void => setPage((p) => (p > 0 ? p - 1 : p));
  const incrementPage = (): void =>
    setPage((p) => (p < values.length / pageSize - 1 ? p + 1 : p));

  return (
    <div>
      <button onClick={decrementPage}>-</button>
      <button onClick={incrementPage}>+</button>
      {values.slice(page * pageSize, (page + 1) * pageSize).map((v) => (
        <Component key={v[0]} value={v} {...props} />
      ))}
    </div>
  );
};
