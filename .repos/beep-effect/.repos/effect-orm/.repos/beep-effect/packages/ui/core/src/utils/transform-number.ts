import * as A from "effect/Array";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
export type InputValue = string | number | null | undefined;

export function transformValue(value: InputValue, defaultValue = ""): string {
  if (!P.and(P.isNotNullable, P.isNumber)(value)) return defaultValue;
  return value.toString();
}

export function transformValueOnChange(value: string | number): string {
  const currentValue: string = transformValue(value);

  const cleanedValue = Str.replace(/[^0-9.]/g, "")(currentValue);

  const [integerPart, ...decimalParts] = Str.split(".")(cleanedValue);

  if (P.isNullable(integerPart)) return "";

  return A.length(decimalParts) > 0 ? Str.concat(`.${A.join("")(decimalParts)}`)(integerPart) : integerPart;
}

export function transformValueOnBlur(value: InputValue, defaultValue: string | number = ""): string | number {
  if (!P.and(P.isNotNullable, P.isNumber)(value)) return defaultValue;

  const numericValue = Number.parseFloat(value.toString());

  if (Number.isNaN(numericValue)) {
    return defaultValue;
  }

  return numericValue;
}
