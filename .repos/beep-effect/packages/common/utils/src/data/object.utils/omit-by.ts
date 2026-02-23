/**
 * Implementation backing `Utils.ObjectUtils.omitBy`, providing predicate-based
 * object property filtering similar to lodash's omitBy.
 *
 * @example
 * import { ObjectUtils } from "@beep/utils";
 * import * as P from "effect/Predicate";
 *
 * const result = ObjectUtils.omitBy({ a: 1, b: null, c: undefined }, P.isNullable);
 * // { a: 1 }
 *
 * @category Documentation
 * @since 0.1.0
 */
import * as A from "effect/Array";
import { pipe } from "effect/Function";

import * as Struct from "effect/Struct";

/**
 * Creates an object composed of properties from the source object for which
 * the predicate returns `false`.
 *
 * @example
 * import { omitBy } from "@beep/utils/data/object.utils/omit-by";
 * import * as P from "effect/Predicate";
 *
 * const data = { a: 1, b: null, c: "hello", d: undefined };
 * const clean = omitBy(data, P.isNullable);
 * // { a: 1, c: "hello" }
 *
 * @category Data
 * @since 0.1.0
 */
export function omitBy<T extends object>(obj: T, predicate: (value: T[keyof T], key: keyof T) => boolean): Partial<T> {
  return pipe(
    Struct.entries(obj) as [keyof T, T[keyof T]][],
    A.filter(([key, value]) => !predicate(value, key)),
    // Using Object.fromEntries here because R.fromEntries has stricter generic
    // constraints that are incompatible with this function's generic signature
    // under exactOptionalPropertyTypes. This is a pragmatic exception.
    (entries) => Object.fromEntries(entries) as Partial<T>
  );
}
