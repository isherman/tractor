import * as React from "react";
import styles from "./PanelSidebar.module.scss";
import { Button } from "react-bootstrap";
export const PanelSidebar: React.FC = () => {
  return (
    <div className={styles.panelSidebar}>
      <Button>Data Type</Button>
      <Button>Tags</Button>
      <Button>Visualization Type</Button>
      <Button>Visualization Option A</Button>
      <Button>Visualization Option B</Button>
    </div>
  );
};
