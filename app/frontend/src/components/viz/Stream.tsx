import { useObserver } from "mobx-react-lite";
import * as React from "react";
import { TimestampedEventVector } from "../../types/common";
import { useStores } from "../../hooks/useStores";
import styles from "./Stream.module.scss";

interface IProps {
  panelId: string;
  name: string;
  values: TimestampedEventVector;
}

const throttle = (
  values: TimestampedEventVector,
  throttle: number
): TimestampedEventVector =>
  values.reduce<TimestampedEventVector>((acc, [t, v]) => {
    if (acc.length === 0 || t - acc[acc.length - 1][0] > throttle) {
      acc.push([t, v]);
    }
    return acc;
  }, []);

export const Stream: React.FC<IProps> = ({ panelId, name, values }) => {
  const { visualizationStore: store } = useStores();

  return useObserver(() => {
    const panel = store.panels.get(panelId);
    if (!panel) return null;
    const { visualizer, options } = panel;

    const filteredValues = throttle(
      values.slice(
        Math.floor(store.bufferRangeStart * values.length),
        Math.ceil(store.bufferRangeEnd * values.length)
      ),
      store.bufferThrottle
    );

    return (
      <div className={styles.stream}>
        <h4>{name}</h4>
        {React.createElement(visualizer.component, {
          values: filteredValues,
          options
        })}
      </div>
    );
  });
};
