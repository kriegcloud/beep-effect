import { BS } from "@beep/schema";
import * as S from "effect/Schema";

export namespace CombinatorValue {
  const kit = BS.stringLiteralKit(
    "and",
    "or",
    "xor",
  )({
    identifier: "CombinatorValue",
    title: "Combinator Value",
    description: "The possible combinator values",
  });

  export const {
    Enum,
    Options,
    is,
    Equivalence,
    Mock,
    JSONSchema,
    Pretty,
    pick,
    omit,
    derive,
  } = kit;

  export const Schema = kit.Schema.pipe(S.brand("CombinatorValue"));
}

export namespace OperatorValue {
  const kit = BS.stringLiteralKit(
    "eq",
    "ne",
    "gt",
    "gte",
    "lt",
    "lte",
    "contains",
    "beginsWith",
    "endsWith",
    "doesNotContain",
    "doesNotBeginWith",
    "doesNotEndWith",
    "null",
    "notNull",
    "in",
    "notIn",
    "between",
    "notBetween",
  )({
    identifier: "OperatorValue",
    title: "Operator Value",
    description: "The possible operator values",
  });

  export const {
    Enum,
    Options,
    is,
    Equivalence,
    Mock,
    JSONSchema,
    Pretty,
    pick,
    omit,
    derive,
  } = kit;

  export const Schema = kit.Schema.pipe(S.brand("OperatorValue"));

  export const NegationMap = {
    eq: Enum.ne,
    ne: Enum.eq,
    gt: Enum.lt,
    gte: Enum.lte,
    lt: Enum.gt,
    lte: Enum.gte,
    contains: Enum.doesNotContain,
    beginsWith: Enum.doesNotBeginWith,
    endsWith: Enum.doesNotEndWith,
    doesNotContain: Enum.contains,
    doesNotBeginWith: Enum.beginsWith,
    doesNotEndWith: Enum.endsWith,
    null: Enum.notNull,
    notNull: Enum.null,
    in: Enum.notIn,
    notIn: Enum.in,
    between: Enum.notBetween,
    notBetween: Enum.between,
  } as const;
}

export namespace JoinCharValue {
  export const Value = ",";
  export const Schema = S.Literal(Value)
    .pipe(S.brand("JoinCharValue"))
    .annotations({
      identifier: "JoinCharValue",
      title: "Join Char Value",
      description: "A `,` character representing a join",
    });
  export type Type = typeof Value;
}

export namespace MatchModeValue {
  const kit = BS.stringLiteralKit(
    "all",
    "some",
    "none",
    "atLeast",
    "atMost",
    "exactly",
  )({
    identifier: "MatchModeValue",
    title: "Match Mode Value",
    description: "The possible match mode values",
  });

  export const {
    Enum,
    Options,
    is,
    Equivalence,
    Mock,
    JSONSchema,
    Pretty,
    pick,
    omit,
    derive,
  } = kit;

  export const Schema = kit.Schema.pipe(S.brand("MatchModeValue"));
}
