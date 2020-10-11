import * as React from "react";
import {
  CalibrationParameter,
  ViewDirection,
  viewDirectionToJSON,
  ViewInitialization
} from "../../../../genproto/farm_ng_proto/tractor/v1/calibrator";
import { useFormState } from "../../../hooks/useFormState";
import {
  FormProps,
  SingleElementVisualizerProps
} from "../../../registry/visualization";
import { enumNumericKeys } from "../../../utils/enum";
import { CalibrationParameterVisualizer } from "./CalibrationParameter";
import { CalibrationParameterTable } from "./CalibrationParameterTable";
import FormGroup from "./FormGroup";
import { KeyValueTable } from "./KeyValueTable";
import {
  StandardComponentOptions,
  StandardComponent
} from "./StandardComponent";

const ViewInitializationForm: React.FC<FormProps<ViewInitialization>> = (
  props
) => {
  const [value, setValue] = useFormState(props);
  return (
    <>
      <h6>X</h6>
      <CalibrationParameterVisualizer.Form
        initialValue={value.x || CalibrationParameter.fromPartial({})}
        onChange={(updated) => setValue((v) => ({ ...v, x: updated }))}
      />
      <h6>Y</h6>
      <CalibrationParameterVisualizer.Form
        initialValue={value.y || CalibrationParameter.fromPartial({})}
        onChange={(updated) => setValue((v) => ({ ...v, y: updated }))}
      />
      <h6>Z</h6>
      <CalibrationParameterVisualizer.Form
        initialValue={value.z || CalibrationParameter.fromPartial({})}
        onChange={(updated) => setValue((v) => ({ ...v, z: updated }))}
      />

      <FormGroup
        label="View Direction"
        value={value.viewDirection}
        as="select"
        onChange={(e) =>
          setValue((v) => ({ ...v, viewDirection: parseInt(e.target.value) }))
        }
      >
        {enumNumericKeys(ViewDirection)
          .filter((k) => k > 0)
          .map((k) => {
            return (
              <option key={k} value={k}>
                {viewDirectionToJSON(k)}
              </option>
            );
          })}
      </FormGroup>
    </>
  );
};

const ViewInitializationElement: React.FC<SingleElementVisualizerProps<
  ViewInitialization
>> = ({ value: [, value] }) => {
  const { x, y, z } = value;
  return (
    <>
      {x && y && z && (
        <CalibrationParameterTable
          labels={["x", "y", "z"]}
          parameters={[x, y, z]}
        />
      )}
      <KeyValueTable
        records={[["Direction", viewDirectionToJSON(value.viewDirection)]]}
      />
    </>
  );
};

export const ViewInitializationVisualizer = {
  id: "ViewInitialization",
  types: ["type.googleapis.com/farm_ng_proto.tractor.v1.ViewInitialization"],
  options: StandardComponentOptions,
  Component: StandardComponent(ViewInitializationElement),
  Element: ViewInitializationElement,
  Form: ViewInitializationForm
};
