import { BS } from "@beep/schema";
import type { StringTypes, StructTypes } from "@beep/types";
// import * as A from "effect/Array";
import * as Equal from "effect/Equal";
import * as F from "effect/Function";
import * as Match from "effect/Match";
// import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { makeRule } from "../../internal";
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

export namespace ContainsAll {
  export const { Schema, label } = Operand.make("containsAll", "contains all");
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

  export const validate = (rule: Rule, value: string) =>
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
  export const validate = (rule: Rule, value: number) =>
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
    op: S.Union(
      IsTrue.Schema(S.Literal(true), {}),
      IsFalse.Schema(S.Literal(false), {}),
    ),
  });

  export type Input = typeof Input.Type;
  export type InputEncoded = typeof Input.Encoded;
  export type Rule = typeof Rule.Type;
  export type RuleEncoded = typeof Rule.Encoded;

  export const validate = (rule: Rule, value: boolean) =>
    Match.value(rule.op).pipe(
      Match.withReturnType<boolean>(),
      Match.tags({
        isTrue: (r) => Equal.equals(r.value)(true),
        isFalse: (r) => Equal.equals(r.value)(false),
      }),
      Match.orElse(() => false),
    );
}

export namespace ArrayValueRule {
  export const { Rule, Input } = makeRule("arrayValue", {
    field: S.NonEmptyString,
    op: S.Union(
      Contains.Schema(BS.Json, {}),
      NotContains.Schema(BS.Json, {}),
      ContainsAll.Schema(S.Array(BS.Json), {}),
    ),
  });

  export type Input = typeof Input.Type;
  export type InputEncoded = typeof Input.Encoded;
  export type Rule = typeof Rule.Type;
  export type RuleEncoded = typeof Rule.Encoded;

  // export const validate = (rule: Rule, value: unknown) =>
  //   A.isArray(value)
  //    ? Match.value(rule.op).pipe(
  //      Match.withReturnType<boolean>(),
  //      Match.tag("containsAll", (r) => A.every(r.value, (v) => A.every(
  //        value,
  //        (v2) => Equal.equals(v)(v2)
  //      ))),
  //     Match.orElse(() => false)
  //     )
  //     : Match.value(rule.op).pipe(
  //       Match.withReturnType<boolean>(),
  //     Match.tags({
  //       contains: (r) => value.includes()
  //     })
  //     )
}
