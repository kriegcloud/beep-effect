/**
 * Schema-first NLP pattern model.
 *
 * @since 0.0.0
 * @module @beep/nlp/Core/Pattern
 */

import { $NlpId } from "@beep/identity";
import { LiteralKit, NonNegativeInt, SchemaUtils } from "@beep/schema";
import * as A from "effect/Array";
import * as S from "effect/Schema";

const $I = $NlpId.create("Core/Pattern");

const EmptyPatternChoice = S.Literal("");
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
 * @since 0.0.0
 * @category DomainModel
 */
export type WinkPOSTag = typeof WinkPOSTag.Type;

/**
 * Supported wink entity types.
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
 * @since 0.0.0
 * @category DomainModel
 */
export type WinkEntityType = typeof WinkEntityType.Type;

/**
 * POS alternatives for a single pattern position.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const POSPatternOption = S.NonEmptyArray(S.Union([WinkPOSTag, EmptyPatternChoice])).pipe(
  S.annotate(
    $I.annote("POSPatternOption", {
      description: "One or more POS tag alternatives for a pattern position.",
    })
  )
);

/**
 * Runtime type for {@link POSPatternOption}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type POSPatternOption = typeof POSPatternOption.Type;

/**
 * Entity alternatives for a single pattern position.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const EntityPatternOption = S.NonEmptyArray(S.Union([WinkEntityType, EmptyPatternChoice])).pipe(
  S.annotate(
    $I.annote("EntityPatternOption", {
      description: "One or more entity-type alternatives for a pattern position.",
    })
  )
);

/**
 * Runtime type for {@link EntityPatternOption}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type EntityPatternOption = typeof EntityPatternOption.Type;

/**
 * Literal alternatives for a single pattern position.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const LiteralPatternOption = S.NonEmptyArray(S.Union([S.NonEmptyString, EmptyPatternChoice])).pipe(
  S.annotate(
    $I.annote("LiteralPatternOption", {
      description: "One or more literal-text alternatives for a pattern position.",
    })
  )
);

/**
 * Runtime type for {@link LiteralPatternOption}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type LiteralPatternOption = typeof LiteralPatternOption.Type;

/**
 * Pattern element matching one or more POS tags.
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
 * @since 0.0.0
 * @category DomainModel
 */
export type PatternElement = typeof PatternElement.Type;

/**
 * Branded pattern identifier.
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
 * @since 0.0.0
 * @category DomainModel
 */
export type PatternId = typeof PatternId.Type;

/**
 * Inclusive mark range over pattern element positions.
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
 * @since 0.0.0
 * @category DomainModel
 */
export type MarkRange = typeof MarkRange.Type;

/**
 * Immutable NLP pattern.
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
   * Backwards-compatible unsafe constructor alias.
   */
  static readonly make = Pattern.makeUnsafe;

  /**
   * Pattern identifier constructor.
   */
  static readonly Id = PatternId.makeUnsafe;

  /**
   * Pattern element schema.
   */
  static readonly Element = PatternElement;

  /**
   * POS element helpers.
   */
  static readonly POS = Object.assign(POSPatternElement, {
    decode: S.decodeUnknownSync(POSPatternElement),
    encode: S.encodeSync(POSPatternElement),
    is: S.is(POSPatternElement),
    toBracketString: (value: POSPatternOption): string => renderBracketString(value),
  });

  /**
   * Entity element helpers.
   */
  static readonly Entity = Object.assign(EntityPatternElement, {
    decode: S.decodeUnknownSync(EntityPatternElement),
    encode: S.encodeSync(EntityPatternElement),
    is: S.is(EntityPatternElement),
    toBracketString: (value: EntityPatternOption): string => renderBracketString(value),
  });

  /**
   * Literal element helpers.
   */
  static readonly Literal = Object.assign(LiteralPatternElement, {
    decode: S.decodeUnknownSync(LiteralPatternElement),
    encode: S.encodeSync(LiteralPatternElement),
    is: S.is(LiteralPatternElement),
    toBracketString: (value: LiteralPatternOption): string => renderBracketString(value),
  });

  /**
   * Encode a pattern into its schema representation.
   */
  static readonly encode = S.encodeSync(Pattern);

  /**
   * Decode unknown input into a pattern.
   */
  static readonly decode = S.decodeUnknownSync(Pattern);

  /**
   * Runtime predicate for pattern values.
   */
  static readonly is = S.is(Pattern);
}
