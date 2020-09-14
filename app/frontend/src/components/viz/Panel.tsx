import * as React from "react";
import styles from "./Panel.module.scss";
import { PanelSidebar } from "./PanelSidebar";
import { PanelContent } from "./PanelContent";
import { useObserver } from "mobx-react-lite";

interface IProps {
  id: string;
}

export const Panel: React.FC<IProps> = ({ id }) => {
  return useObserver(() => {
    return (
      <div className={styles.panel}>
        <PanelSidebar id={id} />
        <PanelContent id={id} />
      </div>
    );
  });
};
