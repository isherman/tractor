import * as React from "react";
import { forwardRef, InputHTMLAttributes } from "react";

interface IProps extends InputHTMLAttributes<HTMLInputElement> {
  webkitdirectory?: "true" | "false";
  directory?: boolean;
}

const FileInput = forwardRef<HTMLInputElement, IProps>((props, ref) => (
  <input {...props} ref={ref} />
));

FileInput.displayName = "CustomInput";
export { FileInput };
