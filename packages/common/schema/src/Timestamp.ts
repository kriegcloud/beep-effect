/**
 * UTC timestamp value objects, branded ISO string schemas, and epoch-millisecond schemas.
 *
 * @module
 * @since 0.0.0
 */

import { $SchemaId } from "@beep/identity";
import { LocalDate } from "@beep/schema/LocalDate";
import { type Brand, DateTime, Effect, Order as Order_, pipe, Schema, SchemaIssue, SchemaTransformation } from "effect";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { PosInt } from "./Int.ts";
import { NonEmptyTrimmedStr } from "./String.ts";

const $I = $SchemaId.create("Timestamp");

const stripMilliseconds = (value: string): string => pipe(value, Str.replace(/\.\d{3}Z$/, "Z"));

const normalizeIsoString = (input: string | number): string =>
  pipe(DateTime.makeUnsafe(input), DateTime.formatIso, stripMilliseconds);

/**
 * Branded ISO 8601 datetime string schema.
 *
 * Accepts a non-empty trimmed string that can be parsed as a valid `DateTime`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { ISOStr } from "@beep/schema/Timestamp"
 *
 * const decode = S.decodeUnknownSync(ISOStr)
 *
 * const iso = decode("2024-01-01T00:00:00.000Z")
 * console.log(iso)
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const ISOStr = NonEmptyTrimmedStr.check(S.makeFilter((i) => O.isSome(DateTime.make(i)))).pipe(
  S.brand("ISOStr"),
  $I.annoteSchema("ISOStr", {
    description: "ISO 8601 datetime string",
  })
);

/**
 * Branded ISO string type extracted from {@link ISOStr}.
 *
 * @since 0.0.0
 * @category models
 */
export type ISOStr = typeof ISOStr.Type;

/**
 * Branded positive integer schema for epoch milliseconds since 1970-01-01T00:00:00.000Z.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { EpochMillis } from "@beep/schema/Timestamp"
 *
 * const decode = S.decodeUnknownSync(EpochMillis)
 *
 * const millis = decode(1704067200000)
 * console.log(millis)
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const EpochMillis = PosInt.pipe(
  S.brand("EpochMillis"),
  $I.annoteSchema("EpochMillis", {
    description: "Epoch milliseconds since 1970-01-01T00:00:00.000Z",
    documentation: "Stores the epoch milliseconds internally.\nEncoded as ISO 8601 datetime string.",
  })
);

/**
 * Branded epoch milliseconds type extracted from {@link EpochMillis}.
 *
 * @since 0.0.0
 * @category models
 */
export type EpochMillis = typeof EpochMillis.Type;

/**
 * Schema that normalizes numeric timestamps or ISO strings into ISO strings without fractional seconds.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { ToIsoStr } from "@beep/schema/Timestamp"
 *
 * const decode = S.decodeUnknownSync(ToIsoStr)
 *
 * const iso = decode("2024-01-01T00:00:00.123Z")
 * console.log(iso) // "2024-01-01T00:00:00Z"
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const ToIsoStr = S.Union([ISOStr, S.Number]).pipe(
  S.decodeTo(
    ISOStr,
    SchemaTransformation.transform({
      decode: (input) => pipe(DateTime.makeUnsafe(input), DateTime.formatIso, stripMilliseconds),
      encode: (isoStr) => pipe(DateTime.makeUnsafe(isoStr), DateTime.formatIso, stripMilliseconds, ISOStr.make),
    })
  ),
  $I.annoteSchema("ToIsoStr", {
    description: "Schema transformer converting timestamps (numbers or ISO strings) into normalized ISO strings.",
    documentation: "Always emits ISO strings without fractional seconds to keep storage consistent.",
  })
);

/**
 * Normalized ISO string type extracted from {@link ToIsoStr}.
 *
 * @since 0.0.0
 * @category models
 */
export type ToIsoString = typeof ToIsoStr.Type;

/**
 * Namespace members for {@link ToIsoStr}.
 *
 * @since 0.0.0
 * @category models
 */
export declare namespace ToIsoStr {
  /**
   * Encoded representation of {@link ToIsoStr} (string or number union).
   *
   * @since 0.0.0
   * @category models
   */
  export type Encoded = typeof ToIsoStr.Encoded;
}

