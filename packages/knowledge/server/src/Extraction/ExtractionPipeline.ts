/**
 * ExtractionPipeline - Orchestration for knowledge extraction
 *
 * Coordinates all extraction stages into a streaming pipeline.
 *
 * @module knowledge-server/Extraction/ExtractionPipeline
 * @since 0.1.0
 */
import { Errors } from "@beep/knowledge-domain";
const { LlmExtractionError } = Errors;
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import * as S from "effect/Schema";
import { AiService, type AiGenerationConfig } from "../Ai/AiService";
import { NlpService, type ChunkingConfig, defaultChunkingConfig, type TextChunk } from "../Nlp";
import { OntologyService, type OntologyContext } from "../Ontology";
import { EntityExtractor } from "./EntityExtractor";
import { GraphAssembler, type KnowledgeGraph } from "./GraphAssembler";
import { MentionExtractor, type MentionExtractionResult } from "./MentionExtractor";
import { RelationExtractor } from "./RelationExtractor";
import type { ClassifiedEntity } from "./schemas/EntityOutput";
import type { ExtractedMention } from "./schemas/MentionOutput";
import type { ExtractedTriple } from "./schemas/RelationOutput";

/**
 * Pipeline configuration
 *
 * @since 0.1.0
 * @category schemas
 */
export class ExtractionPipelineConfig extends S.Class<ExtractionPipelineConfig>(
  "@beep/knowledge-server/ExtractionPipelineConfig"
)({
  /**
   * Organization ID
   */
  organizationId: SharedEntityIds.OrganizationId,

  /**
   * Ontology ID for type resolution
   */
  ontologyId: KnowledgeEntityIds.OntologyId,

  /**
   * Document ID for provenance
   */
  documentId: S.String,

  /**
   * Source URI for provenance
   */
  sourceUri: S.optional(S.String),

  /**
   * Chunking configuration
   */
  chunkingConfig: S.optional(ChunkingConfig),

  /**
   * AI generation configuration
   */
  aiConfig: S.optional(AiGenerationConfig),

  /**
   * Minimum confidence for mentions
   */
  mentionMinConfidence: S.optional(S.Number),

  /**
   * Minimum confidence for entities
   */
  entityMinConfidence: S.optional(S.Number),

  /**
   * Minimum confidence for relations
   */
  relationMinConfidence: S.optional(S.Number),

  /**
   * Batch size for entity classification
   */
  entityBatchSize: S.optional(S.Number),

  /**
   * Whether to merge entities with same canonical name
   */
  mergeEntities: S.optional(S.Boolean),
}) {}

export declare namespace ExtractionPipelineConfig {
  export type Type = typeof ExtractionPipelineConfig.Type;
  export type Encoded = typeof ExtractionPipelineConfig.Encoded;
}

/**
 * Pipeline progress event
 *
 * @since 0.1.0
 * @category schemas
 */
export type PipelineEvent =
  | { readonly _tag: "ChunkingStarted"; readonly totalLength: number }
  | { readonly _tag: "ChunkCreated"; readonly chunk: TextChunk }
  | { readonly _tag: "ChunkingComplete"; readonly chunkCount: number }
  | { readonly _tag: "MentionExtractionStarted"; readonly chunkIndex: number }
  | { readonly _tag: "MentionsExtracted"; readonly chunkIndex: number; readonly count: number }
  | { readonly _tag: "MentionExtractionComplete"; readonly totalMentions: number }
  | { readonly _tag: "EntityClassificationStarted"; readonly mentionCount: number }
  | { readonly _tag: "EntitiesClassified"; readonly count: number; readonly invalid: number }
  | { readonly _tag: "RelationExtractionStarted"; readonly entityCount: number }
  | { readonly _tag: "RelationsExtracted"; readonly count: number }
  | { readonly _tag: "GraphAssemblyStarted" }
  | { readonly _tag: "GraphAssembled"; readonly entityCount: number; readonly relationCount: number }
  | { readonly _tag: "PipelineComplete"; readonly tokensUsed: number };

/**
 * Final extraction result
 *
 * @since 0.1.0
 * @category schemas
 */
