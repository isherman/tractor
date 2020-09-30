import * as React from "react";
import { Event as BusAnyEvent } from "../../../genproto/farm_ng_proto/tractor/v1/io";
import { CaptureCalibrationDatasetConfiguration } from "../../../genproto/farm_ng_proto/tractor/v1/capture_calibration_dataset";

import { ProgramUI, ProgramId, ProgramUIProps } from "../../registry/programs";

export class CaptureCalibrationDataset
  implements ProgramUI<CaptureCalibrationDatasetConfiguration> {
  static id: ProgramId = "capture-calibration-dataset";

  programIds = ["capture-calibration-dataset"] as const;

  eventLogPredicate = (anyEvent: BusAnyEvent): boolean =>
    anyEvent.name.startsWith("calibrator");

  configurator: React.FC<
    ProgramUIProps<CaptureCalibrationDatasetConfiguration>
  > = () => {
    return <h1>CaptureCalibrationDataset Configurator</h1>;
  };
}
