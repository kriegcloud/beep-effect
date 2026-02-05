import * as S from "effect/Schema";

export class TextChunk extends S.Class<TextChunk>("@beep/knowledge-server/TextChunk")({
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
}) {}

export declare namespace TextChunk {
  export type Type = typeof TextChunk.Type;
  export type Encoded = typeof TextChunk.Encoded;
}

export class ChunkingConfig extends S.Class<ChunkingConfig>("@beep/knowledge-server/ChunkingConfig")({
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
}) {}

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
