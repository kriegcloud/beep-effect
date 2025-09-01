import { stringLiteralKit } from "@beep/schema/kits";
import { fields, makeFactory } from "@beep/schema/tokens/operators/internal/factory";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";

const kit = stringLiteralKit(
  "hasKey",
  "hasEveryKey",
  "hasAnyKey",
  "notHasKey",
  "hasPath",
  "notHasPath"
)({
  identifier: "ObjectStructurePredicate",
  title: "Object Structure Operator Predicate",
  description: "🗺️ Object Structure",
});

const Enum = kit.Enum;

const factory = makeFactory("objectStructure");

// ╔══════════════════════════════════════════════════════════════╗
// ║  🗺️ Object Structure                                          ║
// ╚══════════════════════════════════════════════════════════════╝

/** @category Object @symbol ∋ key @human has key @since 0.1.0 */
export const HasKey = factory.make("hasKey", fields("∋ key", "has key"));
/** @category Object @symbol ∋ all(keys) @human has every key @since 0.1.0 */
export const HasEveryKey = factory.make("hasEveryKey", fields("∋ all(keys)", "has every key"));
/** @category Object @symbol ∋ any(key) @human has any key @since 0.1.0 */
export const HasAnyKey = factory.make("hasAnyKey", fields("∋ any(key)", "has any key"));
/** @category Object @symbol ∌ key @human does not have key @since 0.1.0 */
export const NotHasKey = factory.make("notHasKey", fields("∌ key", "does not have key"));

/** @category Object @symbol ∋ path @human has path @since 0.1.0 */
export const HasPath = factory.make("hasPath", fields("∋ path", "has path"));
/** @category Object @symbol ∌ path @human does not have path @since 0.1.0 */
export const NotHasPath = factory.make("notHasPath", fields("∌ path", "does not have path"));

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
