/**
 * Month literal kits and transformation schemas.
 *
 * Provides string/number representations plus helpers to transform between them.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { MonthNumberFromMonthInt } from "@beep/schema-v2/primitives/temporal/dates/month";
 *
 * const literal = S.decodeSync(MonthNumberFromMonthInt)(5);
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */
import { stringLiteralKit } from "@beep/schema-v2/derived/kits/string-literal-kit";
import * as Match from "effect/Match";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { Id } from "./_id";

/**
 * Literal kit covering month names.
 *
 * Enables `Schema`, `Enum`, and `Options` for lowercase month strings.
 *
 * @example
 * import { MonthStringKit } from "@beep/schema-v2/primitives/temporal/dates/month";
 *
 * const names = MonthStringKit.Options;
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */
export const MonthStringKit = stringLiteralKit(
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
);

/**
 * Schema validating lowercase month strings.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { MonthString } from "@beep/schema-v2/primitives/temporal/dates/month";
 *
 * const parsed = S.decodeSync(MonthString)("march");
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */
export class MonthString extends MonthStringKit.Schema.annotations(
  Id.annotations("MonthString", {
    description: "Month of the year as a string.",
  })
) {
  /**
   * Enum keyed by month strings.
   *
   * @category Primitives/Temporal/Dates
   * @since 0.1.0
   */
  static readonly Enum = MonthStringKit.Enum;
  /**
   * Literal options for {@link MonthString}.
   *
   * @category Primitives/Temporal/Dates
   * @since 0.1.0
   */
  static readonly Options = MonthStringKit.Options;
}

/**
 * Namespace exposing helper types for {@link MonthString}.
 *
 * @example
 * import type { MonthString } from "@beep/schema-v2/primitives/temporal/dates/month";
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
 * Literal kit for zero-padded month numbers.
 *
 * @example
 * import { MonthNumberKit } from "@beep/schema-v2/primitives/temporal/dates/month";
 *
 * const digits = MonthNumberKit.Options;
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */
export const MonthNumberKit = stringLiteralKit("01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", {
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
});

/**
 * Schema validating zero-padded month numbers (`"01"` ... `"12"`).
 *
 * @example
 * import * as S from "effect/Schema";
 * import { MonthNumber } from "@beep/schema-v2/primitives/temporal/dates/month";
 *
 * const parsed = S.decodeSync(MonthNumber)("12");
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */
export class MonthNumber extends MonthNumberKit.Schema.annotations(
  Id.annotations("MonthNumber", {
    description: "Month of the year as a zero-padded number.",
  })
) {
  /**
   * Enum keyed by `"01"` ... `"12"`.
   *
   * @category Primitives/Temporal/Dates
   * @since 0.1.0
   */
  static readonly Enum = MonthNumberKit.Enum;
  /**
   * Literal options for {@link MonthNumber}.
   *
   * @category Primitives/Temporal/Dates
   * @since 0.1.0
   */
  static readonly Options = MonthNumberKit.Options;
}

/**
 * Namespace exposing helper types for {@link MonthNumber}.
 *
 * @example
 * import type { MonthNumber } from "@beep/schema-v2/primitives/temporal/dates/month";
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
  export type Type = S.Schema.Type<typeof MonthNumber>;
  /**
   * Encoded representation of {@link MonthNumber}.
   *
   * @category Primitives/Temporal/Dates
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof MonthNumber>;
}

/**
 * Literal schema representing month integers (1-12).
 *
 * @example
 * import * as S from "effect/Schema";
 * import { MonthInts } from "@beep/schema-v2/primitives/temporal/dates/month";
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
 * import { MonthInt } from "@beep/schema-v2/primitives/temporal/dates/month";
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
 * import type { MonthInt } from "@beep/schema-v2/primitives/temporal/dates/month";
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
 * Converts {@link MonthInt.Type} values to {@link MonthNumber.Enum} literals.
 *
 * @example
 * import { monthIntToNumber } from "@beep/schema-v2/primitives/temporal/dates/month";
 *
 * const literal = monthIntToNumber(1);
 * // "01"
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */
export const monthIntToNumber = Match.type<MonthInt.Type>().pipe(
  Match.when(1, () => MonthNumber.Enum.january),
  Match.when(2, () => MonthNumber.Enum.february),
  Match.when(3, () => MonthNumber.Enum.march),
  Match.when(4, () => MonthNumber.Enum.april),
  Match.when(5, () => MonthNumber.Enum.may),
  Match.when(6, () => MonthNumber.Enum.june),
  Match.when(7, () => MonthNumber.Enum.july),
  Match.when(8, () => MonthNumber.Enum.august),
  Match.when(9, () => MonthNumber.Enum.september),
  Match.when(10, () => MonthNumber.Enum.october),
  Match.when(11, () => MonthNumber.Enum.november),
  Match.when(12, () => MonthNumber.Enum.december),
  Match.exhaustive
);
// todo should use `S.transformLiteral` for this.
/**
 * Converts zero-padded month literals back to integers.
 *
 * @example
 * import { monthNumberToInt } from "@beep/schema-v2/primitives/temporal/dates/month";
 *
 * const value = monthNumberToInt("12");
 * // 12
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */
export const monthNumberToInt = Match.type<MonthNumber.Type>().pipe(
  Match.when("01", () => 1 as const),
  Match.when("02", () => 2 as const),
  Match.when("03", () => 3 as const),
  Match.when("04", () => 4 as const),
  Match.when("05", () => 5 as const),
  Match.when("06", () => 6 as const),
  Match.when("07", () => 7 as const),
  Match.when("08", () => 8 as const),
  Match.when("09", () => 9 as const),
  Match.when("10", () => 10 as const),
  Match.when("11", () => 11 as const),
  Match.when("12", () => 12 as const),
  Match.exhaustive
);

/**
 * Schema that transforms {@link MonthInt} values into {@link MonthNumber} literals.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { MonthNumberFromMonthInt } from "@beep/schema-v2/primitives/temporal/dates/month";
 *
 * const literal = S.decodeSync(MonthNumberFromMonthInt)(5);
 * // "05"
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 */
export class MonthNumberFromMonthInt extends S.transform(MonthInt, MonthNumber, {
  strict: true,
  decode: (i) => monthIntToNumber(i),
  encode: (s) => monthNumberToInt(s),
}).annotations(
  Id.annotations("MonthNumberFromMonthInt", {
    description: "Transform month integers to zero-padded literals.",
  })
) {}

/**
 * Namespace exposing helper types for {@link MonthNumberFromMonthInt}.
 *
 * @example
 * import type { MonthNumberFromMonthInt } from "@beep/schema-v2/primitives/temporal/dates/month";
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