export interface ExtractionResult {
  /**
   * Assembled knowledge graph
   */
  readonly graph: KnowledgeGraph;

  /**
   * Processing statistics
   */
  readonly stats: {
    readonly chunkCount: number;
    readonly mentionCount: number;
    readonly entityCount: number;
    readonly relationCount: number;
    readonly tokensUsed: number;
    readonly durationMs: number;
  };

  /**
   * Extraction configuration used
   */
  readonly config: ExtractionPipelineConfig;
}

/**
 * ExtractionPipeline Service
 *
 * Orchestrates the full extraction pipeline from text to knowledge graph.
 *
 * @example
 * ```ts
 * import { ExtractionPipeline } from "@beep/knowledge-server/Extraction";
 * import * as Effect from "effect/Effect";
 *
 * const program = Effect.gen(function* () {
 *   const pipeline = yield* ExtractionPipeline;
 *
 *   const result = yield* pipeline.run(documentText, ontologyContent, {
 *     organizationId,
 *     ontologyId,
 *     documentId: "doc-123",
 *   });
 *
 *   console.log(`Extracted ${result.graph.stats.entityCount} entities`);
 *   console.log(`Total tokens: ${result.stats.tokensUsed}`);
 * });
 * ```
 *
 * @since 0.1.0
 * @category services
 */
