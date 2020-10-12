import * as React from "react";
import { useResizeObserver } from "../../hooks/useResizeObserver";
import { ResourceArchive } from "../../models/ResourceArchive";
import { DeserializedEvent, EventType } from "../../registry/events";
import { SingleElementVisualizerProps } from "../../registry/visualization";
import { ProgramLog } from "./ProgramLog";
import styles from "./ProgramLogVisualizer.module.scss";

interface IProps {
  eventLog: DeserializedEvent[];
  selectedEntry: number | null;
  onSelectEntry: (index: number | null) => void;
  visualizer?: React.FC<SingleElementVisualizerProps<EventType>>;
  resources: ResourceArchive;
}

export const ProgramLogVisualizer: React.FC<IProps> = (props) => {
  const { eventLog, selectedEntry, visualizer, resources } = props;
  const selectedEvent = selectedEntry ? eventLog[selectedEntry] : null;
  const [, containerRef, resizeObservation] = useResizeObserver();
  return (
    <div className={styles.programLogVisualizer} ref={containerRef}>
      <div className={styles.programLog}>
        <ProgramLog
          {...props}
          height={resizeObservation?.contentRect.height || 600}
        />
      </div>
      {visualizer && selectedEvent && selectedEvent.stamp && (
        <div className={styles.programVisualizer}>
          {React.createElement(visualizer, {
            value: [selectedEvent.stamp.getTime(), selectedEvent.data],
            options: [{ label: "", options: [], value: "overlay" }],
            resources
          })}
        </div>
      )}
    </div>
  );
};
