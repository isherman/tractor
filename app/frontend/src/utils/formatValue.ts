export const formatValue = (value: unknown): string => {
  if (value instanceof Date) {
    const day = value.getDate();
    const month = value.getMonth() + 1;
    const year = value.getFullYear().toString().slice(2);
    const hours = value.getHours() - 12;
    const suffix = value.getHours() < 12 ? "am" : "pm";
    const minutes = value.getMinutes().toString().padStart(2, "0");
    const seconds = value.getSeconds().toString().padStart(2, "0");
    const ms = value.getMilliseconds().toString().padStart(3, "0");

    return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}.${ms} ${suffix}`;
  }
  if (typeof value === "number") {
    return value.toFixed(4);
  }
  return String(value);
};
