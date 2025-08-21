import { BS } from "@beep/schema";
import type { UnsafeTypes } from "@beep/types";
import * as A from "effect/Array";
import * as Bool from "effect/Boolean";
import * as DateTime from "effect/DateTime";
import * as Equal from "effect/Equal";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";
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

  const handleCase = (ignoreCase: boolean) => (value: string) =>
    ignoreCase ? Str.trim(Str.toLowerCase(value)) : Str.trim(value);

  export const validate = F.flow((rule: Input, value: string): boolean =>
    F.pipe(
      {
        caseValue: handleCase(rule.ignoreCase)(value),
        caseRuleValue: handleCase(rule.ignoreCase)(rule.value),
      },
      ({ caseValue, caseRuleValue }) =>
        Match.value(rule.op).pipe(
          Match.withReturnType<boolean>(),
          Match.tags({
            eq: () => caseValue === caseRuleValue,
            ne: () => caseValue !== caseRuleValue,
            in: () => caseValue.includes(caseRuleValue),
            notIn: () => !caseValue.includes(caseRuleValue),
            startsWith: () => caseValue.startsWith(caseRuleValue),
            notStartsWith: () => !caseValue.startsWith(caseRuleValue),
            endsWith: () => caseValue.endsWith(caseRuleValue),
            notEndsWith: () => !caseValue.endsWith(caseRuleValue),
            matches: ({ regex }) => regex.test(value),
          }),
          Match.orElse(F.constFalse),
        ),
    ),
  );
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
    value: S.Number,
  });
  export type Rule = typeof Rule.Type;
  export type Input = typeof Input.Type;

  export const validate = (rule: Input, value: number) =>
    Match.value(rule.op).pipe(
      Match.withReturnType<boolean>(),
      Match.tags({
        eq: () => value === rule.value,
        ne: () => value !== rule.value,
        gt: () => value > rule.value,
        gte: () => value >= rule.value,
        lt: () => value < rule.value,
        lte: () => value <= rule.value,
      }),
      Match.orElse(F.constFalse),
    );
}

export namespace BooleanRule {
  export const { Rule, Input } = makeRule("boolean", {
    field: S.String,
    op: S.Union(Operators.IsTrue.Schema, Operators.IsFalse.Schema),
  });
  export type Rule = typeof Rule.Type;
  export type Input = typeof Input.Type;

  export const validate = (rule: Input, value: boolean) =>
    Match.value(rule.op).pipe(
      Match.withReturnType<boolean>(),
      Match.tags({
        isTrue: () => Equal.equals(value, true),
        isFalse: () => Equal.equals(value, false),
      }),
      Match.orElse(F.constFalse),
    );
}

export namespace ArrayValueRule {
  export const { Rule, Input } = makeRule("arrayValue", {
    field: S.String,
    op: S.Union(
      Operators.Eq.Schema,
      Operators.Ne.Schema,
      Operators.In.Schema,
      Operators.NotIn.Schema,
      Operators.Every.Schema,
    ),
    value: S.Any,
  });
  export type Rule = typeof Rule.Type;
  export type Input = typeof Input.Type;

  export const validate = (rule: Input, value: UnsafeTypes.UnsafeArray) =>
    Match.value(rule.op).pipe(
      Match.withReturnType<boolean>(),
      Match.tags({
        in: () => value.includes(rule.value),
        notIn: () => !value.includes(rule.value),
        every: () => A.every(value, (v) => v === rule.value),
      }),
      Match.orElse(F.constFalse),
    );
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

  export const validate = (
    rule: Input,
    value: UnsafeTypes.UnsafeArray,
  ): boolean =>
    Match.value(rule.op).pipe(
      Match.withReturnType<boolean>(),
      Match.tags({
        eq: () => value.length === rule.value,
        ne: () => value.length !== rule.value,
        gt: () => value.length > rule.value,
        gte: () => value.length >= rule.value,
        lt: () => value.length < rule.value,
        lte: () => value.length <= rule.value,
      }),
      Match.orElse(F.constFalse),
    );
}

export namespace ObjectKeyRule {
  export const { Rule, Input } = makeRule("objectKey", {
    field: S.String,
    op: S.Union(Operators.In.Schema, Operators.NotIn.Schema),
    value: S.String,
  });
  export type Rule = typeof Rule.Type;
  export type Input = typeof Input.Type;

  export const validate = F.flow((rule: Input, value: object) =>
    F.pipe(A.contains(rule.value)(Struct.keys(value)), (contains) =>
      Match.value(rule.op).pipe(
        Match.withReturnType<boolean>(),
        Match.tags({
          in: () => contains,
          notIn: () => !contains,
        }),
        Match.orElse(F.constFalse),
      ),
    ),
  );
}

export namespace ObjectValueRule {
  export const { Rule, Input } = makeRule("objectValue", {
    field: S.String,
    op: S.Union(Operators.In.Schema, Operators.NotIn.Schema),
    value: S.String,
  });
  export type Rule = typeof Rule.Type;
  export type Input = typeof Input.Type;

  export const validate = (rule: Input, value: object) =>
    F.pipe(A.contains(rule.value)(R.values(value)), (contains) =>
      Match.value(rule.op).pipe(
        Match.withReturnType<boolean>(),
        Match.tags({
          in: () => contains,
          notIn: () => !contains,
        }),
        Match.orElse(F.constFalse),
      ),
    );
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

