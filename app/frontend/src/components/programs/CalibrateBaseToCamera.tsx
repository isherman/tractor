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
  CalibrateBaseToCameraConfiguration,
  CalibrateBaseToCameraConfiguration as Configuration,
  CalibrateBaseToCameraStatus as Status
} from "../../../genproto/farm_ng_proto/tractor/v1/calibrate_base_to_camera";

import { toJS } from "mobx";
import { CalibrateBaseToCameraConfigurationVisualizer } from "../scope/visualizers/CalibrateBaseToCameraConfiguration";

const programId = "calibrate_base_to_camera";

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
      "type.googleapis.com/farm_ng_proto.tractor.v1.CalibrateBaseToCameraConfiguration",
      `${programId}/configure`,
      Configuration.encode(
        Configuration.fromPartial(configuration || {})
      ).finish()
    );
  };

  const configurationForm = (
    <Collapse in={Boolean(configuration)}>
      <div>
        <ProgramForm>
          <Form onSubmit={handleConfigurationSubmit}>
            <CalibrateBaseToCameraConfigurationVisualizer.Form
              initialValue={
                configuration ||
                CalibrateBaseToCameraConfiguration.fromPartial({})
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
  );

  return useObserver(() => {
    const requestedConfiguration =
      store.runningProgram &&
      store.latestEvent &&
      store.latestEvent.name.startsWith(`${programId}/status`) &&
      store.latestEvent.typeUrl.endsWith("CalibrateBaseToCameraStatus")
        ? (store.latestEvent.event as Status).inputRequiredConfiguration
        : null;

    if (requestedConfiguration && !configuration) {
      setConfiguration(toJS(requestedConfiguration));
    }

    return (
      <div className={commonStyles.programDetail}>
        {configurationForm}
        <ProgramLogVisualizer
          eventLog={store.eventLog}
          selectedEntry={store.selectedEntry}
          onSelectEntry={(e) => (store.selectedEntry = e)}
          visualizer={store.visualizer?.Element}
          resources={store.resourceArchive}
        />
      </div>
    );
  });
};

export class CalibrateBaseToCamera implements ProgramUI {
  static id: ProgramId = programId;
  programIds = [programId] as const;
  component = Component;
}
