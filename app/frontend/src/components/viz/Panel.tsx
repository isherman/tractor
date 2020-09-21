import * as React from "react";
import styles from "./Panel.module.scss";
import { PanelSidebar } from "./PanelSidebar";
import { PanelContent } from "./PanelContent";
import { useObserver } from "mobx-react-lite";
import { useStores } from "../../hooks/useStores";
import { Button } from "react-bootstrap";
import { Icon } from "../Icon";

interface IProps {
  id: string;
}

export const Panel: React.FC<IProps> = ({ id }) => {
  const { visualizationStore: store } = useStores();

  return useObserver(() => {
    const panel = store.panels.get(id);
    if (!panel) return null;

    const removePanel = (): void => {
      store.deletePanel(id);
    };

    return (
      <div className={styles.panel}>
        <Button
          className={styles.removeButton}
          variant="light"
          onClick={removePanel}
        >
          <Icon id="x" />
        </Button>
        <PanelSidebar id={id} />
        <PanelContent id={id} />
      </div>
    );
  });
};
