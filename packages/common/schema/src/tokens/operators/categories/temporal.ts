import { stringLiteralKit } from "@beep/schema/kits";
import { fields, makeFactory } from "@beep/schema/tokens/operators/internal/factory";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";

const kit = stringLiteralKit(
  "isSameHour",
  "isSameDay",
  "isSameWeek",
  "isSameMonth",
  "isSameYear",
  "before",
  "after",
  "onOrAfter",
  "withinLast",
  "withinNext",
  "isWeekday",
  "isWeekend",
  "isSameQuarter"
)({
  identifier: "TemporalOperatorPredicate",
  title: "Temporal Operator Predicate",
  description: "🗓️ Temporal Operator Predicates",
});

const Enum = kit.Enum;

const factory = makeFactory("temporal");

/** @category Time @symbol ≡ hour @human is in the same hour @since 0.1.0 */
export const IsSameHour = factory.make("isSameHour", fields("≡ hour", "is in the same hour"));
/** @category Time @symbol ≡ day @human is on the same day @since 0.1.0 */
export const IsSameDay = factory.make("isSameDay", fields("≡ day", "is on the same day"));
/** @category Time @symbol ≡ week @human is in the same week @since 0.1.0 */
export const IsSameWeek = factory.make("isSameWeek", fields("≡ week", "is in the same week"));
/** @category Time @symbol ≡ month @human is in the same month @since 0.1.0 */
export const IsSameMonth = factory.make("isSameMonth", fields("≡ month", "is in the same month"));
/** @category Time @symbol ≡ year @human is in the same year @since 0.1.0 */
export const IsSameYear = factory.make("isSameYear", fields("≡ year", "is in the same year"));

/** @category Time @symbol <t @human is before @since 0.1.0 */
export const Before = factory.make("before", fields("<t", "is before"));
/** @category Time @symbol ≤t @human is on or before @since 0.1.0 */
export const OnOrBefore = factory.make("onOrBefore", fields("≤t", "is on or before"));

/** @category Time @symbol >t @human is after @since 0.1.0 */
export const After = factory.make("after", fields(">t", "is after"));
/** @category Time @symbol ≥t @human is on or after @since 0.1.0 */
export const OnOrAfter = factory.make("onOrAfter", fields("≥t", "is on or after"));

/** @category Time @symbol ∈ (now−Δ, now] @human is within last duration @since 0.1.0 */
export const WithinLast = factory.make("withinLast", fields("∈ (now−Δ, now]", "is within last duration"));

/** @category Time @symbol ∈ [now, now+Δ) @human is within next duration @since 0.1.0 */
export const WithinNext = factory.make("withinNext", fields("∈ [now, now+Δ)", "is within next duration"));

/** @category Time @symbol Mon–Fri @human is on a weekday @since 0.1.0 */
export const IsWeekday = factory.make("isWeekday", fields("Mon–Fri", "is on a weekday"));
/** @category Time @symbol Sat/Sun @human is on a weekend @since 0.1.0 */
export const IsWeekend = factory.make("isWeekend", fields("Sat/Sun", "is on a weekend"));
/** @category Time @symbol ≡ quarter @human is in the same quarter @since 0.1.0 */
export const IsSameQuarter = factory.make("isSameQuarter", fields("≡ quarter", "is in the same quarter"));

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
