/* eslint-disable no-console */
import { useObserver } from "mobx-react-lite";
import * as React from "react";
import { useEffect, useState } from "react";
import { useStores } from "../../hooks/useStores";
import { ProgramUI, ProgramId } from "../../registry/programs";
import { ProgramLogVisualizer } from "./ProgramLogVisualizer";
import commonStyles from "./common.module.scss";
import { Button, Collapse, Form } from "react-bootstrap";
import { ProgramForm } from "./ProgramForm";
import {
  CalibrateApriltagRigConfiguration,
  CalibrateApriltagRigConfiguration as Configuration,
  CalibrateApriltagRigStatus as Status
} from "../../../genproto/farm_ng_proto/tractor/v1/calibrate_apriltag_rig";
import { CalibrateApriltagRigConfigurationForm } from "../scope/visualizers/CalibrateApriltagRigConfiguration";

const programId = "calibrate_apriltag_rig";

const Component: React.FC = () => {
  const { programsStore: store } = useStores();
  useEffect(() => {
    store.eventLogPredicate = (e) => e.name.startsWith(`${programId}/`);
    return () => store.resetEventLog();
  }, []);

  const [configuration, setConfiguration] = useState<Configuration | null>(
    null
  );

  const handleConfigurationSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ): void => {
    e.preventDefault();
    store.busClient.send(
      "type.googleapis.com/farm_ng_proto.tractor.v1.CalibrateApriltagRigConfiguration",
      `${programId}/configure`,
      Configuration.encode(Configuration.fromJSON(configuration)).finish()
    );
  };

  return useObserver(() => {
    const requestedConfiguration =
      store.runningProgram &&
      store.latestEvent &&
      store.latestEvent.name.startsWith(`${programId}/status`) &&
      store.latestEvent.typeUrl.endsWith("CalibrateApriltagRigStatus")
        ? (store.latestEvent.event as Status).inputRequiredConfiguration
        : null;

    if (requestedConfiguration && !configuration) {
      setConfiguration(requestedConfiguration);
    }

    return (
      <div className={commonStyles.programDetail}>
        <Collapse in={Boolean(requestedConfiguration)}>
          <div>
            <ProgramForm>
              <Form onSubmit={handleConfigurationSubmit}>
                <CalibrateApriltagRigConfigurationForm
                  initialValue={
                    configuration ||
                    CalibrateApriltagRigConfiguration.fromPartial({})
                  }
                  onUpdate={(updated) => setConfiguration(updated)}
                />
                <Button variant="primary" type="submit">
                  Submit
                </Button>
              </Form>
            </ProgramForm>
          </div>
        </Collapse>

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
  static id: ProgramId = programId;
  programIds = [programId, `${programId}-playback`] as const;
  component = Component;
}
