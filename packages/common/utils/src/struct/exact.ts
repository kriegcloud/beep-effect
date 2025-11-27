/**
 * Utility for making objects compatible with `exactOptionalPropertyTypes`.
 *
 * When `exactOptionalPropertyTypes` is enabled in tsconfig, TypeScript
 * distinguishes between optional properties (`prop?: T`) and properties
 * that can be undefined (`prop: T | undefined`). This causes friction
 * with many libraries that define optional props the former way.
 *
 * `exact` filters out nullish values from an object, returning a new object
 * where only defined properties remain. This makes the object compatible
 * with strict optional property expectations.
 *
 * @example
 * import { exact } from "@beep/utils";
 *
 * // Before (verbose workaround):
 * const state = useMarkToolbarButtonState({
 *   ...(clear ? { clear } : {}),
 *   nodeType
 * });
 *
 * // After (clean):
 * const state = useMarkToolbarButtonState(exact({ clear, nodeType }));
 *
 * @category Struct/Exact
 * @since 0.1.0
 */

import { noOp } from "@beep/utils";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Struct from "effect/Struct";
import { create } from "mutative";

/**
 * Helper to check if a type is possibly nullish (contains null or undefined).
 *
 * @category Struct/Exact
 * @since 0.1.0
 */
type IsNullable<T> = null extends T ? true : undefined extends T ? true : false;

/**
 * Result type for `exact`. For each property:
 * - If the type is *only* `null | undefined`, the key is removed
 * - If the type *contains* `null | undefined`, the key becomes optional with nullish stripped
 * - If the type has no nullish, the key is preserved as-is
 *
 * @category Struct/Exact
 * @since 0.1.0
 */
export type ExactResult<T extends object> = {
  // Required keys: values that are never nullish
  [K in keyof T as IsNullable<T[K]> extends false ? K : never]: T[K];
} & {
  // Optional keys: values that can be nullish but aren't *only* nullish
  [K in keyof T as IsNullable<T[K]> extends true
    ? NonNullable<T[K]> extends never
      ? never // purely nullish, exclude entirely
      : K
    : never]?: NonNullable<T[K]>;
};

/**
 * Removes all properties with `null` or `undefined` values from an object,
 * returning a new object containing only defined properties.
 *
 * Uses `mutative` for efficient object construction without spread operator
 * overhead in reduce operations.
 *
 * @example
 * import { exact } from "@beep/utils";
 *
 * const props = { name: "foo", label: undefined, count: null, active: true };
 * const cleaned = exact(props);
 * // Result: { name: "foo", active: true }
 *
 * @example
 * // Common use case: exactOptionalPropertyTypes compatibility
 * import { exact } from "@beep/utils";
 *
 * function MyComponent({ clear, nodeType }: Props) {
 *   // `clear` might be `string | undefined` but library expects `string?`
 *   const state = useSomeHook(exact({ clear, nodeType }));
 * }
 *
 * @category Struct/Exact
 * @since 0.1.0
 */
export const exact = <const T extends object>(obj: T): ExactResult<T> => {
  const keys = Struct.keys(obj);
  const len = A.length(keys);

  // Fast path: empty object
  if (len === 0) {
    return {} as ExactResult<T>;
  }

  // Use mutative's create for efficient immutable object construction
  return create({} as ExactResult<T>, (draft) => {
    for (let i = 0; i < len; i++) {
      F.pipe(
        keys[i],
        O.fromNullable,
        O.match({
          onNone: noOp,
          onSome: (key) => {
            (draft as Record<string, unknown>)[key] = obj[key];
          },
        })
      );
    }
  });
};
