/**
 * Implementation backing `Utils.ObjectUtils.omit`, providing object property
 * exclusion similar to lodash's omit.
 *
 * @example
 * import { ObjectUtils } from "@beep/utils";
 *
 * const result = ObjectUtils.omit({ a: 1, b: 2, c: 3 }, "b", "c");
 * // { a: 1 }
 *
 * @category Documentation/Modules
 * @since 0.1.0
 */
import * as A from "effect/Array";
import { pipe } from "effect/Function";

/**
 * Creates an object composed of properties from the source object excluding
 * the specified keys.
 *
 * @example
 * import { omit } from "@beep/utils/data/object.utils/omit";
 *
 * const user = { id: 1, name: "John", password: "secret" };
 * const safeUser = omit(user, "password");
 * // { id: 1, name: "John" }
 *
 * @category Data/Object
 * @since 0.1.0
 */
export function omit<T extends object, K extends keyof T>(obj: T, ...keys: readonly K[]): Omit<T, K> {
  const keysSet = new Set<PropertyKey>(keys);

  return pipe(
    Object.entries(obj),
    A.filter(([key]) => !keysSet.has(key)),
    Object.fromEntries
  ) as Omit<T, K>;
}
