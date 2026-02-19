/**
 * @since 0.1.0
 */

import type { DeepNonNullable, UnsafeTypes } from "@beep/types";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as Struct from "effect/Struct";

/**
 * Recursively removes all null and undefined values from an object.
 *
 * @example
 * ```typescript
 * import { deepRemoveNull } from "@beep/utils"
 *
 * const obj = { a: 1, b: null, c: { d: undefined, e: 2 } }
 * const cleaned = deepRemoveNull(obj)
 * // => { a: 1, c: { e: 2 } }
 * ```
 *
 * @category transformations
 * @since 0.1.0
 */
export function deepRemoveNull<T>(obj: T): DeepNonNullable<T> {
  return F.pipe(
    obj as UnsafeTypes.UnsafeAny,
    Struct.entries,
    A.filter(([_, v]) => P.isNotNullable(v)),
    A.map(([k, v]) => [k, v === Object(v) ? deepRemoveNull(v) : v] as const),
    R.fromEntries
  ) as DeepNonNullable<T>;
}
