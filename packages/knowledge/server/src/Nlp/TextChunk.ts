/**
 * TextChunk schema for NLP text processing
 *
 * Represents a chunk of text with position information for
 * processing through the extraction pipeline.
 *
 * @module knowledge-server/Nlp/TextChunk
 * @since 0.1.0
 */
import * as S from "effect/Schema";

/**
 * TextChunk - A unit of text for extraction processing
 *
 * Preserves character offsets for provenance tracking.
 *
 * @since 0.1.0
 * @category schemas
 */
export class TextChunk extends S.Class<TextChunk>("@beep/knowledge-server/TextChunk")({
  /**
   * Chunk index (0-indexed position in document)
   */
  index: S.Number.pipe(
    S.int(),
    S.nonNegative(),
    S.annotations({
      description: "Chunk index (0-indexed position in document)",
    })
  ),

  /**
   * Text content of this chunk
   */
  text: S.String.annotations({
    description: "Text content of this chunk",
  }),

  /**
   * Character offset where this chunk starts in the original document
   */
  startOffset: S.Number.pipe(
    S.int(),
    S.nonNegative(),
    S.annotations({
      description: "Character offset where chunk starts in document",
    })
  ),

  /**
   * Character offset where this chunk ends (exclusive)
   */
  endOffset: S.Number.pipe(
    S.int(),
    S.nonNegative(),
    S.annotations({
      description: "Character offset where chunk ends (exclusive)",
    })
  ),

  /**
   * Optional metadata about this chunk
   */
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

/**
 * ChunkingConfig - Configuration for text chunking behavior
 *
 * @since 0.1.0
 * @category schemas
 */
export class ChunkingConfig extends S.Class<ChunkingConfig>("@beep/knowledge-server/ChunkingConfig")({
  /**
   * Maximum character count per chunk
   */
  maxChunkSize: S.Number.pipe(
    S.int(),
    S.positive(),
    S.annotations({
      description: "Maximum characters per chunk",
      default: 2000,
    })
  ),

  /**
   * Whether to preserve sentence boundaries
   */
  preserveSentences: S.Boolean.annotations({
    description: "If true, chunks will end at sentence boundaries",
    default: true,
  }),

  /**
   * Number of sentences to overlap between chunks
   */
  overlapSentences: S.Number.pipe(
    S.int(),
    S.nonNegative(),
    S.annotations({
      description: "Number of sentences to overlap between chunks",
      default: 1,
    })
  ),

  /**
   * Minimum chunk size (to avoid tiny final chunks)
   */
  minChunkSize: S.optional(
    S.Number.pipe(
      S.int(),
      S.positive(),
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

/**
 * Default chunking configuration
 *
 * @since 0.1.0
 * @category constants
 */
export const defaultChunkingConfig: ChunkingConfig = new ChunkingConfig({
  maxChunkSize: 2000,
  preserveSentences: true,
  overlapSentences: 1,
  minChunkSize: 100,
});
