import * as React from "react";

import { ProgramUI, ProgramId } from "../../registry/programs";
import { ProgramLog } from "../ProgramLog";
import { useStores } from "../../hooks/useStores";
import { useObserver } from "mobx-react-lite";
import commonStyles from "./common.module.scss";
import { useEffect, useState } from "react";
import { Button, Collapse, Form } from "react-bootstrap";
import {
  CaptureCalibrationDatasetConfiguration as Configuration,
  CaptureCalibrationDatasetStatus as Status,
  CaptureCalibrationDatasetStatus_InputRequired as InputRequired
} from "../../../genproto/farm_ng_proto/tractor/v1/capture_calibration_dataset";

const Component: React.FC = () => {
  const { programsStore: store, visualizationStore } = useStores();
  useEffect(() => {
    store.eventLogPredicate = (e) => e.name.startsWith("calibrator/");
    return () => store.resetEventLog();
  }, []);

  const [configuration, setConfiguration] = useState<Configuration>({
    numFrames: 0,
    name: ""
  });

  const handleConfigurationChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setConfiguration({ ...configuration, [e.target.name]: e.target.value });
  };

  const handleConfigurationSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ): void => {
    e.preventDefault();
    store.busClient.send(
      "type.googleapis.com/farm_ng_proto.tractor.v1.CaptureCalibrationDatasetConfiguration",
      "calibrator/configure",
      Configuration.encode(Configuration.fromJSON(configuration)).finish()
    );
  };

  return useObserver(() => {
    const visualizer = store.visualizer?.component;
    const configurationRequired =
      store.runningProgram &&
      store.latestEvent &&
      store.latestEvent.name.startsWith("calibrator/status") &&
      store.latestEvent.typeUrl.endsWith("CaptureCalibrationDatasetStatus") &&
      (store.latestEvent.event as Status).inputRequired >
        InputRequired.INPUT_REQUIRED_NONE;
    const selectedEvent = store.selectedEvent;

    return (
      <div className={commonStyles.programDetail}>
        <Collapse in={configurationRequired}>
          <Form onSubmit={handleConfigurationSubmit}>
            <Form.Group controlId="numFrames">
              <Form.Label>Number of Frames</Form.Label>
              <Form.Control
                type="number"
                defaultValue={16}
                onChange={handleConfigurationChange}
              />
            </Form.Group>

            <Form.Group controlId="formBasicPassword">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="default"
                onChange={handleConfigurationChange}
              />
              <Form.Text className="text-muted">
                A name for the dataset, used to name the output archive.
              </Form.Text>
            </Form.Group>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </Collapse>

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

export class CaptureCalibrationDataset implements ProgramUI {
  static id: ProgramId = "capture-calibration-dataset";
  programIds = ["capture-calibration-dataset"] as const;
  component = Component;
}
