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
      Operators.StringContains.Schema,
      Operators.StringNotContains.Schema,
      Operators.StartsWith.Schema,
      Operators.NotStartsWith.Schema,
      Operators.EndsWith.Schema,
      Operators.NotEndsWith.Schema,
      Operators.Matches.Schema
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
            stringContains: () => caseValue.includes(caseRuleValue),
            stringNotContains: () => !caseValue.includes(caseRuleValue),
            startsWith: () => caseValue.startsWith(caseRuleValue),
            notStartsWith: () => !caseValue.startsWith(caseRuleValue),
            endsWith: () => caseValue.endsWith(caseRuleValue),
            notEndsWith: () => !caseValue.endsWith(caseRuleValue),
            matches: ({ regex }) => regex.test(value),
          }),
          Match.orElse(() => false)
        )
    )
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
      Operators.Lte.Schema
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
      Match.orElse(() => false)
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
      Match.orElse(() => false)
    );
}

export namespace ArrayValueRule {
  export const { Rule, Input } = makeRule("arrayValue", {
    field: S.String,
    op: S.Union(Operators.ArrayContains.Schema, Operators.ArrayNotContains.Schema, Operators.Every.Schema),
    value: S.Any,
  });
  export type Rule = typeof Rule.Type;
  export type Input = typeof Input.Type;

  export const validate = (rule: Input, value: UnsafeTypes.UnsafeArray) =>
    Match.value(rule.op).pipe(
      Match.withReturnType<boolean>(),
      Match.tags({
        arrayContains: () => value.includes(rule.value),
        arrayNotContains: () => !value.includes(rule.value),
        every: () => A.every(value, (v) => v === rule.value),
      }),
      Match.orElse(() => false)
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
      Operators.Lte.Schema
    ),
    value: S.Number,
  });
  export type Rule = typeof Rule.Type;
  export type Input = typeof Input.Type;

  export const validate = (rule: Input, value: UnsafeTypes.UnsafeArray): boolean =>
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
      Match.orElse(() => false)
    );
}

export namespace HasKeyRule {
  export const { Rule, Input } = makeRule("hasKey", {
    field: S.String,
    op: S.Union(Operators.ArrayContains.Schema, Operators.ArrayNotContains.Schema),
    value: S.String,
  });
  export type Rule = typeof Rule.Type;
  export type Input = typeof Input.Type;

  export const validate = F.flow((rule: Input, value: object) =>
    F.pipe(A.contains(rule.value)(Struct.keys(value)), (contains) =>
      Match.value(rule.op).pipe(
        Match.withReturnType<boolean>(),
        Match.tags({
          arrayContains: () => contains,
          arrayNotContains: () => !contains,
        }),
        Match.orElse(() => false)
      )
    )
  );
}

export namespace HasValueRule {
  export const { Rule, Input } = makeRule("hasValue", {
    field: S.String,
    op: S.Union(Operators.ArrayContains.Schema, Operators.ArrayNotContains.Schema),
    value: S.String,
  });
  export type Rule = typeof Rule.Type;
  export type Input = typeof Input.Type;

  export const validate = (rule: Input, value: object) =>
    F.pipe(A.contains(rule.value)(R.values(value)), (contains) =>
      Match.value(rule.op).pipe(
        Match.withReturnType<boolean>(),
        Match.tags({
          arrayContains: () => contains,
          arrayNotContains: () => !contains,
        }),
        Match.orElse(() => false)
      )
    );
}

export namespace HasEntryRule {
  export const { Rule, Input } = makeRule("hasEntry", {
    field: S.String,
    op: S.Union(Operators.ArrayContains.Schema, Operators.ArrayNotContains.Schema),
    value: S.Struct({
      key: S.String,
      value: S.Any,
    }),
  });
  export type Rule = typeof Rule.Type;
  export type Input = typeof Input.Type;

