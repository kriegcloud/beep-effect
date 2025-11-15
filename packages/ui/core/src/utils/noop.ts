import type { UnsafeTypes } from "@beep/types";
export interface Noop {
  noop: true;

  (..._args: UnsafeTypes.UnsafeArray): UnsafeTypes.UnsafeAny;
}

export const noop: Noop = (..._args: UnsafeTypes.UnsafeArray) => undefined;

noop.noop = true;
