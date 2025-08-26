import {BS} from "@beep/schema";
import type {StringTypes, StructTypes} from "@beep/types";
import * as A from "effect/Array";
import * as Equal from "effect/Equal";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import {makeRule} from "./makeRule";

export namespace Operand {
  export const make = <const Tag extends StringTypes.NonEmptyString<string>>(
    tag: Tag,
    label: string,
  ) => {
    const Schema = <
      const A,
      const E,
      const R,
      const Extra extends StructTypes.StructFieldsWithStringKeys,
    >(
      valueSchema: S.Schema<A, E, R>,
      fields: Extra,
    ) =>
      BS.TaggedStruct(tag, {
        value: valueSchema,
        ...fields,
      })();

    return {
      label,
      Schema,
    };
  };
}

export namespace Eq {
  export const { Schema, label } = Operand.make("eq", "equals");
}

export namespace Neq {
  export const { Schema, label } = Operand.make("ne", "does not equal");
}

export namespace Gt {
  export const { Schema, label } = Operand.make("gt", "greater than");
}

export namespace Gte {
  export const { Schema, label } = Operand.make(
    "gte",
    "greater than or equal to",
  );
}

export namespace Lt {
  export const { Schema, label } = Operand.make("lt", "less than");
}

export namespace Lte {
  export const { Schema, label } = Operand.make("lte", "less than or equal to");
}

export namespace Between {
  export const { Schema, label } = Operand.make("between", "between");
}

export namespace StartsWith {
  export const { Schema, label } = Operand.make("startsWith", "starts with");
}

export namespace EndsWith {
  export const { Schema, label } = Operand.make("endsWith", "ends with");
}

export namespace Contains {
  export const { Schema, label } = Operand.make("contains", "contains");
}

export namespace NotContains {
  export const { Schema, label } = Operand.make(
    "notContains",
    "does not contain",
  );
}

export namespace Matches {
  export const { Schema, label } = Operand.make("matches", "string matches");
}

export namespace IsFalse {
  export const { Schema, label } = Operand.make("isFalse", "is false");
}

export namespace IsTrue {
  export const { Schema, label } = Operand.make("isTrue", "is true");
}

export namespace IsString {
  export const { Schema, label } = Operand.make("isString", "is string");
}

export namespace IsNumber {
  export const { Schema, label } = Operand.make("isNumber", "is number");
}

export namespace IsTruthy {
  export const { Schema, label } = Operand.make("isTruthy", "is truthy");
}

export namespace IsFalsy {
  export const { Schema, label } = Operand.make("isFalsy", "is falsy");
}

export namespace IsNull {
  export const { Schema, label } = Operand.make("isNull", "is null");
}

export namespace IsUndefined {
  export const { Schema, label } = Operand.make("isUndefined", "is undefined");
}

export namespace IsBoolean {
  export const { Schema, label } = Operand.make("isBoolean", "is boolean");
}

export namespace IsArray {
  export const { Schema, label } = Operand.make("isArray", "is array");
}

export namespace IsObject {
  export const { Schema, label } = Operand.make("isObject", "is object");
}

export namespace StringRule {
  const IgnoreCase = S.Boolean.pipe(
    S.optional,
    S.withDefaults({
      decoding: F.constFalse,
      constructor: F.constFalse,
    }),
  );
  export const { Input, Rule } = makeRule("string", {
    field: S.NonEmptyString,
    op: S.Union(
      Eq.Schema(S.String, {
        ignoreCase: IgnoreCase,
      }),
      Neq.Schema(S.String, {
        ignoreCase: IgnoreCase,
      }),
      StartsWith.Schema(S.NonEmptyString, {
        ignoreCase: IgnoreCase,
      }),
      EndsWith.Schema(S.NonEmptyString, {
        ignoreCase: IgnoreCase,
      }),
      Contains.Schema(S.NonEmptyString, {
        ignoreCase: IgnoreCase,
      }),
      NotContains.Schema(S.NonEmptyString, {
        ignoreCase: IgnoreCase,
      }),
      Matches.Schema(BS.RegexFromString, {}),
    ),
  });

  export type Input = typeof Input.Type;
  export type InputEncoded = typeof Input.Encoded;
  export type Rule = typeof Rule.Type;
  export type RuleEncoded = typeof Rule.Encoded;

  const handleCase = (ignoreCase: boolean) => (value: string) =>
    ignoreCase ? Str.trim(Str.toLowerCase(value)) : Str.trim(value);

