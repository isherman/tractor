/* eslint-disable no-console */
import * as React from "react";
import { useState } from "react";
import { useStores } from "../../hooks/useStores";
import { Button, Form } from "react-bootstrap";
import { Event as BusEvent } from "../../../genproto/farm_ng_proto/tractor/v1/io";
import {
  CalibrateApriltagRigConfiguration,
  CalibrateApriltagRigConfiguration as Configuration,
  CalibrateApriltagRigStatus as Status
} from "../../../genproto/farm_ng_proto/tractor/v1/calibrate_apriltag_rig";
import { CalibrateApriltagRigConfigurationVisualizer } from "../scope/visualizers/CalibrateApriltagRigConfiguration";
import { ProgramProps } from "../../registry/programs";
import { decodeAnyEvent } from "../../models/decodeAnyEvent";

const programId = "calibrate_apriltag_rig";

const Component: React.FC<ProgramProps<Configuration>> = ({
  inputRequired
}) => {
  const { busClient } = useStores();
  const [configuration, setConfiguration] = useState<Configuration>();

  const handleConfigurationSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ): void => {
    e.preventDefault();
    // TODO: Provide a better API to busClient.send
    busClient.send(
      "type.googleapis.com/farm_ng_proto.tractor.v1.CalibrateApriltagRigConfiguration",
      `${programId}/configure`,
      Configuration.encode(Configuration.fromJSON(configuration)).finish()
    );
  };

  if (inputRequired && !configuration) {
    setConfiguration(inputRequired);
  }

  return (
    <Form onSubmit={handleConfigurationSubmit}>
      <CalibrateApriltagRigConfigurationVisualizer.Form
        initialValue={
          configuration || CalibrateApriltagRigConfiguration.fromPartial({})
        }
        onChange={(updated) => setConfiguration(updated)}
      />
      <Button variant="primary" type="submit">
        Submit
      </Button>
    </Form>
  );
};

export const CalibrateApriltagRigProgram = {
  programIds: [programId, `${programId}-playback`] as const,
  eventLogPredicate: (e: BusEvent) => e.name.startsWith(`${programId}/`),
  inputRequired: (e: BusEvent) => {
    if (!e.name.startsWith(`${programId}/status`)) {
      return null;
    }
    const data = decodeAnyEvent(e);
    if (!data) {
      console.error(`Could not decode bus event`, e);
      return null;
    }
    return (data as Status).inputRequiredConfiguration || null;
  },
  Component
};
