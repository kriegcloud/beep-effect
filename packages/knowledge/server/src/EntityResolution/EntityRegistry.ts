/**
 * EntityRegistry - Candidate search and entity resolution service
 *
 * Finds candidate entities for incoming MentionRecords using:
 * 1. Text normalization
 * 2. Bloom filter negative test
 * 3. Database text match (GIN trigram index)
 * 4. Embedding similarity ranking
 *
 * Performance target: <100ms for organizations with <10K entities.
 *
 * @module knowledge-server/EntityResolution/EntityRegistry
 * @since 0.1.0
 */
import { $KnowledgeServerId } from "@beep/identity/packages";
import { type Entities, Errors, ValueObjects } from "@beep/knowledge-domain";
import { Policy } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Order from "effect/Order";
import * as Str from "effect/String";
import { EntityRepo } from "../db/repos/Entity.repo";
import { EmbeddingService } from "../Embedding/EmbeddingService";
import { cosineSimilarity } from "../utils/vector";
import { BloomFilter } from "./BloomFilter";

const $I = $KnowledgeServerId.create("EntityResolution/EntityRegistry");

// =============================================================================
// Constants
// =============================================================================

/**
 * Similarity threshold for candidate filtering
 *
 * Candidates with similarity score below this threshold are discarded.
 * A value of 0.85 provides good precision while allowing for minor variations.
 */
const SIMILARITY_THRESHOLD = 0.85;

/**
 * Maximum candidates to return from text search
 *
 * Limits the number of candidates passed to embedding similarity ranking
 * to ensure performance stays within target (<100ms).
 */
const MAX_TEXT_MATCH_CANDIDATES = 50;

// =============================================================================
// Text Normalization
// =============================================================================

/**
 * Normalize text for candidate search
 *
 * Applies consistent normalization for text matching:
 * - Trim whitespace
 * - Convert to lowercase
 *
 * @param text - Text to normalize
 * @returns Normalized text
 */
export const normalizeText = (text: string): string => {
  return Str.toLowerCase(Str.trim(text));
};

// =============================================================================
// Service Implementation
// =============================================================================

/**
 * EntityRegistry service for candidate search and entity resolution.
 *
 * Finds candidate entities for incoming MentionRecords using:
 * 1. Text normalization
 * 2. Bloom filter negative test
 * 3. Database text match
 * 4. Embedding similarity ranking
 *
 * Performance target: <100ms for organizations with <10K entities.
 *
 * @since 0.1.0
 * @category services
 */