export class ExtractionPipeline extends Effect.Service<ExtractionPipeline>()(
  "@beep/knowledge-server/ExtractionPipeline",
  {
    accessors: true,
    dependencies: [
      NlpService.Default,
      MentionExtractor.Default,
      EntityExtractor.Default,
      RelationExtractor.Default,
      GraphAssembler.Default,
      OntologyService.Default,
    ],
    effect: Effect.gen(function* () {
      const nlp = yield* NlpService;
      const mentionExtractor = yield* MentionExtractor;
      const entityExtractor = yield* EntityExtractor;
      const relationExtractor = yield* RelationExtractor;
      const graphAssembler = yield* GraphAssembler;
      const ontologyService = yield* OntologyService;

      return {
        /**
         * Run the full extraction pipeline
         *
         * @param text - Document text to extract from
         * @param ontologyContent - Turtle content of the ontology
         * @param config - Pipeline configuration
         * @returns Extraction result
         */
        run: (
          text: string,
          ontologyContent: string,
          config: ExtractionPipelineConfig
        ): Effect.Effect<ExtractionResult, LlmExtractionError> =>
          Effect.gen(function* () {
            const startTime = Date.now();
            let totalTokens = 0;

            yield* Effect.logInfo("Starting extraction pipeline", {
              documentId: config.documentId,
              textLength: text.length,
            });

            // Stage 1: Load ontology
            yield* Effect.logDebug("Loading ontology");
            const ontologyContext = yield* ontologyService.load(
              config.ontologyId,
              ontologyContent
            );

            // Stage 2: Chunk text
            yield* Effect.logDebug("Chunking text");
            const chunks = yield* nlp.chunkTextAll(
              text,
              config.chunkingConfig ?? defaultChunkingConfig
            );

            yield* Effect.logInfo("Text chunked", { chunkCount: chunks.length });

            // Stage 3: Extract mentions from each chunk
            yield* Effect.logDebug("Extracting mentions");
            const mentionResults = yield* mentionExtractor.extractFromChunks(chunks, {
              minConfidence: config.mentionMinConfidence,
              aiConfig: config.aiConfig,
            });

            const allMentions = yield* mentionExtractor.mergeMentions(mentionResults);
            totalTokens += A.reduce(mentionResults, 0, (acc, r) => acc + r.tokensUsed);

            yield* Effect.logInfo("Mentions extracted", {
              totalMentions: allMentions.length,
            });

            // Stage 4: Classify entities
            yield* Effect.logDebug("Classifying entities");
            const entityResult = yield* entityExtractor.classify(allMentions, ontologyContext, {
              minConfidence: config.entityMinConfidence,
              batchSize: config.entityBatchSize,
              aiConfig: config.aiConfig,
            });

            totalTokens += entityResult.tokensUsed;

            yield* Effect.logInfo("Entities classified", {
              validEntities: entityResult.entities.length,
              invalidTypes: entityResult.invalidTypes.length,
            });

            // Stage 5: Extract relations
            // Group entities by chunk for relation extraction
            yield* Effect.logDebug("Extracting relations");

            // Map mentions back to chunks for context
            const mentionsByChunk = groupMentionsByChunk(mentionResults);
            const entitiesByChunk = mapEntitiesToChunks(
              entityResult.entities,
              allMentions,
              chunks
            );

            const relationResult = yield* relationExtractor.extractFromChunks(
              entitiesByChunk,
              chunks,
              ontologyContext,
              {
                minConfidence: config.relationMinConfidence,
                validatePredicates: true,
                aiConfig: config.aiConfig,
              }
            );

            totalTokens += relationResult.tokensUsed;

            const dedupedRelations = yield* relationExtractor.deduplicateRelations(
              relationResult.triples
            );

            yield* Effect.logInfo("Relations extracted", {
              totalRelations: dedupedRelations.length,
            });

            // Stage 6: Assemble graph
            yield* Effect.logDebug("Assembling knowledge graph");
            const graph = yield* graphAssembler.assemble(
              entityResult.entities,
              dedupedRelations,
              {
                organizationId: config.organizationId,
                ontologyId: config.ontologyId,
                mergeEntities: config.mergeEntities ?? true,
              }
            );

            const durationMs = Date.now() - startTime;

            yield* Effect.logInfo("Extraction pipeline complete", {
              entityCount: graph.stats.entityCount,
              relationCount: graph.stats.relationCount,
              tokensUsed: totalTokens,
              durationMs,
            });

            return {
              graph,
              stats: {
                chunkCount: chunks.length,
                mentionCount: allMentions.length,
                entityCount: graph.stats.entityCount,
                relationCount: graph.stats.relationCount,
                tokensUsed: totalTokens,
                durationMs,
              },
              config,
            };
          }),

        /**
         * Run pipeline as a stream emitting progress events
         *
         * @param text - Document text
         * @param ontologyContent - Ontology content
         * @param config - Pipeline configuration
         * @returns Stream of pipeline events, ending with the result
         */
        runWithProgress: (
          text: string,
          ontologyContent: string,
          config: ExtractionPipelineConfig
        ): Stream.Stream<PipelineEvent | { readonly _tag: "Result"; readonly result: ExtractionResult }, LlmExtractionError> =>
          Stream.gen(function* (emit) {
            const startTime = Date.now();
            let totalTokens = 0;

            // Load ontology
            const ontologyContext = yield* ontologyService.load(
              config.ontologyId,
              ontologyContent
            );

            // Chunking
            yield* emit.succeed({ _tag: "ChunkingStarted", totalLength: text.length } as const);

            const chunks = yield* nlp.chunkTextAll(
              text,
              config.chunkingConfig ?? defaultChunkingConfig
            );

            for (const chunk of chunks) {
              yield* emit.succeed({ _tag: "ChunkCreated", chunk } as const);
            }

            yield* emit.succeed({ _tag: "ChunkingComplete", chunkCount: chunks.length } as const);

            // Mention extraction
            const mentionResults: MentionExtractionResult[] = [];
            for (const chunk of chunks) {
              yield* emit.succeed({ _tag: "MentionExtractionStarted", chunkIndex: chunk.index } as const);

              const result = yield* mentionExtractor.extractFromChunk(chunk, {
                minConfidence: config.mentionMinConfidence,
                aiConfig: config.aiConfig,
              });

              mentionResults.push(result);
              totalTokens += result.tokensUsed;

              yield* emit.succeed({
                _tag: "MentionsExtracted",
                chunkIndex: chunk.index,
                count: result.mentions.length,
              } as const);
            }

            const allMentions = yield* mentionExtractor.mergeMentions(mentionResults);
            yield* emit.succeed({
              _tag: "MentionExtractionComplete",
              totalMentions: allMentions.length,
            } as const);

            // Entity classification
            yield* emit.succeed({
              _tag: "EntityClassificationStarted",
              mentionCount: allMentions.length,
            } as const);

            const entityResult = yield* entityExtractor.classify(allMentions, ontologyContext, {
              minConfidence: config.entityMinConfidence,
              batchSize: config.entityBatchSize,
              aiConfig: config.aiConfig,
            });

            totalTokens += entityResult.tokensUsed;

            yield* emit.succeed({
              _tag: "EntitiesClassified",
              count: entityResult.entities.length,
              invalid: entityResult.invalidTypes.length,
            } as const);

            // Relation extraction
            yield* emit.succeed({
              _tag: "RelationExtractionStarted",
              entityCount: entityResult.entities.length,
            } as const);

            const entitiesByChunk = mapEntitiesToChunks(
              entityResult.entities,
              allMentions,
              chunks
            );

            const relationResult = yield* relationExtractor.extractFromChunks(
              entitiesByChunk,
              chunks,
              ontologyContext,
              {
                minConfidence: config.relationMinConfidence,
                validatePredicates: true,
                aiConfig: config.aiConfig,
              }
            );

            totalTokens += relationResult.tokensUsed;

            const dedupedRelations = yield* relationExtractor.deduplicateRelations(
              relationResult.triples
            );

            yield* emit.succeed({
              _tag: "RelationsExtracted",
              count: dedupedRelations.length,
            } as const);

            // Graph assembly
            yield* emit.succeed({ _tag: "GraphAssemblyStarted" } as const);

            const graph = yield* graphAssembler.assemble(
              entityResult.entities,
              dedupedRelations,
              {
                organizationId: config.organizationId,
                ontologyId: config.ontologyId,
                mergeEntities: config.mergeEntities ?? true,
              }
            );

            yield* emit.succeed({
              _tag: "GraphAssembled",
              entityCount: graph.stats.entityCount,
              relationCount: graph.stats.relationCount,
            } as const);

            yield* emit.succeed({ _tag: "PipelineComplete", tokensUsed: totalTokens } as const);

            const durationMs = Date.now() - startTime;

            yield* emit.succeed({
              _tag: "Result",
              result: {
                graph,
                stats: {
                  chunkCount: chunks.length,
                  mentionCount: allMentions.length,
                  entityCount: graph.stats.entityCount,
                  relationCount: graph.stats.relationCount,
                  tokensUsed: totalTokens,
                  durationMs,
                },
                config,
              },
            } as const);
          }),
      };
    }),
  }
) {}