  export const validate = (rule: Input, value: string) =>
    Match.value(rule.op).pipe(
      Match.withReturnType<boolean>(),
      Match.not({ _tag: "matches" }, (m) => {
        const caseValue = handleCase(m.ignoreCase)(value);
        const caseRuleValue = handleCase(m.ignoreCase)(m.value);
        return F.pipe(
          {
            caseValue,
            caseRuleValue,
          },
          ({ caseValue, caseRuleValue }) =>
            Match.value(m).pipe(
              Match.withReturnType<boolean>(),
              Match.tags({
                eq: () => caseValue === caseRuleValue,
                ne: () => caseValue !== caseRuleValue,
                contains: () => caseValue.includes(caseRuleValue),
                notContains: () => !caseValue.includes(caseRuleValue),
                startsWith: () => caseValue.startsWith(caseRuleValue),
                endsWith: () => caseValue.endsWith(caseRuleValue),
              }),
              Match.orElse(() => false),
            ),
        );
      }),
      Match.tag("matches", (r) => r.value.test(value)),
      Match.orElse(() => false),
    );
}

export namespace NumberRule {
  export const { Input, Rule } = makeRule("number", {
    field: S.NonEmptyString,
    op: S.Union(
      Eq.Schema(S.Number, {}),
      Neq.Schema(S.Number, {}),
      Gt.Schema(S.Number, {}),
      Gte.Schema(S.Number, {}),
      Lt.Schema(S.Number, {}),
      Lte.Schema(S.Number, {}),
      Between.Schema(
        S.Struct({
          min: S.Number,
          max: S.Number,
        }).pipe(
          S.filter(({ min, max }) => min < max, {
            message: () => "min must be less than max",
          }),
        ),
        {
          inclusive: S.Boolean.pipe(
            S.optional,
            S.withDefaults({
              decoding: F.constFalse,
              constructor: F.constFalse,
            }),
          ),
        },
      ),
    ),
  });
  export type Rule = typeof Rule.Type;
  export type RuleEncoded = typeof Rule.Encoded;
  export type Input = typeof Input.Type;
  export type InputEncoded = typeof Input.Encoded;
  export const validate = (rule: Input, value: number) =>
    Match.value(rule.op).pipe(
      Match.withReturnType<boolean>(),
      Match.tags({
        eq: (op) => op.value === value,
        ne: (op) => op.value !== value,
        gt: (op) => op.value < value,
        gte: (op) => op.value <= value,
        lt: (op) => op.value > value,
        lte: (op) => op.value >= value,
        between: (op) => {
          const {
            value: { min, max },
            inclusive,
          } = op;
          const minInclusive = inclusive ? value >= min : value > min;
          const maxInclusive = inclusive ? value <= max : value < max;
          return minInclusive && maxInclusive;
        },
      }),
      Match.orElse(() => false),
    );
}

export namespace BooleanRule {
  export const { Input, Rule } = makeRule("boolean", {
    field: S.NonEmptyString,
    op: S.Union(IsTrue.Schema(S.Never, {}), IsFalse.Schema(S.Never, {})),
  });

  export type Input = typeof Input.Type;
  export type InputEncoded = typeof Input.Encoded;
  export type Rule = typeof Rule.Type;
  export type RuleEncoded = typeof Rule.Encoded;

  export const validate = (rule: Input, value: boolean) =>
    Match.value(rule.op).pipe(
      Match.withReturnType<boolean>(),
      Match.tags({
        isTrue: (r) => Equal.equals(value)(true),
        isFalse: (r) => Equal.equals(value)(false),
      }),
      Match.orElse(() => false),
    );
}

export namespace InSet {
  export const { Schema, label } = Operand.make("inSet", "in set");
}

export namespace OneOf {
  export const { Schema, label } = Operand.make("oneOf", "one of");
}

export namespace AllOf {
  export const { Schema, label } = Operand.make("allOf", "all of");
}

export namespace NoneOf {
  export const { Schema, label } = Operand.make("noneOf", "none of");
}

// Small helpers using the equivalence-aware array fns
const has = (arr: ReadonlyArray<BS.Json.Type>, x: BS.Json.Type) =>
  A.containsWith(BS.jsonEq)(arr, x);

const intersect = (
  arr: ReadonlyArray<BS.Json.Type>,
  bs: ReadonlyArray<BS.Json.Type>,
) => A.intersectionWith(BS.jsonEq)(arr, bs);

// elements in `need` that are NOT in `arr`
const missingFrom = (
  need: ReadonlyArray<BS.Json.Type>,
  arr: ReadonlyArray<BS.Json.Type>,
) => A.differenceWith(BS.jsonEq)(need, arr);