  export const validate = (rule: Input, value: object) =>
    F.pipe(
      A.some(
        R.toEntries(value),
        ([k, v]) =>
          Equal.equals(v)(rule.value.value) && Equal.equals(k)(rule.value.key),
      ),
      (contains) =>
        Match.value(rule.op).pipe(
          Match.withReturnType<boolean>(),
          Match.tags({
            in: () => contains,
            notIn: () => !contains,
          }),
          Match.orElse(F.constFalse),
        ),
    );
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

  export const validate = (
    rule: Input,
    value: UnsafeTypes.UnsafeAny,
  ): boolean =>
    Match.value(rule.op).pipe(
      Match.withReturnType<boolean>(),
      Match.tags({
        eq: () => value === rule.value,
        ne: () => value !== rule.value,
        gt: () => value > rule.value,
        gte: () => value >= rule.value,
        lt: () => value < rule.value,
        lte: () => value <= rule.value,
      }),
      Match.orElse(F.constFalse),
    );
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

  export const validate = (rule: Input, value: UnsafeTypes.UnsafeAny) =>
    Match.value(rule.op).pipe(
      Match.withReturnType<boolean>(),
      Match.tags({
        isString: () => Str.isString(value),
        isNotString: () => P.not(Str.isString)(value),
        isNumber: () => Num.isNumber(value),
        isNotNumber: () => P.not(Num.isNumber)(value),
        isTruthy: () => !!value,
        isFalsy: () => !value,
        isNull: () => P.isNull(value),
        isNotNull: () => P.isNotNull(value),
        isUndefined: () => P.isUndefined(value),
        isDefined: () => P.isNotUndefined(value),
        isBoolean: () => Bool.isBoolean(value),
        isNotBoolean: () => P.not(Bool.isBoolean)(value),
        isArray: () => A.isArray(value),
        isNotArray: () => P.not(A.isArray)(value),
        isObject: () => P.isObject(value),
        isNotObject: () => P.not(P.isObject)(value),
      }),
      Match.orElse(F.constFalse),
    );
}

export namespace DateRule {
  export const { Rule, Input } = makeRule("date", {
    field: S.String,
    operator: S.Union(
      Operators.IsBefore.Schema,
      Operators.IsAfter.Schema,
      Operators.IsBetween.Schema,
    ),
    value: S.Union(
      S.TaggedStruct("range", {
        start: BS.DateTimeUtcFromAllAcceptable,
        end: BS.DateTimeUtcFromAllAcceptable,
      }),
      S.TaggedStruct("comparison", {
        value: BS.DateTimeUtcFromAllAcceptable,
      }),
    ),
  });

  export type Rule = typeof Rule.Type;
  export type Input = typeof Input.Type;

  export const validate = (
    rule: Input,
    value: string | number | Date | DateTime.Utc,
  ) =>
    F.pipe(
      S.decodeOption(BS.DateTimeUtcFromAllAcceptable)(value),
      O.match({
        onNone: () => false,
        onSome: (utc) =>
          Match.value(rule.operator).pipe(
            Match.withReturnType<boolean>(),
            Match.tags({
              isBefore: () =>
                Match.value(rule.value).pipe(
                  Match.withReturnType<boolean>(),
                  Match.tags({
                    comparison: ({ value: cmpRaw }) =>
                      F.pipe(
                        S.decodeOption(BS.DateTimeUtcFromAllAcceptable)(cmpRaw),
                        O.match({
                          onNone: () => false,
                          onSome: (cmp) => DateTime.lessThan(utc, cmp),
                        }),
                      ),
                    range: () => false,
                  }),
                  Match.orElse(F.constFalse),
                ),
              isAfter: () =>
                Match.value(rule.value).pipe(
                  Match.withReturnType<boolean>(),
                  Match.tags({
                    comparison: ({ value: cmpRaw }) =>
                      F.pipe(
                        S.decodeOption(BS.DateTimeUtcFromAllAcceptable)(cmpRaw),
                        O.match({
                          onNone: () => false,
                          onSome: (cmp) => DateTime.greaterThan(utc, cmp),
                        }),
                      ),
                    range: () => false,
                  }),
                  Match.orElse(F.constFalse),
                ),
              isBetween: () =>
                Match.value(rule.value).pipe(
                  Match.withReturnType<boolean>(),
                  Match.tags({
                    comparison: () => false,
                    range: ({ start: startRaw, end: endRaw }) =>
                      F.pipe(
                        S.decodeOption(BS.DateTimeUtcFromAllAcceptable)(
                          startRaw,
                        ),
                        O.flatMap((start) =>
                          F.pipe(
                            S.decodeOption(BS.DateTimeUtcFromAllAcceptable)(
                              endRaw,
                            ),
                            O.map((end) =>
                              DateTime.between(utc, {
                                minimum: start,
                                maximum: end,
                              }),
                            ),
                          ),
                        ),
                        O.getOrElse(F.constFalse),
                      ),
                  }),
                  Match.orElse(F.constFalse),
                ),
            }),
            Match.orElse(F.constFalse),
          ),
      }),
    );

  // export const validate = (rule: Input, value: string) => Match.value(rule.op).pipe(
  //   Match.withReturnType<boolean>(),
  //   Match.tags({
  //     isBefore: () =>
  //   })
  // )
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
export namespace Rule {
  export type Type = typeof Rule.Type;
  export type Encoded = typeof Rule.Encoded;
}

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
export namespace RuleInput {
  export type Type = typeof RuleInput.Type;
  export type Encoded = typeof RuleInput.Encoded;
}
