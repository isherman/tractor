import * as React from "react";
import { CalibrationParameter } from "../../../../genproto/farm_ng_proto/tractor/v1/calibrator";
import { useFormState } from "../../../hooks/useFormState";
import { FormProps } from "../../../registry/visualization";
import FormGroup from "./FormGroup";
import { LayoutOptions } from "./Layout";

const CalibrationParameterForm: React.FC<FormProps<CalibrationParameter>> = (
  props
) => {
  const [value, update] = useFormState(props);
  return (
    <>
      <FormGroup
        label="Value"
        value={value.value}
        type="number"
        onChange={(e) =>
          update((v) => ({ ...v, value: parseFloat(e.target.value) }))
        }
      />
      <FormGroup
        label="Constant"
        checked={value.constant}
        type="checkbox"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          update((v) => ({ ...v, constant: Boolean(e.target.checked) }))
        }
      />
    </>
  );
};

export const CalibrationParameterVisualizer = {
  id: "CalibrationParameter",
  types: ["type.googleapis.com/farm_ng_proto.tractor.v1.CalibrationParameter"],
  options: LayoutOptions,
  Form: CalibrationParameterForm
};