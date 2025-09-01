import { stringLiteralKit } from "@beep/schema/kits";
import { fields, makeFactory } from "@beep/schema/tokens/operators/internal/factory";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";

const kit = stringLiteralKit(
  "isTrue",
  "isFalse",
  "isString",
  "isNotString",
  "isNumber",
  "isNotNumber",
  "isTruthy",
  "isNotTruthy",
  "isFalsy",
  "isNotFalsy",
  "isNull",
  "isNotNull",
  "isUndefined",
  "isNotUndefined",
  "isBoolean",
  "isNotBoolean",
  "isArray",
  "isNotArray",
  "isObject",
  "isNotObject",
  "isNullish",
  "isNotNullish"
)({
  identifier: "Type Operator Predicates",
  title: "Type Operator Predicates",
  description: "🧪 Type & Truthiness Predicates isString/Number/Array/Object/Boolean/etc. (+ not-variants)",
});

const Enum = kit.Enum;

const factory = makeFactory("type");

// ╔══════════════════════════════════════════════════════════════╗
// ║  🧪 Type & Truthiness Predicates                             ║
// ║  isString/Number/Array/Object/Boolean/etc. (+ not-variants) ║
// ╚══════════════════════════════════════════════════════════════╝

/** @category Type @symbol ≡ true @human is true @since 0.1.0 */
export const IsTrue = factory.make(Enum.isTrue, fields("≡ true", "is true"));

/** @category Type @symbol ≡ false @human is false @since 0.1.0 */
export const IsFalse = factory.make(Enum.isFalse, fields("≡ false", "is false"));

/** @category Type @symbol ∈ String @human is a string @since 0.1.0 */
export const IsString = factory.make(Enum.isString, fields("∈ String", "is a string"));
/** @category Type @symbol ∉ String @human is not a string @since 0.1.0 */
export const IsNotString = factory.make(Enum.isNotString, fields("∉ String", "is not a string"));

/** @category Type @symbol ∈ Number @human is a number @since 0.1.0 */
export const IsNumber = factory.make(Enum.isNumber, fields("∈ Number", "is a number"));
/** @category Type @symbol ∉ Number @human is not a number @since 0.1.0 */
export const IsNotNumber = factory.make(Enum.isNotNumber, fields("∉ Number", "is not a number"));

/** @category Type @symbol truthy @human is truthy @since 0.1.0 */
export const IsTruthy = factory.make(Enum.isTruthy, fields("truthy", "is truthy"));
/** @category Type @symbol ¬truthy @human is not truthy @since 0.1.0 */
export const IsNotTruthy = factory.make(Enum.isNotTruthy, fields("¬truthy", "is not truthy"));

/** @category Type @symbol falsy @human is falsy @since 0.1.0 */
export const IsFalsy = factory.make(Enum.isFalsy, fields("falsy", "is falsy"));
/** @category Type @symbol ¬falsy @human is not falsy @since 0.1.0 */
export const IsNotFalsy = factory.make(Enum.isNotFalsy, fields("¬falsy", "is not falsy"));

/** @category Type @symbol ≡ null @human is null @since 0.1.0 */
export const IsNull = factory.make(Enum.isNull, fields("≡ null", "is null"));
/** @category Type @symbol ≠ null @human is not null @since 0.1.0 */
export const IsNotNull = factory.make(Enum.isNotNull, fields("≠ null", "is not null"));

/** @category Type @symbol ≡ undefined @human is undefined @since 0.1.0 */
export const IsUndefined = factory.make(Enum.isUndefined, fields("≡ undefined", "is undefined"));
/** @category Type @symbol ≠ undefined @human is not undefined @since 0.1.0 */
export const IsNotUndefined = factory.make(Enum.isNotUndefined, fields("≠ undefined", "is not undefined"));

/** @category Type @symbol ∈ Boolean @human is a boolean @since 0.1.0 */
export const IsBoolean = factory.make(Enum.isBoolean, fields("∈ Boolean", "is a boolean"));
/** @category Type @symbol ∉ Boolean @human is not a boolean @since 0.1.0 */
export const IsNotBoolean = factory.make(Enum.isNotBoolean, fields("∉ Boolean", "is not a boolean"));

/** @category Type @symbol ∈ Array @human is an array @since 0.1.0 */
export const IsArray = factory.make(Enum.isArray, fields("∈ Array", "is an array"));
/** @category Type @symbol ∉ Array @human is not an array @since 0.1.0 */
export const IsNotArray = factory.make(Enum.isNotArray, fields("∉ Array", "is not an array"));

/** @category Type @symbol ∈ Object @human is an object @since 0.1.0 */
export const IsObject = factory.make(Enum.isObject, fields("∈ Object", "is an object"));
/** @category Type @symbol ∉ Object @human is not an object @since 0.1.0 */
export const IsNotObject = factory.make(Enum.isNotObject, fields("∉ Object", "is not an object"));

/** @category Type @symbol ≡ null | undefined @human is nullish @since 0.1.0 */
export const IsNullish = factory.make(Enum.isNullish, fields("≡ null | undefined", "is nullish"));
/** @category Type @symbol ≠ null & ≠ undefined @human is not nullish @since 0.1.0 */
export const IsNotNullish = factory.make(Enum.isNotNullish, fields("≠ null & ≠ undefined", "is not nullish"));

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
