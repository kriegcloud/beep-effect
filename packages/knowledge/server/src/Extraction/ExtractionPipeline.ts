/**
 * ExtractionPipeline - Orchestration for knowledge extraction
 *
 * Coordinates all extraction stages into a complete pipeline.
 *
 * @module knowledge-server/Extraction/ExtractionPipeline
 * @since 0.1.0
 */
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Struct from "effect/Struct";
import type { AiGenerationConfig } from "../Ai/AiService";
import { type ChunkingConfig, defaultChunkingConfig, NlpService, type TextChunk } from "../Nlp";
import { OntologyService } from "../Ontology";
import { EntityExtractor } from "./EntityExtractor";
import { GraphAssembler, type KnowledgeGraph } from "./GraphAssembler";
import { MentionExtractor } from "./MentionExtractor";
import { RelationExtractor } from "./RelationExtractor";
import type { ClassifiedEntity } from "./schemas/entity-output.schema";
import type { ExtractedMention } from "./schemas/mention-output.schema";
/**
 * Pipeline configuration
 *
 * @since 0.1.0
 * @category schemas
 */
export interface ExtractionPipelineConfig {
  /**
   * Organization ID
   */
  readonly organizationId: string;

  /**
   * Ontology ID for type resolution
   */
  readonly ontologyId: string;

  /**
   * Document ID for provenance
   */
  readonly documentId: string;

  /**
   * Source URI for provenance
   */
  readonly sourceUri?: undefined | string;

  /**
   * Chunking configuration
   */
  readonly chunkingConfig?: undefined | ChunkingConfig;

  /**
   * AI generation configuration
   */
  readonly aiConfig?: AiGenerationConfig;

  /**
   * Minimum confidence for mentions
   */
  readonly mentionMinConfidence?: number;

  /**
   * Minimum confidence for entities
   */
  readonly entityMinConfidence?: number;

  /**
   * Minimum confidence for relations
   */
  readonly relationMinConfidence?: number;

  /**
   * Batch size for entity classification
   */
  readonly entityBatchSize?: number;

  /**
   * Whether to merge entities with same canonical name
   */
  readonly mergeEntities?: boolean;
}

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
 *     organizationId: "org-123",
 *     ontologyId: "my-ontology",
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
        run: Effect.fnUntraced(function* (text: string, ontologyContent: string, config: ExtractionPipelineConfig) {
          const startTime = Date.now();
          let totalTokens = 0;

          yield* Effect.logInfo("Starting extraction pipeline", {
            documentId: config.documentId,
            textLength: text.length,
          });

          // Stage 1: Load ontology
          yield* Effect.logDebug("Loading ontology");
          const ontologyContext = yield* ontologyService.load(config.ontologyId, ontologyContent);

          // Stage 2: Chunk text
          yield* Effect.logDebug("Chunking text");
          const chunks = yield* nlp.chunkTextAll(text, config.chunkingConfig ?? defaultChunkingConfig);

          yield* Effect.logInfo("Text chunked", { chunkCount: chunks.length });

          // Stage 3: Extract mentions from each chunk
          yield* Effect.logDebug("Extracting mentions");
          const mentionResults = yield* mentionExtractor.extractFromChunks(
            [...chunks],
            filterUndefined({
              minConfidence: config.mentionMinConfidence,
              aiConfig: config.aiConfig,
            })
          );

          const allMentions = yield* mentionExtractor.mergeMentions(mentionResults);
          totalTokens += A.reduce([...mentionResults], 0, (acc, r) => acc + r.tokensUsed);

          yield* Effect.logInfo("Mentions extracted", {
            totalMentions: allMentions.length,
          });

          // Stage 4: Classify entities
          yield* Effect.logDebug("Classifying entities");
          const entityResult = yield* entityExtractor.classify(
            allMentions,
            ontologyContext,
            filterUndefined({
              minConfidence: config.entityMinConfidence,
              batchSize: config.entityBatchSize,
              aiConfig: config.aiConfig,
            })
          );

          totalTokens += entityResult.tokensUsed;

          yield* Effect.logInfo("Entities classified", {
            validEntities: entityResult.entities.length,
            invalidTypes: entityResult.invalidTypes.length,
          });

          // Stage 5: Extract relations
          // Group entities by chunk for relation extraction
          yield* Effect.logDebug("Extracting relations");

          // Map mentions back to chunks for context
          const entitiesByChunk = mapEntitiesToChunks([...entityResult.entities], [...allMentions], [...chunks]);

          const relationResult = yield* relationExtractor.extractFromChunks(
            entitiesByChunk,
            [...chunks],
            ontologyContext,
            filterUndefined({
              minConfidence: config.relationMinConfidence,
              validatePredicates: true,
              aiConfig: config.aiConfig,
            })
          );

          totalTokens += relationResult.tokensUsed;

          const dedupedRelations = yield* relationExtractor.deduplicateRelations(relationResult.triples);

          yield* Effect.logInfo("Relations extracted", {
            totalRelations: dedupedRelations.length,
          });

          // Stage 6: Assemble graph
          yield* Effect.logDebug("Assembling knowledge graph");
          const graph = yield* graphAssembler.assemble([...entityResult.entities], [...dedupedRelations], {
            organizationId: config.organizationId,
            ontologyId: config.ontologyId,
            mergeEntities: config.mergeEntities ?? true,
          });

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
      };
    }),
  }
) {}

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

/**
 * Filter out undefined values from an object
 *
 * Handles exactOptionalPropertyTypes by removing keys with undefined values.
 *
 * @internal
 */
const filterUndefined = <T extends Record<string, unknown>>(obj: T): Partial<T> => {
  const result: Partial<T> = {};
  for (const key of Struct.keys(obj)) {
    const value = obj[key];
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
};
