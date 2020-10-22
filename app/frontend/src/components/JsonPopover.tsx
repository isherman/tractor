import * as React from "react";
import ReactJson from "react-json-view";
import { Popover, PopoverProps } from "./Popover";

interface IProps extends PopoverProps {
  // eslint-disable-next-line @typescript-eslint/ban-types
  json: Object;
}

export const JsonPopover: React.FC<IProps> = ({ json, ...props }) => {
  return (
    <Popover {...props}>
      <ReactJson src={json} displayDataTypes={false} />
    </Popover>
  );
};
