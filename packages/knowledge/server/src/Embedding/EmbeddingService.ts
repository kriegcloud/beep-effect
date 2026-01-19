/**
 * EmbeddingService - Embedding generation with caching
 *
 * Provides cached embedding generation using the EmbeddingProvider
 * and pgvector-backed storage via EmbeddingRepo.
 *
 * @module knowledge-server/Embedding/EmbeddingService
 * @since 0.1.0
 */
import type { Entities } from "@beep/knowledge-domain";
import { EmbeddingRepo } from "@beep/knowledge-server/db";
import { KnowledgeEntityIds, type SharedEntityIds } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import type { AssembledEntity } from "../Extraction/GraphAssembler";
import { type EmbeddingError, EmbeddingProvider, type TaskType } from "./EmbeddingProvider";

// Type alias for proper TypeScript type access
type EmbeddingModel = (typeof Entities.Embedding.Model)["Type"];

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

/**
 * Format entity for embedding text
 *
 * Creates a natural language description suitable for embedding.
 */
const formatEntityForEmbedding = (entity: AssembledEntity): string => {
  const name = entity.canonicalName ?? entity.mention;
  const typeLabel = extractLocalName(entity.primaryType);
  return `${name} is a ${typeLabel}`;
};

/**
 * Extract local name from IRI
 */
const extractLocalName = (iri: string): string => {
  const hashIndex = iri.lastIndexOf("#");
  if (hashIndex !== -1) {
    return iri.slice(hashIndex + 1);
  }
  const slashIndex = iri.lastIndexOf("/");
  if (slashIndex !== -1) {
    return iri.slice(slashIndex + 1);
  }
  return iri;
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
    const provider = yield* EmbeddingProvider;
    const repo = yield* EmbeddingRepo;

    /**
     * Generate embedding for a single text with caching
     *
     * Checks cache first, generates if not found, stores in cache.
     *
     * @param text - Text to embed
     * @param taskType - Embedding task type
     * @param organizationId - Organization ID for scoping
     * @param ontologyId - Ontology ID for scoping
     * @returns Embedding vector
     */
    const embed = (
      text: string,
      taskType: TaskType,
      organizationId: SharedEntityIds.OrganizationId.Type,
      ontologyId: string
    ) =>
      Effect.gen(function* () {
        const cacheKey = computeCacheKey(text, provider.config.model);

        // Check cache
        const cached: O.Option<EmbeddingModel> = yield* repo
          .findByCacheKey(cacheKey, organizationId)
          .pipe(Effect.catchAll(() => Effect.succeed(O.none<EmbeddingModel>())));

        if (O.isSome(cached)) {
          yield* Effect.logDebug("EmbeddingService.embed: cache hit", { cacheKey });
          return cached.value.embedding;
        }

        yield* Effect.logDebug("EmbeddingService.embed: cache miss, generating", {
          cacheKey,
          textLength: text.length,
        });

        // Generate embedding
        const result = yield* provider.embed(text, taskType);

        // Store in cache
        yield* repo
          .insertVoid({
            id: KnowledgeEntityIds.EmbeddingId.make(`knowledge_embedding__${crypto.randomUUID()}`),
            organizationId,
            ontologyId,
            entityType: "entity",
            entityId: cacheKey,
            embedding: result.vector,
            contentText: O.some(text.slice(0, 1000)), // Truncate for storage
            model: result.model,
            // Audit fields
            source: O.some("embedding-service"),
            deletedAt: O.none(),
            createdBy: O.none(),
            updatedBy: O.none(),
            deletedBy: O.none(),
          })
          .pipe(
            Effect.catchAll((error) => {
              // Log but don't fail - caching is best-effort
              return Effect.logWarning("EmbeddingService: failed to cache embedding", {
                error: String(error),
                cacheKey,
              });
            })
          );

        return result.vector;
      }).pipe(
        Effect.withSpan("EmbeddingService.embed", {
          captureStackTrace: false,
          attributes: { taskType, organizationId, ontologyId },
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
      ontologyId: string
    ) =>
      Effect.gen(function* () {
        if (entities.length === 0) {
          yield* Effect.logDebug("EmbeddingService.embedEntities: no entities to embed");
          return;
        }

        yield* Effect.logInfo("EmbeddingService.embedEntities: starting", {
          count: entities.length,
        });

        // Prepare texts for batch embedding
        const texts = A.map(entities, formatEntityForEmbedding);

        // Check which are already cached
        const uncachedIndices: number[] = [];
        const cachedVectors = new Map<number, ReadonlyArray<number>>();

        for (let i = 0; i < texts.length; i++) {
          const text = texts[i]!;
          const cacheKey = computeCacheKey(text, provider.config.model);
          const cached: O.Option<EmbeddingModel> = yield* repo
            .findByCacheKey(cacheKey, organizationId)
            .pipe(Effect.catchAll(() => Effect.succeed(O.none<EmbeddingModel>())));

          if (O.isSome(cached)) {
            cachedVectors.set(i, cached.value.embedding);
          } else {
            uncachedIndices.push(i);
          }
        }

        yield* Effect.logDebug("EmbeddingService.embedEntities: cache check complete", {
          cached: cachedVectors.size,
          uncached: uncachedIndices.length,
        });

        if (uncachedIndices.length === 0) {
          yield* Effect.logInfo("EmbeddingService.embedEntities: all cached");
          return;
        }

        // Batch generate uncached embeddings
        const uncachedTexts = A.map(uncachedIndices, (i) => texts[i]!);
        const results = yield* provider.embedBatch(uncachedTexts, "clustering");

        // Store new embeddings
        for (let j = 0; j < uncachedIndices.length; j++) {
          const entityIndex = uncachedIndices[j]!;
          const entity = entities[entityIndex]!;
          const text = texts[entityIndex]!;
          const result = results[j]!;

          yield* repo
            .insertVoid({
              id: KnowledgeEntityIds.EmbeddingId.make(`knowledge_embedding__${crypto.randomUUID()}`),
              organizationId,
              ontologyId,
              entityType: "entity",
              entityId: entity.id, // Use entity ID for later lookup
              embedding: result.vector,
              contentText: O.some(text.slice(0, 1000)),
              model: result.model,
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
          cached: cachedVectors.size,
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
              ({
                _tag: "EmbeddingError",
                message: `Similarity search failed: ${String(error)}`,
                provider: "pgvector",
                retryable: false,
              }) as EmbeddingError
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
     *
     * @param text - Text to embed
     * @param taskType - Embedding task type
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
     * Get provider configuration
     */
    const getConfig = () => Effect.succeed(provider.config);

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
 * Requires EmbeddingProvider and EmbeddingRepo to be provided.
 *
 * @since 0.1.0
 * @category layers
 */
export const EmbeddingServiceLive = EmbeddingService.Default.pipe(Layer.provide(EmbeddingRepo.Default));
