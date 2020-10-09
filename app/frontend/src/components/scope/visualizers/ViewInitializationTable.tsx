import * as React from "react";
import {
  CalibrationParameter,
  ViewDirection,
  viewDirectionToJSON,
  ViewInitialization
} from "../../../../genproto/farm_ng_proto/tractor/v1/calibrator";
import { useFormState } from "../../../hooks/useFormState";
import { FormProps } from "../../../registry/visualization";
import { enumNumericKeys } from "../../../utils/enum";
import {
  CalibrationParameterForm,
  CalibrationParameterTable
} from "./CalibrationParameterTable";
import FormGroup from "./FormGroup";
import { KeyValueTable } from "./KeyValueTable";

export const ViewInitializationForm: React.FC<FormProps<ViewInitialization>> = (
  props
) => {
  const [value, update] = useFormState(props);
  return (
    <>
      <h6>X</h6>
      <CalibrationParameterForm
        initialValue={value.x || CalibrationParameter.fromPartial({})}
        onUpdate={(updated) => update((v) => ({ ...v, x: updated }))}
      />
      <h6>Y</h6>
      <CalibrationParameterForm
        initialValue={value.y || CalibrationParameter.fromPartial({})}
        onUpdate={(updated) => update((v) => ({ ...v, y: updated }))}
      />
      <h6>Z</h6>
      <CalibrationParameterForm
        initialValue={value.z || CalibrationParameter.fromPartial({})}
        onUpdate={(updated) => update((v) => ({ ...v, z: updated }))}
      />

      <FormGroup
        label="View Direction"
        value={value.viewDirection}
        as="select"
        onChange={(e) =>
          update((v) => ({ ...v, viewDirection: parseInt(e.target.value) }))
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

interface IProps {
  view: ViewInitialization;
}

export const ViewInitializationTable: React.FC<IProps> = ({ view }) => {
  const { x, y, z } = view;
  return (
    <>
      {x && y && z && (
        <CalibrationParameterTable
          labels={["x", "y", "z"]}
          parameters={[x, y, z]}
        />
      )}
      <KeyValueTable
        records={[["Direction", viewDirectionToJSON(view.viewDirection)]]}
      />
    </>
  );
};
