import { BoolWithDefault } from "@beep/schema/custom";
import { stringLiteralKit } from "@beep/schema/kits";
import { fields, makeFactory } from "@beep/schema/tokens/operators/internal/factory";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";

const kit = stringLiteralKit(
  "isInteger",
  "isNotInteger",
  "isFinite",
  "isNotFinite",
  "isNaN",
  "isNotNaN",
  "isEven",
  "isOdd",
  "isPositive",
  "isNonPositive",
  "isNegative",
  "isNonNegative",
  "approxEq"
);

const Enum = kit.Enum;

const factory = makeFactory("numeric");

/** @category Number @symbol ℤ @human is an integer @since 0.1.0 */
export const IsInteger = factory.make("isInteger", fields("ℤ", "is an integer"));
/** @category Number @symbol ¬ℤ @human is not an integer @since 0.1.0 */
export const IsNotInteger = factory.make("isNotInteger", fields("¬ℤ", "is not an integer"));

/** @category Number @symbol finite @human is finite @since 0.1.0 */
export const IsFinite = factory.make("isFinite", fields("finite", "is finite"));
/** @category Number @symbol ¬finite @human is not finite @since 0.1.0 */
export const IsNotFinite = factory.make("isNotFinite", fields("¬finite", "is not finite"));

/** @category Number @symbol NaN @human is NaN @since 0.1.0 */
export const IsNaN = factory.make("isNaN", fields("NaN", "is NaN"));
/** @category Number @symbol ¬NaN @human is not NaN @since 0.1.0 */
export const IsNotNaN = factory.make("isNotNaN", fields("¬NaN", "is not NaN"));

/** @category Number @symbol ≡ 0 (mod 2) @human is even @since 0.1.0 */
export const IsEven = factory.make("isEven", fields("≡ 0 (mod 2)", "is even"));
/** @category Number @symbol ≡ 1 (mod 2) @human is odd @since 0.1.0 */
export const IsOdd = factory.make("isOdd", fields("≡ 1 (mod 2)", "is odd"));

/** @category Number @symbol > 0 @human is positive @since 0.1.0 */
export const IsPositive = factory.make("isPositive", fields("> 0", "is positive"));
/** @category Number @symbol ≤ 0 @human is non-positive @since 0.1.0 */
export const IsNonPositive = factory.make("isNonPositive", fields("≤ 0", "is non-positive"));
/** @category Number @symbol < 0 @human is negative @since 0.1.0 */
export const IsNegative = factory.make("isNegative", fields("< 0", "is negative"));
/** @category Number @symbol ≥ 0 @human is non-negative @since 0.1.0 */
export const IsNonNegative = factory.make("isNonNegative", fields("≥ 0", "is non-negative"));

/**
 * @category Number
 * @symbol ≈
 * @human is approximately equal to
 * @since 0.1.0
 * @remarks Use `.create({ epsilon: S.Number })` in a specialization; set `epsilonIsPercent` to interpret tolerance as %.
 */
export const ApproxEq = factory.make(
  "approxEq",
  fields("≈", "is approximately equal to", { epsilonIsPercent: BoolWithDefault(false) })
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
