/**
 * Timestamp helpers that normalize either epoch numbers or ISO strings into canonical UTC strings.
 *
 * Converts timestamps represented as milliseconds or ISO inputs into normalized ISO strings without milliseconds.
 * Useful when a database stores numeric timestamps but APIs expect ISO strings.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { ToIsoString } from "@beep/schema/primitives/temporal/dates/timestamp";
 *
 * const decode = S.decodeSync(ToIsoString);
 * const encode = S.encodeSync(ToIsoString);
 *
 * const decoded = decode(1704067200000);
 * const encoded = encode("2024-01-01T00:00:00.123Z");
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */

import { $SchemaId } from "@beep/identity/packages";
import { Regex } from "@beep/schema/internal/regex/regex";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Order from "effect/Order";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import * as Schema from "effect/Schema";
import * as Str from "effect/String";
import { LocalDate } from "../LocalDate.ts";

const $I = $SchemaId.create("primitives/temporal/dates/timestamp");

const stripMilliseconds = (value: string): string => F.pipe(value, Str.replace(Regex.make(/\.\d{3}Z$/), "Z"));

/**
 * Schema transformer converting timestamps (numbers or ISO strings) into normalized ISO strings.
 *
 * Always emits ISO strings without fractional seconds to keep storage consistent.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { ToIsoString } from "@beep/schema/primitives/temporal/dates/timestamp";
 *
 * const iso = S.decodeSync(ToIsoString)("2024-01-01T00:00:00.123Z");
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */
export const ToIsoString = S.transform(S.Union(S.Number, S.String), S.String, {
  decode: (input) => F.pipe(new Date(input).toISOString(), stripMilliseconds),
  encode: (isoString) => F.pipe(new Date(isoString).toISOString(), stripMilliseconds),
}).annotations(
  $I.annotations("timestamp/ToIsoString", {
    description:
      "Schema transformer that converts timestamp numbers or ISO strings into canonical ISO strings without milliseconds.",
  })
);

/**
 * Namespace exposing runtime and encoded types for {@link ToIsoString}.
 *
 * @example
 * import type { ToIsoString } from "@beep/schema/primitives/temporal/dates/timestamp";
 *
 * type Timestamp = ToIsoString.Type;
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */
export declare namespace ToIsoString {
  /**
   * Runtime type after decoding via {@link ToIsoString}.
   *
   * @example
   * import type { ToIsoString } from "@beep/schema/primitives/temporal/dates/timestamp";
   *
   * let iso: ToIsoString.Type;
   *
   * @category Primitives/Temporal/Dates
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof ToIsoString>;
  /**
   * Encoded representation accepted by {@link ToIsoString}.
   *
   * @example
   * import type { ToIsoString } from "@beep/schema/primitives/temporal/dates/timestamp";
   *
   * let encoded: ToIsoString.Encoded;
   *
   * @category Primitives/Temporal/Dates
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof ToIsoString>;
}

/**
 * Timestamp - A Schema.Class wrapping DateTime.Utc for UTC timestamps
 *
 * Stores the epoch milliseconds internally.
 * Encoded as ISO 8601 datetime string.
 */
export class Timestamp extends Schema.Class<Timestamp>("Timestamp")({
  epochMillis: Schema.Number.pipe(Schema.int()),
}) {
  /**
   * Get the underlying DateTime.Utc instance
   */
  toDateTime(): DateTime.Utc {
    return DateTime.unsafeMake(this.epochMillis);
  }

  /**
   * Convert to JavaScript Date
   */
  toDate(): Date {
    return new Date(this.epochMillis);
  }

  /**
   * Convert to ISO 8601 string
   */
  toISOString(): string {
    return this.toDate().toISOString();
  }

  /**
   * Convert to string representation
   */
  override toString(): string {
    return this.toISOString();
  }

  /**
   * Extract the LocalDate portion (UTC date)
   */
  toLocalDate(): LocalDate {
    const date = this.toDate();
    return LocalDate.make({
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate(),
    });
  }
}

/**
 * Type guard for Timestamp using Schema.is
 */
export const isTimestamp = Schema.is(Timestamp);

/**
 * Create a Timestamp from a DateTime.Utc
 */
export const fromDateTime = (dateTime: DateTime.Utc): Timestamp => {
  return Timestamp.make({ epochMillis: dateTime.epochMillis });
};

/**
 * Create a Timestamp from a JavaScript Date
 */
export const fromDate = (date: Date): Timestamp => {
  return Timestamp.make({ epochMillis: date.getTime() });
};

/**
 * Create a Timestamp from an ISO 8601 string
 * Returns an Effect that may fail with ParseError
 */
export const fromString = (dateString: string): Effect.Effect<Timestamp, ParseResult.ParseError> => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return Effect.fail(
      new ParseResult.ParseError({
        issue: new ParseResult.Type(Schema.String.ast, dateString, `Invalid ISO 8601 datetime: "${dateString}"`),
      })
    );
  }
  return Effect.succeed(Timestamp.make({ epochMillis: date.getTime() }));
};

