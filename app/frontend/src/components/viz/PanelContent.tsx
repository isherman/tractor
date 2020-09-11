import * as React from "react";
import styles from "./PanelContent.module.scss";
import { Stream } from "./Stream";
export const PanelContent: React.FC = () => {
  return (
    <div className={styles.panelContent}>
      <Stream />
      <Stream />
      <Stream />
    </div>
  );
};
