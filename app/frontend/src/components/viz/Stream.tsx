import * as React from "react";
import styles from "./Stream.module.scss";
import { EventVector } from "./EventVector";

export const Stream: React.FC = () => {
  return (
    <div className={styles.stream}>
      <h6>tagName</h6>
      <EventVector />
    </div>
  );
};