export class EntityRegistry extends Effect.Service<EntityRegistry>()($I`EntityRegistry`, {
  accessors: true,
  effect: Effect.gen(function* () {
    // Inject dependencies
    const entityRepo = yield* EntityRepo;
    const bloomFilter = yield* BloomFilter;
    const embeddingService = yield* EmbeddingService;
    const authContext = yield* Policy.AuthContext;

    return {
      /**
       * Find candidate entities for a mention
       *
       * Implements multi-stage search pipeline:
       * 1. Normalize mention text
       * 2. Bloom filter check (quick negative test)
       * 3. GIN index text search (trigram similarity)
       * 4. Embedding similarity ranking (cosine similarity)
       *
       * @param mention - MentionRecord to resolve
       * @returns Array of EntityCandidates ranked by similarity (descending)
       */
      findCandidates: Effect.fn("EntityRegistry.findCandidates")(
        function* (mention: Entities.MentionRecord.Model) {
          const normalizedText = normalizeText(mention.rawText);
          const organizationId = authContext.session.activeOrganizationId;

          // Stage 1: Bloom filter check (quick negative test)
          const mayExist = yield* bloomFilter.contains(normalizedText);
          if (!mayExist) {
            yield* Effect.logDebug("EntityRegistry: bloom filter negative", {
              normalizedText,
            });
            return A.empty<ValueObjects.EntityCandidate>();
          }

          // Stage 2: Database text match (GIN trigram index)
          const textMatches = yield* entityRepo
            .findByNormalizedText(normalizedText, organizationId, MAX_TEXT_MATCH_CANDIDATES)
            .pipe(
              Effect.mapError(
                (e) =>
                  new Errors.RegistryError({
                    message: `Database text search failed: ${String(e)}`,
                    cause: e,
                  })
              )
            );

          if (A.isEmptyReadonlyArray(textMatches)) {
            yield* Effect.logDebug("EntityRegistry: no text matches", {
              normalizedText,
            });
            return A.empty<ValueObjects.EntityCandidate>();
          }

          yield* Effect.logDebug("EntityRegistry: text matches found", {
            normalizedText,
            matchCount: textMatches.length,
          });

          // Stage 3: Embedding similarity ranking
          const mentionEmbedding = yield* embeddingService
            .embed(mention.rawText, "search_query", organizationId, undefined)
            .pipe(
              Effect.mapError(
                (e) =>
                  new Errors.RegistryError({
                    message: `Failed to embed mention: ${String(e)}`,
                    cause: e,
                  })
              )
            );

          // Compute similarity scores for all text matches
          const ranked = yield* Effect.forEach(
            textMatches,
            (entity) =>
              Effect.gen(function* () {
                const entityEmbedding = yield* embeddingService
                  .embed(entity.mention, "search_document", organizationId, undefined)
                  .pipe(
                    Effect.mapError(
                      (e) =>
                        new Errors.RegistryError({
                          message: `Failed to embed entity: ${String(e)}`,
                          cause: e,
                        })
                    )
                  );

                const similarity = cosineSimilarity(mentionEmbedding, entityEmbedding);
                return { entity, similarityScore: similarity };
              }),
            { concurrency: 10 }
          );

          // Filter by threshold and sort by similarity (descending)
          const candidates = F.pipe(
            ranked,
            A.filter((c) => c.similarityScore > SIMILARITY_THRESHOLD),
            A.map(
              (c) =>
                new ValueObjects.EntityCandidate({
                  entity: c.entity,
                  similarityScore: c.similarityScore,
                })
            ),
            A.sort(
              Order.reverse(
                Order.mapInput(Order.number, (c: ValueObjects.EntityCandidate) => c.similarityScore)
              )
            )
          );

          yield* Effect.logDebug("EntityRegistry: candidates ranked", {
            textMatches: textMatches.length,
            aboveThreshold: candidates.length,
            threshold: SIMILARITY_THRESHOLD,
          });

          return candidates;
        },
        Effect.withSpan("EntityRegistry.findCandidates", {
          captureStackTrace: false,
        }),
        Effect.mapError(
          (error) =>
            new Errors.RegistryError({
              message: `Failed to find candidates: ${error}`,
              cause: error,
            })
        )
      ),

      /**
       * Bloom filter check (quick negative test)
       *
       * Returns false if the text is definitely NOT in the registry.
       * Returns true if the text MAY be in the registry (needs verification).
       *
       * @param normalizedText - Normalized text to check
       * @returns true if entity may exist, false if definitely doesn't exist
       */
      bloomFilterCheck: Effect.fn("EntityRegistry.bloomFilterCheck")(function* (
        normalizedText: string
      ) {
        return yield* bloomFilter.contains(normalizedText);
      }),

      /**
       * Fetch text matches from database
       *
       * Uses GIN trigram index for fuzzy text matching.
       * Returns entities where similarity(mention, normalizedText) > 0.3.
       *
       * @param normalizedText - Normalized text to search
       * @param limit - Maximum number of results (default: 50)
       * @returns Array of matching entities
       */
      fetchTextMatches: Effect.fn("EntityRegistry.fetchTextMatches")(function* (
        normalizedText: string,
        limit = MAX_TEXT_MATCH_CANDIDATES
      ) {
        const organizationId = authContext.session.activeOrganizationId;

        const results = yield* entityRepo
          .findByNormalizedText(normalizedText, organizationId, limit)
          .pipe(
            Effect.mapError(
              (e) =>
                new Errors.RegistryError({
                  message: `Database text search failed: ${String(e)}`,
                  cause: e,
                })
            )
          );

        yield* Effect.logDebug("EntityRegistry.fetchTextMatches", {
          normalizedText,
          resultCount: results.length,
        });

        return results;
      }),

      /**
       * Rank candidates by embedding similarity
       *
       * Computes cosine similarity between mention and each candidate entity
       * using embedding vectors. Returns candidates above threshold (0.85)
       * sorted by similarity score descending.
       *
       * @param mention - MentionRecord to match against
       * @param candidates - Candidate entities to rank
       * @returns Array of EntityCandidates sorted by similarity score (descending)
       */
      rankBySimilarity: Effect.fn("EntityRegistry.rankBySimilarity")(function* (
        mention: Entities.MentionRecord.Model,
        candidates: ReadonlyArray<Entities.Entity.Model>
      ) {
        if (A.isEmptyReadonlyArray(candidates)) {
          yield* Effect.logDebug("EntityRegistry.rankBySimilarity: no candidates to rank");
          return A.empty<ValueObjects.EntityCandidate>();
        }

        const organizationId = authContext.session.activeOrganizationId;

        // Get mention embedding
        const mentionEmbedding = yield* embeddingService
          .embed(mention.rawText, "search_query", organizationId, undefined)
          .pipe(
            Effect.mapError(
              (e) =>
                new Errors.RegistryError({
                  message: `Failed to embed mention: ${String(e)}`,
                  cause: e,
                })
            )
          );

        // Compute similarity for each candidate
        const ranked = yield* Effect.forEach(
          candidates,
          (entity) =>
            Effect.gen(function* () {
              const entityEmbedding = yield* embeddingService
                .embed(entity.mention, "search_document", organizationId, undefined)
                .pipe(
                  Effect.mapError(
                    (e) =>
                      new Errors.RegistryError({
                        message: `Failed to embed entity: ${String(e)}`,
                        cause: e,
                      })
                  )
                );

              const similarity = cosineSimilarity(mentionEmbedding, entityEmbedding);
              return { entity, similarityScore: similarity };
            }),
          { concurrency: 10 }
        );

        // Filter and sort
        const result = F.pipe(
          ranked,
          A.filter((c) => c.similarityScore > SIMILARITY_THRESHOLD),
          A.map(
            (c) =>
              new ValueObjects.EntityCandidate({
                entity: c.entity,
                similarityScore: c.similarityScore,
              })
          ),
          A.sort(
            Order.reverse(
              Order.mapInput(Order.number, (c: ValueObjects.EntityCandidate) => c.similarityScore)
            )
          )
        );

        yield* Effect.logDebug("EntityRegistry.rankBySimilarity", {
          mentionId: mention.id,
          candidateCount: candidates.length,
          aboveThreshold: result.length,
        });

        return result;
      }),

      /**
       * Add entity to bloom filter for future lookups
       *
       * Should be called when new entities are created to populate the filter.
       *
       * @param entityName - Entity name to add
       */
      addToBloomFilter: Effect.fn("EntityRegistry.addToBloomFilter")(function* (
        entityName: string
      ) {
        const normalizedText = normalizeText(entityName);
        yield* bloomFilter.add(normalizedText);
        yield* Effect.logTrace("EntityRegistry.addToBloomFilter", { normalizedText });
      }),

      /**
       * Bulk add entities to bloom filter
       *
       * Should be called during initialization to populate the filter
       * with existing entity names.
       *
       * @param entityNames - Entity names to add
       */
      bulkAddToBloomFilter: Effect.fn("EntityRegistry.bulkAddToBloomFilter")(function* (
        entityNames: ReadonlyArray<string>
      ) {
        const normalizedNames = A.map(entityNames, normalizeText);
        yield* bloomFilter.bulkAdd(normalizedNames);
        yield* Effect.logDebug("EntityRegistry.bulkAddToBloomFilter", {
          count: entityNames.length,
        });
      }),

      /**
       * Get current bloom filter statistics
       *
       * Useful for monitoring filter saturation and effectiveness.
       */
      getBloomFilterStats: Effect.fn("EntityRegistry.getBloomFilterStats")(function* () {
        return yield* bloomFilter.getStats();
      }),
    };
  }),
}) {}
