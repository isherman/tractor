/* eslint-disable no-console */
import * as React from "react";
import { useState } from "react";
import { useStores } from "../../hooks/useStores";
import { Button, Form } from "react-bootstrap";
import { EventLogEntry } from "../../stores/ProgramsStore";
import { Event as BusAnyEvent } from "../../../genproto/farm_ng_proto/tractor/v1/io";
import {
  CalibrateBaseToCameraConfiguration,
  CalibrateBaseToCameraConfiguration as Configuration,
  CalibrateBaseToCameraStatus as Status
} from "../../../genproto/farm_ng_proto/tractor/v1/calibrate_base_to_camera";
import { CalibrateBaseToCameraConfigurationVisualizer } from "../scope/visualizers/CalibrateBaseToCameraConfiguration";
import { ProgramProps } from "../../registry/programs";

const programId = "calibrate_base_to_camera";

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
      "type.googleapis.com/farm_ng_proto.tractor.v1.CalibrateBaseToCameraConfiguration",
      `${programId}/configure`,
      Configuration.encode(
        Configuration.fromPartial(configuration || {})
      ).finish()
    );
  };

  if (inputRequired && !configuration) {
    setConfiguration(inputRequired);
  }

  return (
    <Form onSubmit={handleConfigurationSubmit}>
      <CalibrateBaseToCameraConfigurationVisualizer.Form
        initialValue={
          configuration || CalibrateBaseToCameraConfiguration.fromPartial({})
        }
        onChange={(updated) => setConfiguration(updated)}
      />
      <Button variant="primary" type="submit">
        Submit
      </Button>
    </Form>
  );
};

export const CalibrateBaseToCameraProgram = {
  programIds: [programId] as const,
  eventLogPredicate: (e: BusAnyEvent) => e.name.startsWith(`${programId}/`),
  inputRequired: (e: EventLogEntry) =>
    (e.name.startsWith(`${programId}/status`) &&
      e.typeUrl.endsWith("CalibrateBaseToCameraStatus") &&
      (e.event as Status).inputRequiredConfiguration) ||
    null,
  Component
};
