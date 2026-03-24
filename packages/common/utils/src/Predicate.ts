/**
 * @module @beep/utils/Predicate
 * @since 0.0.0
 */

import { Function as Fn } from "effect";
import * as A from "effect/Array";
import * as P from "effect/Predicate";

/**
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
 * @category Utility
 * @example
 * ```ts
 * import { hasProperties } from "@beep/utils/Predicate";
 *
 * // Data-last style
 * const hasFooBar = hasProperties("foo", "bar");
 * hasFooBar({ foo: 1, bar: 2 }); // true
 *
 * // Data-first style
 * hasProperties({ foo: 1, bar: 2 }, ["foo", "bar"] as const); // true
 * ```
 *
 * @param properties - The property keys to check for (data-last style)
 * @returns A predicate function that checks if the value has all properties (data-last style)
 *
 * @template Properties - The type of property keys to check for
 * @param self {unknown} - The value to check (data-first style)
 * @param properties {Properties} - The property keys to check for (data-first style)
 * @returns A type predicate indicating if the value has all properties (data-first style)
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
  2,
  <Properties extends A.NonEmptyReadonlyArray<PropertyKey>>(
    self: unknown,
    property: Properties
  ): self is { [K in Properties[number]]: unknown } => P.isObject(self) && A.every(property, P.hasProperty)
);
