import { BoolWithDefault } from "@beep/schema/custom";
import { stringLiteralKit } from "@beep/schema/kits";
import { fields, makeFactory } from "@beep/schema/tokens/operators/internal/factory";
import * as Match from "effect/Match";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";

const kit = stringLiteralKit(
  "eq",
  "ne",
  "gt",
  "gte",
  "lt",
  "lte",
  "between",
  "notBetween"
)({
  identifier: "ComparatorOperators",
  title: "Comparator Operators",
  description: "Basic Comparator Operators eq / ne / gt / gte / lt / lte / between / notBetween",
});

const Enum = kit.Enum;

const factory = makeFactory("comparator");

// ╔══════════════════════════════════════════════════════════════╗
// ║  🧮 Basic Comparators                                        ║
// ║  eq / ne / gt / gte / lt / lte / between                     ║
// ╚══════════════════════════════════════════════════════════════╝

/**
 * @category Comparators
 * @symbol ===
 * @human is equal to
 * @since 0.1.0
 * */
export const Eq = factory.make(Enum.eq, fields("===", "is equal to"));

/**
 * @category Comparators
 * @symbol !==
 * @human is not equal to
 * @since 0.1.0
 * */
export const Ne = factory.make(Enum.ne, fields("!==", "is not equal to"));

/**
 * @category Comparators
 * @symbol >
 * @human is greater than
 * @since 0.1.0
 * */
export const Gt = factory.make(Enum.gt, fields(">", "is greater than"));

/**
 * @category Comparators
 * @symbol >=
 * @human is greater than or equal to
 * @since 0.1.0
 * */
export const Gte = factory.make(Enum.gte, fields(">=", "is greater than or equal to"));

/** @category Comparators
 * @symbol `<`
 * @human is less than
 * @since 0.1.0
 * */
export const Lt = factory.make(Enum.lt, fields("<", "is less than"));

/**
 * @category Comparators
 * @symbol <=
 * @human is less than or equal to
 * @since 0.1.0
 * */
export const Lte = factory.make(Enum.lte, fields("<=", "is less than or equal to"));

/**
 * @category Comparators
 * @symbol x ∈ [a, b]
 * @human is between
 * @since 0.1.0
 * @remarks Toggle `inclusive` to choose [a,b] vs (a,b).
 */
export const Between = factory.make(
  Enum.between,
  fields(`x ∈ [a, b]`, "is between", { inclusive: BoolWithDefault(false) })
);

/**
 * @category Comparators
 * @symbol x ∉ [a, b]
 * @human is not between
 * @since 0.1.0
 * */
export const NotBetween = factory.make(
  Enum.notBetween,
  fields(`x ∉ [a, b]`, "is not between", { inclusive: BoolWithDefault(false) })
);

export class Literal extends kit.Schema {
  static readonly Enum = Enum;
  static readonly Options = kit.Options;
}

export namespace Literal {
  export type Type = S.Schema.Type<typeof Literal>;
  export type Encoded = S.Schema.Encoded<typeof Literal>;
}

export class TaggedLiteral extends kit.toTagged("operator").Union {}

export namespace TaggedLiteral {
  export type Type = S.Schema.Type<typeof TaggedLiteral>;
  export type Encoded = S.Schema.Encoded<typeof TaggedLiteral>;
}

export const TaggedFromLiteral = S.transformOrFail(Literal, TaggedLiteral, {
  strict: true,
  decode: (i, _, ast) => ParseResult.succeed({ operator: i }),
  encode: (tagged, _, ast) =>
    ParseResult.try({
      try: () => {
        const decoded = S.decodeSync(TaggedLiteral)(tagged);
        return decoded.operator;
      },
      catch: () => new ParseResult.Type(ast, tagged, "Invalid operator"),
    }),
});

export namespace TaggedFromLiteral {
  export type Type = S.Schema.Type<typeof TaggedFromLiteral>;
  export type Encoded = S.Schema.Encoded<typeof TaggedFromLiteral>;
}

export const fingerPrint = Match.type<TaggedFromLiteral.Type>().pipe(
  Match.discriminatorsExhaustive("operator")({
    eq: (m) => m.operator,
    ne: (m) => m.operator,
    gt: (m) => m.operator,
    gte: (m) => m.operator,
    lt: (m) => m.operator,
    lte: (m) => m.operator,
    between: (m) => m.operator,
    notBetween: (m) => m.operator,
  })
);
