/* eslint-disable no-console */
import * as React from "react";
import {
  FormProps,
  SingleElementVisualizerProps,
} from "../../../registry/visualization";
import { Card } from "./Card";
import { LogPlaybackConfiguration } from "@farm-ng/genproto-core/farm_ng/core/log_playback";
import {
  StandardComponent,
  StandardComponentOptions,
} from "./StandardComponent";

const LogPlaybackConfigurationForm: React.FC<FormProps<
  LogPlaybackConfiguration
>> = () => {
  // const [value, setValue] = useFormState(props);

  return <></>;
};

const LogPlaybackConfigurationElement: React.FC<SingleElementVisualizerProps<
  LogPlaybackConfiguration
>> = (props) => {
  const {
    value: [timestamp, value],
  } = props;

  return (
    <Card timestamp={timestamp} json={value}>
      <Card title="Summary"></Card>
    </Card>
  );
};

export const LogPlaybackConfigurationVisualizer = {
  id: "LogPlaybackConfiguration",
  types: ["type.googleapis.com/farm_ng.core.LogPlaybackConfiguration"],
  options: StandardComponentOptions,
  Component: StandardComponent(LogPlaybackConfigurationElement),
  Element: LogPlaybackConfigurationElement,
  Form: LogPlaybackConfigurationForm,
};
