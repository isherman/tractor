import * as React from "react";
import styles from "./Panel.module.scss";
import { PanelSidebar } from "./PanelSidebar";
import { PanelContent } from "./PanelContent";
export const Panel: React.FC = () => {
  return (
    <div className={styles.panel}>
      <PanelSidebar />
      <PanelContent />
    </div>
  );
};
