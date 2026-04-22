/**
 * @module
 * @since 0.0.0
 */

import { Function as Fn } from "effect";
import * as A from "effect/Array";
import * as P from "effect/Predicate";

/**
 * Re-export of all helpers from `effect/Predicate`.
 *
 * @category utilities
 * @since 0.0.0
 */
export * from "effect/Predicate";

/**
 * Returns a predicate that succeeds when an unknown value is an object with all
 *	the requested own or inherited properties.
 *
 * Supports both data-last and data-first invocation styles.
 *
 * @since 0.0.0
 * @category utility
 * @example
 * ```ts
 * import { hasProperties } from "@beep/utils/Predicate"
 *
 * // Data-last style
 * const hasFooBar = hasProperties("foo", "bar")
 * const result1 = hasFooBar({ foo: 1, bar: 2 })
 * // true
 *
 * // Data-first style
 * const result2 = hasProperties({ foo: 1, bar: 2 }, ["foo", "bar"] as const)
 * // true
 *
 * void result1
 * void result2
 * ```
 */
export const hasProperties: {
  <Properties extends A.NonEmptyReadonlyArray<PropertyKey>>(
    ...properties: Properties
  ): (self: unknown) => self is { [K in Properties[number]]: unknown };
  <Properties extends A.NonEmptyReadonlyArray<PropertyKey>>(
    self: unknown,
    properties: Properties
  ): self is { [K in Properties[number]]: unknown };
} = Fn.dual(
  (args) => args.length === 2 && A.isArray(args[1]),
  <Properties extends A.NonEmptyReadonlyArray<PropertyKey>>(
    self: unknown,
    firstPropertyOrProperties: PropertyKey | Properties,
    ...remainingProperties: ReadonlyArray<PropertyKey>
  ): self is { [K in Properties[number]]: unknown } => {
    const properties = (A.isArray(firstPropertyOrProperties)
      ? firstPropertyOrProperties
      : [firstPropertyOrProperties, ...remainingProperties]) as unknown as Properties;

    return P.isObject(self) && A.every(properties, (property) => P.hasProperty(self, property));
  }
);
