/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

type Timeout = ReturnType<typeof setTimeout>;

export const debounce = <T extends (...args: any[]) => any>(
  callback: T,
  time: number
) => {
  let timeout: Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => callback(...args), time);
  };
};
