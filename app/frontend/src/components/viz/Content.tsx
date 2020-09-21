import * as React from "react";
import styles from "./Content.module.scss";
import { Panel } from "./Panel";
import { useStores } from "../../hooks/useStores";
import { useObserver } from "mobx-react-lite";
import { Button } from "react-bootstrap";
import { Icon } from "../Icon";
export const Content: React.FC = () => {
  const { visualizationStore: store } = useStores();

  return useObserver(() => {
    if (Object.keys(store.buffer).length === 0) {
      return null;
    }
    const panels = Object.entries(
      Object.fromEntries(store.panels.entries())
    ).map(([_, p]) => <Panel key={p.id} id={p.id} />);

    return (
      <div className={styles.content}>
        {panels}
        <Button
          className={styles.addButton}
          variant="light"
          onClick={() => store.addPanel()}
        >
          <Icon id="plus" />
        </Button>
      </div>
    );
  });
};
