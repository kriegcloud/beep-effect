import { pipe, Struct } from "effect";
import * as A from "effect/Array";
import * as P from "effect/Predicate";
import type { DeepNonNullable } from "ts-essentials";

/** Deeply omit null and undefined values from an object. */
export const omitNil = <T extends object>(obj: T): Partial<DeepNonNullable<T>> => {
  if (A.isArray(obj)) {
    return A.map(obj, (item) => (P.isObject(item) ? omitNil(item) : item)) as unknown as Partial<DeepNonNullable<T>>;
  }
  if (P.isObject(obj)) {
    return pipe(
      obj,
      Struct.entries,
      A.filter(([, v]) => !P.isNullable(v)),
      A.reduce({} as Partial<DeepNonNullable<T>>, (acc, [k, v]) => ({
        ...acc,
        [k]: P.isObject(v) ? omitNil(v as object) : v,
      }))
    );
  }
  return obj as Partial<DeepNonNullable<T>>;
};
