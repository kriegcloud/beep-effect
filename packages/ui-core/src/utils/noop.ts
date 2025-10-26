import type { UnsafeTypes } from "@beep/types";
export interface Noop {
  noop: true;

  (...args: UnsafeTypes.UnsafeArray): UnsafeTypes.UnsafeAny;
}

export const noop: Noop = (...args: UnsafeTypes.UnsafeArray) => undefined;

noop.noop = true;
