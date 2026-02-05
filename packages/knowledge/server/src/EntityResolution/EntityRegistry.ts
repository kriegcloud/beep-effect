import { $KnowledgeServerId } from "@beep/identity/packages";
import { type Entities, Errors, ValueObjects } from "@beep/knowledge-domain";
import { Policy } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as Order from "effect/Order";
import * as Str from "effect/String";
import { EntityRepo } from "../db/repos/Entity.repo";
import { EmbeddingService } from "../Embedding/EmbeddingService";
import { cosineSimilarity } from "../utils/vector";
import { BloomFilter } from "./BloomFilter";

const $I = $KnowledgeServerId.create("EntityResolution/EntityRegistry");

const SIMILARITY_THRESHOLD = 0.85;

const MAX_TEXT_MATCH_CANDIDATES = 50;

export const normalizeText = (text: string): string => Str.toLowerCase(Str.trim(text));

export interface EntityRegistryShape {
  readonly findCandidates: (
    mention: Entities.MentionRecord.Model
  ) => Effect.Effect<ValueObjects.EntityCandidate[], Errors.RegistryError>;
  readonly bloomFilterCheck: (normalizedText: string) => Effect.Effect<boolean>;
  readonly fetchTextMatches: (
    normalizedText: string,
    limit?: number
  ) => Effect.Effect<readonly Entities.Entity.Model[], Errors.RegistryError>;
  readonly rankBySimilarity: (
    mention: Entities.MentionRecord.Model,
    candidates: ReadonlyArray<Entities.Entity.Model>
  ) => Effect.Effect<ValueObjects.EntityCandidate[], Errors.RegistryError>;
  readonly addToBloomFilter: (entityName: string) => Effect.Effect<void>;
  readonly bulkAddToBloomFilter: (entityNames: ReadonlyArray<string>) => Effect.Effect<void>;
  readonly getBloomFilterStats: () => Effect.Effect<{
    readonly itemCount: number;
    readonly bitArraySize: number;
    readonly setBitCount: number;
    readonly fillRatio: number;
    readonly estimatedFalsePositiveRate: number;
    readonly numHashFunctions: number;
    readonly memoryBytes: number;
  }>;
}

export class EntityRegistry extends Context.Tag($I`EntityRegistry`)<EntityRegistry, EntityRegistryShape>() {}

const serviceEffect: Effect.Effect<
  EntityRegistryShape,
  never,
  EntityRepo | BloomFilter | EmbeddingService | Policy.AuthContext
> = Effect.gen(function* () {
  const entityRepo = yield* EntityRepo;
  const bloomFilter = yield* BloomFilter;
  const embeddingService = yield* EmbeddingService;
  const authContext = yield* Policy.AuthContext;

  const findCandidates = Effect.fn("EntityRegistry.findCandidates")(
    function* (mention: Entities.MentionRecord.Model) {
      const normalizedText = normalizeText(mention.rawText);
      const organizationId = authContext.session.activeOrganizationId;

      const mayExist = yield* bloomFilter.contains(normalizedText);
      if (!mayExist) {
        yield* Effect.logDebug("EntityRegistry: bloom filter negative").pipe(Effect.annotateLogs({ normalizedText }));
        return A.empty<ValueObjects.EntityCandidate>();
      }

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
        yield* Effect.logDebug("EntityRegistry: no text matches").pipe(Effect.annotateLogs({ normalizedText }));
        return A.empty<ValueObjects.EntityCandidate>();
      }

      yield* Effect.logDebug("EntityRegistry: text matches found").pipe(
        Effect.annotateLogs({
          normalizedText,
          matchCount: A.length(textMatches),
        })
      );

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
        A.sort(Order.reverse(Order.mapInput(Order.number, (c: ValueObjects.EntityCandidate) => c.similarityScore)))
      );

      yield* Effect.logDebug("EntityRegistry: candidates ranked").pipe(
        Effect.annotateLogs({
          textMatches: A.length(textMatches),
          aboveThreshold: A.length(candidates),
          threshold: SIMILARITY_THRESHOLD,
        })
      );

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
  );

  const bloomFilterCheck = Effect.fn("EntityRegistry.bloomFilterCheck")(function* (normalizedText: string) {
    return yield* bloomFilter.contains(normalizedText);
  });

  const fetchTextMatches = Effect.fn("EntityRegistry.fetchTextMatches")(function* (
    normalizedText: string,
    limit = MAX_TEXT_MATCH_CANDIDATES
  ) {
    const organizationId = authContext.session.activeOrganizationId;

    const results = yield* entityRepo.findByNormalizedText(normalizedText, organizationId, limit).pipe(
      Effect.mapError(
        (e) =>
          new Errors.RegistryError({
            message: `Database text search failed: ${String(e)}`,
            cause: e,
          })
      )
    );

    yield* Effect.logDebug("EntityRegistry.fetchTextMatches").pipe(
      Effect.annotateLogs({
        normalizedText,
        resultCount: A.length(results),
      })
    );

    return results;
  });

  const rankBySimilarity = Effect.fn("EntityRegistry.rankBySimilarity")(function* (
    mention: Entities.MentionRecord.Model,
    candidates: ReadonlyArray<Entities.Entity.Model>
  ) {
    if (A.isEmptyReadonlyArray(candidates)) {
      yield* Effect.logDebug("EntityRegistry.rankBySimilarity: no candidates to rank");
      return A.empty<ValueObjects.EntityCandidate>();
    }

    const organizationId = authContext.session.activeOrganizationId;

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
      A.sort(Order.reverse(Order.mapInput(Order.number, (c: ValueObjects.EntityCandidate) => c.similarityScore)))
    );

    yield* Effect.logDebug("EntityRegistry.rankBySimilarity").pipe(
      Effect.annotateLogs({
        mentionId: mention.id,
        candidateCount: A.length(candidates),
        aboveThreshold: A.length(result),
      })
    );

    return result;
  });

  const addToBloomFilter = Effect.fn("EntityRegistry.addToBloomFilter")(function* (entityName: string) {
    const normalizedText = normalizeText(entityName);
    yield* bloomFilter.add(normalizedText);
    yield* Effect.logTrace("EntityRegistry.addToBloomFilter").pipe(Effect.annotateLogs({ normalizedText }));
  });

  const bulkAddToBloomFilter = Effect.fn("EntityRegistry.bulkAddToBloomFilter")(function* (
    entityNames: ReadonlyArray<string>
  ) {
    const normalizedNames = A.map(entityNames, normalizeText);
    yield* bloomFilter.bulkAdd(normalizedNames);
    yield* Effect.logDebug("EntityRegistry.bulkAddToBloomFilter").pipe(
      Effect.annotateLogs({ count: A.length(entityNames) })
    );
  });

  const getBloomFilterStats = Effect.fn("EntityRegistry.getBloomFilterStats")(function* () {
    return yield* bloomFilter.getStats();
  });

  return EntityRegistry.of({
    findCandidates,
    bloomFilterCheck,
    fetchTextMatches,
    rankBySimilarity,
    addToBloomFilter,
    bulkAddToBloomFilter,
    getBloomFilterStats,
  });
});

export const EntityRegistryLive = Layer.effect(EntityRegistry, serviceEffect);
