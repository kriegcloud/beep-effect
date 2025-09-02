import { stringLiteralKit } from "@beep/schema/kits";
import type * as S from "effect/Schema";

const kit = stringLiteralKit(
  "equals",
  "not_equals",
  "greater_than",
  "greater_than_or_equal_to",
  "less_than",
  "less_than_or_equal_to",
  "between",
  "not_between",
  "like",
  "not_like",
  "starts_with",
  "ends_with",
  "contains",
  "not_contains",
  "matches",
  "is_false",
  "is_true",
  "is_string",
  "is_number",
  "is_truthy",
  "is_falsy",
  "is_null",
  "is_undefined",
  "is_boolean",
  "is_array",
  "is_object",
  "is_nullish",
  "in_set",
  "one_of",
  "all_of",
  "none_of",
  "is_same_hour",
  "is_same_day",
  "is_same_week",
  "is_same_month",
  "is_same_year"
)({
  identifier: "OperatorLiterals",
  title: "Operator Literals",
  description: "Operator literals for conditions",
});
export const { Union, Members } = kit.toTagged("operator");

export class Operator extends kit.Schema {
  static readonly Enum = kit.Enum;
  static readonly Options = kit.Options;
  static readonly pick = kit.pick;
  static readonly toTagged = kit.toTagged;
}

export namespace Operator {
  export type Type = S.Schema.Type<typeof Operator>;
  export type Encoded = S.Schema.Encoded<typeof Operator>;
}
