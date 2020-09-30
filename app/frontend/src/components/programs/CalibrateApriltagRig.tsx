import * as React from "react";
import { Event as BusAnyEvent } from "../../../genproto/farm_ng_proto/tractor/v1/io";
import { CalibrateApriltagRigConfiguration } from "../../../genproto/farm_ng_proto/tractor/v1/calibrate_apriltag_rig";

import { ProgramUI, ProgramId, ProgramUIProps } from "../../registry/programs";

export class CalibrateApriltagRig
  implements ProgramUI<CalibrateApriltagRigConfiguration> {
  static id: ProgramId = "calibrate-apriltag-rig";

  programIds = [
    "calibrate-apriltag-rig",
    "calibrate-apriltag-rig-playback"
  ] as const;

  eventLogPredicate = (anyEvent: BusAnyEvent): boolean =>
    anyEvent.name.startsWith("calibrator");

  configurator: React.FC<
    ProgramUIProps<CalibrateApriltagRigConfiguration>
  > = () => {
    return <h1>CalibrateApriltag Configurator</h1>;
  };
}
