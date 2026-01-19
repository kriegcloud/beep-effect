/**
 * MentionExtractor - Entity mention detection service
 *
 * Stage 2 of the extraction pipeline: Detect entity mentions in text chunks.
 *
 * @module knowledge-server/Extraction/MentionExtractor
 * @since 0.1.0
 */
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import { AiService, AiExtractionError, type AiGenerationConfig } from "../Ai/AiService";
import { buildMentionPrompt, buildSystemPrompt } from "../Ai/PromptTemplates";
import type { TextChunk } from "../Nlp/TextChunk";
import { ExtractedMention, MentionOutput } from "./schemas/MentionOutput";

/**
 * Configuration for mention extraction
 *
 * @since 0.1.0
 * @category schemas
 */
export interface MentionExtractionConfig {
  /**
   * Minimum confidence threshold for mentions
   */
  readonly minConfidence?: number;

  /**
   * AI generation configuration
   */
  readonly aiConfig?: AiGenerationConfig;
}

/**
 * Result of mention extraction from a chunk
 *
 * @since 0.1.0
 * @category schemas
 */
export interface MentionExtractionResult {
  /**
   * Original chunk that was processed
   */
  readonly chunk: TextChunk;

  /**
   * Extracted mentions with document-level offsets
   */
  readonly mentions: readonly ExtractedMention[];

  /**
   * Token usage for this extraction
   */
  readonly tokensUsed: number;
}

/**
 * MentionExtractor Service
 *
 * Detects entity mentions in text chunks using LLM.
 *
 * @example
 * ```ts
 * import { MentionExtractor } from "@beep/knowledge-server/Extraction";
 * import * as Effect from "effect/Effect";
 *
 * const program = Effect.gen(function* () {
 *   const extractor = yield* MentionExtractor;
 *   const result = yield* extractor.extractFromChunk(textChunk);
 *   console.log(`Found ${result.mentions.length} mentions`);
 * });
 * ```
 *
 * @since 0.1.0
 * @category services
 */
export class MentionExtractor extends Effect.Service<MentionExtractor>()(
  "@beep/knowledge-server/MentionExtractor",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      const ai = yield* AiService;

      return {
        /**
         * Extract mentions from a single text chunk
         *
         * @param chunk - Text chunk to process
         * @param config - Extraction configuration
         * @returns Extraction result with mentions
         */
        extractFromChunk: (
          chunk: TextChunk,
          config: MentionExtractionConfig = {}
        ): Effect.Effect<MentionExtractionResult, AiExtractionError> =>
          Effect.gen(function* () {
            const minConfidence = config.minConfidence ?? 0.5;

            yield* Effect.logDebug("Extracting mentions from chunk", {
              chunkIndex: chunk.index,
              textLength: chunk.text.length,
            });

            // Call AI to extract mentions
            const result = yield* ai.generateObjectWithSystem(
              MentionOutput,
              buildSystemPrompt(),
              buildMentionPrompt(chunk.text, chunk.index),
              config.aiConfig
            );

            // Filter by confidence and adjust offsets to document level
            const mentions = A.filterMap(result.data.mentions, (m): O.Option<ExtractedMention> => {
              if (m.confidence < minConfidence) {
                return O.none();
              }

              // Adjust character offsets to document level
              const adjusted = new ExtractedMention({
                text: m.text,
                startChar: m.startChar + chunk.startOffset,
                endChar: m.endChar + chunk.startOffset,
                confidence: m.confidence,
                suggestedType: m.suggestedType,
                context: m.context,
              });

              return O.some(adjusted);
            });

            yield* Effect.logDebug("Mention extraction complete", {
              chunkIndex: chunk.index,
              mentionsFound: mentions.length,
              tokensUsed: result.usage.totalTokens,
            });

            return {
              chunk,
              mentions,
              tokensUsed: result.usage.totalTokens,
            };
          }),

        /**
         * Extract mentions from multiple chunks
         *
         * @param chunks - Text chunks to process
         * @param config - Extraction configuration
         * @returns Array of extraction results
         */
        extractFromChunks: (
          chunks: readonly TextChunk[],
          config: MentionExtractionConfig = {}
        ): Effect.Effect<readonly MentionExtractionResult[], AiExtractionError> =>
          Effect.gen(function* () {
            yield* Effect.logInfo("Extracting mentions from chunks", {
              chunkCount: chunks.length,
            });

            const minConfidence = config.minConfidence ?? 0.5;

            // Process chunks sequentially to respect rate limits
            const results: MentionExtractionResult[] = [];
            for (const chunk of chunks) {
              const genResult = yield* ai.generateObjectWithSystem(
                MentionOutput,
                buildSystemPrompt(),
                buildMentionPrompt(chunk.text, chunk.index),
                config.aiConfig
              );

              const mentions = A.filterMap(genResult.data.mentions, (m): O.Option<ExtractedMention> => {
                if (m.confidence < minConfidence) {
                  return O.none();
                }

                const adjusted = new ExtractedMention({
                  text: m.text,
                  startChar: m.startChar + chunk.startOffset,
                  endChar: m.endChar + chunk.startOffset,
                  confidence: m.confidence,
                  suggestedType: m.suggestedType,
                  context: m.context,
                });

                return O.some(adjusted);
              });

              results.push({
                chunk,
                mentions,
                tokensUsed: genResult.usage.totalTokens,
              });
            }

            const totalMentions = A.reduce(results, 0, (acc, r) => acc + r.mentions.length);
            const totalTokens = A.reduce(results, 0, (acc, r) => acc + r.tokensUsed);

            yield* Effect.logInfo("Mention extraction complete", {
              chunkCount: chunks.length,
              totalMentions,
              totalTokens,
            });

            return results;
          }),

        /**
         * Merge mentions from multiple chunk results
         *
         * Deduplicates overlapping mentions, preferring higher confidence.
         *
         * @param results - Results from multiple chunks
         * @returns Deduplicated mentions
         */
        mergeMentions: (
          results: readonly MentionExtractionResult[]
        ): Effect.Effect<readonly ExtractedMention[]> =>
          Effect.sync(() => {
            const allMentions: ExtractedMention[] = A.flatMap(
              [...results],
              (r): ExtractedMention[] => [...r.mentions]
            );

            // Sort by start position, then by confidence (descending)
            const sorted = [...allMentions].sort((a, b) => {
              if (a.startChar !== b.startChar) {
                return a.startChar - b.startChar;
              }
              return b.confidence - a.confidence;
            });

            // Remove overlapping mentions (keep higher confidence)
            const merged: ExtractedMention[] = [];
            let lastEndChar = -1;

            for (const mention of sorted) {
              if (mention.startChar >= lastEndChar) {
                merged.push(mention);
                lastEndChar = mention.endChar;
              }
            }

            return merged;
          }),
      };
    }),
  }
) {}
