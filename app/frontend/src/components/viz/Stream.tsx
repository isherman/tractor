import { useObserver } from "mobx-react-lite";
import * as React from "react";
import { useStores } from "../../hooks/useStores";
import { NamedTimestampedEventVector } from "../../stores/buffer";
import styles from "./Stream.module.scss";

interface IProps {
  panelId: string;
  stream: NamedTimestampedEventVector;
}

export const Stream: React.FC<IProps> = ({ panelId, stream }) => {
  const { visualizationStore: store } = useStores();

  return useObserver(() => {
    const panel = store.panels.get(panelId);
    if (!panel) return null;
    const { visualizer, options } = panel;

    return (
      <div className={styles.stream}>
        <h4>{stream.name}</h4>
        {React.createElement(visualizer.component, {
          values: stream.values,
          options: options
        })}
      </div>
    );
  });
};
