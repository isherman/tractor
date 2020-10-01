/* eslint-disable no-console */
import { useObserver } from "mobx-react-lite";
import * as React from "react";
import { useEffect } from "react";
import { useStores } from "../../hooks/useStores";
import { ProgramUI, ProgramId } from "../../registry/programs";
import { ProgramLog } from "../ProgramLog";
import commonStyles from "./common.module.scss";

const Component: React.FC = () => {
  const { programsStore: store, visualizationStore } = useStores();
  useEffect(() => {
    store.eventLogPredicate = (e) => e.name.startsWith("calibrator/");
    return () => store.resetEventLog();
  }, []);

  return useObserver(() => {
    const visualizer = store.visualizer?.component;
    const selectedEvent = store.selectedEvent;

    return (
      <div className={commonStyles.programDetail}>
        <div className={commonStyles.programLog}>
          <ProgramLog />
          {visualizer &&
            selectedEvent &&
            selectedEvent.stamp &&
            React.createElement(visualizer, {
              values: [[selectedEvent.stamp.getTime(), selectedEvent.event]],
              options: [
                {
                  label: "view",
                  options: ["overlay", "grid"],
                  value: "overlay"
                }
              ],
              resources: visualizationStore.resourceArchive
            })}
        </div>
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
