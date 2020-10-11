/* eslint-disable no-console */
import * as React from "react";
import { SingleElementVisualizerProps } from "../../../registry/visualization";
import { LayoutOptions, LayoutVisualizerComponent } from "./Layout";
import { CalibrateApriltagRigResult } from "../../../../genproto/farm_ng_proto/tractor/v1/calibrate_apriltag_rig";
import {
  MonocularApriltagRigModel,
  solverStatusToJSON
} from "../../../../genproto/farm_ng_proto/tractor/v1/calibrator";
import { useFetchResource } from "../../../hooks/useFetchResource";
import { KeyValueTable } from "./KeyValueTable";
import { Card } from "./Card";
import { MonocularApriltagRigModelVisualizer } from "./MonocularApriltagRigModel";
import { CalibrateApriltagRigConfigurationVisualizer } from "./CalibrateApriltagRigConfiguration";

const CalibrateApriltagRigResultElement: React.FC<SingleElementVisualizerProps<
  CalibrateApriltagRigResult
>> = (props) => {
  const {
    value: [timestamp, value],
    resources
  } = props;

  const initial = useFetchResource<MonocularApriltagRigModel>(
    value.monocularApriltagRigInitial,
    resources || undefined
  );
  const solved = useFetchResource<MonocularApriltagRigModel>(
    value.monocularApriltagRigSolved,
    resources || undefined
  );

  const { configuration, solverStatus, rmse, stampEnd } = value || {};
  return (
    <Card timestamp={timestamp} json={value}>
      <Card title="Summary">
        <KeyValueTable
          records={[
            ["Solver Status", solverStatus && solverStatusToJSON(solverStatus)],
            ["Total RMSE", rmse],
            ["Stamp End", stampEnd]
          ]}
        />
      </Card>
      {configuration && (
        <Card title="Configuration">
          <CalibrateApriltagRigConfigurationVisualizer.Element
            value={[0, configuration]}
            options={[]}
            resources={resources}
          />
        </Card>
      )}
      {initial && (
        <Card title="Initial">
          <MonocularApriltagRigModelVisualizer.Element
            value={[0, initial]}
            options={[]}
            resources={resources}
          />
        </Card>
      )}
      {solved && (
        <Card title="Solved">
          <MonocularApriltagRigModelVisualizer.Element
            value={[0, solved]}
            options={[]}
            resources={resources}
          />
        </Card>
      )}
    </Card>
  );
};

export const CalibrateApriltagRigResultVisualizer = {
  id: "CalibrateApriltagRigResult",
  types: [
    "type.googleapis.com/farm_ng_proto.tractor.v1.CalibrateApriltagRigResult"
  ],
  options: LayoutOptions,
  Component: LayoutVisualizerComponent(CalibrateApriltagRigResultElement),
  Element: CalibrateApriltagRigResultElement
};
