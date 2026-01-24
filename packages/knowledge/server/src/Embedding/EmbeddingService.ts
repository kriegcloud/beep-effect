/**
 * EmbeddingService - Embedding generation with caching
 *
 * Provides cached embedding generation using @effect/ai EmbeddingModel
 * and pgvector-backed storage via EmbeddingRepo.
 *
 * @module knowledge-server/Embedding/EmbeddingService
 * @since 0.1.0
 */

import type { Entities } from "@beep/knowledge-domain";
import { EmbeddingRepo } from "@beep/knowledge-server/db";
import { KnowledgeEntityIds, type SharedEntityIds } from "@beep/shared-domain";
import { thunkEmptyStr, thunkFalse, thunkTrue } from "@beep/utils";
import type * as AiError from "@effect/ai/AiError";
import * as EmbeddingModel from "@effect/ai/EmbeddingModel";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as Layer from "effect/Layer";
import * as Match from "effect/Match";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
import * as Str from "effect/String";
import type { AssembledEntity } from "../Extraction/GraphAssembler";
import { formatEntityForEmbedding } from "../utils/formatting";
import { EmbeddingError, type TaskType } from "./EmbeddingProvider";

// Type alias for proper TypeScript type access
type EmbeddingModelEntity = (typeof Entities.Embedding.Model)["Type"];

// =============================================================================
// Constants
// =============================================================================

/**
 * Default embedding model name for caching purposes
 *
 * Used as a cache key component since EmbeddingModel.Service doesn't expose model config.
 */
const DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small";

// =============================================================================
// Error Mapping
// =============================================================================

/**
 * Map @effect/ai AiError to knowledge domain EmbeddingError
 *
 * Preserves error semantics while adapting to the knowledge domain's error contract.
 * HTTP errors are considered retryable; validation/parsing errors are not.
 */
const mapAiError = (error: AiError.AiError): EmbeddingError =>
  new EmbeddingError({
    message: error.message,
    provider: "openai",
    retryable: Match.value(error._tag).pipe(
      Match.when("HttpRequestError", thunkTrue),
      Match.when("HttpResponseError", thunkTrue),
      Match.orElse(thunkFalse)
    ),
    cause: Either.try(() => JSON.stringify({ _tag: error._tag })).pipe(Either.getOrElse(thunkEmptyStr)),
  });

// =============================================================================
// Cache Key Utilities
// =============================================================================

/**
 * Generate a deterministic cache key for an embedding
 *
 * Uses a simple hash of the text to create a reproducible key.
 */
const computeCacheKey = (text: string, model: string): string => {
  // Simple hash function (djb2)
  let hash = 5381;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) + hash + text.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Convert to hex and combine with model
  const hashHex = Math.abs(hash).toString(16).padStart(8, "0");
  return `${model}:${hashHex}`;
};

// =============================================================================
// Service Implementation
// =============================================================================

/**
 * EmbeddingService - Cached embedding generation
 *
 * Provides embedding generation with automatic caching via pgvector.
 * Uses the configured EmbeddingProvider for actual embedding generation.
 *
 * @example
 * ```ts
 * import { EmbeddingService } from "@beep/knowledge-server/Embedding";
 * import * as Effect from "effect/Effect";
 *
 * const program = Effect.gen(function* () {
 *   const service = yield* EmbeddingService;
 *
 *   // Single embedding with caching
 *   const vector = yield* service.embed(
 *     "Machine learning is a subset of AI",
 *     "search_document",
 *     organizationId,
 *     ontologyId
 *   );
 *
 *   // Find similar content
 *   const similar = yield* service.findSimilar(vector, organizationId);
 * });
 * ```
 *
 * @since 0.1.0
 * @category services
 */
