import * as React from "react";
import { Vec2 } from "../../../genproto/farm_ng_proto/tractor/v1/geometry";
import { buffer, TimestampedEventVector } from "../../stores/buffer";
import styles from "./Stream.module.scss";
import { Vec2SummaryVisualizer } from "./visualizers/Vec2SummaryVisualizer";
// import { EventVector } from "./EventVector";

interface IProps {
  id: string;
}

export const Stream: React.FC<IProps> = ({ id }) => {
  const values = buffer[id];
  return (
    <div className={styles.stream}>
      <h6>{id}</h6>
      <Vec2SummaryVisualizer values={values as TimestampedEventVector<Vec2>} />
    </div>
  );
};
