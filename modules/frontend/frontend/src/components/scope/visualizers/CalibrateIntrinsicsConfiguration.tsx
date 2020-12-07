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
    // resources,
  } = props;

  return (
    <Card timestamp={timestamp} json={value}>
      TODO
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
