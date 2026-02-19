/**
 * Comprehensive date-time helpers that normalize disparate inputs.
 *
 * Provides unions and transformers for accepting Effect `DateTime`, JavaScript `Date`,
 * ISO strings, or numeric timestamps while ensuring canonical ISO emission.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { DateFromAllAcceptable } from "@beep/schema/primitives/temporal/dates/date-time";
 *
 * const toDate = S.decodeSync(DateFromAllAcceptable);
 * const parsed = toDate("2024-01-01T00:00:00Z");
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */

import { $SchemaId } from "@beep/identity/packages";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $SchemaId.create("primitives/temporal/dates/date-time");

const DateTimeUtcByInstant = S.DateTimeUtcFromSelf.annotations(
  $I.annotations("dates/DateTimeUtcByInstant", {
    equivalence: () => (a: DateTime.Utc, b: DateTime.Utc) =>
      DateTime.toDate(a).getTime() === DateTime.toDate(b).getTime(),
    jsonSchema: {
      format: "date-time",
      type: "string",
    },
  })
);

/**
 * Union of every acceptable input form for date-time fields.
 *
 * Accepts raw `Date`, ISO strings, numeric timestamps, or Effect `DateTime` instances
 * so callers can supply whichever form they already have.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { AllAcceptableDateInputs } from "@beep/schema/primitives/temporal/dates/date-time";
 *
 * const decode = S.decodeSync(AllAcceptableDateInputs);
 * const value = decode(1704067200000);
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */
export const AllAcceptableDateInputs = S.Union(
  S.DateFromSelf.annotations(
    $I.annotations("dates/AllAcceptableDateInputs/DateFromSelf", {
      jsonSchema: {
        format: "date-time",
        type: "string",
      },
    })
  ),
  S.DateFromString.annotations(
    $I.annotations("dates/AllAcceptableDateInputs/DateFromString", {
      jsonSchema: {
        format: "date-time",
        type: "string",
      },
    })
  ),
  S.DateFromNumber.annotations(
    $I.annotations("dates/AllAcceptableDateInputs/DateFromNumber", {
      jsonSchema: {
        format: "timestamp",
        type: "number",
      },
    })
  ),
  DateTimeUtcByInstant
).annotations(
  $I.annotations("dates/AllAcceptableDateInputs", {
    jsonSchema: {
      format: "date-time",
      type: "string",
    },
  })
);

