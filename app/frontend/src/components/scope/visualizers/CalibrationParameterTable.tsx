import * as React from "react";
import { Table } from "react-bootstrap";
import { CalibrationParameter } from "../../../../genproto/farm_ng_proto/tractor/v1/calibrator";
import { useFormState } from "../../../hooks/useFormState";
import { FormProps } from "../../../registry/visualization";
import { formatValue } from "../../../utils/formatValue";
import FormGroup from "./FormGroup";

export const CalibrationParameterForm: React.FC<FormProps<
  CalibrationParameter
>> = (props) => {
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

interface IProps {
  labels: string[];
  parameters: CalibrationParameter[];
}

export const CalibrationParameterTable: React.FC<IProps> = ({
  labels,
  parameters
}) => {
  return (
    <Table bordered size="sm" responsive="md">
      <thead>
        <tr>
          <th>Label</th>
          <th>Value</th>
          <th>Constant</th>
        </tr>
      </thead>
      <tbody>
        {parameters.map((p, i) => (
          <tr key={labels[i]}>
            <td>{labels[i]}</td>
            <td>{formatValue(p.value)}</td>
            <td>{formatValue(p.constant)}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