/**
 * Group mentions by their source chunk
 *
 * @internal
 */
const groupMentionsByChunk = (
  results: readonly MentionExtractionResult[]
): ReadonlyMap<number, readonly ExtractedMention[]> => {
  const map = new Map<number, ExtractedMention[]>();

  for (const result of results) {
    map.set(result.chunk.index, [...result.mentions]);
  }

  return map;
};

/**
 * Map classified entities back to their source chunks
 *
 * @internal
 */
const mapEntitiesToChunks = (
  entities: readonly ClassifiedEntity[],
  mentions: readonly ExtractedMention[],
  chunks: readonly TextChunk[]
): ReadonlyMap<number, readonly ClassifiedEntity[]> => {
  // Build mention text -> entity mapping
  const entityByMention = new Map<string, ClassifiedEntity>();
  for (const entity of entities) {
    entityByMention.set(entity.mention.toLowerCase(), entity);
  }

  // Group by chunk
  const result = new Map<number, ClassifiedEntity[]>();

  for (const chunk of chunks) {
    result.set(chunk.index, []);
  }

  for (const mention of mentions) {
    const entity = entityByMention.get(mention.text.toLowerCase());
    if (!entity) continue;

    // Find which chunk this mention belongs to
    for (const chunk of chunks) {
      if (mention.startChar >= chunk.startOffset && mention.endChar <= chunk.endOffset) {
        const existing = result.get(chunk.index) ?? [];
        if (!existing.some((e) => e.mention.toLowerCase() === entity.mention.toLowerCase())) {
          existing.push(entity);
          result.set(chunk.index, existing);
        }
        break;
      }
    }
  }

  return result;
};
