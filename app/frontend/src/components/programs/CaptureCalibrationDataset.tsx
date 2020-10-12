import * as React from "react";

import { useStores } from "../../hooks/useStores";
import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { Event as BusAnyEvent } from "../../../genproto/farm_ng_proto/tractor/v1/io";
import {
  CaptureCalibrationDatasetConfiguration,
  CaptureCalibrationDatasetConfiguration as Configuration,
  CaptureCalibrationDatasetStatus as Status
} from "../../../genproto/farm_ng_proto/tractor/v1/capture_calibration_dataset";
import { CaptureCalibrationDatasetConfigurationVisualizer } from "../scope/visualizers/CaptureCalibrationDatasetConfiguration";
import { ProgramProps } from "../../registry/programs";
import { DeserializedEvent } from "../../registry/events";

const programId = "capture_calibration_dataset";

const Component: React.FC<ProgramProps<Configuration>> = ({
  inputRequired
}) => {
  const { busClient } = useStores();
  const [configuration, setConfiguration] = useState<Configuration>();

  const handleConfigurationSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ): void => {
    e.preventDefault();
    busClient.send(
      "type.googleapis.com/farm_ng_proto.tractor.v1.CaptureCalibrationDatasetConfiguration",
      `${programId}/configure`,
      Configuration.encode(Configuration.fromJSON(configuration)).finish()
    );
  };

  if (inputRequired && !configuration) {
    setConfiguration(inputRequired);
  }

  return (
    <Form onSubmit={handleConfigurationSubmit}>
      <CaptureCalibrationDatasetConfigurationVisualizer.Form
        initialValue={
          configuration ||
          CaptureCalibrationDatasetConfiguration.fromPartial({})
        }
        onChange={(updated) => setConfiguration(updated)}
      />
      <Button variant="primary" type="submit">
        Submit
      </Button>
    </Form>
  );
};

export const CaptureCalibrationDatasetProgram = {
  programIds: [programId] as const,
  eventLogPredicate: (e: BusAnyEvent) =>
    e.name.startsWith(`${programId}/`) || e.name.startsWith("calibrator/"),
  inputRequired: (e: DeserializedEvent) =>
    (e.name.startsWith(`${programId}/status`) &&
      e.typeUrl.endsWith("CaptureCalibrationDatasetStatus") &&
      (e.data as Status).inputRequiredConfiguration) ||
    null,
  Component
};
