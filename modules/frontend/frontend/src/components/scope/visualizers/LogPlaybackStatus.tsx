/* eslint-disable no-console */
import * as React from "react";
import {
  FormProps,
  SingleElementVisualizerProps,
} from "../../../registry/visualization";
import { Card } from "./Card";
import { LogPlaybackStatus } from "@farm-ng/genproto-core/farm_ng/core/log_playback";
import {
  StandardComponent,
  StandardComponentOptions,
} from "./StandardComponent";

const LogPlaybackStatusForm: React.FC<FormProps<LogPlaybackStatus>> = () => {
  // const [value, setValue] = useFormState(props);

  return <></>;
};

const LogPlaybackStatusElement: React.FC<SingleElementVisualizerProps<
  LogPlaybackStatus
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

export const LogPlaybackStatusVisualizer = {
  id: "LogPlaybackStatus",
  types: ["type.googleapis.com/farm_ng.core.LogPlaybackStatus"],
  options: StandardComponentOptions,
  Component: StandardComponent(LogPlaybackStatusElement),
  Element: LogPlaybackStatusElement,
  Form: LogPlaybackStatusForm,
};
