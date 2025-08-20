import * as S from "effect/Schema";
import { makeRule } from "./internal";
import * as Operators from "./operators";

export namespace StringRule {
  export const { Rule, Input } = makeRule("string", {
    field: S.String,
    op: S.Union(
      Operators.Eq.Schema,
      Operators.Ne.Schema,
      Operators.In.Schema,
      Operators.NotIn.Schema,
      Operators.StartsWith.Schema,
      Operators.NotStartsWith.Schema,
      Operators.EndsWith.Schema,
      Operators.NotEndsWith.Schema,
      Operators.Matches.Schema,
    ),
    value: S.String,
    ignoreCase: S.Boolean,
  });
  export type Rule = typeof Rule.Type;
  export type Input = typeof Input.Type;
}

export namespace NumberRule {
  export const { Rule, Input } = makeRule("number", {
    field: S.String,
    op: S.Union(
      Operators.Eq.Schema,
      Operators.Ne.Schema,
      Operators.Gt.Schema,
      Operators.Gte.Schema,
      Operators.Lt.Schema,
      Operators.Lte.Schema,
    ),
  });
  export type Rule = typeof Rule.Type;
  export type Input = typeof Input.Type;
}

export namespace BooleanRule {
  export const { Rule, Input } = makeRule("boolean", {
    field: S.String,
    op: S.Union(Operators.IsTrue.Schema, Operators.IsFalse.Schema),
  });
  export type Rule = typeof Rule.Type;
  export type Input = typeof Input.Type;
}

export namespace ArrayValueRule {
  export const { Rule, Input } = makeRule("arrayValue", {
    field: S.String,
    op: S.Union(
      Operators.Eq.Schema,
      Operators.Ne.Schema,
      Operators.In.Schema,
      Operators.NotIn.Schema,
      Operators.AllIn.Schema,
    ),
    value: S.String,
  });
  export type Rule = typeof Rule.Type;
  export type Input = typeof Input.Type;
}

export namespace ArrayLengthRule {
  export const { Rule, Input } = makeRule("arrayLength", {
    field: S.String,
    op: S.Union(
      Operators.Eq.Schema,
      Operators.Ne.Schema,
      Operators.Gt.Schema,
      Operators.Gte.Schema,
      Operators.Lt.Schema,
      Operators.Lte.Schema,
    ),
    value: S.Number,
  });
  export type Rule = typeof Rule.Type;
  export type Input = typeof Input.Type;
}

export namespace ObjectKeyRule {
  export const { Rule, Input } = makeRule("objectKey", {
    field: S.String,
    op: S.Union(Operators.In.Schema, Operators.NotIn.Schema),
    value: S.String,
  });
  export type Rule = typeof Rule.Type;
  export type Input = typeof Input.Type;
}

export namespace ObjectValueRule {
  export const { Rule, Input } = makeRule("objectValue", {
    field: S.String,
    op: S.Union(Operators.In.Schema, Operators.NotIn.Schema),
    value: S.String,
  });
  export type Rule = typeof Rule.Type;
  export type Input = typeof Input.Type;
}

export namespace ObjectKeyValueRule {
  export const { Rule, Input } = makeRule("objectKeyValue", {
    field: S.String,
    op: S.Union(Operators.In.Schema, Operators.NotIn.Schema),
    value: S.Struct({
      key: S.String,
      value: S.Any,
    }),
  });
  export type Rule = typeof Rule.Type;
  export type Input = typeof Input.Type;
}

export namespace GenericComparisonRule {
  export const { Rule, Input } = makeRule("genericComparison", {
    field: S.String,
    op: S.Union(
      Operators.Eq.Schema,
      Operators.Ne.Schema,
      Operators.Gt.Schema,
      Operators.Gte.Schema,
      Operators.Lt.Schema,
      Operators.Lte.Schema,
    ),
    value: S.Any,
  });

  export type Rule = typeof Rule.Type;
  export type Input = typeof Input.Type;
}

export namespace GenericTypeRule {
  export const { Rule, Input } = makeRule("genericType", {
    field: S.String,
    op: S.Union(
      Operators.IsString.Schema,
      Operators.IsNotString.Schema,
      Operators.IsNumber.Schema,
      Operators.IsNotNumber.Schema,
      Operators.IsTruthy.Schema,
      Operators.IsFalsy.Schema,
      Operators.IsNull.Schema,
      Operators.IsNotNull.Schema,
      Operators.IsUndefined.Schema,
      Operators.IsDefined.Schema,
      Operators.IsBoolean.Schema,
      Operators.IsNotBoolean.Schema,
      Operators.IsArray.Schema,
      Operators.IsNotArray.Schema,
      Operators.IsObject.Schema,
      Operators.IsNotObject.Schema,
    ),
  });

  export type Rule = typeof Rule.Type;
  export type Input = typeof Input.Type;
}

export namespace DateRule {
  export const { Rule, Input } = makeRule("date", {
    field: S.String,
    operator: S.Union(
      Operators.IsBefore.Schema,
      Operators.IsAfter.Schema,
      Operators.IsBetween.Schema,
    ),
    value: S.String,
  });

  export type Rule = typeof Rule.Type;
  export type Input = typeof Input.Type;
}

export const Rule = S.Union(
  StringRule.Rule,
  NumberRule.Rule,
  BooleanRule.Rule,
  ArrayValueRule.Rule,
  ArrayLengthRule.Rule,
  ObjectKeyRule.Rule,
  ObjectValueRule.Rule,
  ObjectKeyValueRule.Rule,
  GenericComparisonRule.Rule,
  GenericTypeRule.Rule,
  DateRule.Rule,
);
export type Rule = typeof Rule.Type;

export const RuleInput = S.Union(
  StringRule.Input,
  NumberRule.Input,
  BooleanRule.Input,
  ArrayValueRule.Input,
  ArrayLengthRule.Input,
  ObjectKeyRule.Input,
  ObjectValueRule.Input,
  ObjectKeyValueRule.Input,
  GenericComparisonRule.Input,
  GenericTypeRule.Input,
  DateRule.Input,
);
export type RuleInput = typeof RuleInput.Type;
