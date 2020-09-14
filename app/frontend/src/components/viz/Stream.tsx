import { useObserver } from "mobx-react-lite";
import * as React from "react";
import { TimestampedEventVector } from "../../data/registry";
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

    const values = stream.values
      .slice(
        Math.floor(store.bufferRangeStart * stream.values.length),
        Math.ceil(store.bufferRangeEnd * stream.values.length)
      )
      .reduce<TimestampedEventVector>((acc, [t, v]) => {
        if (
          acc.length === 0 ||
          t - acc[acc.length - 1][0] > store.bufferThrottle
        ) {
          acc.push([t, v]);
        }
        return acc;
      }, []);

    return (
      <div className={styles.stream}>
        <h4>{stream.name}</h4>
        {React.createElement(visualizer.component, {
          values,
          options
        })}
      </div>
    );
  });
};
