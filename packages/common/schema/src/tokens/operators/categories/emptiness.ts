import { BoolWithDefault } from "@beep/schema/custom";
import { stringLiteralKit } from "@beep/schema/kits";
import { fields, makeFactory } from "@beep/schema/tokens/operators/internal/factory";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";

const kit = stringLiteralKit(
  "isEmpty",
  "isNotEmpty",
  "isBlank",
  "isNotBlank",
  "isNullishOrEmpty",
  "isPresent",
  "isEmptyDeep",
  "isNotEmptyDeep"
)({
  identifier: "EmptinessOperator",
  title: "Emptiness Operator Predicate",
  description: 'Covers "", [], {}, Map(0), Set(0); type-specific impl via .create',
});

const Enum = kit.Enum;

const factory = makeFactory("emptiness");

/** @category Size @symbol ∅ @human is empty @since 0.1.0 */
export const IsEmpty = factory.make("isEmpty", fields("∅", "is empty"));

/** @category Size @symbol ¬∅ @human is not empty @since 0.1.0 */
export const IsNotEmpty = factory.make("isNotEmpty", fields("¬∅", "is not empty"));

/**
 * @category String
 * @symbol "" (trim)
 * @human is blank (empty or whitespace-only)
 * @since 0.1.0
 * @remarks Use `trim` to control whitespace semantics.
 */
export const IsBlank = factory.make("isBlank", fields(`""(trim)`, "is blank", { trim: BoolWithDefault(true) }));

/** @category String @symbol "¬""(trim)" @human is not blank @since 0.1.0 */
export const IsNotBlank = factory.make(
  "isNotBlank",
  fields(`¬""(trim)`, "is not blank", { trim: BoolWithDefault(true) })
);

/**
 * @category Presence
 * @symbol null|undef|∅
 * @human is nullish or empty
 * @since 0.1.0
 * @remarks Treats null/undefined/""/[]/{} as empty; `trim` affects strings.
 */
export const IsNullishOrEmpty = factory.make(
  "isNullishOrEmpty",
  fields("null|undef|∅", "is nullish or empty", { trim: BoolWithDefault(true) })
);

/**
 * @category Presence
 * @symbol ¬(null|undef|∅)
 * @human is present (not nullish and not empty)
 * @since 0.1.0
 */
export const IsPresent = factory.make(
  "isPresent",
  fields("¬(null|undef|∅)", "is present", { trim: BoolWithDefault(true) })
);

/**
 * @category Size
 * @symbol ∅(deep)
 * @human is deeply empty (recursively no meaningful content)
 * @since 0.1.0
 * @remarks For nested arrays/objects (and Maps/Sets); implement depth logic in specialization.
 */
export const IsEmptyDeep = factory.make(
  "isEmptyDeep",
  fields("∅(deep)", "is deeply empty", { deep: BoolWithDefault(true) })
);

/** @category Size @symbol ¬∅(deep) @human is not deeply empty @since 0.1.0 */
export const IsNotEmptyDeep = factory.make(
  "isNotEmptyDeep",
  fields("¬∅(deep)", "is not deeply empty", { deep: BoolWithDefault(true) })
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
