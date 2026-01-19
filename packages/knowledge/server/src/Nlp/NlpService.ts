/**
 * NlpService - Text processing for knowledge extraction
 *
 * Provides sentence-aware text chunking with configurable overlap.
 * Preserves character offsets for provenance tracking.
 *
 * @module knowledge-server/Nlp/NlpService
 * @since 0.1.0
 */
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { ChunkingConfig, defaultChunkingConfig, TextChunk } from "./TextChunk";

/**
 * Sentence boundary patterns
 * Matches periods, question marks, and exclamation marks followed by space or end-of-string
 */
const SENTENCE_END_PATTERN = /(?<=[.!?])\s+(?=[A-Z])|(?<=[.!?])$/g;

/**
 * Split text into sentences
 *
 * @internal
 */
const splitIntoSentences = (text: string): readonly string[] => {
  // Simple sentence splitting - preserves original text exactly
  const parts: string[] = [];
  let lastEnd = 0;
  const matches = text.matchAll(SENTENCE_END_PATTERN);

  for (const match of matches) {
    if (match.index !== undefined) {
      parts.push(text.slice(lastEnd, match.index));
      lastEnd = match.index;
    }
  }

  // Add remaining text
  if (lastEnd < text.length) {
    parts.push(text.slice(lastEnd));
  }

  return parts.length > 0 ? parts : [text];
};

/**
 * Create text chunks from sentences with overlap
 *
 * @internal
 */
const createChunksFromSentences = (
  sentences: readonly string[],
  config: ChunkingConfig,
  documentOffset: number
): readonly TextChunk[] => {
  const chunks: TextChunk[] = [];
  let currentChunkSentences: string[] = [];
  let currentChunkStart = documentOffset;
  let chunkIndex = 0;
  let currentCharPos = documentOffset;

  const flushChunk = () => {
    if (currentChunkSentences.length === 0) return;

    const text = currentChunkSentences.join("");
    const chunk = new TextChunk({
      index: chunkIndex,
      text,
      startOffset: currentChunkStart,
      endOffset: currentChunkStart + text.length,
    });
    chunks.push(chunk);
    chunkIndex++;

    // Handle overlap: keep last N sentences for next chunk
    if (config.overlapSentences > 0 && currentChunkSentences.length > config.overlapSentences) {
      const overlapSentences = A.takeRight(currentChunkSentences, config.overlapSentences);
      const overlapText = overlapSentences.join("");
      currentChunkStart = currentChunkStart + text.length - overlapText.length;
      currentChunkSentences = [...overlapSentences];
    } else {
      currentChunkStart = currentChunkStart + text.length;
      currentChunkSentences = [];
    }
  };

  for (const sentence of sentences) {
    const currentLength = currentChunkSentences.join("").length;

    // If adding this sentence would exceed max size, flush current chunk
    if (currentLength + sentence.length > config.maxChunkSize && currentChunkSentences.length > 0) {
      flushChunk();
    }

    currentChunkSentences.push(sentence);
    currentCharPos += sentence.length;
  }

  // Flush remaining sentences
  if (currentChunkSentences.length > 0) {
    const text = currentChunkSentences.join("");
    // Check if final chunk is too small and should merge with previous
    if (text.length < (config.minChunkSize ?? 100) && chunks.length > 0) {
      // Merge with previous chunk
      const prevChunk = chunks[chunks.length - 1];
      chunks[chunks.length - 1] = new TextChunk({
        index: prevChunk.index,
        text: prevChunk.text + text,
        startOffset: prevChunk.startOffset,
        endOffset: prevChunk.endOffset + text.length,
      });
    } else {
      flushChunk();
    }
  }

  return chunks;
};

/**
 * Create text chunks without sentence preservation (raw character-based)
 *
 * @internal
 */
const createRawChunks = (text: string, config: ChunkingConfig): readonly TextChunk[] => {
  const chunks: TextChunk[] = [];
  let offset = 0;
  let index = 0;

  while (offset < text.length) {
    const endOffset = Math.min(offset + config.maxChunkSize, text.length);
    const chunkText = text.slice(offset, endOffset);

    chunks.push(
      new TextChunk({
        index,
        text: chunkText,
        startOffset: offset,
        endOffset,
      })
    );

    index++;
    offset = endOffset;
  }

  return chunks;
};

/**
 * Split text into chunks
 *
 * @internal
 */
const splitIntoChunks = (text: string, config: ChunkingConfig): readonly TextChunk[] => {
  if (text.length === 0) {
    return [];
  }

  if (text.length <= config.maxChunkSize) {
    return [
      new TextChunk({
        index: 0,
        text,
        startOffset: 0,
        endOffset: text.length,
      }),
    ];
  }

  if (config.preserveSentences) {
    const sentences = splitIntoSentences(text);
    return createChunksFromSentences(sentences, config, 0);
  }

  return createRawChunks(text, config);
};

/**
 * NlpService - Text processing service
 *
 * Provides sentence-aware chunking with configurable overlap.
 *
 * @example
 * ```ts
 * import { NlpService } from "@beep/knowledge-server/Nlp";
 * import * as Effect from "effect/Effect";
 * import * as Stream from "effect/Stream";
 *
 * const program = Effect.gen(function* () {
 *   const nlp = yield* NlpService;
 *   const chunks = yield* nlp.chunkText(longDocument, {
 *     maxChunkSize: 2000,
 *     preserveSentences: true,
 *     overlapSentences: 1,
 *   }).pipe(Stream.runCollect);
 *
 *   console.log(`Created ${chunks.length} chunks`);
 * });
 * ```
 *
 * @since 0.1.0
 * @category services
 */
export class NlpService extends Effect.Service<NlpService>()("@beep/knowledge-server/NlpService", {
  accessors: true,
  effect: Effect.gen(function* () {
    return {
      /**
       * Chunk text into processable segments
       *
       * Returns a Stream of TextChunks with preserved character offsets.
       * Supports sentence-aware chunking with configurable overlap.
       *
       * @param text - The document text to chunk
       * @param config - Chunking configuration (optional)
       * @returns Stream of TextChunk
       */
      chunkText: (text: string, config: ChunkingConfig = defaultChunkingConfig) =>
        Stream.fromIterable(splitIntoChunks(text, config)),

      /**
       * Chunk text and collect all chunks into an array
       *
       * Convenience method for small documents.
       *
       * @param text - The document text to chunk
       * @param config - Chunking configuration (optional)
       * @returns Effect yielding array of TextChunk
       */
      chunkTextAll: (text: string, config: ChunkingConfig = defaultChunkingConfig) =>
        Effect.sync(() => splitIntoChunks(text, config)),

      /**
       * Split text into sentences
       *
       * @param text - The text to split
       * @returns Array of sentences
       */
      splitSentences: (text: string) => Effect.sync(() => splitIntoSentences(text)),

      /**
       * Count approximate tokens in text
       *
       * Uses rough estimation (4 characters per token).
       * For precise counts, use a tokenizer library.
       *
       * @param text - The text to count
       * @returns Approximate token count
       */
      estimateTokens: (text: string) =>
        Effect.sync(() => {
          // Rough estimation: ~4 characters per token
          return Math.ceil(text.length / 4);
        }),
    };
  }),
}) {}
