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
    const streams = store.panels
      .get(id)
      ?.visibleStreams.map((_) => <Stream key={_} id={_} />);
    return <div className={styles.panelContent}>{streams}</div>;
  });
};