/**
 * Get the current timestamp (now)
 */
export const now = (): Timestamp => {
  return Timestamp.make({ epochMillis: Date.now() });
};

/**
 * Get the current timestamp as an Effect using the Clock service
 */
export const nowEffect: Effect.Effect<Timestamp> = Effect.map(
  Effect.clockWith((clock) => clock.currentTimeMillis),
  (millis) => Timestamp.make({ epochMillis: Number(millis) })
);

/**
 * Order for Timestamp - compares chronologically
 */
export const Order_: Order.Order<Timestamp> = Order.make((a, b) => {
  if (a.epochMillis < b.epochMillis) return -1;
  if (a.epochMillis > b.epochMillis) return 1;
  return 0;
});

/**
 * Check if first timestamp is before second
 */
export const isBefore = (a: Timestamp, b: Timestamp): boolean => {
  return a.epochMillis < b.epochMillis;
};

/**
 * Check if first timestamp is after second
 */
export const isAfter = (a: Timestamp, b: Timestamp): boolean => {
  return a.epochMillis > b.epochMillis;
};

/**
 * Check if two timestamps are equal
 */
export const equals = (a: Timestamp, b: Timestamp): boolean => {
  return a.epochMillis === b.epochMillis;
};

/**
 * Add milliseconds to a timestamp
 */
export const addMillis = (timestamp: Timestamp, millis: number): Timestamp => {
  return Timestamp.make({ epochMillis: timestamp.epochMillis + millis });
};

/**
 * Add seconds to a timestamp
 */
export const addSeconds = (timestamp: Timestamp, seconds: number): Timestamp => {
  return addMillis(timestamp, seconds * 1000);
};

/**
 * Add minutes to a timestamp
 */
export const addMinutes = (timestamp: Timestamp, minutes: number): Timestamp => {
  return addMillis(timestamp, minutes * 60 * 1000);
};

/**
 * Add hours to a timestamp
 */
export const addHours = (timestamp: Timestamp, hours: number): Timestamp => {
  return addMillis(timestamp, hours * 60 * 60 * 1000);
};

/**
 * Add days to a timestamp
 */
export const addDays = (timestamp: Timestamp, days: number): Timestamp => {
  return addMillis(timestamp, days * 24 * 60 * 60 * 1000);
};

/**
 * Get the difference in milliseconds between two timestamps
 */
export const diffInMillis = (a: Timestamp, b: Timestamp): number => {
  return a.epochMillis - b.epochMillis;
};

/**
 * Get the difference in seconds between two timestamps
 */
export const diffInSeconds = (a: Timestamp, b: Timestamp): number => {
  return Math.floor(diffInMillis(a, b) / 1000);
};

/**
 * Get the minimum of two timestamps
 */
export const min = (a: Timestamp, b: Timestamp): Timestamp => {
  return a.epochMillis <= b.epochMillis ? a : b;
};

/**
 * Get the maximum of two timestamps
 */
export const max = (a: Timestamp, b: Timestamp): Timestamp => {
  return a.epochMillis >= b.epochMillis ? a : b;
};

/**
 * Unix epoch timestamp (1970-01-01T00:00:00.000Z)
 */
export const EPOCH: Timestamp = Timestamp.make({ epochMillis: 0 });