export class EmbeddingService extends Effect.Service<EmbeddingService>()("@beep/knowledge-server/EmbeddingService", {
  accessors: true,
  effect: Effect.gen(function* () {
    const embeddingModel = yield* EmbeddingModel.EmbeddingModel;
    const repo = yield* EmbeddingRepo;

    /**
     * Generate embedding for a single text with caching
     *
     * Checks cache first, generates if not found, stores in cache.
     * Note: taskType parameter is kept for backward compatibility but is not used
     * by @effect/ai's EmbeddingModel interface.
     *
     * @param text - Text to embed
     * @param _taskType - Embedding task type (kept for backward compatibility, ignored)
     * @param organizationId - Organization ID for scoping
     * @param ontologyId - Ontology ID for scoping
     * @returns Embedding vector
     */
    const embed = (
      text: string,
      _taskType: TaskType,
      organizationId: SharedEntityIds.OrganizationId.Type,
      ontologyId?: undefined | KnowledgeEntityIds.OntologyId.Type
    ) =>
      Effect.gen(function* () {
        const cacheKey = computeCacheKey(text, DEFAULT_EMBEDDING_MODEL);

        // Check cache
        const cached: O.Option<EmbeddingModelEntity> = yield* repo
          .findByCacheKey(cacheKey, organizationId)
          .pipe(Effect.catchAll(() => Effect.succeed(O.none<EmbeddingModelEntity>())));

        if (O.isSome(cached)) {
          yield* Effect.logDebug("EmbeddingService.embed: cache hit", { cacheKey });
          return cached.value.embedding;
        }

        yield* Effect.logDebug("EmbeddingService.embed: cache miss, generating", {
          cacheKey,
          textLength: text.length,
        });

        // Generate embedding using @effect/ai EmbeddingModel
        const vector = yield* embeddingModel.embed(text).pipe(Effect.mapError(mapAiError));

        // Note: Caching disabled - the entityId must now be a proper entity ID
        // (ClassDefinitionId | KnowledgeEntityId | RelationId), not a cache key hash.
        // TODO: Implement separate caching mechanism or use in-memory cache.
        yield* Effect.logDebug("EmbeddingService: embedding generated (caching disabled)", {
          cacheKey,
          vectorLength: vector.length,
        });

        return vector;
      }).pipe(
        Effect.withSpan("EmbeddingService.embed", {
          captureStackTrace: false,
          attributes: { organizationId, ontologyId },
        })
      );

    /**
     * Generate embeddings for multiple entities from an extraction
     *
     * Batches embeddings for efficiency and stores all in cache.
     *
     * @param entities - Assembled entities from extraction
     * @param organizationId - Organization ID for scoping
     * @param ontologyId - Ontology ID for scoping
     * @returns Effect that completes when all embeddings are stored
     */
    const embedEntities = (
      entities: ReadonlyArray<AssembledEntity>,
      organizationId: SharedEntityIds.OrganizationId.Type,
      ontologyId?: undefined | KnowledgeEntityIds.OntologyId.Type
    ) =>
      Effect.gen(function* () {
        if (A.isEmptyReadonlyArray(entities)) {
          yield* Effect.logDebug("EmbeddingService.embedEntities: no entities to embed");
          return;
        }

        yield* Effect.logInfo("EmbeddingService.embedEntities: starting", {
          count: entities.length,
        });

        // Prepare texts for batch embedding
        const texts = A.map(entities, formatEntityForEmbedding);

        // Check which are already cached
        const uncachedIndices = A.empty<number>();
        const cachedVectors = MutableHashMap.empty<number, ReadonlyArray<number>>();

        for (let i = 0; i < texts.length; i++) {
          const textOpt = A.get(texts, i);
          if (O.isNone(textOpt)) continue;
          const text = textOpt.value;
          const cacheKey = computeCacheKey(text, DEFAULT_EMBEDDING_MODEL);
          const cached: O.Option<EmbeddingModelEntity> = yield* repo
            .findByCacheKey(cacheKey, organizationId)
            .pipe(Effect.catchAll(() => Effect.succeed(O.none<EmbeddingModelEntity>())));

          if (O.isSome(cached)) {
            MutableHashMap.set(cachedVectors, i, cached.value.embedding);
          } else {
            uncachedIndices.push(i);
          }
        }

        yield* Effect.logDebug("EmbeddingService.embedEntities: cache check complete", {
          cached: MutableHashMap.size(cachedVectors),
          uncached: uncachedIndices.length,
        });

        if (A.isEmptyReadonlyArray(uncachedIndices)) {
          yield* Effect.logInfo("EmbeddingService.embedEntities: all cached");
          return;
        }

        // Batch generate uncached embeddings using @effect/ai EmbeddingModel
        const uncachedTexts = A.filterMap(uncachedIndices, (i) => A.get(texts, i));
        const vectors = yield* embeddingModel.embedMany(uncachedTexts).pipe(Effect.mapError(mapAiError));

        // Store new embeddings
        for (let j = 0; j < uncachedIndices.length; j++) {
          const combined = O.all({
            entityIndex: A.get(uncachedIndices, j),
            vector: A.get(vectors, j),
          });

          if (O.isNone(combined)) continue;
          const { entityIndex, vector } = combined.value;

          const entityAndText = O.all({
            entity: A.get(entities, entityIndex),
            text: A.get(texts, entityIndex),
          });

          if (O.isNone(entityAndText)) continue;
          const { entity, text } = entityAndText.value;

          yield* repo
            .insertVoid({
              id: KnowledgeEntityIds.EmbeddingId.create(),
              organizationId,
              ontologyId: O.fromNullable(ontologyId),
              entityType: "entity",
              entityId: entity.id, // Use entity ID for later lookup
              embedding: vector,
              contentText: O.some(Str.slice(0, 1000)(text)),
              model: DEFAULT_EMBEDDING_MODEL,
              // Audit fields
              source: O.some("embedding-service"),
              deletedAt: O.none(),
              createdBy: O.none(),
              updatedBy: O.none(),
              deletedBy: O.none(),
            })
            .pipe(
              Effect.catchAll((error) =>
                Effect.logWarning("EmbeddingService: failed to store entity embedding", {
                  error: String(error),
                  entityId: entity.id,
                })
              )
            );
        }

        yield* Effect.logInfo("EmbeddingService.embedEntities: complete", {
          total: entities.length,
          generated: uncachedIndices.length,
          cached: MutableHashMap.size(cachedVectors),
        });
      }).pipe(
        Effect.withSpan("EmbeddingService.embedEntities", {
          captureStackTrace: false,
          attributes: { entityCount: entities.length, organizationId, ontologyId },
        })
      );

    /**
     * Find similar embeddings via pgvector
     *
     * @param queryVector - Query embedding vector
     * @param organizationId - Organization ID for scoping
     * @param limit - Maximum results (default 10)
     * @param threshold - Minimum similarity (default 0.7)
     * @returns Array of similar embeddings with similarity scores
     */
    const findSimilar = (
      queryVector: ReadonlyArray<number>,
      organizationId: SharedEntityIds.OrganizationId.Type,
      limit = 10,
      threshold = 0.7
    ) =>
      Effect.gen(function* () {
        yield* Effect.logDebug("EmbeddingService.findSimilar", {
          organizationId,
          limit,
          threshold,
        });

        const results = yield* repo.findSimilar(queryVector, organizationId, limit, threshold).pipe(
          Effect.mapError(
            (error) =>
              new EmbeddingError({
                message: `Similarity search failed: ${String(error)}`,
                provider: "pgvector",
                retryable: false,
              })
          )
        );

        yield* Effect.logDebug("EmbeddingService.findSimilar: complete", {
          resultCount: results.length,
        });

        return results;
      }).pipe(
        Effect.withSpan("EmbeddingService.findSimilar", {
          captureStackTrace: false,
          attributes: { organizationId, limit, threshold },
        })
      );

    /**
     * Get embedding for a text (generate or retrieve from cache)
     *
     * Convenience method that always returns a vector.
     * Note: taskType parameter is kept for backward compatibility but is not used.
     *
     * @param text - Text to embed
     * @param taskType - Embedding task type (kept for backward compatibility, ignored)
     * @param organizationId - Organization ID
     * @param ontologyId - Ontology ID
     * @returns Embedding vector
     */
    const getOrCreate = (
      text: string,
      taskType: TaskType,
      organizationId: SharedEntityIds.OrganizationId.Type,
      ontologyId: string
    ): Effect.Effect<ReadonlyArray<number>, EmbeddingError> => embed(text, taskType, organizationId, ontologyId);

    /**
     * Get embedding configuration
     *
     * Returns static configuration since @effect/ai EmbeddingModel doesn't expose config.
     */
    const getConfig = () =>
      Effect.succeed({
        model: DEFAULT_EMBEDDING_MODEL,
        dimensions: 768,
        provider: "openai",
      });

    return {
      embed,
      embedEntities,
      findSimilar,
      getOrCreate,
      getConfig,
    };
  }),
}) {}

/**
 * EmbeddingService layer with dependencies
 *
 * Requires EmbeddingModel.EmbeddingModel and EmbeddingRepo to be provided.
 * Use MockEmbeddingModelLayer for tests or OpenAiEmbeddingLayerConfig for production.
 *
 * @since 0.1.0
 * @category layers
 */
export const EmbeddingServiceLive = EmbeddingService.Default.pipe(Layer.provide(EmbeddingRepo.Default));
