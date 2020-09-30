import { Event as BusAnyEvent } from "../../genproto/farm_ng_proto/tractor/v1/io";
import { CaptureCalibrationDataset } from "../components/programs/CaptureCalibrationDataset";
import { CalibrateApriltagRig } from "../components/programs/CalibrateApriltagRig";
import { EventType } from "./events";

export interface ProgramUIProps<ConfigType extends EventType = EventType> {
  onSubmitConfig: (config: ConfigType) => void;
}

export interface ProgramUI<ConfigType extends EventType = EventType> {
  programIds: readonly string[];
  eventLogPredicate: (anyEvent: BusAnyEvent) => boolean;
  configurator: React.FC<ProgramUIProps<ConfigType>>;
}

export const programRegistry: { [k: string]: ProgramUI } = {
  [CaptureCalibrationDataset.id]: new CaptureCalibrationDataset() as ProgramUI,
  [CalibrateApriltagRig.id]: new CalibrateApriltagRig() as ProgramUI
};
export const programIds = Object.keys(programRegistry);
export type ProgramId = typeof programIds[number];

export function programUIForProgramId(programId: string): ProgramUI | null {
  return (
    Object.values(programRegistry).find((programUI) =>
      programUI.programIds.includes(programId)
    ) || null
  );
}
