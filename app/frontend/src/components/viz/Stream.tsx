import { useObserver } from "mobx-react-lite";
import * as React from "react";
// import { Vec2 } from "../../../genproto/farm_ng_proto/tractor/v1/geometry";
import { useStores } from "../../hooks/useStores";
import { buffer } from "../../stores/buffer";
import styles from "./Stream.module.scss";
// import { Vec2SummaryVisualizer } from "./visualizers/Vec2SummaryVisualizer";
// import { EventVector } from "./EventVector";

interface IProps {
  panelId: string;
  name: string;
}

export const Stream: React.FC<IProps> = ({ panelId, name }) => {
  const { visualizationStore: store } = useStores();
  const values = buffer[name];

  return useObserver(() => {
    const panel = store.panels.get(panelId);
    if (!panel) return null;
    const { visualizer, options } = panel;

    return (
      <div className={styles.stream}>
        <h6>{name}</h6>
        {React.createElement(visualizer.component, {
          values: values,
          options: options
        })}
      </div>
    );
  });
};