/**
 * Namespace exposing runtime and encoded types for {@link AllAcceptableDateInputs}.
 *
 * @example
 * import type { AllAcceptableDateInputs } from "@beep/schema/primitives/temporal/dates/date-time";
 *
 * type Inputs = AllAcceptableDateInputs.Type;
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */
export declare namespace AllAcceptableDateInputs {
  /**
   * Runtime type accepted by {@link AllAcceptableDateInputs}.
   *
   * @category Primitives/Temporal/Dates
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof AllAcceptableDateInputs>;
  /**
   * Encoded representation parsed by {@link AllAcceptableDateInputs}.
   *
   * @category Primitives/Temporal/Dates
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof AllAcceptableDateInputs>;
}

/**
 * Converts any acceptable input into a canonical JavaScript `Date`.
 *
 * Ensures downstream logic always receives a Date regardless of whether callers provided
 * an `Effect/DateTime`, ISO string, or numeric timestamp.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { DateFromAllAcceptable } from "@beep/schema/primitives/temporal/dates/date-time";
 *
 * const toDate = S.decodeSync(DateFromAllAcceptable);
 * const result = toDate("2024-02-01T00:00:00Z");
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */
export const DateFromAllAcceptable = S.transformOrFail(AllAcceptableDateInputs, S.ValidDateFromSelf, {
  decode: (input, _, ast) =>
    ParseResult.try({
      catch: () => new ParseResult.Type(ast, input, "Invalid date"),
      try: () => (DateTime.isDateTime(input) ? DateTime.toDate(input) : S.decodeSync(S.ValidDateFromSelf)(input)),
    }),
  encode: (input) => ParseResult.succeed(input),
  strict: true,
}).annotations(
  $I.annotations("dates/DateFromAllAcceptable", {
    jsonSchema: {
      format: "date-time",
      type: "string",
    },
  })
);

/**
 * Namespace exposing helper types for {@link DateFromAllAcceptable}.
 *
 * @example
 * import type { DateFromAllAcceptable } from "@beep/schema/primitives/temporal/dates/date-time";
 *
 * type Value = DateFromAllAcceptable.Type;
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */
export declare namespace DateFromAllAcceptable {
  /**
   * Runtime type produced by {@link DateFromAllAcceptable}.
   *
   * @category Primitives/Temporal/Dates
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof DateFromAllAcceptable>;
  /**
   * Encoded representation accepted by {@link DateFromAllAcceptable}.
   *
   * @category Primitives/Temporal/Dates
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof DateFromAllAcceptable>;
}

/**
 * Converts acceptable inputs into Effect `DateTime.Utc` instances.
 *
 * Useful when storage layers prefer UTC instants but callers provide strings or JavaScript dates.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { DateTimeUtcFromAllAcceptable } from "@beep/schema/primitives/temporal/dates/date-time";
 *
 * const toUtc = S.decodeSync(DateTimeUtcFromAllAcceptable);
 * const result = toUtc("2024-02-01T00:00:00Z");
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */
export const DateTimeUtcFromAllAcceptable = S.transformOrFail(
  S.Union(DateFromAllAcceptable, DateTimeUtcByInstant),
  DateTimeUtcByInstant,
  {
    decode: (input, _options, ast) =>
      Effect.gen(function* () {
        if (DateTime.isDateTime(input)) {
          return DateTime.toUtc(input);
        }
        const date = yield* F.pipe(
          S.decodeUnknown(S.ValidDateFromSelf)(input),
          Effect.mapError(() => new ParseResult.Type(ast, input, "Invalid date"))
        );
        return yield* F.pipe(
          date,
          DateTime.make,
          O.map(DateTime.toUtc),
          O.match({
            onNone: () => Effect.fail(new ParseResult.Type(ast, input, "Invalid date")),
            onSome: Effect.succeed,
          })
        );
      }),
    encode: (input) => Effect.succeed(DateTime.toDateUtc(input)),
    strict: true,
  }
).annotations(
  $I.annotations("dates/DateTimeUtcFromAllAcceptable", {
    jsonSchema: {
      format: "date-time",
      type: "string",
    },
  })
);

/**
 * Namespace exposing helper types for {@link DateTimeUtcFromAllAcceptable}.
 *
 * @example
 * import type { DateTimeUtcFromAllAcceptable } from "@beep/schema/primitives/temporal/dates/date-time";
 *
 * type Value = DateTimeUtcFromAllAcceptable.Type;
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */
export declare namespace DateTimeUtcFromAllAcceptable {
  /**
   * Runtime type produced by {@link DateTimeUtcFromAllAcceptable}.
   *
   * @category Primitives/Temporal/Dates
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof DateTimeUtcFromAllAcceptable>;
  /**
   * Encoded representation accepted by {@link DateTimeUtcFromAllAcceptable}.
   *
   * @category Primitives/Temporal/Dates
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof DateTimeUtcFromAllAcceptable>;
}

/**
 * Normalizes ISO strings by removing millisecond precision.
 *
 * @example
 * import { normalizeIsoString } from "@beep/schema/primitives/temporal/dates/date-time";
 *
 * const normalized = normalizeIsoString("2024-01-01T00:00:00.123Z");
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */
export const normalizeIsoString = (dateValue: number | string | Date): string =>
  F.pipe(new Date(dateValue).toISOString(), Str.replace(/\.\d{3}Z$/, "Z"));

/**
 * Schema transformer that converts ISO strings to numeric timestamps.
 *
 * Accepts ISO strings or numbers and always emits millisecond timestamps for storage layers (e.g., Zero).
 *
 * @example
 * import * as S from "effect/Schema";
 * import { IsoStringToTimestamp } from "@beep/schema/primitives/temporal/dates/date-time";
 *
 * const toTimestamp = S.decodeSync(IsoStringToTimestamp);
 * const encoded = toTimestamp("2024-01-01T00:00:00Z");
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */
export const IsoStringToTimestamp = S.transform(S.Union(S.String, S.Number), S.Number, {
  decode: (input: string | number) => new Date(input).getTime(),
  encode: normalizeIsoString,
  strict: true,
}).annotations(
  $I.annotations("dates/IsoStringToTimestamp", {
    description: "Transforms ISO strings into millisecond timestamps and encodes back to canonical ISO.",
  })
);

/**
 * Namespace exposing helper types for {@link IsoStringToTimestamp}.
 *
 * @example
 * import type { IsoStringToTimestamp } from "@beep/schema/primitives/temporal/dates/date-time";
 *
 * type Value = IsoStringToTimestamp.Type;
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */
export declare namespace IsoStringToTimestamp {
  /**
   * Runtime type produced by {@link IsoStringToTimestamp}.
   *
   * @category Primitives/Temporal/Dates
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof IsoStringToTimestamp>;
  /**
   * Encoded representation accepted by {@link IsoStringToTimestamp}.
   *
   * @category Primitives/Temporal/Dates
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof IsoStringToTimestamp>;
}

/**
 * Converts any acceptable date input into a numeric millisecond timestamp.
 *
 * This schema accepts `string | number | Date | DateTime.Utc` as input during decoding
 * and normalizes all of them to a numeric epoch millisecond timestamp.
 *
 * **Key characteristics**:
 * - **Type**: `number` (runtime value is always a number)
 * - **Encoded**: `number` (both input and output are numbers)
 * - **Decoding**: Accepts `string | number | Date | DateTime.Utc` and converts to `number`
 * - **Encoding**: `number` → `number` (identity transformation)
 *
 * This is implemented using `Schema.declare` to have precise control over the `Encoded` type,
 * ensuring it's `number` rather than the union of all acceptable input types. The decode function
 * handles all input type variants internally.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { EpochMillisFromAllAcceptable } from "@beep/schema/primitives/temporal/dates/date-time";
 *
 * // Decoding from various input types
 * const toTimestamp = S.decodeSync(EpochMillisFromAllAcceptable);
 * const fromString = toTimestamp("2024-01-01T00:00:00Z"); // 1704067200000
 * const fromNumber = toTimestamp(1704067200000);           // 1704067200000
 * const fromDate = toTimestamp(new Date("2024-01-01"));    // 1704067200000
 *
 * // Encoding always produces a number
 * const encode = S.encodeSync(EpochMillisFromAllAcceptable);
 * const encoded = encode(1704067200000); // 1704067200000 (number)
 *
 * // In structs, Encoded type is number
 * const MySchema = S.Struct({ expiresAt: S.optional(EpochMillisFromAllAcceptable) });
 * type Encoded = S.Schema.Encoded<typeof MySchema>; // { readonly expiresAt?: number }
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */
export const EpochMillisFromAllAcceptable: S.Schema<number, number> = S.declare(
  [],
  {
    decode: () => (input, _options, ast) =>
      Effect.gen(function* () {
        // Handle number input (identity)
        if (typeof input === "number") {
          if (Number.isNaN(input) || !Number.isFinite(input) || input < 0) {
            return yield* ParseResult.fail(new ParseResult.Type(ast, input, "Invalid timestamp"));
          }
          return input;
        }

        // Handle string input (ISO date string)
        if (typeof input === "string") {
          const time = new Date(input).getTime();
          if (Number.isNaN(time)) {
            return yield* ParseResult.fail(new ParseResult.Type(ast, input, "Invalid ISO date string"));
          }
          return time;
        }

        // Handle Date input
        if (input instanceof Date) {
          const time = input.getTime();
          if (Number.isNaN(time)) {
            return yield* ParseResult.fail(new ParseResult.Type(ast, input, "Invalid Date object"));
          }
          return time;
        }

        // Handle DateTime.Utc input
        if (DateTime.isDateTime(input)) {
          return yield* ParseResult.try({
            try: () => DateTime.toEpochMillis(input),
            catch: () => new ParseResult.Type(ast, input, "Invalid DateTime.Utc"),
          });
        }

        // Unknown input type
        return yield* ParseResult.fail(
          new ParseResult.Type(ast, input, "Expected string | number | Date | DateTime.Utc")
        );
      }),
    encode: () => (input, _options, _ast) =>
      // Encoding: number → number (identity)
      // The input is already validated to be a number by the Type
      ParseResult.succeed(input as number),
  },
  $I.annotations("dates/EpochMillisFromAllAcceptable", {
    description: "Epoch milliseconds timestamp that accepts string, number, Date, or DateTime.Utc during decoding",
    jsonSchema: {
      type: "number",
      format: "timestamp",
    },
  })
);

/**
 * Namespace exposing helper types for {@link EpochMillisFromAllAcceptable}.
 *
 * @example
 * import type { EpochMillisFromAllAcceptable } from "@beep/schema/primitives/temporal/dates/date-time";
 *
 * type Millis = EpochMillisFromAllAcceptable.Type;
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */
export declare namespace EpochMillisFromAllAcceptable {
  /**
   * Runtime type produced by {@link EpochMillisFromAllAcceptable}.
   *
   * @category Primitives/Temporal/Dates
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof EpochMillisFromAllAcceptable>;
  /**
   * Encoded representation accepted by {@link EpochMillisFromAllAcceptable}.
   *
   * @category Primitives/Temporal/Dates
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof EpochMillisFromAllAcceptable>;
}
