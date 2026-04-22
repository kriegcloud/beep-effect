/**
 * Schema-first NLP pattern model.
 *
 * @since 0.0.0
 * @module
 */

import { $NlpId } from "@beep/identity";
import { LiteralKit, NonNegativeInt, SchemaUtils } from "@beep/schema";
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $NlpId.create("Core/Pattern");

const EmptyPatternChoice = S.Literal("");
const MeaningfulPatternOptionChoice = S.makeFilter((values: ReadonlyArray<string>) => A.some(values, Str.isNonEmpty), {
  description: "Pattern options must include at least one non-empty choice.",
  identifier: $I`MeaningfulPatternOptionChoice`,
  message: "Pattern options must include at least one non-empty choice.",
  title: "Meaningful Pattern Option Choice",
});
const WinkPOSTagKit = LiteralKit([
  "ADJ",
  "ADP",
  "ADV",
  "AUX",
  "CCONJ",
  "DET",
  "INTJ",
  "NOUN",
  "NUM",
  "PART",
  "PRON",
  "PROPN",
  "PUNCT",
  "SCONJ",
  "SYM",
  "VERB",
  "X",
  "SPACE",
] as const);
const WinkEntityTypeKit = LiteralKit([
  "DATE",
  "ORDINAL",
  "CARDINAL",
  "MONEY",
  "PERCENT",
  "TIME",
  "DURATION",
  "HASHTAG",
  "EMOJI",
  "EMOTICON",
  "EMAIL",
  "URL",
  "MENTION",
] as const);

const renderBracketString = (values: ReadonlyArray<string>): string => `[${A.join(values, "|")}]`;

