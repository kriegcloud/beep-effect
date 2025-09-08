import type * as S from "effect/Schema";

import { stringLiteralKit } from "../../kits";

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

export class MonthString extends MonthStringKit.Schema.annotations({
  schemaId: Symbol.for("@beep/schema/custom/dates/MonthString"),
  identifier: "MonthString",
  title: "Month String",
  description: "Month of the year as a string",
}) {
  static readonly Enum = MonthStringKit.Enum;
  static readonly Options = MonthStringKit.Options;
}

export namespace MonthString {
  export type Type = S.Schema.Type<typeof MonthString>;
  export type Encoded = S.Schema.Encoded<typeof MonthString>;
}

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

export class MonthNumber extends MonthNumberKit.Schema.annotations({
  schemaId: Symbol.for("@beep/schema/custom/dates/MonthNumber"),
  identifier: "MonthNumber",
  title: "Month Number",
  description: "Month of the year as a number",
}) {
  static readonly Enum = MonthNumberKit.Enum;
  static readonly Options = MonthNumberKit.Options;
}

export namespace MonthNumber {
  export type Type = S.Schema.Type<typeof MonthNumber>;
  export type Encoded = S.Schema.Encoded<typeof MonthNumber>;
}
