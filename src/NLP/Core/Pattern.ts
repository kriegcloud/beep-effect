import { Option, Effect, ParseResult, Schema } from "effect";
// ============================================================================
// POS TAG REFERENCE
// ============================================================================

/**
 * Universal POS tags supported by wink-nlp
 * Based on https://winkjs.org/wink-nlp/part-of-speech.html
 */

export type WinkPOSTag = Schema.Schema.Type<typeof WinkPOSTag>;
const WinkPOSTag = Schema.Literal(
  "ADJ", // Adjective: Red, unique, rare, huge, happy
  "ADP", // Adposition: in, of, to, over
  "ADV", // Adverb: Very, happily, briefly, soon
  "AUX", // Auxiliary: Do, did, is, am, are, should, must, will
  "CCONJ", // Coordinating conjunction: And, or, but
  "DET", // Determiner: my, that, few, this, an, the
  "INTJ", // Interjection: Alas, oh, wow
  "NOUN", // Noun: Man, dog, table, chair
  "NUM", // Numeral: one, five, 3.14, 100
  "PART", // Particle: 's, not, n't
  "PRON", // Pronoun: You, I, he, she, myself, what, who
  "PROPN", // Proper noun: John Smith, London, UN
  "PUNCT", // Punctuation: ., ,, (), !
  "SCONJ", // Subordinating conjunction: That, if, while
  "SYM", // Symbol: $, +, =, :), 😝
  "VERB", // Verb: Run, sing, develop
  "X", // Other: Words that cannot be assigned any POS tag
  "SPACE" // Space: \n, \t, \r (wink-nlp specific)
).pipe(
  Schema.annotations({
    identifier: "effect-nlp/Pattern/WinkPOSTag",
    title: "Wink Part-of-Speech Tag",
    description:
      "Universal POS tags supported by wink-nlp based on the Universal Dependencies tagset",
    examples: ["NOUN", "VERB", "ADJ", "PROPN"],
    jsonSchema: {
      $comment: "POS tags used for grammatical pattern matching in wink-nlp",
    },
  })
);

export type WinkEntityType = Schema.Schema.Type<typeof WinkEntityType>;
export const WinkEntityType = Schema.Literal(
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
  "MENTION"
).pipe(
  Schema.annotations({
    identifier: "effect-nlp/Pattern/WinkEntityType",
    name: "WinkEntityType",
    title: "Wink Entity Type",
    description: "A type of entity that can be matched by wink-nlp",
    examples: [
      "CARDINAL",
      "TIME",
      "DATE",
      "MONEY",
      "PERCENT",
      "HASHTAG",
      "EMOJI",
      "EMOTICON",
      "EMAIL",
      "URL",
      "MENTION",
    ],
  })
);

export type POSPatternOption = Schema.Schema.Type<typeof POSPatternOption>;
export const POSPatternOption = Schema.Data(
  Schema.NonEmptyArray(Schema.Union(WinkPOSTag, Schema.Literal(""))).pipe(
    Schema.annotations({
      identifier: "effect-nlp/Pattern/POSPatternOption",
      title: "POS Pattern Option",
      description:
        "An array of POS tags that can match at a position, with empty string representing optional elements",
      examples: [["NOUN"], ["", "DET"], ["ADJ", "NOUN"], ["PROPN", "PROPN"]],
      jsonSchema: {
        $comment:
          "Array of POS tags for pattern matching; empty string means optional",
      },
    })
  )
);

// ============================================================================
// PATTERN ELEMENT SCHEMAS
// ============================================================================
// literal option is a literal or series of literals separated by "|"
// can half empty option [|DET] e.g. "empty or DET"

