import type { UnsafeTypes } from "@beep/types";
import { isNil } from "lodash";
import type { DeepNonNullable } from "ts-essentials";

export function deepRemoveNull<T>(obj: T): DeepNonNullable<T> {
  return Object.fromEntries(
    Object.entries(obj as UnsafeTypes.UnsafeAny)
      .filter(([_, v]) => !isNil(v))
      .map(([k, v]) => [k, v === Object(v) ? deepRemoveNull(v) : v])
  ) as DeepNonNullable<T>;
}
