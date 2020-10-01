import { useObserver } from "mobx-react-lite";
import * as React from "react";
import { useEffect } from "react";
import { useStores } from "../../hooks/useStores";
import { ProgramUI, ProgramId } from "../../registry/programs";
import { ProgramLogVisualizer } from "./ProgramLogVisualizer";
import commonStyles from "./common.module.scss";

const Component: React.FC = () => {
  const { programsStore: store } = useStores();
  useEffect(() => {
    store.eventLogPredicate = (e) => e.name.startsWith("calibrator/");
    return () => store.resetEventLog();
  }, []);

  return useObserver(() => {
    return (
      <div className={commonStyles.programDetail}>
        <ProgramLogVisualizer
          eventLog={store.eventLog}
          selectedEntry={store.selectedEntry}
          onSelectEntry={(e) => (store.selectedEntry = e)}
          visualizer={store.visualizer?.component || null}
          resources={store.resourceArchive}
        />
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
