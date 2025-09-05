import { BoolWithDefault } from "@beep/schema/custom";
import { stringLiteralKit } from "@beep/schema/kits";
import { fields, makeFactory } from "@beep/schema/tokens/operators/internal/factory";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";

const kit = stringLiteralKit("lengthEq", "lengthGt", "lengthLt", "lengthLte", "lengthBetween");

const Enum = kit.Enum;

const factory = makeFactory("size");

// ╔══════════════════════════════════════════════════════════════╗
// ║  📏 Size / Length Predicates                                 ║
// ╚══════════════════════════════════════════════════════════════╝

/** @category Size @symbol |x| = n @human length equals @since 0.1.0 */
export const LengthEq = factory.make("lengthEq", fields("|x| = n", "length equals"));
/** @category Size @symbol |x| > n @human length greater than @since 0.1.0 */
export const LengthGt = factory.make("lengthGt", fields("|x| > n", "length greater than"));
/** @category Size @symbol |x| ≥ n @human length greater than or equal to @since 0.1.0 */
export const LengthGte = factory.make("lengthGte", fields("|x| ≥ n", "length greater than or equal to"));
/** @category Size @symbol |x| < n @human length less than @since 0.1.0 */
export const LengthLt = factory.make("lengthLt", fields("|x| < n", "length less than"));
/** @category Size @symbol |x| ≤ n @human length less than or equal to @since 0.1.0 */
export const LengthLte = factory.make("lengthLte", fields("|x| ≤ n", "length less than or equal to"));

/**
 * @category Size
 * @symbol |x| ∈ [a, b]
 * @human length between
 * @since 0.1.0
 * @remarks Toggle `inclusive` to choose inclusive/exclusive bounds.
 */
export const LengthBetween = factory.make(
  "lengthBetween",
  fields("|x| ∈ [a, b]", "length between", { inclusive: BoolWithDefault(false) })
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
