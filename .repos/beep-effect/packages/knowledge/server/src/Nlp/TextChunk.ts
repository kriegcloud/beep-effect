import { $KnowledgeServerId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeServerId.create("Nlp/TextChunk");

export class TextChunk extends S.Class<TextChunk>($I`TextChunk`)(
  {
    index: S.NonNegativeInt.pipe(
      S.annotations({
        description: "Chunk index (0-indexed position in document)",
      })
    ),

    text: S.String.annotations({
      description: "Text content of this chunk",
    }),

    startOffset: S.NonNegativeInt.pipe(
      S.annotations({
        description: "Character offset where chunk starts in document",
      })
    ),

    endOffset: S.NonNegativeInt.pipe(
      S.annotations({
        description: "Character offset where chunk ends (exclusive)",
      })
    ),

    metadata: S.optional(
      S.Record({ key: S.String, value: S.Unknown }).annotations({
        description: "Additional metadata for this chunk",
      })
    ),
  },
  $I.annotations("TextChunk", {
    description: "Text chunk slice with offsets and optional metadata (for NLP chunking pipelines).",
  })
) {}

export declare namespace TextChunk {
  export type Type = typeof TextChunk.Type;
  export type Encoded = typeof TextChunk.Encoded;
}

export class ChunkingConfig extends S.Class<ChunkingConfig>($I`ChunkingConfig`)(
  {
    maxChunkSize: S.NonNegativeInt.pipe(
      S.annotations({
        description: "Maximum characters per chunk",
        default: 2000,
      })
    ),

    preserveSentences: S.Boolean.annotations({
      description: "If true, chunks will end at sentence boundaries",
      default: true,
    }),

    overlapSentences: S.NonNegativeInt.pipe(
      S.annotations({
        description: "Number of sentences to overlap between chunks",
        default: 1,
      })
    ),

    minChunkSize: S.optional(
      S.NonNegativeInt.pipe(
        S.annotations({
          description: "Minimum chunk size - smaller remnants merge with previous chunk",
          default: 100,
        })
      )
    ),
  },
  $I.annotations("ChunkingConfig", {
    description: "Configuration for splitting text into chunks (sizes, overlaps, sentence boundaries).",
  })
) {}

export declare namespace ChunkingConfig {
  export type Type = typeof ChunkingConfig.Type;
  export type Encoded = typeof ChunkingConfig.Encoded;
}

export const defaultChunkingConfig: ChunkingConfig = new ChunkingConfig({
  maxChunkSize: 2000,
  preserveSentences: true,
  overlapSentences: 1,
  minChunkSize: 100,
});
