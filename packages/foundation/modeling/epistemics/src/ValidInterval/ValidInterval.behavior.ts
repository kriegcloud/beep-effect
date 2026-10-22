/**
 * Valid-time interval predicates.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import * as DateTime from "effect/DateTime";
import { constTrue, dual } from "effect/Function";
import * as O from "effect/Option";
import type { ValidInterval } from "./ValidInterval.model.ts";

/**
 * Whether the fact a valid-time interval describes holds at an instant.
 *
 * **Details**
 *
 * The interval is half-open: `validFrom` is included and `validTo` is
 * excluded, so adjacent versions never both hold at their shared boundary. An
 * absent `validTo` holds at every instant from `validFrom` on. Any value with
 * the {@link ValidInterval} fields is accepted, including entities that spread
 * them.
 *
 * **Example** (Check a half-open valid-time boundary)
 *
 * ```ts
 * import { holdsAt } from "@beep/epistemics/ValidInterval"
 * import * as DateTime from "effect/DateTime"
 * import * as O from "effect/Option"
 *
 * const interval = {
 *   validFrom: DateTime.makeUnsafe(1_000),
 *   validTo: O.some(DateTime.makeUnsafe(2_000))
 * }
 * console.log(holdsAt(interval, DateTime.makeUnsafe(1_000))) // true
 * console.log(holdsAt(interval, DateTime.makeUnsafe(2_000))) // false
 * ```
 *
 * @category predicates
 * @since 0.0.0
 */
export const holdsAt: {
  (at: DateTime.Utc): (interval: ValidInterval) => boolean;
  (interval: ValidInterval, at: DateTime.Utc): boolean;
} = dual(
  2,
  (interval: ValidInterval, at: DateTime.Utc): boolean =>
    DateTime.isLessThanOrEqualTo(interval.validFrom, at) &&
    O.match(interval.validTo, { onNone: constTrue, onSome: DateTime.isGreaterThan(at) })
);
