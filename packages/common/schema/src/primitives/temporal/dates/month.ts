/**
 * Month literal kits and transformation schemas.
 *
 * Provides string/number representations plus helpers to transform between them.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { MonthNumberFromMonthInt } from "@beep/schema/primitives/temporal/dates/month";
 *
 * const literal = S.decodeSync(MonthNumberFromMonthInt)(5);
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */

import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { MappedLiteralKit } from "../../../derived/kits/mapped-literal-kit";
import { StringLiteralKit } from "../../../derived/kits/string-literal-kit";
import { $TemporalId } from "../../../internal";

const { $MonthId: Id } = $TemporalId.compose("month");

/**
 * Schema validating lowercase month strings.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { MonthString } from "@beep/schema/primitives/temporal/dates/month";
 *
 * const parsed = S.decodeSync(MonthString)("march");
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */
export class MonthString extends StringLiteralKit(
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december"
).annotations(
  Id.annotations("MonthString", {
    description: "Month of the year as a string.",
  })
) {}

/**
 * Namespace exposing helper types for {@link MonthString}.
 *
 * @example
 * import type { MonthString } from "@beep/schema/primitives/temporal/dates/month";
 *
 * let month: MonthString.Type;
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */
export declare namespace MonthString {
  /**
   * Runtime type of {@link MonthString}.
   *
   * @category Primitives/Temporal/Dates
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof MonthString>;
  /**
   * Encoded representation of {@link MonthString}.
   *
   * @category Primitives/Temporal/Dates
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof MonthString>;
}

/**
 * Schema validating zero-padded month numbers (`"01"` ... `"12"`).
 *
 * @example
 * import * as S from "effect/Schema";
 * import { MonthNumber } from "@beep/schema/primitives/temporal/dates/month";
 *
 * const parsed = S.decodeSync(MonthNumber)("12");
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */
export class MonthNumber extends StringLiteralKit(
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
  {
    enumMapping: [
      ["01", "january"],
      ["02", "february"],
      ["03", "march"],
      ["04", "april"],
      ["05", "may"],
      ["06", "june"],
      ["07", "july"],
      ["08", "august"],
      ["09", "september"],
      ["10", "october"],
      ["11", "november"],
      ["12", "december"],
    ],
  }
).annotations(
  Id.annotations("MonthNumber", {
    description: "Month of the year as a zero-padded number.",
  })
) {}

/**
 * Namespace exposing helper types for {@link MonthNumber}.
 *
 * @example
 * import type { MonthNumber } from "@beep/schema/primitives/temporal/dates/month";
 *
 * let num: MonthNumber.Type;
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */
export declare namespace MonthNumber {
  /**
   * Runtime type of {@link MonthNumber}.
   *
   * @category Primitives/Temporal/Dates
   * @since 0.1.0
   */
  export type Type = typeof MonthNumber.Type;
  /**
   * Encoded representation of {@link MonthNumber}.
   *
   * @category Primitives/Temporal/Dates
   * @since 0.1.0
   */
  export type Encoded = typeof MonthNumber.Encoded;
}

/**
 * Literal schema representing month integers (1-12).
 *
 * @example
 * import * as S from "effect/Schema";
 * import { MonthInts } from "@beep/schema/primitives/temporal/dates/month";
 *
 * const parse = S.decodeSync(MonthInts);
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */
export const MonthInts = S.Literal(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12);

/**
 * Schema bridging raw integers and {@link MonthNumber} string literals.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { MonthInt } from "@beep/schema/primitives/temporal/dates/month";
 *
 * const parsed = S.decodeSync(MonthInt)(7);
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */
export class MonthInt extends S.transformOrFail(S.Int, MonthInts, {
  strict: true,
  decode: (i, _, ast) =>
    ParseResult.try({
      try: () => S.decodeUnknownSync(MonthInts)(i),
      catch: () => new ParseResult.Type(ast, i, "Invalid month int"),
    }),
  encode: (i) => ParseResult.succeed(i),
}).annotations(
  Id.annotations("MonthInt", {
    description: "Month of the year as an integer (1-12).",
  })
) {}

/**
 * Namespace exposing helper types for {@link MonthInt}.
 *
 * @example
 * import type { MonthInt } from "@beep/schema/primitives/temporal/dates/month";
 *
 * let month: MonthInt.Type;
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */
export declare namespace MonthInt {
  /**
   * Runtime type of {@link MonthInt}.
   *
   * @category Primitives/Temporal/Dates
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof MonthInt>;
  /**
   * Encoded representation of {@link MonthInt}.
   *
   * @category Primitives/Temporal/Dates
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof MonthInt>;
}

/**
 * Mapped literal kit for bidirectional int↔string month transformations.
 *
 * Provides static `From` (integer literals 1-12) and `To` (zero-padded strings "01"-"12") kits
 * along with decode/encode maps for programmatic access.
 *
 * @example
 * import { MonthIntToNumber } from "@beep/schema/primitives/temporal/dates/month";
 *
 * // Access literal kits
 * MonthIntToNumber.From.Options  // => [1, 2, 3, ..., 12]
 * MonthIntToNumber.To.Options    // => ["01", "02", ..., "12"]
 *
 * // Lookup maps
 * MonthIntToNumber.decodeMap.get(1)   // => "01"
 * MonthIntToNumber.encodeMap.get("01") // => 1
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */
export const MonthIntToNumber = MappedLiteralKit(
  [1, "01"],
  [2, "02"],
  [3, "03"],
  [4, "04"],
  [5, "05"],
  [6, "06"],
  [7, "07"],
  [8, "08"],
  [9, "09"],
  [10, "10"],
  [11, "11"],
  [12, "12"]
).annotations(
  Id.annotations("MonthIntToNumber", {
    description: "Bidirectional month integer to zero-padded string mapping.",
  })
);

/**
 * Namespace exposing helper types for {@link MonthIntToNumber}.
 *
 * @example
 * import type { MonthIntToNumber } from "@beep/schema/primitives/temporal/dates/month";
 *
 * let monthNumber: MonthIntToNumber.Type;
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */
export declare namespace MonthIntToNumber {
  /**
   * Runtime type of {@link MonthIntToNumber} (decoded value: zero-padded string).
   *
   * @category Primitives/Temporal/Dates
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof MonthIntToNumber>;
  /**
   * Encoded representation of {@link MonthIntToNumber} (integer 1-12).
   *
   * @category Primitives/Temporal/Dates
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof MonthIntToNumber>;
}

/**
 * Mapped literal kit for bidirectional int↔string month transformations.
 *
 * Provides static `From` (integer literals 1-12) and `To` (zero-padded strings "01"-"12") kits
 * along with decode/encode maps for programmatic access.
 *
 * @example
 * import { MonthIntToName } from "@beep/schema/primitives/temporal/dates/month";
 *
 * // Access literal kits
 * MonthIntToName.From.Options  // => [1, 2, 3, ..., 12]
 * MonthIntToName.To.Options    // => ["January", "February", ..., "December"]
 *
 * // Lookup maps
 * MonthIntToName.decodeMap.get(1)   // => "01"
 * MonthIntToName.encodeMap.get("01") // => 1
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */
export const MonthIntToName = MappedLiteralKit(
  [1, "January"],
  [2, "February"],
  [3, "March"],
  [4, "April"],
  [5, "May"],
  [6, "June"],
  [7, "July"],
  [8, "August"],
  [9, "September"],
  [10, "October"],
  [11, "November"],
  [12, "December"]
).annotations(
  Id.annotations("MonthIntToName", {
    description: "Bidirectional month integer to zero-padded string mapping.",
  })
);

/**
 * Namespace exposing helper types for {@link MonthIntToName}.
 *
 * @example
 * import type { MonthIntToName } from "@beep/schema/primitives/temporal/dates/month";
 *
 * let monthNumber: MonthIntToName.Type;
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */
export declare namespace MonthIntToName {
  /**
   * Runtime type of {@link MonthIntToName} (decoded value: zero-padded string).
   *
   * @category Primitives/Temporal/Dates
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof MonthIntToName>;
  /**
   * Encoded representation of {@link MonthIntToName} (integer 1-12).
   *
   * @category Primitives/Temporal/Dates
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof MonthIntToName>;
}

/**
 * Converts {@link MonthInt.Type} values to {@link MonthNumber.Type} literals.
 *
 * Uses the decode map from {@link MonthIntToNumber} for O(1) lookup.
 *
 * @example
 * import { monthIntToNumber } from "@beep/schema/primitives/temporal/dates/month";
 *
 * const literal = monthIntToNumber(1);
 * // "01"
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */
export const monthIntToNumber = (i: MonthInt.Type): MonthNumber.Type =>
  MonthIntToNumber.decodeMap.get(i) as MonthNumber.Type;

/**
 * Converts zero-padded month literals back to integers.
 *
 * Uses the encode map from {@link MonthIntToNumber} for O(1) lookup.
 *
 * @example
 * import { monthNumberToInt } from "@beep/schema/primitives/temporal/dates/month";
 *
 * const value = monthNumberToInt("12");
 * // 12
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */
export const monthNumberToInt = (s: MonthNumber.Type): MonthInt.Type =>
  MonthIntToNumber.encodeMap.get(s) as MonthInt.Type;

/**
 * Schema that transforms {@link MonthInt} values into {@link MonthNumber} literals.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { MonthNumberFromMonthInt } from "@beep/schema/primitives/temporal/dates/month";
 *
 * const literal = S.decodeSync(MonthNumberFromMonthInt)(5);
 * // "05"
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */
export class MonthNumberFromMonthInt extends S.transform(MonthInt, MonthNumber, {
  strict: true,
  decode: monthIntToNumber,
  encode: monthNumberToInt,
}).annotations(
  Id.annotations("MonthNumberFromMonthInt", {
    description: "Transform month integers to zero-padded literals.",
  })
) {}

/**
 * Namespace exposing helper types for {@link MonthNumberFromMonthInt}.
 *
 * @example
 * import type { MonthNumberFromMonthInt } from "@beep/schema/primitives/temporal/dates/month";
 *
 * let literal: MonthNumberFromMonthInt.Type;
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */
export declare namespace MonthNumberFromMonthInt {
  /**
   * Runtime type inferred from {@link MonthNumberFromMonthInt}.
   *
   * @category Primitives/Temporal/Dates
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof MonthNumberFromMonthInt>;
  /**
   * Encoded representation of {@link MonthNumberFromMonthInt}.
   *
   * @category Primitives/Temporal/Dates
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof MonthNumberFromMonthInt>;
}
