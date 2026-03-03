import { DateTime } from "effect";

/**
 * Constructs a `DateTime.Utc` from any supported `DateTime` input.
 *
 * This helper normalizes zoned inputs to UTC while preserving the instant.
 *
 * @since 0.1.0
 * @category DomainModel
 * @example
 * ```ts-morph
 * import { makeUnsafeUtc } from "@beep/utils/DateTime"
 *
 * const value = makeUnsafeUtc("2026-01-01T00:00:00.000Z")
 * ```
 */
export const makeUnsafeUtc = <A extends Parameters<typeof DateTime.makeUnsafe>[0]>(input: A): DateTime.Utc =>
  DateTime.toUtc(DateTime.makeUnsafe(input));
