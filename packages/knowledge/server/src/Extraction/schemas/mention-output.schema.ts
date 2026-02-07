import { $KnowledgeServerId } from "@beep/identity/packages";
import { Confidence } from "@beep/knowledge-domain/value-objects";
import * as S from "effect/Schema";

const $I = $KnowledgeServerId.create("Extraction/schemas/mention-output.schema");

export class ExtractedMention extends S.Class<ExtractedMention>($I`ExtractedMention`)(
  {
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
  },
  $I.annotations("ExtractedMention", {
    description: "Single mention extracted from text (span offsets, confidence, optional type/context hints).",
  })
) {}

export declare namespace ExtractedMention {
  export type Type = typeof ExtractedMention.Type;
  export type Encoded = typeof ExtractedMention.Encoded;
}

export class MentionOutput extends S.Class<MentionOutput>($I`MentionOutput`)(
  {
    mentions: S.Array(ExtractedMention).annotations({
      description: "List of detected entity mentions",
    }),

    reasoning: S.optional(
      S.String.annotations({
        description: "LLM reasoning for mention detection",
      })
    ),
  },
  $I.annotations("MentionOutput", {
    description: "LLM mention-extraction output (mentions + optional reasoning).",
  })
) {}

export declare namespace MentionOutput {
  export type Type = typeof MentionOutput.Type;
  export type Encoded = typeof MentionOutput.Encoded;
}
