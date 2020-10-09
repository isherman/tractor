import * as React from "react";
import {
  BaseToCameraInitialization,
  CalibrationParameter,
  ViewInitialization
} from "../../../../genproto/farm_ng_proto/tractor/v1/calibrator";
import { useFormState } from "../../../hooks/useFormState";
import { FormProps } from "../../../registry/visualization";
import {
  CalibrationParameterForm,
  CalibrationParameterTable
} from "./CalibrationParameterTable";
import { Card } from "./Card";
import {
  ViewInitializationForm,
  ViewInitializationTable
} from "./ViewInitializationTable";

export const BaseToCameraInitializationForm: React.FC<FormProps<
  BaseToCameraInitialization
>> = (props) => {
  const [value, update] = useFormState(props);
  return (
    <>
      <h6>Wheel Baseline</h6>
      <CalibrationParameterForm
        initialValue={
          value.wheelBaseline || CalibrationParameter.fromPartial({})
        }
        onUpdate={(updated) =>
          update((v) => ({ ...v, wheelBaseline: updated }))
        }
      />
      <h6>Wheel Radius</h6>
      <CalibrationParameterForm
        initialValue={value.wheelRadius || CalibrationParameter.fromPartial({})}
        onUpdate={(updated) => update((v) => ({ ...v, wheelRadius: updated }))}
      />
      <ViewInitializationForm
        initialValue={
          value.basePoseCamera || ViewInitialization.fromPartial({})
        }
        onUpdate={(updated) =>
          update((v) => ({ ...v, basePoseCamera: updated }))
        }
      />
    </>
  );
};

interface IProps {
  value: BaseToCameraInitialization;
}

export const BaseToCameraInitializationTable: React.FC<IProps> = ({
  value
}) => {
  const { wheelBaseline, wheelRadius, basePoseCamera } = value;
  return (
    <>
      {basePoseCamera && (
        <Card title="base_pose_camera Initialization">
          <ViewInitializationTable view={basePoseCamera} />
        </Card>
      )}
      {wheelBaseline && wheelRadius && (
        <Card title="Other Calibration Parameters">
          <CalibrationParameterTable
            labels={["Wheel Baseline", "Wheel Radius"]}
            parameters={[wheelBaseline, wheelRadius]}
          />
        </Card>
      )}
    </>
  );
};
