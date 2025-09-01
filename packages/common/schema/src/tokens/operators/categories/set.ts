import { stringLiteralKit } from "@beep/schema/kits";
import { fields, makeFactory } from "@beep/schema/tokens/operators/internal/factory";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";

const kit = stringLiteralKit(
  "inSet",
  "in",
  "notIn",
  "subsetOf",
  "notSubsetOf",
  "supersetOf",
  "notSupersetOf",
  "overlaps",
  "disjointWith",
  "oneOf",
  "allOf",
  "noneOf",
  "containsAny",
  "containsAll",
  "containsNone"
)({
  identifier: "Set Operator Predicate",
  title: "Set Operator Predicate",
  description: "🧰 Set / Collection Relations Predicates",
});

const Enum = kit.Enum;

const factory = makeFactory("set");

// ╔══════════════════════════════════════════════════════════════╗
// ║  🧰 Set / Collection Relations                               ║
// ╚══════════════════════════════════════════════════════════════╝

/** @category Set @symbol ∈ @human is in set @since 0.1.0 */
export const InSet = factory.make("inSet", fields("∈", "is in set"));
/** @category Set @symbol ∈ @human is in (alias) @since 0.1.0 */
export const In = factory.make("in", fields("∈", "is in"));
/** @category Set @symbol ∉ @human is not in @since 0.1.0 */
export const NotIn = factory.make("notIn", fields("∉", "is not in"));

/** @category Set @symbol ⊆ @human is a subset of @since 0.1.0 */
export const SubsetOf = factory.make("subsetOf", fields("⊆", "is a subset of"));
/** @category Set @symbol ⊄ @human is not a subset of @since 0.1.0 */
export const NotSubsetOf = factory.make("notSubsetOf", fields("⊄", "is not a subset of"));

/** @category Set @symbol ⊇ @human is a superset of @since 0.1.0 */
export const SupersetOf = factory.make("supersetOf", fields("⊇", "is a superset of"));
/** @category Set @symbol ⊅ @human is not a superset of @since 0.1.0 */
export const NotSupersetOf = factory.make("notSupersetOf", fields("⊅", "is not a superset of"));

/** @category Set @symbol ∩ ≠ ∅ @human overlaps @since 0.1.0 */
export const Overlaps = factory.make("overlaps", fields("∩ ≠ ∅", "overlaps"));
/** @category Set @symbol ∩ = ∅ @human is disjoint with @since 0.1.0 */
export const DisjointWith = factory.make("disjointWith", fields("∩ = ∅", "is disjoint with"));

/** @category Selection @symbol ∈ @human is one of @since 0.1.0 */
export const OneOf = factory.make("oneOf", fields("∈", "is one of"));
/** @category Selection @symbol ⊇ @human contains all of @since 0.1.0 */
export const AllOf = factory.make("allOf", fields("⊇", "contains all of"));
/** @category Selection @symbol ∩ = ∅ @human contains none of @since 0.1.0 */
export const NoneOf = factory.make("noneOf", fields("∩ = ∅", "contains none of"));

/** @category Selection @symbol ∩ ≠ ∅ @human contains any of @since 0.1.0 */
export const ContainsAny = factory.make("containsAny", fields("∩ ≠ ∅", "contains any of"));
/** @category Selection @symbol ⊇ @human contains all of (collections) @since 0.1.0 */
export const ContainsAll = factory.make("containsAll", fields("⊇", "contains all of"));
/** @category Selection @symbol ∩ = ∅ @human contains none of (collections) @since 0.1.0 */
export const ContainsNone = factory.make("containsNone", fields("∩ = ∅", "contains none of"));

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
  decode: (i, _) => ParseResult.succeed({ operator: i }),
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
