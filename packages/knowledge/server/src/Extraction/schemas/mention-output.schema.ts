/**
 * MentionOutput - LLM output schema for mention extraction
 *
 * Defines the structured output format for entity mention detection.
 *
 * @module knowledge-server/Extraction/schemas/MentionOutput
 * @since 0.1.0
 */
import * as S from "effect/Schema";

/**
 * ExtractedMention - A single entity mention detected by the LLM
 *
 * @since 0.1.0
 * @category schemas
 */
export class ExtractedMention extends S.Class<ExtractedMention>("@beep/knowledge-server/ExtractedMention")({
  /**
   * The exact text span of the mention
   */
  text: S.String.annotations({
    description: "Exact text span of the entity mention",
  }),

  /**
   * Character offset where mention starts (0-indexed)
   */
  startChar: S.NonNegativeInt.pipe(
    S.annotations({
      description: "Character offset start (0-indexed relative to chunk)",
    })
  ),

  /**
   * Character offset where mention ends (exclusive)
   */
  endChar: S.NonNegativeInt.pipe(
    S.annotations({
      description: "Character offset end (exclusive, relative to chunk)",
    })
  ),

  /**
   * LLM confidence in this mention detection (0-1)
   */
  confidence: S.Number.pipe(
    S.greaterThanOrEqualTo(0),
    S.lessThanOrEqualTo(1),
    S.annotations({
      description: "Extraction confidence score (0-1)",
    })
  ),

  /**
   * Suggested entity type based on context (will be refined by EntityExtractor)
   */
  suggestedType: S.optional(
    S.String.annotations({
      description: "Preliminary type suggestion (e.g., 'Person', 'Organization')",
    })
  ),

  /**
   * Surrounding context for disambiguation
   */
  context: S.optional(
    S.String.annotations({
      description: "Surrounding text for disambiguation",
    })
  ),
}) {}

export declare namespace ExtractedMention {
  export type Type = typeof ExtractedMention.Type;
  export type Encoded = typeof ExtractedMention.Encoded;
}

/**
 * MentionOutput - Complete output from mention extraction
 *
 * @since 0.1.0
 * @category schemas
 */
export class MentionOutput extends S.Class<MentionOutput>("@beep/knowledge-server/MentionOutput")({
  /**
   * List of detected entity mentions
   */
  mentions: S.Array(ExtractedMention).annotations({
    description: "List of detected entity mentions",
  }),

  /**
   * LLM's reasoning for the extractions (optional)
   */
  reasoning: S.optional(
    S.String.annotations({
      description: "LLM reasoning for mention detection",
    })
  ),
}) {}

export declare namespace MentionOutput {
  export type Type = typeof MentionOutput.Type;
  export type Encoded = typeof MentionOutput.Encoded;
}
