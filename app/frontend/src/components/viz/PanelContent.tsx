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
    const streams = (store.buffer[panel.eventType] || [])
      .filter((stream) => filter.test(stream.name))
      .map((stream) => (
        <Stream key={stream.name} panelId={id} stream={stream} />
      ));
    return <div className={styles.panelContent}>{streams}</div>;
  });
};