  export const validate = (rule: Input, value: object) =>
    F.pipe(
      A.some(R.toEntries(value), ([k, v]) => Equal.equals(v)(rule.value.value) && Equal.equals(k)(rule.value.key)),
      (contains) =>
        Match.value(rule.op).pipe(
          Match.withReturnType<boolean>(),
          Match.tags({
            arrayContains: () => contains,
            arrayNotContains: () => !contains,
          }),
          Match.orElse(() => false)
        )
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
      Operators.Lte.Schema
    ),
    value: S.Any,
  });

  export type Rule = typeof Rule.Type;
  export type Input = typeof Input.Type;

  export const validate = (rule: Input, value: UnsafeTypes.UnsafeAny): boolean =>
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
      Match.orElse(() => false)
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
      Operators.IsNotObject.Schema
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
        isObject: () => P.isRecord(value),
        isNotObject: () => !P.isRecord(value),
      }),
      Match.orElse(() => false)
    );
}

export namespace DateRule {
  export const { Rule, Input } = makeRule("date", {
    field: S.String,
    op: S.Union(Operators.IsBefore.Schema, Operators.IsAfter.Schema, Operators.IsBetween.Schema),
    value: S.Union(
      S.TaggedStruct("range", {
        start: BS.DateFromAllAcceptable,
        end: BS.DateFromAllAcceptable,
      }),
      S.TaggedStruct("comparison", {
        value: BS.DateFromAllAcceptable,
      })
    ),
  });

  export type Rule = typeof Rule.Type;
  export type RuleEncoded = typeof Rule.Encoded;
  export type Input = typeof Input.Type;
  export type InputEncoded = typeof Input.Encoded;

  export const validate = (rule: InputEncoded, value: string | number | Date) =>
    F.pipe(
      S.decodeOption(BS.DateTimeUtcFromAllAcceptable)(value),
      O.match({
        onNone: () => false,
        onSome: (utc) =>
          Match.value(rule.op).pipe(
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
                          onSome: (cmp) => DateTime.toDate(utc).getTime() < DateTime.toDate(cmp).getTime(),
                        })
                      ),
                    range: () => false,
                  }),
                  Match.orElse(() => false)
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
                          onSome: (cmp) => DateTime.toDate(utc).getTime() > DateTime.toDate(cmp).getTime(),
                        })
                      ),
                    range: () => false,
                  }),
                  Match.orElse(() => false)
                ),
              isBetween: () =>
                Match.value(rule.value).pipe(
                  Match.withReturnType<boolean>(),
                  Match.tags({
                    comparison: () =>
                      F.pipe(
                        S.decodeOption(BS.DateTimeUtcFromAllAcceptable)((rule.op as any).minimum),
                        O.flatMap((min) =>
                          F.pipe(
                            S.decodeOption(BS.DateTimeUtcFromAllAcceptable)((rule.op as any).maximum),
                            O.map((max) => {
                              const u = DateTime.toDate(utc).getTime();
                              const minMs = DateTime.toDate(min).getTime();
                              const maxMs = DateTime.toDate(max).getTime();
                              const inclusive = !!(rule.op as any).inclusive;
                              return inclusive ? u >= minMs && u <= maxMs : u > minMs && u < maxMs;
                            })
                          )
                        ),
                        O.getOrElse(F.constFalse)
                      ),
                    range: () => false,
                  }),
                  Match.orElse(() => false)
                ),
            }),
            Match.orElse(() => false)
          ),
      })
    );
}

export class Rule extends S.Union(
  StringRule.Rule,
  NumberRule.Rule,
  BooleanRule.Rule,
  ArrayValueRule.Rule,
  ArrayLengthRule.Rule,
  HasKeyRule.Rule,
  HasValueRule.Rule,
  HasEntryRule.Rule,
  GenericComparisonRule.Rule,
  GenericTypeRule.Rule,
  DateRule.Rule
) {}
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
  HasKeyRule.Input,
  HasValueRule.Input,
  HasEntryRule.Input,
  GenericComparisonRule.Input,
  GenericTypeRule.Input,
  DateRule.Input
);
export namespace RuleInput {
  export type Type = typeof RuleInput.Type;
  export type Encoded = typeof RuleInput.Encoded;
}

// export const RuleType = S.Literal(
//   StringRule.
// )
