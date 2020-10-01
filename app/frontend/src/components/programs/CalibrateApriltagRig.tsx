/* eslint-disable no-console */
import { useObserver } from "mobx-react-lite";
import * as React from "react";
import { useEffect } from "react";
import { Button } from "react-bootstrap";
import { useStores } from "../../hooks/useStores";
import { ProgramUI, ProgramId } from "../../registry/programs";
import { ProgramLog } from "../ProgramLog";
import commonStyles from "./common.module.scss";

const Component: React.FC = () => {
  const { programsStore: store, visualizationStore } = useStores();
  useEffect(() => {
    store.eventLogPredicate = (e) => e.name.startsWith("calibrator/");
    store.inputRequiredPredicate = (e) =>
      e.name.startsWith("calibrator/tracking_camera/front/apriltags");
    return () => store.reset();
  }, []);

  return useObserver(() => {
    const visualizer = store.visualizer?.component;
    const inputRequired = store.inputRequired;
    const selectedEvent = store.selectedEvent;
    const clearInputRequired = (): void => {
      store.inputRequired = null;
    };

    return (
      <div className={commonStyles.programDetail}>
        <ProgramLog />
        {inputRequired && (
          <Button onClick={clearInputRequired}>
            {store.inputRequired?.name || "?"}
          </Button>
        )}
        {!inputRequired &&
          visualizer &&
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

export class CalibrateApriltagRig implements ProgramUI {
  static id: ProgramId = "calibrate-apriltag-rig";
  programIds = [
    "calibrate-apriltag-rig",
    "calibrate-apriltag-rig-playback"
  ] as const;
  component = Component;
}