/**
 * Supported wink part-of-speech tags.
 *
 * @example
 * ```ts
 * import { WinkPOSTag } from "@beep/nlp/Core/Pattern"
 *
 * console.log(WinkPOSTag)
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const WinkPOSTag = WinkPOSTagKit.pipe(
  $I.annoteSchema("WinkPOSTag", {
    description: "Universal part-of-speech tags supported by wink-nlp.",
  }),
  SchemaUtils.withLiteralKitStatics(WinkPOSTagKit)
);

/**
 * Runtime type for {@link WinkPOSTag}.
 *
 * @example
 * ```ts
 * import type { WinkPOSTag } from "@beep/nlp/Core/Pattern"
 *
 * type Example = WinkPOSTag
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type WinkPOSTag = typeof WinkPOSTag.Type;

/**
 * Supported wink entity types.
 *
 * @example
 * ```ts
 * import { WinkEntityType } from "@beep/nlp/Core/Pattern"
 *
 * console.log(WinkEntityType)
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const WinkEntityType = WinkEntityTypeKit.pipe(
  $I.annoteSchema("WinkEntityType", {
    description: "Named-entity types supported by wink-nlp custom entity patterns.",
  }),
  SchemaUtils.withLiteralKitStatics(WinkEntityTypeKit)
);

/**
 * Runtime type for {@link WinkEntityType}.
 *
 * @example
 * ```ts
 * import type { WinkEntityType } from "@beep/nlp/Core/Pattern"
 *
 * type Example = WinkEntityType
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type WinkEntityType = typeof WinkEntityType.Type;

const DisambiguatedLiteralPatternOptionChoice = S.makeFilter(
  (values: ReadonlyArray<string>) =>
    A.some(values, (value) => P.every([Str.isNonEmpty, P.not(S.is(WinkPOSTag)), P.not(S.is(WinkEntityType))])(value)),
  {
    description: "Literal pattern options must include at least one non-reserved literal choice.",
    identifier: $I`DisambiguatedLiteralPatternOptionChoice`,
    message: "Literal pattern options must include at least one non-reserved literal choice.",
    title: "Disambiguated Literal Pattern Option Choice",
  }
);

/**
 * POS alternatives for a single pattern position.
 *
 * @example
 * ```ts
 * import { POSPatternOption } from "@beep/nlp/Core/Pattern"
 *
 * console.log(POSPatternOption)
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const POSPatternOption = S.NonEmptyArray(S.Union([WinkPOSTag, EmptyPatternChoice]))
  .check(MeaningfulPatternOptionChoice)
  .pipe(
    S.annotate(
      $I.annote("POSPatternOption", {
        description: "One or more POS tag alternatives for a pattern position.",
      })
    )
  );

/**
 * Runtime type for {@link POSPatternOption}.
 *
 * @example
 * ```ts
 * import type { POSPatternOption } from "@beep/nlp/Core/Pattern"
 *
 * type Example = POSPatternOption
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type POSPatternOption = typeof POSPatternOption.Type;

/**
 * Entity alternatives for a single pattern position.
 *
 * @example
 * ```ts
 * import { EntityPatternOption } from "@beep/nlp/Core/Pattern"
 *
 * console.log(EntityPatternOption)
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const EntityPatternOption = S.NonEmptyArray(S.Union([WinkEntityType, EmptyPatternChoice]))
  .check(MeaningfulPatternOptionChoice)
  .pipe(
    S.annotate(
      $I.annote("EntityPatternOption", {
        description: "One or more entity-type alternatives for a pattern position.",
      })
    )
  );

/**
 * Runtime type for {@link EntityPatternOption}.
 *
 * @example
 * ```ts
 * import type { EntityPatternOption } from "@beep/nlp/Core/Pattern"
 *
 * type Example = EntityPatternOption
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type EntityPatternOption = typeof EntityPatternOption.Type;

/**
 * Literal alternatives for a single pattern position.
 *
 * @example
 * ```ts
 * import { LiteralPatternOption } from "@beep/nlp/Core/Pattern"
 *
 * console.log(LiteralPatternOption)
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const LiteralPatternOption = S.NonEmptyArray(S.Union([S.NonEmptyString, EmptyPatternChoice]))
  .check(MeaningfulPatternOptionChoice)
  .check(DisambiguatedLiteralPatternOptionChoice)
  .pipe(
    S.annotate(
      $I.annote("LiteralPatternOption", {
        description: "One or more literal-text alternatives for a pattern position.",
      })
    )
  );

/**
 * Runtime type for {@link LiteralPatternOption}.
 *
 * @example
 * ```ts
 * import type { LiteralPatternOption } from "@beep/nlp/Core/Pattern"
 *
 * type Example = LiteralPatternOption
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type LiteralPatternOption = typeof LiteralPatternOption.Type;

/**
 * Pattern element matching one or more POS tags.
 *
 * @example
 * ```ts
 * import { POSPatternElement } from "@beep/nlp/Core/Pattern"
 *
 * console.log(POSPatternElement)
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class POSPatternElement extends S.TaggedClass<POSPatternElement>($I`POSPatternElement`)(
  "POSPatternElement",
  {
    value: POSPatternOption,
  },
  $I.annote("POSPatternElement", {
    description: "Pattern element matching POS tag alternatives.",
  })
) {}

/**
 * Pattern element matching one or more entity types.
 *
 * @example
 * ```ts
 * import { EntityPatternElement } from "@beep/nlp/Core/Pattern"
 *
 * console.log(EntityPatternElement)
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class EntityPatternElement extends S.TaggedClass<EntityPatternElement>($I`EntityPatternElement`)(
  "EntityPatternElement",
  {
    value: EntityPatternOption,
  },
  $I.annote("EntityPatternElement", {
    description: "Pattern element matching entity-type alternatives.",
  })
) {}

/**
 * Pattern element matching one or more literal strings.
 *
 * @example
 * ```ts
 * import { LiteralPatternElement } from "@beep/nlp/Core/Pattern"
 *
 * console.log(LiteralPatternElement)
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class LiteralPatternElement extends S.TaggedClass<LiteralPatternElement>($I`LiteralPatternElement`)(
  "LiteralPatternElement",
  {
    value: LiteralPatternOption,
  },
  $I.annote("LiteralPatternElement", {
    description: "Pattern element matching literal-text alternatives.",
  })
) {}

/**
 * Union of supported pattern elements.
 *
 * @example
 * ```ts
 * import { PatternElement } from "@beep/nlp/Core/Pattern"
 *
 * console.log(PatternElement)
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const PatternElement = S.Union([POSPatternElement, EntityPatternElement, LiteralPatternElement]).pipe(
  S.annotate(
    $I.annote("PatternElement", {
      description: "Tagged union of supported NLP pattern element variants.",
    })
  )
);

/**
 * Runtime type for {@link PatternElement}.
 *
 * @example
 * ```ts
 * import type { PatternElement } from "@beep/nlp/Core/Pattern"
 *
 * type Example = PatternElement
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type PatternElement = typeof PatternElement.Type;

/**
 * Branded pattern identifier.
 *
 * @example
 * ```ts
 * import { PatternId } from "@beep/nlp/Core/Pattern"
 *
 * console.log(PatternId)
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const PatternId = S.NonEmptyString.pipe(
  S.brand("PatternId"),
  S.annotate(
    $I.annote("PatternId", {
      description: "Stable identifier for a reusable NLP pattern.",
    })
  )
);

/**
 * Runtime type for {@link PatternId}.
 *
 * @example
 * ```ts
 * import type { PatternId } from "@beep/nlp/Core/Pattern"
 *
 * type Example = PatternId
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type PatternId = typeof PatternId.Type;

/**
 * Inclusive mark range over pattern element positions.
 *
 * @example
 * ```ts
 * import { MarkRange } from "@beep/nlp/Core/Pattern"
 *
 * console.log(MarkRange)
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const MarkRange = S.Tuple([NonNegativeInt, NonNegativeInt]).pipe(
  S.annotate(
    $I.annote("MarkRange", {
      description: "Inclusive [start, end] range of marked pattern elements.",
    })
  )
);

/**
 * Runtime type for {@link MarkRange}.
 *
 * @example
 * ```ts
 * import type { MarkRange } from "@beep/nlp/Core/Pattern"
 *
 * type Example = MarkRange
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type MarkRange = typeof MarkRange.Type;

/**
 * Immutable NLP pattern.
 *
 * @example
 * ```ts
 * import { Pattern } from "@beep/nlp/Core/Pattern"
 *
 * console.log(Pattern)
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Pattern extends S.TaggedClass<Pattern>($I`Pattern`)(
  "Pattern",
  {
    elements: S.Chunk(PatternElement),
    id: PatternId,
    mark: S.OptionFromOptionalKey(MarkRange),
  },
  $I.annote("Pattern", {
    description: "Ordered sequence of NLP pattern elements with optional marked span.",
  })
) {
  /**
   * Pattern identifier constructor.
   */
  static readonly Id: {
    (id: string): PatternId;
    (): (id: string) => PatternId;
  } = dual<
    () => (id: string) => PatternId,
    (id: string) => PatternId
  >((args) => args.length >= 1, PatternId.make);

  /**
   * Pattern element schema.
   */
  static readonly Element = PatternElement;

  /**
   * POS element helpers.
   */
  static readonly POS = POSPatternElement.pipe(
    SchemaUtils.withStatics(() => ({
      decode: S.decodeUnknownSync(POSPatternElement),
      encode: S.encodeSync(POSPatternElement),
      is: S.is(POSPatternElement),
      toBracketString: (value: POSPatternOption): string => renderBracketString(value),
    }))
  );

  /**
   * Entity element helpers.
   */
  static readonly Entity = EntityPatternElement.pipe(
    SchemaUtils.withStatics(() => ({
      decode: S.decodeUnknownSync(EntityPatternElement),
      encode: S.encodeSync(EntityPatternElement),
      is: S.is(EntityPatternElement),
      toBracketString: (value: EntityPatternOption): string => renderBracketString(value),
    }))
  );

  /**
   * Literal element helpers.
   */
  static readonly Literal = LiteralPatternElement.pipe(
    SchemaUtils.withStatics(() => ({
      decode: S.decodeUnknownSync(LiteralPatternElement),
      encode: S.encodeSync(LiteralPatternElement),
      is: S.is(LiteralPatternElement),
      toBracketString: (value: LiteralPatternOption): string => renderBracketString(value),
    }))
  );

  /**
   * Encode a pattern into its schema representation.
   */
  static readonly encode: {
    (pattern: Pattern): S.Codec.Encoded<typeof Pattern>;
    (): (pattern: Pattern) => S.Codec.Encoded<typeof Pattern>;
  } = dual<
    () => (pattern: Pattern) => S.Codec.Encoded<typeof Pattern>,
    (pattern: Pattern) => S.Codec.Encoded<typeof Pattern>
  >((args) => args.length >= 1, S.encodeSync(Pattern));

  /**
   * Decode unknown input into a pattern.
   */
  static readonly decode: {
    (input: S.Codec.Encoded<typeof Pattern>): Pattern;
    (): (input: S.Codec.Encoded<typeof Pattern>) => Pattern;
  } = dual<
    () => (input: S.Codec.Encoded<typeof Pattern>) => Pattern,
    (input: S.Codec.Encoded<typeof Pattern>) => Pattern
  >((args) => args.length >= 1, S.decodeUnknownSync(Pattern));

  /**
   * Runtime predicate for pattern values.
   */
  static readonly is = S.is(Pattern);
}
