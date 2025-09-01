import { BoolWithDefault } from "@beep/schema/custom";
import { stringLiteralKit } from "@beep/schema/kits";
import { fields, makeFactory } from "@beep/schema/tokens/operators/internal/factory";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";

const kit = stringLiteralKit(
  "startsWith",
  "notStartsWith",
  "endsWith",
  "notEndsWith",
  "contains",
  "notContains",
  "matches",
  "notMatches",
  "equalsIgnoreCase"
)({
  identifier: "StringOperators",
  title: "String Operators",
  description:
    "Basic String Operators startsWith / notStartsWith / endsWith / notEndsWith / contains / notContains / matches / notMatches",
});

const Enum = kit.Enum;

const factory = makeFactory("string");

// ╔══════════════════════════════════════════════════════════════╗
// ║  🔤 String / Pattern Operators                               ║
// ║  startsWith / endsWith / contains / notContains / matches…  ║
// ╚══════════════════════════════════════════════════════════════╝

/** @category String @symbol prefix⋯ @human starts with @since 0.1.0 */
export const StartsWith = factory.make(
  Enum.startsWith,
  fields("prefix⋯", "starts with", { caseInsensitive: BoolWithDefault(false) })
);

/** @category String @symbol ¬prefix⋯ @human does not start with @since 0.1.0 */
export const NotStartsWith = factory.make(
  Enum.notStartsWith,
  fields("¬prefix⋯", "does not start with", { caseInsensitive: BoolWithDefault(false) })
);

/** @category String @symbol ⋯suffix @human ends with @since 0.1.0 */
export const EndsWith = factory.make(
  Enum.endsWith,
  fields("⋯suffix", "ends with", { caseInsensitive: BoolWithDefault(false) })
);

/** @category String @symbol ⋯¬suffix @human does not end with @since 0.1.0 */
export const NotEndsWith = factory.make(
  Enum.notEndsWith,
  fields("⋯¬suffix", "does not end with", { caseInsensitive: BoolWithDefault(false) })
);

/** @category String @symbol ∋ @human contains @since 0.1.0 */
export const Contains = factory.make(
  Enum.contains,
  fields("∋", "contains", { caseInsensitive: BoolWithDefault(false) })
);

/** @category String @symbol ∌ @human does not contain @since 0.1.0 */
export const NotContains = factory.make(
  Enum.notContains,
  fields("∌", "does not contain", { caseInsensitive: BoolWithDefault(false) })
);

/** @category String @symbol ~ @human matches pattern @since 0.1.0 */
export const Matches = factory.make(
  Enum.matches,
  fields("~", "matches pattern", { caseInsensitive: BoolWithDefault(false) })
);

/** @category String @symbol ¬~ @human does not match pattern @since 0.1.0 */
export const NotMatches = factory.make(
  Enum.notMatches,
  fields("¬~", "does not match pattern", { caseInsensitive: BoolWithDefault(false) })
);

/** @category String @symbol ≡ (ci) @human equals (case-insensitive) @since 0.1.0 */
export const EqualsIgnoreCase = factory.make(
  Enum.equalsIgnoreCase,
  fields("≡ (ci)", "equals (case-insensitive)", { caseInsensitive: BoolWithDefault(true) })
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