/**
 * Schema class wrapping `DateTime.Utc` as epoch milliseconds.
 *
 * Provides conversions to `DateTime.Utc`, `Date`, `ISOStr`, and `LocalDate`.
 *
 * @example
 * ```ts
 * import { Timestamp } from "@beep/schema/Timestamp"
 *
 * const ts = Timestamp.make({ epochMillis: 1704067200000 })
 *
 * console.log(ts.toISOStr())
 * console.log(ts.toLocalDate().toISOString())
 * ```
 *
 * @example
 * ```ts
 * import { Timestamp, now, isBefore } from "@beep/schema/Timestamp"
 *
 * const a = now()
 * const b = Timestamp.make({ epochMillis: 0 })
 *
 * console.log(isBefore(b, a)) // true
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export class Timestamp extends S.Class<Timestamp>("Timestamp")(
  {
    epochMillis: S.Int.check(S.isGreaterThanOrEqualTo(1)),
  },
  $I.annote("Timestamp", {
    description: "Timestamp - A Schema.Class wrapping DateTime.Utc for UTC timestamps",
    documentation: "Stores the epoch milliseconds internally.\nEncoded as ISO 8601 datetime string.",
  })
) {
  /**
   * Get the underlying DateTime.Utc instance
   *
   * @since 0.0.0
   * @category utilities
   * @returns * {@link Timestamp.toDateTime}
   */
  readonly toDateTime: () => DateTime.Utc = (): DateTime.Utc => DateTime.makeUnsafe(this.epochMillis);

  /**
   * Convert to JavaScript Date
   *
   * @since 0.0.0
   * @category utilities
   * @returns */
  readonly toDate: () => Date = (): Date => DateTime.toDateUtc(this.toDateTime());

  /**
   * Convert this timestamp to a branded ISO 8601 string without fractional seconds.
   *
   * @since 0.0.0
   * @category utilities
   */
  readonly toISOStr: () => Brand.Branded<Brand.Branded<string, "NonEmptyTrimmedStr">, "ISOStr"> = (): Brand.Branded<
    Brand.Branded<string, "NonEmptyTrimmedStr">,
    "ISOStr"
  > => ISOStr.make(normalizeIsoString(this.epochMillis));

  /**
   * Convert to string representation
   *
   * @since 0.0.0
   * @category utilities
   * @returns */
  readonly toStr: () => ISOStr = (): ISOStr => ISOStr.make(this.toISOStr());

  /**
   * Extract the LocalDate portion (UTC date)
   *
   * @since 0.0.0
   * @category utilities
   * @returns */
  readonly toLocalDate: () => LocalDate = (): LocalDate => {
    const date = DateTime.toPartsUtc(this.toDateTime());
    return LocalDate.make({
      year: date.year,
      month: date.month,
      day: date.day,
    });
  };
}

/**
 * Type guard for `Timestamp` instances.
 *
 * @since 0.0.0
 * @category guards
 */
export const isTimestamp = Schema.is(Timestamp);

/**
 * Create a `Timestamp` from a `DateTime.Utc`.
 *
 * @since 0.0.0
 * @category constructors
 */
export const fromDateTime = (dateTime: DateTime.Utc): Timestamp =>
  Timestamp.make({ epochMillis: dateTime.epochMilliseconds });

/**
 * Create a `Timestamp` from a JavaScript `Date`.
 *
 * @since 0.0.0
 * @category constructors
 */
export const fromDate = (date: Date): Timestamp => Timestamp.make({ epochMillis: date.getTime() });

/**
 * Create a `Timestamp` from an ISO 8601 string, returning an `Effect` that fails for invalid input.
 *
 * @since 0.0.0
 * @category constructors
 */
export const fromString = (dateString: string): Effect.Effect<Timestamp, SchemaIssue.InvalidValue> => {
  return pipe(
    DateTime.make(dateString),
    O.match({
      onNone: () => Effect.fail(new SchemaIssue.InvalidValue(O.some(dateString))),
      onSome: (dateTime) => Effect.succeed(Timestamp.make({ epochMillis: DateTime.toEpochMillis(dateTime) })),
    })
  );
};

/**
 * Create a `Timestamp` for the current wall-clock time.
 *
 * @since 0.0.0
 * @category constructors
 */
export const now = (): Timestamp => Timestamp.make({ epochMillis: DateTime.nowUnsafe().epochMilliseconds });

/**
 * Get the current timestamp as an `Effect` using the Clock service, testable with `TestClock`.
 *
 * @since 0.0.0
 * @category constructors
 */
export const nowEffect: Effect.Effect<Timestamp> = Effect.map(
  Effect.clockWith((clock) => clock.currentTimeMillis),
  (millis) => Timestamp.make({ epochMillis: Number(millis) })
);

/**
 * Chronological `Order` for `Timestamp` values.
 *
 * @since 0.0.0
 * @category ordering
 */
export const Order: Order_.Order<Timestamp> = Order_.make((a, b) => {
  if (a.epochMillis < b.epochMillis) return -1;
  if (a.epochMillis > b.epochMillis) return 1;
  return 0;
});

