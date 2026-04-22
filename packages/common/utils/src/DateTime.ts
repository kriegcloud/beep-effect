/**
 * DateTime helpers and Effect DateTime re-exports.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { DateTime } from "effect";

/**
 * Constructs a `DateTime.Utc` from any supported `DateTime` input.
 *
 * This helper normalizes zoned inputs to UTC while preserving the instant.
 *
 * @example
 * ```typescript
 * import { makeUnsafeUtc } from "@beep/utils/DateTime"
 *
 * const value = makeUnsafeUtc("2026-01-01T00:00:00.000Z")
 * void value
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const makeUnsafeUtc = <A extends Parameters<typeof DateTime.make>[0]>(input: A): DateTime.Utc =>
  DateTime.makeUnsafe(input).pipe(DateTime.toUtc);

/**
 * Re-export of all helpers from `effect/DateTime`.
 *
 * @category utilities
 * @since 0.0.0
 */
export * from "effect/DateTime";
