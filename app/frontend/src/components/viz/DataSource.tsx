import * as React from "react";
import styles from "./DataSource.module.scss";
import { Button, ButtonGroup } from "react-bootstrap";

export const DataSource: React.FC = () => {
  return (
    <div className={styles.dataSource}>
      <ButtonGroup aria-label="Basic example">
        <Button>Live</Button>
        <Button>Log</Button>
        <Button>Debug</Button>
      </ButtonGroup>
    </div>
  );
};
