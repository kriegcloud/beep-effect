/**
 * @see { @link effect }
 * @see {@link "effect/Function#F.pipe" }
 * @module @beep/schema/Timestamp
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
 * @see {@link @beep/schema/Number#NonEmptyTrimmedStr | NonEmptyTrimmedStr}
 * Branded ISO 8601 datetime string
 *
 * @example
 * import { ISOStr } from "@beep/schema/Timestamp";
 * import * as S from "effect/Schema";
 *
 * const validValue = "2024-01-01T00:00:00.000Z";
 * const decoded = S.decodeUnknownSync(ISOStr)(validValue);
 * const encoded = S.encodeSync(ISOStr)(decoded);
 *
 * @since 0.0.0
 * @category DomainModel
 * @type {@link S.brand<S.brand<S.Trim, "NonEmptyTrimmedStr">, "ISOStr">}
 */
export const ISOStr = NonEmptyTrimmedStr.check(S.makeFilter((i) => O.isSome(DateTime.make(i)))).pipe(
  S.brand("ISOStr"),
  $I.annoteSchema("ISOStr", {
    description: "ISO 8601 datetime string",
  })
);

/**
 * type of @link {ISOStr}
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ISOStr = typeof ISOStr.Type;

/**
 * EpochMillis - Epoch milliseconds since 1970-01-01T00:00:00.000Z
 *
 * Stores the epoch milliseconds internally.
 * Encoded as ISO 8601 datetime string.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { Effect } from "effect";
 *
 * const JanuaryFirst1970 = new Date("1970-01-01T00:00:00.000Z").getTime()
 * const program = Effect.gen(function* () {
 *   const decoded = yield* S.decodeEffect(EpochMillis)(EpochMillis.makeUnsafe(JanuaryFirst1970));
 *   const encoded = yield* S.encodeEffect(EpochMillis)(decoded);
 * })
 *
 * program.pipe(Effect.runPromise);
 *
 * @Category DomainModel
 * @since 0.0.0
 * @type @link S.brand<S.brand<S.brand<S.Int, "Int">, "PosInt">, "EpochMillis">
 */
export const EpochMillis = PosInt.pipe(
  S.brand("EpochMillis"),
  $I.annoteSchema("EpochMillis", {
    description: "Epoch milliseconds since 1970-01-01T00:00:00.000Z",
    documentation: "Stores the epoch milliseconds internally.\nEncoded as ISO 8601 datetime string.",
  })
);

/**
 * type of {@link @beep/schema/Timestamp#L69-75  | EpochMillis}
 *
 * @import { Brand } from "effect/Schema";
 * @since 0.0.0
 * @category DomainModel
 * @type {@link effect/Brand |  number & Brand.Brand<"Int"> & Brand.Brand<"PosInt"> & Brand.Brand<"EpochMillis">}
 */
export type EpochMillis = typeof EpochMillis.Type;

/**
 * Schema transformer converting timestamps (numbers or ISO strings) into normalized ISO strings.
 *
 * Always emits ISO strings without fractional seconds to keep storage consistent.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { ToIsoString } from "@beep/schema/Timestamp";
 *
 * const iso = S.decodeSync(ToIsoString)("2024-01-01T00:00:00.123Z");
 *
 * Uses {@link effect/Schema#S.decodeTo | }
 * @category DomainModel
 * @since 0.0.0
 * @type {@link effect/Schema#S.decodeTo | S.decodeTo<S.String, S.Union<readonly [S.String, S.Number]>, never, never>}
 */
export const ToIsoStr = S.Union([ISOStr, S.Number]).pipe(
  S.decodeTo(
    ISOStr,
    SchemaTransformation.transform({
      decode: (input) => pipe(DateTime.makeUnsafe(input), DateTime.formatIso, stripMilliseconds),
      encode: (isoStr) => pipe(DateTime.makeUnsafe(isoStr), DateTime.formatIso, stripMilliseconds, ISOStr.makeUnsafe),
    })
  ),
  $I.annoteSchema("ToIsoStr", {
    description: "Schema transformer converting timestamps (numbers or ISO strings) into normalized ISO strings.",
    documentation: "Always emits ISO strings without fractional seconds to keep storage consistent.",
  })
);

/**
 * type for @link {ToIsoStr}
 *
 * @category DomainModel
 * @since 0.0.0
 * @example
 * import { type ToIsoString } from "@beep/schema/Timestamp";
 *
 * const value = "2024-01-01T00:00:00.123Z" as ToIsoString;
 * console.log(value);
 */
export type ToIsoString = typeof ToIsoStr.Type;

