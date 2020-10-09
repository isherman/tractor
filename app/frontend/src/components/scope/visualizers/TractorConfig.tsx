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
import {
  NamedSE3PoseElement,
  NamedSE3PoseForm
} from "./NamedSE3PoseVisualizer";
import { useFormState } from "../../../hooks/useFormState";
import FormGroup from "./FormGroup";

const TractorConfigForm: React.FC<FormProps<TractorConfig>> = (props) => {
  const [value, update] = useFormState(props);

  return (
    <>
      <FormGroup
        label="Wheel Baseline"
        value={value.wheelBaseline}
        type="number"
        onChange={(e) =>
          update((v) => ({ ...v, wheelBaseline: parseFloat(e.target.value) }))
        }
      />

      <FormGroup
        label="Wheel Radius"
        value={value.wheelRadius}
        type="number"
        onChange={(e) =>
          update((v) => ({ ...v, wheelRadius: parseFloat(e.target.value) }))
        }
      />

      <FormGroup
        label="Wheel Radius Left"
        value={value.wheelRadiusLeft}
        type="number"
        onChange={(e) =>
          update((v) => ({ ...v, wheelRadiusLeft: parseFloat(e.target.value) }))
        }
      />

      <FormGroup
        label="Wheel Radius Right"
        value={value.wheelRadiusRight}
        type="number"
        onChange={(e) =>
          update((v) => ({
            ...v,
            wheelRadiusRight: parseFloat(e.target.value)
          }))
        }
      />

      <FormGroup
        label="Hub Motor Gear Ratio"
        value={value.hubMotorGearRatio}
        type="number"
        onChange={(e) =>
          update((v) => ({
            ...v,
            hubMotorGearRatio: parseFloat(e.target.value)
          }))
        }
      />

      <FormGroup
        label="Hub Motor Poll Pairs"
        value={value.hubMotorPollPairs}
        type="number"
        onChange={(e) =>
          update((v) => ({ ...v, hubMotorPollPairs: parseInt(e.target.value) }))
        }
      />

      {value.basePosesSensor.map((basePoseSensor, i) => (
        <NamedSE3PoseForm
          key={basePoseSensor.frameA + basePoseSensor.frameB}
          initialValue={basePoseSensor}
          onUpdate={(updated) =>
            update((v) => ({
              ...v,
              basePosesSensor: Object.assign([...v.basePosesSensor], {
                [i]: updated
              })
            }))
          }
        />
      ))}
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
