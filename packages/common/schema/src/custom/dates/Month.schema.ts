import { stringLiteralKit } from "@beep/schema/kits";
import * as Match from "effect/Match";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { Id } from "./_id";
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

export class MonthString extends MonthStringKit.Schema.annotations(
  Id.annotations("MonthString", {
    description: "Month of the year as a string",
  })
) {
  static readonly Enum = MonthStringKit.Enum;
  static readonly Options = MonthStringKit.Options;
}

export declare namespace MonthString {
  export type Type = S.Schema.Type<typeof MonthString>;
  export type Encoded = S.Schema.Encoded<typeof MonthString>;
}
// todo should use `S.transformLiteral` for this.
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

export class MonthNumber extends MonthNumberKit.Schema.annotations(
  Id.annotations("MonthNumber", {
    description: "Month of the year as a number",
  })
) {
  static readonly Enum = MonthNumberKit.Enum;
  static readonly Options = MonthNumberKit.Options;
}

export declare namespace MonthNumber {
  export type Type = S.Schema.Type<typeof MonthNumber>;
  export type Encoded = S.Schema.Encoded<typeof MonthNumber>;
}
export const MonthInts = S.Literal(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12);
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
    description: "Month of the year as an integer",
  })
) {}

export declare namespace MonthInt {
  export type Type = S.Schema.Type<typeof MonthInt>;
  export type Encoded = S.Schema.Encoded<typeof MonthInt>;
}
// todo should use `S.transformLiteral` for this.
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

export class MonthNumberFromMonthInt extends S.transform(MonthInt, MonthNumber, {
  strict: true,
  decode: (i) => monthIntToNumber(i),
  encode: (s) => monthNumberToInt(s),
}).annotations(
  Id.annotations("MonthNumberFromMonthInt", {
    description: "Month of the year as a number from a month int",
  })
) {}

export declare namespace MonthNumberFromMonthInt {
  export type Type = S.Schema.Type<typeof MonthNumberFromMonthInt>;
  export type Encoded = S.Schema.Encoded<typeof MonthNumberFromMonthInt>;
}