/**
 * The `ToIsoStr` namespace provides utilities for working with encoded ISO strings.
 *
 * This namespace is designed to define and work with a specific encoded type representation.
 *
 * ## Key Features
 *
 * - **Type definitions**: Encoded ISO string representation
 * - **Type safety**: Ensures encoded values conform to the defined type
 *
 * @example
 * ```typescript
 * import { type ToIsoStr } from "@beep/schema/Timestamp";
 *
 * // Access Encoded Type
 * type EncodedIsoString = ToIsoStr.Encoded;
 *
 * const valueIsoString: EncodedIsoString = "2024-11-01T00:00:00.000Z";
 *
 * console.log(valueIsoString);
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export declare namespace ToIsoStr {
  /**
   * encoded type fro @link {ToIsoStr}
   *
   * @since 0.0.0
   * @category DomainModel
   * @example
   * import { ToIsoStr } from "@beep/schema/Timestamp";
   *
   * const encoded: ToIsoStr.Encoded = "2024-11-01T00:00:00.000Z";
   */
  export type Encoded = typeof ToIsoStr.Encoded;
}

/**
 * Timestamp - A Schema.Class wrapping DateTime.Utc for UTC timestamps
 *
 * Stores the epoch milliseconds internally.
 * Encoded as ISO 8601 datetime string.
 *
 * @since 0.0.0
 * @category DomainModel
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
   * @category Utility
   * @returns {DateTime.Utc}
   * {@link Timestamp.toDateTime}
   */
  readonly toDateTime: () => DateTime.Utc = (): DateTime.Utc => DateTime.makeUnsafe(this.epochMillis);

  /**
   * Convert to JavaScript Date
   *
   * @since 0.0.0
   * @category Utility
   * @returns {Date}
   */
  readonly toDate: () => Date = (): Date => DateTime.toDateUtc(this.toDateTime());

  /**
   * Converts a timestamp or date object to its ISO 8601 string representation.
   *
   * The resulting string adheres to the `ISOStr` branded type, ensuring that it:
   * - Represents a valid ISO 8601-compliant datetime string.
   * - Is non-empty and trimmed, satisfying the `NonEmptyTrimmedStr` constraint.
   *
   * @example
   * ```typescript
   * import { ISOStr } from "effect/Date" // Hypothetical module path; update as needed.
   *
   * // Assume a valid date object
   * const date = new Date("2023-01-01T12:00:00Z")
   *
   * // Generate an ISO 8601 string from the date
   * const isoString = ISOStr.toISOStr(date)
   * console.log(isoString) // Outputs: "2023-01-01T12:00:00.000Z"
   *
   * // Use the branded type safely
   * type CheckBranding = typeof isoString extends Brand.Branded<string, "ISOStr"> ? true : false
   * ```
   *
   *
   * @category utilities
   */
  readonly toISOStr: () => Brand.Branded<Brand.Branded<string, "NonEmptyTrimmedStr">, "ISOStr"> = (): Brand.Branded<
    Brand.Branded<string, "NonEmptyTrimmedStr">,
    "ISOStr"
  > => ISOStr.makeUnsafe(normalizeIsoString(this.epochMillis));

  /**
   * Convert to string representation
   *
   * @since 0.0.0
   * @category Utility
   * @returns {ISOStr}
   */
  readonly toStr: () => ISOStr = (): ISOStr => ISOStr.makeUnsafe(this.toISOStr());

  /**
   * Extract the LocalDate portion (UTC date)
   *
   * @since 0.0.0
   * @category Utility
   * @returns {LocalDate}
   */
  readonly toLocalDate: () => LocalDate = (): LocalDate => {
    const date = DateTime.toPartsUtc(this.toDateTime());
    return LocalDate.makeUnsafe({
      year: date.year,
      month: date.month,
      day: date.day,
    });
  };
}

/**
 * Type guard for Timestamp using Schema.is
 *
 * @since 0.0.0
 * @category Validation
 */
export const isTimestamp = Schema.is(Timestamp);

/**
 * Create a Timestamp from a DateTime.Utc
 *
 * @since 0.0.0
 * @category Constructors
 */
export const fromDateTime = (dateTime: DateTime.Utc): Timestamp =>
  Timestamp.makeUnsafe({ epochMillis: dateTime.epochMilliseconds });

/**
 * Create a Timestamp from a JavaScript Date
 *
 * @since 0.0.0
 * @category Constructors
 */
export const fromDate = (date: Date): Timestamp => Timestamp.makeUnsafe({ epochMillis: date.getTime() });

/**
 * Create a Timestamp from an ISO 8601 string
 * Returns an Effect that may fail with ParseError
 *
 * @since 0.0.0
 * @category Constructors
 */
export const fromString = (dateString: string): Effect.Effect<Timestamp, SchemaIssue.InvalidValue> => {
  return pipe(
    DateTime.make(dateString),
    O.match({
      onNone: () => Effect.fail(new SchemaIssue.InvalidValue(O.some(dateString))),
      onSome: (dateTime) => Effect.succeed(Timestamp.makeUnsafe({ epochMillis: DateTime.toEpochMillis(dateTime) })),
    })
  );
};

/**
 * Get the current timestamp (now)
 *
 * @since 0.0.0
 * @category Constructors
 */
export const now = (): Timestamp => Timestamp.makeUnsafe({ epochMillis: Date.now() });

/**
 * Get the current timestamp as an Effect using the Clock service
 *
 * @since 0.0.0
 * @category Constructors
 */
export const nowEffect: Effect.Effect<Timestamp> = Effect.map(
  Effect.clockWith((clock) => clock.currentTimeMillis),
  (millis) => Timestamp.makeUnsafe({ epochMillis: Number(millis) })
);

