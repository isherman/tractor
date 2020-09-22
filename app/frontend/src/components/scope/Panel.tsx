import * as React from "react";
import styles from "./Panel.module.scss";
import { PanelSidebar } from "./PanelSidebar";
import { PanelContent } from "./PanelContent";
import { useStores } from "../../hooks/useStores";
import { Button } from "react-bootstrap";
import { Icon } from "../Icon";

interface IProps {
  id: string;
}

export const Panel: React.FC<IProps> = ({ id }) => {
  const { visualizationStore: store } = useStores();

  const deletePanel = (): void => store.deletePanel(id);

  return (
    <div className={styles.panel}>
      <Button
        className={styles.removeButton}
        variant="light"
        onClick={deletePanel}
      >
        <Icon id="x" />
      </Button>
      <PanelSidebar id={id} />
      <PanelContent id={id} />
    </div>
  );
};