export const POSPatternOptionToBracketString = Schema.transformOrFail(
  POSPatternOption,
  Schema.NonEmptyString,
  {
    strict: true,
    decode: (input, _options, _ast, _fromI) => {
      // Check if there are any non-empty POS tags
      const hasValidTags = input.some((tag) => tag !== "");
      if (!hasValidTags) {
        return Effect.fail(
          new ParseResult.Type(
            _ast,
            input,
            "POS pattern must contain at least one valid POS tag"
          )
        );
      }
      return Effect.succeed(`[${input.join("|")}]`);
    },
    encode: (input, _options, _ast) => {
      const content = input.slice(1, -1); // Remove brackets
      const parts = content.split("|");

      return Schema.decodeUnknown(POSPatternOption)(parts).pipe(
        Effect.flatMap((decodedParts) => {
          // Check if there are any non-empty POS tags
          const hasValidTags = decodedParts.some((tag) => tag !== "");
          if (!hasValidTags) {
            return Effect.fail(
              new ParseResult.Type(
                _ast,
                input,
                "POS pattern must contain at least one valid POS tag"
              )
            );
          }
          return Effect.succeed(decodedParts);
        }),
        Effect.mapError(
          (error) =>
            new ParseResult.Type(
              _ast,
              input,
              `Invalid POS pattern: ${error.message}`
            )
        )
      );
    },
  }
);

export const EntityPatternOption = Schema.DataFromSelf(
  Schema.NonEmptyArray(Schema.Union(WinkEntityType, Schema.Literal("")))
).pipe(
  Schema.annotations({
    identifier: "effect-nlp/Pattern/EntityPatternOption",
    title: "Entity Pattern Option",
    description:
      "An array of entity types that can match at a position, with empty string representing optional elements",
    examples: [
      ["CARDINAL", "TIME"],
      ["DATE", ""],
      ["MONEY", "PERCENT"],
    ],
    jsonSchema: {
      $comment:
        "Array of entity types for pattern matching; empty string means optional",
    },
  })
);

export type EntityPatternOption = Schema.Schema.Type<
  typeof EntityPatternOption
>;

export const EntityPatternOptionToBracketString = Schema.transformOrFail(
  EntityPatternOption,
  Schema.NonEmptyString,
  {
    strict: true,
    decode: (input, _options, _ast, _fromI) => {
      // Check if there are any non-empty entity types
      const hasValidTypes = input.some((type) => type !== "");
      if (!hasValidTypes) {
        return Effect.fail(
          new ParseResult.Type(
            _ast,
            input,
            "Entity pattern must contain at least one valid entity type"
          )
        );
      }
      return Effect.succeed(`[${input.join("|")}]`);
    },
    encode: (input, _options, _ast) => {
      const content = input.slice(1, -1); // Remove brackets
      const parts = content.split("|");

      return Schema.decodeUnknown(EntityPatternOption)(parts).pipe(
        Effect.flatMap((decodedParts) => {
          // Check if there are any non-empty entity types
          const hasValidTypes = decodedParts.some((type) => type !== "");
          if (!hasValidTypes) {
            return Effect.fail(
              new ParseResult.Type(
                _ast,
                input,
                "Entity pattern must contain at least one valid entity type"
              )
            );
          }
          return Effect.succeed(decodedParts);
        }),
        Effect.mapError(
          (error) =>
            new ParseResult.Type(
              _ast,
              input,
              `Invalid entity pattern: ${error.message}`
            )
        )
      );
    },
  }
);

export const LiteralPatternOption = Schema.DataFromSelf(
  Schema.NonEmptyArray(Schema.Union(Schema.NonEmptyString, Schema.Literal("")))
).pipe(
  Schema.annotations({
    identifier: "effect-nlp/Pattern/LiteralPatternOption",
    title: "Literal Pattern Option",
    description:
      "An array of literal words that can match at a position, with empty string representing optional elements",
    examples: [
      ["Classic", "Supreme", "Extravaganza"],
      ["Delivery", ""],
      ["Corn", "Capsicum", "Onion"],
      ["", "Small", "Medium", "Large"],
    ],
    jsonSchema: {
      $comment:
        "Array of literal words for exact matching; empty string means optional",
    },
  })
);

