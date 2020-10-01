import * as React from "react";

import { ProgramUI, ProgramId } from "../../registry/programs";
import { ProgramLog } from "../ProgramLog";
import { useStores } from "../../hooks/useStores";
import { useObserver } from "mobx-react-lite";
import commonStyles from "./common.module.scss";
import { useEffect } from "react";

const Component: React.FC = () => {
  const { programsStore: store, visualizationStore } = useStores();
  useEffect(() => {
    store.eventLogPredicate = (e) => e.name.startsWith("calibrator/");
    return () => store.reset();
  }, []);

  return useObserver(() => {
    const visualizer = store.visualizer?.component;
    const selectedEvent = store.selectedEvent;
    return (
      <div className={commonStyles.programDetail}>
        <ProgramLog />
        <h1> CaptureCalibrationDataset </h1>
        {visualizer &&
          selectedEvent &&
          selectedEvent.stamp &&
          React.createElement(visualizer, {
            values: [[selectedEvent.stamp.getTime(), selectedEvent.event]],
            options: [
              { label: "view", options: ["overlay", "grid"], value: "overlay" }
            ],
            resources: visualizationStore.resourceArchive
          })}
      </div>
    );
  });
};

export class CaptureCalibrationDataset implements ProgramUI {
  static id: ProgramId = "capture-calibration-dataset";
  programIds = ["capture-calibration-dataset"] as const;
  component = Component;
}
