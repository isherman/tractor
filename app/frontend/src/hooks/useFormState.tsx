import { useState, useEffect } from "react";

interface IProps<T> {
  initialValue: T;
  onUpdate: (updated: T) => void;
}

type IReturnValue<T> = [
  T,
  (e: React.ChangeEvent<HTMLInputElement>) => void,
  (e: React.ChangeEvent<HTMLInputElement>) => void
];

export function useFormState<T>({
  initialValue,
  onUpdate
}: IProps<T>): IReturnValue<T> {
  const [config, setConfig] = useState(initialValue);
  useEffect(() => {
    if (config) {
      onUpdate(config);
    }
  }, [config]);

  const onStringChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setConfig({
      ...(config || {}),
      [e.target.name]: e.target.value
    } as T);
  };

  const onNumberChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setConfig({
      ...(config || {}),
      [e.target.name]: parseFloat(e.target.value)
    } as T);
  };

  return [config, onStringChange, onNumberChange];
}
