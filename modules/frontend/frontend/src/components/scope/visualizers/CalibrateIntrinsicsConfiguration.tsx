/* eslint-disable no-console */
import * as React from "react";
import {
  FormProps,
  SingleElementVisualizerProps,
} from "../../../registry/visualization";
import {
  StandardComponentOptions,
  StandardComponent,
} from "./StandardComponent";
import { CalibrateIntrinsicsConfiguration } from "@farm-ng/genproto-calibration/farm_ng/calibration/calibrate_intrinsics";
import { Card } from "./Card";
import { KeyValueTable } from "./KeyValueTable";
import { cameraModel_DistortionModelToJSON } from "@farm-ng/genproto-perception/farm_ng/perception/camera_model";

const CalibrateIntrinsicsConfigurationForm: React.FC<FormProps<
  CalibrateIntrinsicsConfiguration
>> = () => {
  // const [value, setValue] = useFormState(props);

  return <>TODO</>;
};

const CalibrateIntrinsicsConfigurationElement: React.FC<SingleElementVisualizerProps<
  CalibrateIntrinsicsConfiguration
>> = (props) => {
  const {
    value: [timestamp, value],
  } = props;

  const { cameraName, filterStableTags, videoDataset, distortionModel } = value;

  return (
    <Card timestamp={timestamp} json={value}>
      <Card title="Summary">
        <KeyValueTable
          records={[
            ["Video Dataset", videoDataset?.path],
            [
              "Distortion Model",
              cameraModel_DistortionModelToJSON(distortionModel),
            ],
            ["Camera Name", cameraName],
            ["Filter Stable Tags?", filterStableTags],
          ]}
        />
      </Card>
    </Card>
  );
};

export const CalibrateIntrinsicsConfigurationVisualizer = {
  id: "CalibrateIntrinsicsConfiguration",
  types: [
    "type.googleapis.com/farm_ng.calibration.CalibrateIntrinsicsConfiguration",
  ],
  options: StandardComponentOptions,
  Component: StandardComponent(CalibrateIntrinsicsConfigurationElement),
  Element: CalibrateIntrinsicsConfigurationElement,
  Form: CalibrateIntrinsicsConfigurationForm,
};
