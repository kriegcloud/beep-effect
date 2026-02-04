/**
 * EntityRegistry service contract for Knowledge slice
 *
 * Defines the interface for candidate search and entity resolution.
 * Finds candidate entities for incoming MentionRecords using:
 * 1. Text normalization
 * 2. Bloom filter negative test
 * 3. Database text match
 * 4. Embedding similarity ranking
 *
 * Performance target: <100ms for organizations with <10K entities.
 *
 * STUB: Phase 3 will implement full search flow.
 *
 * @module knowledge-domain/services/EntityRegistry
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import type { Model as Entity } from "../entities/entity/entity.model";
import type { Model as MentionRecordModel } from "../entities/mention-record/mention-record.model";
import { RegistryError } from "../errors/registry.errors";
import type { EntityCandidate } from "../value-objects/entity-candidate.value";

const $I = $KnowledgeDomainId.create("services/EntityRegistry");

/**
 * EntityRegistry service shape
 *
 * @since 0.1.0
 * @category types
 */
export interface EntityRegistryService {
  /**
   * Find candidate entities for a mention
   *
   * @param mention MentionRecord to resolve
   * @returns Array of EntityCandidates ranked by similarity
   */
  readonly findCandidates: (
    mention: MentionRecordModel
  ) => Effect.Effect<ReadonlyArray<EntityCandidate>, RegistryError>;

  /**
   * Bloom filter check (quick negative test)
   *
   * Returns true if the normalized text MAY exist in the registry.
   * Returns false if the text DEFINITELY does not exist.
   *
   * STUB: Phase 3 will implement bloom filter
   */
  readonly bloomFilterCheck: (normalizedText: string) => Effect.Effect<boolean, RegistryError>;

  /**
   * Fetch text matches from database
   *
   * STUB: Phase 3 will implement GIN index query
   */
  readonly fetchTextMatches: (normalizedText: string) => Effect.Effect<ReadonlyArray<Entity>, RegistryError>;

  /**
   * Rank candidates by embedding similarity
   *
   * STUB: Phase 3 will implement cosine similarity ranking
   */
  readonly rankBySimilarity: (
    mention: MentionRecordModel,
    candidates: ReadonlyArray<Entity>
  ) => Effect.Effect<ReadonlyArray<EntityCandidate>, RegistryError>;
}

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
 * STUB: Phase 3 will implement full search flow.
 *
 * @since 0.1.0
 * @category services
 */
export class EntityRegistry extends Effect.Service<EntityRegistry>()($I`EntityRegistry`, {
  accessors: true,
  effect: Effect.gen(function* () {
    const service: EntityRegistryService = {
      findCandidates: (mention) =>
        Effect.gen(function* () {
          // STUB: Phase 3 will implement full search flow
          // For now, return empty array
          yield* Effect.logDebug("EntityRegistry.findCandidates stub called", {
            mentionId: mention.id,
            rawText: mention.rawText,
          });
          return A.empty<EntityCandidate>();
        }).pipe(
          Effect.withSpan("EntityRegistry.findCandidates", {
            attributes: { mentionId: mention.id, rawText: mention.rawText },
          }),
          Effect.mapError(
            (error) =>
              new RegistryError({
                message: `Failed to find candidates: ${String(error)}`,
                cause: error,
              })
          )
        ),

      bloomFilterCheck: (normalizedText) =>
        Effect.gen(function* () {
          // STUB: Always return true (assume may exist)
          // Phase 3 will implement actual bloom filter
          yield* Effect.logDebug("EntityRegistry.bloomFilterCheck stub called", {
            normalizedText,
          });
          return true;
        }).pipe(
          Effect.withSpan("EntityRegistry.bloomFilterCheck", {
            attributes: { normalizedText },
          })
        ),

      fetchTextMatches: (normalizedText) =>
        Effect.gen(function* () {
          // STUB: Return empty array
          // Phase 3 will implement GIN index query
          yield* Effect.logDebug("EntityRegistry.fetchTextMatches stub called", {
            normalizedText,
          });
          return A.empty<Entity>();
        }).pipe(
          Effect.withSpan("EntityRegistry.fetchTextMatches", {
            attributes: { normalizedText },
          }),
          Effect.mapError(
            (error) =>
              new RegistryError({
                message: `Failed to fetch text matches: ${String(error)}`,
                cause: error,
              })
          )
        ),

      rankBySimilarity: (mention, candidates) =>
        Effect.gen(function* () {
          // STUB: Return empty array
          // Phase 3 will implement cosine similarity ranking
          yield* Effect.logDebug("EntityRegistry.rankBySimilarity stub called", {
            mentionId: mention.id,
            candidateCount: A.length(candidates),
          });
          return A.empty<EntityCandidate>();
        }).pipe(
          Effect.withSpan("EntityRegistry.rankBySimilarity", {
            attributes: {
              mentionId: mention.id,
              candidateCount: A.length(candidates),
            },
          }),
          Effect.mapError(
            (error) =>
              new RegistryError({
                message: `Failed to rank candidates: ${String(error)}`,
                cause: error,
              })
          )
        ),
    };

    return service;
  }),
}) {}
