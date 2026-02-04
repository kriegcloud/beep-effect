/**
 * MentionExtractor - Entity mention detection service
 *
 * Stage 2 of the extraction pipeline: Detect entity mentions in text chunks.
 *
 * @module knowledge-server/Extraction/MentionExtractor
 * @since 0.1.0
 */
import { $KnowledgeServerId } from "@beep/identity/packages";
import { LanguageModel, Prompt } from "@effect/ai";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import { buildMentionPrompt, buildSystemPrompt } from "../Ai/PromptTemplates";
import type { TextChunk } from "../Nlp/TextChunk";
import { ExtractedMention, MentionOutput } from "./schemas/mention-output.schema";

const $I = $KnowledgeServerId.create("knowledge-server/Extraction/MentionExtractor");

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
  readonly minConfidence?: undefined | number;
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
export class MentionExtractor extends Effect.Service<MentionExtractor>()($I`MentionExtractor`, {
  accessors: true,
  effect: Effect.gen(function* () {
    const model = yield* LanguageModel.LanguageModel;

    return {
      /**
       * Extract mentions from a single text chunk
       *
       * @param chunk - Text chunk to process
       * @param config - Extraction configuration
       * @returns Extraction result with mentions
       */
      extractFromChunk: Effect.fnUntraced(function* (chunk: TextChunk, config: MentionExtractionConfig = {}) {
        const minConfidence = config.minConfidence ?? 0.5;

        yield* Effect.logDebug("Extracting mentions from chunk", {
          chunkIndex: chunk.index,
          textLength: chunk.text.length,
        });

        // Create prompt with system and user messages
        const prompt = Prompt.make([
          { role: "system" as const, content: buildSystemPrompt() },
          { role: "user" as const, content: buildMentionPrompt(chunk.text, chunk.index) },
        ]);

        // Call AI to extract mentions
        const result = yield* model.generateObject({
          prompt,
          schema: MentionOutput,
          objectName: "MentionOutput",
        });

        const tokensUsed = (result.usage.inputTokens ?? 0) + (result.usage.outputTokens ?? 0);

        // Filter by confidence and adjust offsets to document level
        const mentions = A.filterMap(result.value.mentions, (m): O.Option<ExtractedMention> => {
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
          tokensUsed,
        });

        return {
          chunk,
          mentions,
          tokensUsed,
        };
      }),

      /**
       * Extract mentions from multiple chunks
       *
       * @param chunks - Text chunks to process
       * @param config - Extraction configuration
       * @returns Array of extraction results
       */
      extractFromChunks: Effect.fnUntraced(function* (
        chunks: readonly TextChunk[],
        config: MentionExtractionConfig = {}
      ) {
        yield* Effect.logInfo("Extracting mentions from chunks", {
          chunkCount: chunks.length,
        });

        const minConfidence = config.minConfidence ?? 0.5;

        // Process chunks sequentially to respect rate limits
        const results = A.empty<MentionExtractionResult>();
        for (const chunk of chunks) {
          const prompt = Prompt.make([
            { role: "system" as const, content: buildSystemPrompt() },
            { role: "user" as const, content: buildMentionPrompt(chunk.text, chunk.index) },
          ]);

          const genResult = yield* model.generateObject({
            prompt,
            schema: MentionOutput,
            objectName: "MentionOutput",
          });

          const tokensUsed = (genResult.usage.inputTokens ?? 0) + (genResult.usage.outputTokens ?? 0);

          const mentions = A.filterMap(genResult.value.mentions, (m): O.Option<ExtractedMention> => {
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
            tokensUsed,
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
      ): Effect.Effect<readonly ExtractedMention[], never> => {
        return Effect.sync(() => {
          const allMentions: ExtractedMention[] = A.flatMap([...results], (r): ExtractedMention[] => [...r.mentions]);

          // Sort by start position, then by confidence (descending)
          const sorted = A.sort(
            allMentions,
            Order.combine(
              Order.mapInput(Order.number, (m: ExtractedMention) => m.startChar),
              Order.reverse(Order.mapInput(Order.number, (m: ExtractedMention) => m.confidence))
            )
          );

          // Remove overlapping mentions (keep higher confidence)
          const merged = A.empty<ExtractedMention>();
          let lastEndChar = -1;

          for (const mention of sorted) {
            if (mention.startChar >= lastEndChar) {
              merged.push(mention);
              lastEndChar = mention.endChar;
            }
          }

          return merged;
        });
      },
    };
  }),
}) {}
