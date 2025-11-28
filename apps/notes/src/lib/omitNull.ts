import { isNil, isObject } from "lodash";
import type { DeepNonNullable } from "ts-essentials";

/** Deeply omit null and undefined values from an object. */
export const omitNil = <T extends object>(obj: T): Partial<DeepNonNullable<T>> => {
  if (Array.isArray(obj)) {
    return obj.map((item) => (isObject(item) ? omitNil(item as object) : item)) as unknown as Partial<
      DeepNonNullable<T>
    >;
  }
  if (isObject(obj)) {
    return Object.entries(obj)
      .filter(([, v]) => !isNil(v))
      .reduce(
        (acc: Record<string, unknown>, [k, v]) => ({ ...acc, [k]: isObject(v) ? omitNil(v as object) : v }),
        {}
      ) as Partial<DeepNonNullable<T>>;
  }
  return obj as Partial<DeepNonNullable<T>>;
};
