/**
 * Transaction-time interval predicates.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import * as DateTime from "effect/DateTime";
import { constTrue, dual } from "effect/Function";
import * as O from "effect/Option";
import type { KnowledgeInterval } from "./KnowledgeInterval.model.ts";

/**
 * Whether a record was the current belief as of an instant.
 *
 * **Details**
 *
 * The interval is half-open: `recordedAt` is included and `expiredAt` is
 * excluded, so a superseded row and its replacement are never both current at
 * the moment of replacement. An absent `expiredAt` is current from
 * `recordedAt` on. Any value with the {@link KnowledgeInterval} fields is
 * accepted, including entities that spread them.
 *
 * **Example** (Check a half-open transaction-time boundary)
 *
 * ```ts
 * import { knownAt } from "@beep/epistemics/KnowledgeInterval"
 * import * as DateTime from "effect/DateTime"
 * import * as O from "effect/Option"
 *
 * const interval = {
 *   expiredAt: O.some(DateTime.makeUnsafe(2_000)),
 *   recordedAt: DateTime.makeUnsafe(1_000)
 * }
 * console.log(knownAt(interval, DateTime.makeUnsafe(1_999))) // true
 * console.log(knownAt(interval, DateTime.makeUnsafe(2_000))) // false
 * ```
 *
 * @category predicates
 * @since 0.0.0
 */
export const knownAt: {
  (asOf: DateTime.Utc): (interval: KnowledgeInterval) => boolean;
  (interval: KnowledgeInterval, asOf: DateTime.Utc): boolean;
} = dual(
  2,
  (interval: KnowledgeInterval, asOf: DateTime.Utc): boolean =>
    DateTime.isLessThanOrEqualTo(interval.recordedAt, asOf) &&
    O.match(interval.expiredAt, { onNone: constTrue, onSome: DateTime.isGreaterThan(asOf) })
);
