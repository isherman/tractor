import * as React from "react";
import styles from "./Buffer.module.scss";
import { Button } from "react-bootstrap";

export const Buffer: React.FC = () => {
  return (
    <div className={styles.buffer}>
      <Button>BufferStart</Button>
      <Button>Start</Button>
      <Button>Current</Button>
      <Button>End</Button>
      <Button>BufferEnd</Button>
      <Button>Rate</Button>
      <Button>BufferSize</Button>
    </div>
  );
};
