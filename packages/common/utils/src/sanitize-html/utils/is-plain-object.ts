/**
 * Plain object type guard for sanitize-html
 *
 * @since 0.1.0
 * @module
 */
import * as P from "effect/Predicate";
/**
 * Checks if a value is a plain object (not an array, null, or class instance).
 * Plain objects are objects created by the Object constructor or with object literal syntax.
 *
 * @example
 * ```typescript
 * import { isPlainObject } from "@beep/utils/sanitize-html/utils/is-plain-object"
 *
 * isPlainObject({}) // true
 * isPlainObject({ foo: "bar" }) // true
 * isPlainObject(Object.create(null)) // true
 * isPlainObject([]) // false
 * isPlainObject(null) // false
 * isPlainObject(new Date()) // false
 * isPlainObject(new Map()) // false
 * ```
 *
 * @since 0.1.0
 * @category guards
 */
export const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (P.isNull(value) || !P.isObject(value)) {
    return false;
  }

  // Handle Object.create(null) objects
  const proto = Object.getPrototypeOf(value);
  if (P.isNull(proto)) {
    return true;
  }

  // Check if the prototype is Object.prototype
  // This excludes arrays, dates, maps, sets, and class instances
  return proto === Object.prototype;
};
