import * as React from "react";
import styles from "./Content.module.scss";
import { Panel } from "./Panel";
import { Button } from "react-bootstrap";
export const Content: React.FC = () => {
  return (
    <div className={styles.content}>
      <Panel />
      <Button>+</Button>
    </div>
  );
};
