import { makeUnsafeUtc } from "@beep/utils/DateTime";
import { DateTime } from "effect";

/**
 * Constructs a `DateTime.Utc` value from epoch milliseconds.
 *
 * @since 0.0.0
 * @category Utility
 */
export const utcFromMillis = (millis: number): DateTime.Utc => makeUnsafeUtc(millis);

/**
 * Converts a `DateTime.Utc` value to epoch milliseconds.
 *
 * @since 0.0.0
 * @category Utility
 */
export const utcToMillis = (value: DateTime.Utc): number => DateTime.toEpochMillis(value);
