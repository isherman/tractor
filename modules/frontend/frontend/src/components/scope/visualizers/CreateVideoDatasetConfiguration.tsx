/* eslint-disable no-console */
import * as React from "react";
import {
  FormProps,
  SingleElementVisualizerProps,
} from "../../../registry/visualization";
import { KeyValueTable } from "./KeyValueTable";
import { Card } from "./Card";
import { CreateVideoDatasetConfiguration } from "@farm-ng/genproto-perception/farm_ng/perception/create_video_dataset";
import {
  StandardComponent,
  StandardComponentOptions,
} from "./StandardComponent";
import { useFormState } from "../../../hooks/useFormState";
import Form from "./Form";

const CreateVideoDatasetConfigurationForm: React.FC<FormProps<
  CreateVideoDatasetConfiguration
>> = (props) => {
  const [value, setValue] = useFormState(props);

  return (
    <>
      <Form.Group
        label="Name"
        value={value.name}
        description="A name for the dataset, used to name the output archive."
        type="text"
        onChange={(e) => {
          const name = e.target.value;
          setValue((v) => ({ ...v, name }));
        }}
      />
      <Form.Group
        label="Detect Apriltags?"
        checked={value.detectApriltags}
        type="checkbox"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const detectApriltags = Boolean(e.target.checked);
          setValue((v) => ({ ...v, detectApriltags }));
        }}
      />
    </>
  );
};

const CreateVideoDatasetConfigurationElement: React.FC<SingleElementVisualizerProps<
  CreateVideoDatasetConfiguration
>> = (props) => {
  const {
    value: [timestamp, value],
  } = props;

  const { name } = value;

  return (
    <Card timestamp={timestamp} json={value}>
      <Card title="Summary">
        <KeyValueTable records={[["Name", name]]} />
      </Card>
    </Card>
  );
};

export const CreateVideoDatasetConfigurationVisualizer = {
  id: "CreateVideoDatasetConfiguration",
  types: [
    "type.googleapis.com/farm_ng.perception.CreateVideoDatasetConfiguration",
  ],
  options: StandardComponentOptions,
  Component: StandardComponent(CreateVideoDatasetConfigurationElement),
  Element: CreateVideoDatasetConfigurationElement,
  Form: CreateVideoDatasetConfigurationForm,
};