/**
 * Dual predicate returning `true` when `self` is chronologically before `that`.
 *
 * @since 0.0.0
 * @category predicates
 */
export const isBefore: {
  (that: Timestamp): (self: Timestamp) => boolean;
  (self: Timestamp, that: Timestamp): boolean;
} = dual(2, (self: Timestamp, that: Timestamp): boolean => Order(self, that) === -1);

/**
 * Dual predicate returning `true` when `self` is chronologically after `that`.
 *
 * @since 0.0.0
 * @category predicates
 */
export const isAfter: {
  (that: Timestamp): (self: Timestamp) => boolean;
  (self: Timestamp, that: Timestamp): boolean;
} = dual(2, (self: Timestamp, that: Timestamp): boolean => Order(self, that) === 1);

/**
 * Check whether two timestamps represent the same point in time.
 *
 * @since 0.0.0
 * @category predicates
 */
export const equals: {
  (that: Timestamp): (self: Timestamp) => boolean;
  (self: Timestamp, that: Timestamp): boolean;
} = dual(2, (self: Timestamp, that: Timestamp): boolean => self.epochMillis === that.epochMillis);

/**
 * Add milliseconds to a timestamp
 *
 * @since 0.0.0
 * @category utilities
 */
export const addMillis: {
  (millis: number): (self: Timestamp) => Timestamp;
  (self: Timestamp, millis: number): Timestamp;
} = dual(2, (self: Timestamp, millis: number): Timestamp => Timestamp.make({ epochMillis: self.epochMillis + millis }));

/**
 * Add seconds to a timestamp
 *
 * @since 0.0.0
 * @category utilities
 */
export const addSeconds: {
  (seconds: number): (self: Timestamp) => Timestamp;
  (self: Timestamp, seconds: number): Timestamp;
} = dual(2, (self: Timestamp, seconds: number): Timestamp => addMillis(self, seconds * 1000));

/**
 * Add minutes to a timestamp
 *
 * @since 0.0.0
 * @category utilities
 */
export const addMinutes: {
  (minutes: number): (self: Timestamp) => Timestamp;
  (self: Timestamp, minutes: number): Timestamp;
} = dual(2, (self: Timestamp, minutes: number): Timestamp => addMillis(self, minutes * 60 * 1000));

/**
 * Add hours to a timestamp
 *
 * @since 0.0.0
 * @category utilities
 */
export const addHours: {
  (hours: number): (self: Timestamp) => Timestamp;
  (self: Timestamp, hours: number): Timestamp;
} = dual(2, (self: Timestamp, hours: number): Timestamp => addMillis(self, hours * 60 * 60 * 1000));

/**
 * Add days to a timestamp
 *
 * @since 0.0.0
 * @category utilities
 */
export const addDays: {
  (days: number): (self: Timestamp) => Timestamp;
  (self: Timestamp, days: number): Timestamp;
} = dual(2, (self: Timestamp, days: number): Timestamp => addMillis(self, days * 24 * 60 * 60 * 1000));

/**
 * Get the difference in milliseconds between two timestamps
 *
 * @since 0.0.0
 * @category utilities
 */
export const diffInMillis: {
  (that: Timestamp): (self: Timestamp) => number;
  (self: Timestamp, that: Timestamp): number;
} = dual(2, (self: Timestamp, that: Timestamp): number => self.epochMillis - that.epochMillis);

/**
 * Get the difference in seconds between two timestamps
 *
 * @since 0.0.0
 * @category utilities
 */
export const diffInSeconds: {
  (that: Timestamp): (self: Timestamp) => number;
  (self: Timestamp, that: Timestamp): number;
} = dual(2, (self: Timestamp, that: Timestamp): number => Math.floor(diffInMillis(self, that) / 1000));

/**
 * Get the minimum of two timestamps
 *
 * @since 0.0.0
 * @category utilities
 */
export const min: {
  (that: Timestamp): (self: Timestamp) => Timestamp;
  (self: Timestamp, that: Timestamp): Timestamp;
} = dual(2, (self: Timestamp, that: Timestamp): Timestamp => (Order(self, that) <= 0 ? self : that));

/**
 * Get the maximum of two timestamps
 *
 * @since 0.0.0
 * @category utilities
 */
export const max: {
  (that: Timestamp): (self: Timestamp) => Timestamp;
  (self: Timestamp, that: Timestamp): Timestamp;
} = dual(2, (self: Timestamp, that: Timestamp): Timestamp => (Order(self, that) >= 0 ? self : that));

/**
 * The Unix epoch timestamp representing `1970-01-01T00:00:00.000Z`.
 *
 * @since 0.0.0
 * @category constructors
 */
export const EPOCH: Timestamp = Timestamp.make({ epochMillis: 0 });
