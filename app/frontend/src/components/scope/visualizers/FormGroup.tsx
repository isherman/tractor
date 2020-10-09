import * as React from "react";
import { Form, FormControlProps } from "react-bootstrap";
import { toCamelCase, toSentenceCase } from "../../../utils/string";

interface IProps extends FormControlProps {
  label: string;
  description?: string;
  checked?: boolean;
  onChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >;
}

const FormGroup: React.FC<IProps> = (props) => {
  const { label, value, description, children } = props;
  const camelCaseLabel = toCamelCase(label);
  const defaultValue = typeof value === "number" ? 0 : "";
  return (
    <Form.Group controlId={camelCaseLabel}>
      <Form.Label>{label}</Form.Label>
      <Form.Control
        name={camelCaseLabel}
        value={value || defaultValue}
        {...props}
      >
        {children}
      </Form.Control>
      {description && (
        <Form.Text className="text-muted">{description}</Form.Text>
      )}
    </Form.Group>
  );
};

interface INumberSetProps<T> {
  object: T;
  keys: (string & keyof T)[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function NumberSet<T>({
  object,
  keys,
  onChange
}: INumberSetProps<T>): JSX.Element {
  return (
    <>
      {keys.map((key) => (
        <FormGroup
          key={key}
          label={toSentenceCase(key)}
          type="number"
          value={(object[key] as unknown) as number}
          onChange={onChange}
        />
      ))}
    </>
  );
}

type IStringSetProps<T> = INumberSetProps<T>;

function StringSet<T>({
  object,
  keys,
  onChange
}: IStringSetProps<T>): JSX.Element {
  return (
    <>
      {keys.map((key) => (
        <FormGroup
          key={key}
          label={toSentenceCase(key)}
          type="text"
          value={(object[key] as unknown) as string}
          onChange={onChange}
        />
      ))}
    </>
  );
}

export default Object.assign(FormGroup, {
  NumberSet,
  StringSet
});
