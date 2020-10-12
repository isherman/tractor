import * as React from "react";

import { ProgramUI, ProgramId } from "../../registry/programs";
import { useStores } from "../../hooks/useStores";
import { useObserver } from "mobx-react-lite";
import commonStyles from "./common.module.scss";
import { useEffect, useState } from "react";
import { Button, Collapse, Form } from "react-bootstrap";
import {
  CaptureVideoDatasetConfiguration,
  CaptureVideoDatasetConfiguration as Configuration,
  CaptureVideoDatasetStatus as Status
} from "../../../genproto/farm_ng_proto/tractor/v1/capture_video_dataset";
import { ProgramLogVisualizer } from "./ProgramLogVisualizer";
import { ProgramForm } from "./ProgramForm";
import { CaptureVideoDatasetConfigurationVisualizer } from "../scope/visualizers/CaptureVideoDatasetConfiguration";

const programId = "capture_video_dataset";

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
      "type.googleapis.com/farm_ng_proto.tractor.v1.CaptureVideoDatasetConfiguration",
      `${programId}/configure`,
      Configuration.encode(Configuration.fromJSON(configuration)).finish()
    );
  };

  return useObserver(() => {
    const requestedConfiguration =
      store.runningProgram &&
      store.latestEvent &&
      store.latestEvent.name.startsWith(`${programId}/status`) &&
      store.latestEvent.typeUrl.endsWith("CaptureVideoDatasetStatus")
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
                <CaptureVideoDatasetConfigurationVisualizer.Form
                  initialValue={
                    configuration ||
                    CaptureVideoDatasetConfiguration.fromPartial({})
                  }
                  onChange={(updated) => setConfiguration(updated)}
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
          visualizer={store.visualizer?.Element}
          resources={store.resourceArchive}
        />
      </div>
    );
  });
};

export class CaptureVideoDataset implements ProgramUI {
  static id: ProgramId = programId;
  programIds = [programId] as const;
  component = Component;
}
