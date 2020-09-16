import * as React from "react";
import styles from "./PanelContent.module.scss";
import { Stream } from "./Stream";
import { useStores } from "../../hooks/useStores";
import { useObserver } from "mobx-react-lite";

interface IProps {
  id: string;
}

export const PanelContent: React.FC<IProps> = ({ id }) => {
  const { visualizationStore: store } = useStores();

  return useObserver(() => {
    const panel = store.panels.get(id);
    if (!panel) return null;
    const filter = new RegExp(panel.tagFilter);
    const streams = Object.entries(store.buffer[panel.eventType] || {})
      .filter(([name, _]) => filter.test(name))
      .map(([name, values]) => (
        <Stream key={name} panelId={id} name={name} values={values} />
      ));
    return <div className={styles.panelContent}>{streams}</div>;
  });
};