/**
 * Order for Timestamp - compares chronologically
 *
 * @since 0.0.0
 * @category Ordering
 */
export const Order: Order_.Order<Timestamp> = Order_.make((a, b) => {
  if (a.epochMillis < b.epochMillis) return -1;
  if (a.epochMillis > b.epochMillis) return 1;
  return 0;
});

/**
 * Check if the first timestamp is before the second
 *
 * @since 0.0.0
 * @category Validation
 */
export const isBefore: {
  (that: Timestamp): (self: Timestamp) => boolean;
  (self: Timestamp, that: Timestamp): boolean;
} = dual(2, (self: Timestamp, that: Timestamp): boolean => Order(self, that) === -1);

/**
 * Check if the first timestamp is after the second
 *
 * @since 0.0.0
 * @category Validation
 */
export const isAfter: {
  (that: Timestamp): (self: Timestamp) => boolean;
  (self: Timestamp, that: Timestamp): boolean;
} = dual(2, (self: Timestamp, that: Timestamp): boolean => Order(self, that) === 1);

/**
 * Check if two timestamps are equal
 *
 * @since 0.0.0
 * @category Utility
 */
export const equals: {
  (that: Timestamp): (self: Timestamp) => boolean;
  (self: Timestamp, that: Timestamp): boolean;
} = dual(2, (self: Timestamp, that: Timestamp): boolean => self.epochMillis === that.epochMillis);

/**
 * Add milliseconds to a timestamp
 *
 * @since 0.0.0
 * @category Utility
 */
export const addMillis: {
  (millis: number): (self: Timestamp) => Timestamp;
  (self: Timestamp, millis: number): Timestamp;
} = dual(
  2,
  (self: Timestamp, millis: number): Timestamp => Timestamp.makeUnsafe({ epochMillis: self.epochMillis + millis })
);

/**
 * Add seconds to a timestamp
 *
 * @since 0.0.0
 * @category Utility
 */
export const addSeconds: {
  (seconds: number): (self: Timestamp) => Timestamp;
  (self: Timestamp, seconds: number): Timestamp;
} = dual(2, (self: Timestamp, seconds: number): Timestamp => addMillis(self, seconds * 1000));

/**
 * Add minutes to a timestamp
 *
 * @since 0.0.0
 * @category Utility
 */
export const addMinutes: {
  (minutes: number): (self: Timestamp) => Timestamp;
  (self: Timestamp, minutes: number): Timestamp;
} = dual(2, (self: Timestamp, minutes: number): Timestamp => addMillis(self, minutes * 60 * 1000));

/**
 * Add hours to a timestamp
 *
 * @since 0.0.0
 * @category Utility
 */
export const addHours: {
  (hours: number): (self: Timestamp) => Timestamp;
  (self: Timestamp, hours: number): Timestamp;
} = dual(2, (self: Timestamp, hours: number): Timestamp => addMillis(self, hours * 60 * 60 * 1000));

/**
 * Add days to a timestamp
 *
 * @since 0.0.0
 * @category Utility
 */
export const addDays: {
  (days: number): (self: Timestamp) => Timestamp;
  (self: Timestamp, days: number): Timestamp;
} = dual(2, (self: Timestamp, days: number): Timestamp => addMillis(self, days * 24 * 60 * 60 * 1000));

/**
 * Get the difference in milliseconds between two timestamps
 *
 * @since 0.0.0
 * @category Utility
 */
export const diffInMillis: {
  (that: Timestamp): (self: Timestamp) => number;
  (self: Timestamp, that: Timestamp): number;
} = dual(2, (self: Timestamp, that: Timestamp): number => self.epochMillis - that.epochMillis);

/**
 * Get the difference in seconds between two timestamps
 *
 * @since 0.0.0
 * @category Utility
 */
export const diffInSeconds: {
  (that: Timestamp): (self: Timestamp) => number;
  (self: Timestamp, that: Timestamp): number;
} = dual(2, (self: Timestamp, that: Timestamp): number => Math.floor(diffInMillis(self, that) / 1000));

/**
 * Get the minimum of two timestamps
 *
 * @since 0.0.0
 * @category Utility
 */
export const min: {
  (that: Timestamp): (self: Timestamp) => Timestamp;
  (self: Timestamp, that: Timestamp): Timestamp;
} = dual(2, (self: Timestamp, that: Timestamp): Timestamp => (Order(self, that) <= 0 ? self : that));

/**
 * Get the maximum of two timestamps
 *
 * @since 0.0.0
 * @category Utility
 */
export const max: {
  (that: Timestamp): (self: Timestamp) => Timestamp;
  (self: Timestamp, that: Timestamp): Timestamp;
} = dual(2, (self: Timestamp, that: Timestamp): Timestamp => (Order(self, that) >= 0 ? self : that));

/**
 * Unix epoch timestamp (1970-01-01T00:00:00.000Z)
 *
 * @since 0.0.0
 * @category Utility
 */
export const EPOCH: Timestamp = Timestamp.makeUnsafe({ epochMillis: 0 });