export const LiteralPatternOptionToBracketString = Schema.transformOrFail(
  LiteralPatternOption,
  Schema.NonEmptyString,
  {
    strict: true,
    decode: (input, _options, _ast, _fromI) => {
      // Check if there are any non-empty literals
      const hasValidLiterals = input.some((literal) => literal !== "");
      if (!hasValidLiterals) {
        return Effect.fail(
          new ParseResult.Type(
            _ast,
            input,
            "Literal pattern must contain at least one valid literal"
          )
        );
      }
      return Effect.succeed(`[${input.join("|")}]`);
    },
    encode: (input, _options, _ast) => {
      const content = input.slice(1, -1); // Remove brackets
      const parts = content.split("|");

      return Schema.decodeUnknown(LiteralPatternOption)(parts).pipe(
        Effect.flatMap((decodedParts) => {
          // Check if there are any non-empty literals
          const hasValidLiterals = decodedParts.some(
            (literal) => literal !== ""
          );
          if (!hasValidLiterals) {
            return Effect.fail(
              new ParseResult.Type(
                _ast,
                input,
                "Literal pattern must contain at least one valid literal"
              )
            );
          }
          return Effect.succeed(decodedParts);
        }),
        Effect.mapError(
          (error) =>
            new ParseResult.Type(
              _ast,
              input,
              `Invalid literal pattern: ${error.message}`
            )
        )
      );
    },
  }
);

// ============================================================================
// PATTERN ELEMENT TAGGED STRUCTS
// ============================================================================

export class POSPatternElement extends Schema.TaggedClass<POSPatternElement>(
  "POS"
)("POSPatternElement", {
  value: POSPatternOption,
}) {}

export class EntityPatternElement extends Schema.TaggedClass<EntityPatternElement>(
  "Entity"
)("EntityPatternElement", {
  value: EntityPatternOption,
}) {}

export class LiteralPatternElement extends Schema.TaggedClass<LiteralPatternElement>(
  "Literal"
)("LiteralPatternElement", {
  value: LiteralPatternOption,
}) {}

// ============================================================================
// PATTERN ELEMENT UNION TYPE
// ============================================================================

export type PatternElement = Schema.Schema.Type<typeof PatternElement>;
export const PatternElement = Schema.Union(
  Schema.asSchema(POSPatternElement),
  Schema.asSchema(EntityPatternElement),
  Schema.asSchema(LiteralPatternElement)
).pipe(
  Schema.annotations({
    identifier: "effect-nlp/Pattern/PatternElement",
    title: "Pattern Element",
    description:
      "A discriminated union of pattern elements (POS, Entity, or Literal) for composing extraction patterns",
    documentation: `
Pattern elements are the building blocks of wink-nlp patterns. Each element represents
a group of options that can match at a specific position in the text.

Types:
- pos: Part-of-Speech tags (NOUN, VERB, ADJ, etc.)
- entity: Named entity types (CARDINAL, TIME, DATE, etc.)  
- literal: Exact word matches (Classic, Supreme, etc.)

All elements use the same bracket format: [OPTION1|OPTION2|...]
Empty options (|) represent optional elements that may or may not be present.
      `,
  })
);

type PatternId = Schema.Schema.Type<typeof PatternId>;
const PatternId = Schema.NonEmptyString.pipe(Schema.brand("PatternId"));

// ============================================================================
// MARK RANGE TYPE
// ============================================================================

/**
 * Mark range for selective token extraction from pattern matches
 * [start, end] indices relative to the pattern match (0-based)
 * Supports negative indices for counting from end
 */
export type MarkRange = Schema.Schema.Type<typeof MarkRange>;
export const MarkRange = Schema.Tuple(Schema.Int, Schema.Int).pipe(
  Schema.annotations({
    identifier: "effect-nlp/Pattern/MarkRange",
    title: "Mark Range",
    description:
      "Token range specification for selective extraction [start, end]",
    examples: [
      [0, 0],
      [1, 2],
      [-2, -1],
    ],
    jsonSchema: {
      type: "array",
      items: { type: "integer" },
      minItems: 2,
      maxItems: 2,
      description: "Two-element array specifying start and end token indices",
    },
  })
);

