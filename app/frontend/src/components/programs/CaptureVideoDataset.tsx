import * as React from "react";
import { useStores } from "../../hooks/useStores";
import { EventLogEntry } from "../../stores/ProgramsStore";
import { Event as BusAnyEvent } from "../../../genproto/farm_ng_proto/tractor/v1/io";
import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import {
  CaptureVideoDatasetConfiguration,
  CaptureVideoDatasetConfiguration as Configuration,
  CaptureVideoDatasetStatus as Status
} from "../../../genproto/farm_ng_proto/tractor/v1/capture_video_dataset";
import { CaptureVideoDatasetConfigurationVisualizer } from "../scope/visualizers/CaptureVideoDatasetConfiguration";
import { ProgramProps } from "../../registry/programs";

const programId = "capture_video_dataset";

const Component: React.FC<ProgramProps<Configuration>> = ({
  inputRequired
}) => {
  const { programsStore: store } = useStores();
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

  if (inputRequired && !configuration) {
    setConfiguration(inputRequired);
  }

  return (
    <Form onSubmit={handleConfigurationSubmit}>
      <CaptureVideoDatasetConfigurationVisualizer.Form
        initialValue={
          configuration || CaptureVideoDatasetConfiguration.fromPartial({})
        }
        onChange={(updated) => setConfiguration(updated)}
      />
      <Button variant="primary" type="submit">
        Submit
      </Button>
    </Form>
  );
};

export const CaptureVideoDatasetProgram = {
  programIds: [programId] as const,
  eventLogPredicate: (e: BusAnyEvent) => e.name.startsWith(`${programId}/`),
  inputRequired: (e: EventLogEntry) =>
    (e.name.startsWith(`${programId}/status`) &&
      e.typeUrl.endsWith("CaptureVideoDatasetStatus") &&
      (e.event as Status).inputRequiredConfiguration) ||
    null,
  Component
};
