import { useState, useEffect } from "react";

interface IProps<T> {
  initialValue: T;
  onUpdate: (updated: T) => void;
}

type IReturnValue<T> = [T, (updater: (c: T) => T) => void];

export function useFormState<T>({
  initialValue,
  onUpdate
}: IProps<T>): IReturnValue<T> {
  const [value, setValue] = useState(initialValue);
  useEffect(() => {
    if (value) {
      onUpdate(value);
    }
  }, [value]);

  const updateValue = (updater: (c: T) => T): void => {
    setValue(updater(value));
  };

  return [value, updateValue];
}