export class Pattern extends Schema.TaggedClass<Pattern>(
  "effect-nlp/Pattern/Model"
)("Pattern", {
  id: PatternId,
  elements: Schema.ChunkFromSelf(Schema.asSchema(PatternElement)).pipe(
    Schema.annotations({
      description: "Ordered sequence of pattern elements to match",
      title: "Pattern Elements",
      minItems: 1,
      jsonSchema: {
        type: "array",
        items: true,
        minItems: 1,
        description: "Ordered sequence of pattern elements to match",
      },
    })
  ),
  mark: Schema.Option(MarkRange).pipe(
    Schema.propertySignature,
    Schema.withConstructorDefault(() => Option.none())
  ),
}) {}

// ============================================================================
// PATTERN NAMESPACE
// ============================================================================

/**
 * Pattern namespace with encoded/decoded types and utilities
 * @since 1.0.0
 * @category namespace
 */
export namespace Pattern {
  /**
   * POS pattern element types
   * @category model
   */
  export namespace POS {
    export type Encoded = Schema.Schema.Encoded<typeof POSPatternElement>;
    export type Type = Schema.Schema.Type<typeof POSPatternElement>;

    export const make = POSPatternElement.make;
    export const decode = Schema.decodeUnknown(POSPatternElement);
    export const encode = Schema.encodeSync(POSPatternElement);
    export const toBracketString = Schema.decodeSync(
      POSPatternOptionToBracketString
    );
    export const is = Schema.is(POSPatternElement);
  }

  /**
   * Entity pattern element types
   * @category model
   */
  export namespace Entity {
    export type Encoded = Schema.Schema.Encoded<typeof EntityPatternElement>;
    export type Type = Schema.Schema.Type<typeof EntityPatternElement>;

    export const make = EntityPatternElement.make;
    export const decode = Schema.decodeUnknown(EntityPatternElement);
    export const encode = Schema.encodeSync(EntityPatternElement);
    export const toBracketString = Schema.decodeSync(
      EntityPatternOptionToBracketString
    );
    export const is = Schema.is(EntityPatternElement);
  }

  /**
   * Literal pattern element types
   * @category model
   */
  export namespace Literal {
    export type Encoded = Schema.Schema.Encoded<typeof LiteralPatternElement>;
    export type Type = Schema.Schema.Type<typeof LiteralPatternElement>;

    export const make = LiteralPatternElement.make;
    export const decode = Schema.decodeUnknown(LiteralPatternElement);
    export const encode = Schema.encodeSync(LiteralPatternElement);
    export const is = Schema.is(LiteralPatternElement);
    export const toBracketString = Schema.decodeSync(
      LiteralPatternOptionToBracketString
    );
  }

  /**
   * Pattern element union types
   * @category model
   */
  export namespace Element {
    export type Encoded = Schema.Schema.Encoded<typeof PatternElement>;
    export type Type = Schema.Schema.Type<typeof PatternElement>;

    export const decode = Schema.decodeUnknown(PatternElement);
    export const encode = Schema.encodeSync(PatternElement);
    export const is = Schema.is(PatternElement);
  }

  /**
   * Core pattern types
   * @category model
   */
  // Pattern is a class, not a regular schema
  export type Encoded = Schema.Schema.Encoded<typeof Pattern>;
  export type Type = Pattern;
  export type Id = Schema.Schema.Type<typeof PatternId>;

  export const schema = Schema.asSchema(Pattern);
  export const Id = PatternId.make;
  export const decode = Schema.decodeUnknownSync(Pattern);
  export const encode = Schema.encodeSync(Pattern);
  export const is = Schema.is(Pattern);
}
