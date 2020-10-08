/* eslint-disable no-console */
import * as React from "react";
import {
  FormProps,
  SingleElementVisualizerProps,
  Visualizer,
  VisualizerId,
  VisualizerOptionConfig,
  VisualizerProps
} from "../../../registry/visualization";
import { EventTypeId } from "../../../registry/events";
import { Layout } from "./Layout";
import { Card } from "./Card";
import { TractorConfig } from "../../../../genproto/farm_ng_proto/tractor/v1/tractor";
import { KeyValueTable } from "./KeyValueTable";
import { NamedSE3PoseElement } from "./NamedSE3PoseVisualizer";
import { Form } from "react-bootstrap";
import { useEffect, useState } from "react";

export const TractorConfigForm: React.FC<FormProps<TractorConfig>> = ({
  initialValue,
  onUpdate
}) => {
  const [config, setConfig] = useState(initialValue);

  useEffect(() => {
    if (config) {
      onUpdate(config);
    }
  }, [config]);

  const handleConfigurationChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setConfig({
      ...(config || {}),
      [e.target.name]: e.target.value
    } as TractorConfig);
  };

  return (
    <>
      <Form.Group controlId="wheelBaseline">
        <Form.Label>Wheel Baseline</Form.Label>
        <Form.Control
          type="number"
          name="wheelBaseline"
          value={config?.wheelBaseline || 0}
          onChange={handleConfigurationChange}
        />
      </Form.Group>

      <Form.Group controlId="wheelRadius">
        <Form.Label>Wheel Radius</Form.Label>
        <Form.Control
          type="text"
          name="wheelRadius"
          value={config?.wheelRadius || ""}
          onChange={handleConfigurationChange}
        />
      </Form.Group>
    </>
  );
};

export const TractorConfigElement: React.FC<SingleElementVisualizerProps<
  TractorConfig
>> = (props) => {
  const {
    value: [timestamp, value],
    resources
  } = props;

  return (
    <Card timestamp={timestamp} json={value}>
      <KeyValueTable
        records={[
          ["Wheel Radius", value.wheelRadius],
          ["Wheel Baseline", value.wheelBaseline],
          ["Wheel Radius Left", value.wheelRadiusLeft],
          ["Wheel Radius Right", value.wheelRadiusRight],
          ["Hub Motor Gear Ratio", value.hubMotorGearRatio],
          ["Hub Motor Poll Pairs", value.hubMotorPollPairs]
        ]}
      />

      {value.basePosesSensor.map((basePoseSensor) => {
        const title = `${basePoseSensor.frameA}_pose_${basePoseSensor.frameB}`;
        return (
          <Card key={title} title={title}>
            <NamedSE3PoseElement
              value={[0, basePoseSensor]}
              options={[]}
              resources={resources}
            />
          </Card>
        );
      })}
    </Card>
  );
};

export class TractorConfigVisualizer implements Visualizer<TractorConfig> {
  static id: VisualizerId = "tractorConfig";
  types: EventTypeId[] = [
    "type.googleapis.com/farm_ng_proto.tractor.v1.TractorConfig"
  ];

  options: VisualizerOptionConfig[] = [
    { label: "view", options: ["overlay", "grid"] }
  ];

  component: React.FC<VisualizerProps<TractorConfig>> = (props) => {
    const view = props.options[0].value as "overlay" | "grid";
    return <Layout view={view} element={TractorConfigElement} {...props} />;
  };

  form = TractorConfigForm;
}
