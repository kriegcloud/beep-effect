import * as S from "effect/Schema";
import {
  ArrayLengthRule,
  ArrayValueRule,
  BooleanRule,
  DateRule,
  HasEntryRule,
  HasKeyRule,
  HasValueRule,
  NumberRule,
  StringRule,
  TypeRule,
} from "./rules";

export class Rule extends S.Union(
  ArrayLengthRule.Rule,
  ArrayValueRule.Rule,
  BooleanRule.Rule,
  DateRule.Rule,
  HasEntryRule.Rule,
  HasKeyRule.Rule,
  HasValueRule.Rule,
  NumberRule.Rule,
  StringRule.Rule,
  TypeRule.Rule
) {}

export class RuleInput extends S.Union(
  ArrayLengthRule.Input,
  ArrayValueRule.Input,
  BooleanRule.Input,
  DateRule.Input,
  HasEntryRule.Input,
  HasKeyRule.Input,
  HasValueRule.Input,
  NumberRule.Input,
  StringRule.Input,
  TypeRule.Input
) {}

export namespace RuleInput {
  export type Type = typeof RuleInput.Type;
  export type Encoded = typeof RuleInput.Encoded;
}

export namespace Rule {
  export type Type = typeof Rule.Type;
  export type Encoded = typeof Rule.Encoded;
}