// membership by structural equality
const containsJson = A.containsWith(BS.jsonEq);

/**
 * Count how many DISTINCT elements of `self` exist in `set_`,
 * using structural equality.
 */
const countDistinctOverlaps = (
  self: ReadonlyArray<BS.Json.Type>,
  set_: ReadonlyArray<BS.Json.Type>
): number => {
  // dedupe the input so repeated values don't inflate the count
  const distinct = A.dedupeWith(BS.jsonEq)(self);
  let count = 0;
  for (let i = 0; i < distinct.length; i++) {
    if (containsJson(set_, distinct[i]!)) count++;
    if (count > 1) return count; // early exit for oneOf / noneOf style checks
  }
  return count;
};

export namespace ArrayValueRule {
  // Keep field strict as you already do elsewhere
  // NOTE on op.value types:
  // - Contains / NotContains => single Json
  // - InSet / OneOf / AllOf => NonEmptyArray<Json> (avoid empty selections)
  // - NoneOf => Array<Json> (empty selection is a harmless always-true)
  export const { Rule, Input } = makeRule("arrayValue", {
    field: S.NonEmptyString,
    op: S.Union(
      Contains.Schema(BS.Json, {}),
      NotContains.Schema(BS.Json, {}),
      AllOf.Schema(BS.NonEmptyJsonArray, {}),
      InSet.Schema(BS.NonEmptyJsonArray, {}),
      OneOf.Schema(BS.NonEmptyJsonArray, {}),
      NoneOf.Schema(BS.JsonArray, {}),
    ),
  });

  export type Input = typeof Input.Type;
  export type InputEncoded = typeof Input.Encoded;
  export type Rule = typeof Rule.Type;
  export type RuleEncoded = typeof Rule.Encoded;

  export const validate = (rule: Input, value: ReadonlyArray<BS.Json.Type>) =>
    // Engine guarantees this rule only runs when the field resolves to an array,
    // but be defensive in case callers use validate() directly.
    A.isArray(value)
      ? Match.value(rule.op).pipe(
          Match.withReturnType<boolean>(),
          Match.tags({
            contains: (op) => has(value, op.value),
            notContains: (op) => !has(value, op.value),
            // “at least one” overlap between the runtime array and the selection
            inSet: (op) => intersect(value, op.value).length > 0,

            // exactly one distinct overlap
            oneOf: (op) => countDistinctOverlaps(value, op.value) === 1,

            // none of the selection appears in the array
            noneOf: (op) => intersect(value, op.value).length === 0,

            // every (unique) selection element appears in the array
            allOf: (op) => missingFrom(op.value, value).length === 0,
          }),
          Match.orElse(() => false),
        )
      : false;
}

export namespace ArrayLengthRule {
  export const { Rule, Input } = makeRule("arrayLength", {
    field: S.NonEmptyString,
    op: S.Union(
      Eq.Schema(S.Number, {}),
      Neq.Schema(S.Number, {}),
      Gt.Schema(S.Number, {}),
      Gte.Schema(S.Number, {}),
      Lt.Schema(S.Number, {}),
      Lte.Schema(S.Number, {}),
      Between.Schema(
        S.Struct({
          min: S.Number,
          max: S.Number,
        }).pipe(
          S.filter(({ min, max }) => min < max, {
            message: () => "min must be less than max",
          }),
        ),
        {
          inclusive: S.Boolean.pipe(
            S.optional,
            S.withDefaults({
              decoding: F.constFalse,
              constructor: F.constFalse,
            }),
          ),
        },
      ),
    ),
  });

  export type Rule = typeof Rule.Type;
  export type RuleEncoded = typeof Rule.Encoded;
  export type Input = typeof Input.Type;
  export type InputEncoded = typeof Input.Encoded;
  export const validate = (rule: Input, value: number) =>
    Match.value(rule.op).pipe(
      Match.withReturnType<boolean>(),
      Match.tags({
        eq: (op) => op.value === value,
        ne: (op) => op.value !== value,
        gt: (op) => op.value < value,
        gte: (op) => op.value <= value,
        lt: (op) => op.value > value,
        lte: (op) => op.value >= value,
        between: (op) => {
          const {
            value: { min, max },
            inclusive,
          } = op;
          const minInclusive = inclusive ? value >= min : value > min;
          const maxInclusive = inclusive ? value <= max : value < max;
          return minInclusive && maxInclusive;
        },
      }),
      Match.orElse(() => false),
    );
}
