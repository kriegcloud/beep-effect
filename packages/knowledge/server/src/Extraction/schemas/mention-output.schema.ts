import { Confidence } from "@beep/knowledge-domain/value-objects";
import * as S from "effect/Schema";

export class ExtractedMention extends S.Class<ExtractedMention>("@beep/knowledge-server/ExtractedMention")({
  text: S.String.annotations({
    description: "Exact text span of the entity mention",
  }),

  startChar: S.NonNegativeInt.pipe(
    S.annotations({
      description: "Character offset start (0-indexed relative to chunk)",
    })
  ),

  endChar: S.NonNegativeInt.pipe(
    S.annotations({
      description: "Character offset end (exclusive, relative to chunk)",
    })
  ),

  confidence: Confidence.annotations({
    description: "Extraction confidence score (0-1)",
  }),

  suggestedType: S.optional(
    S.String.annotations({
      description: "Preliminary type suggestion (e.g., 'Person', 'Organization')",
    })
  ),

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

export class MentionOutput extends S.Class<MentionOutput>("@beep/knowledge-server/MentionOutput")({
  mentions: S.Array(ExtractedMention).annotations({
    description: "List of detected entity mentions",
  }),

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
