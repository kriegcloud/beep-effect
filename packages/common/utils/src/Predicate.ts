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
 * of the requested own or inherited properties.
 *
 * Supports both data-last and data-first invocation styles.
 *
 * @since 0.0.0
 * @category Utility
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
