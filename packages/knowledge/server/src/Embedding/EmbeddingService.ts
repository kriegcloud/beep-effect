import { $KnowledgeServerId } from "@beep/identity/packages";
import { EmbeddingRepo, type SimilarityResult } from "@beep/knowledge-server/db/repos/Embedding.repo";
import type { AssembledEntity } from "@beep/knowledge-server/Extraction/GraphAssembler";
import { formatEntityForEmbedding } from "@beep/knowledge-server/utils/formatting";
import { KnowledgeEntityIds, type SharedEntityIds } from "@beep/shared-domain";
import { AuthContext } from "@beep/shared-domain/Policy";
import { thunkEffectVoid, thunkEmptyStr, thunkFalse, thunkTrue } from "@beep/utils";
import * as AiError from "@effect/ai/AiError";
import * as EmbeddingModel from "@effect/ai/EmbeddingModel";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { CentralRateLimiterService } from "../LlmControl/RateLimiter";
import { EmbeddingError, type TaskType } from "./EmbeddingProvider";
import type{CircuitOpenError,  RateLimitError} from "@beep/knowledge-domain/errors";

const $I = $KnowledgeServerId.create("Embedding/EmbeddingService");

const DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small";

const mapAiError = (error: AiError.AiError): EmbeddingError =>
  new EmbeddingError({
    message: error.message,
    provider: "openai",
    retryable: Match.value(error).pipe(
      Match.tags({
        HttpRequestError: thunkTrue,
        HttpResponseError: thunkTrue,
      }),
      Match.orElse(thunkFalse)
    ),
    cause: S.encodeEither(S.parseJson(S.instanceOf(AiError.AiError)))({
      _tag: error._tag,
      cause: error.cause,
    }).pipe(
      Either.match({
        onRight: F.identity,
        onLeft: thunkEmptyStr,
      })
    ),
  });

const computeCacheKey = (text: string, model: string): string => {
  let hash = 5381;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) + hash + text.charCodeAt(i);
    hash = hash & hash;
  }
  const hashHex = Str.padStart(8, "0")(Math.abs(hash).toString(16));
  return `${model}:${hashHex}`;
};

export interface EmbeddingServiceShape {
  readonly getConfig: () => Effect.Effect<
    {
      model: string;
      dimensions: number;
      provider: string;
    },
    never,
    never
  >;
  readonly getOrCreate: (
    text: string,
    taskType: TaskType.Type,
    organizationId: SharedEntityIds.OrganizationId.Type,
    ontologyId: KnowledgeEntityIds.OntologyId.Type
  ) => Effect.Effect<readonly number[], EmbeddingError | RateLimitError | CircuitOpenError>;
  readonly findSimilar: (
    queryVector: readonly number[],
    organizationId: SharedEntityIds.OrganizationId.Type,
    limit?: undefined | number,
    threshold?: undefined | number
  ) => Effect.Effect<readonly SimilarityResult[], EmbeddingError, never>;
  readonly embedEntities: (
    entities: readonly AssembledEntity[],
    organizationId: SharedEntityIds.OrganizationId.Type,
    ontologyId?: KnowledgeEntityIds.OntologyId.Type
  ) => Effect.Effect<void, EmbeddingError | RateLimitError | CircuitOpenError, never>;
  readonly embed: (
    text: string,
    _taskType: TaskType.Type,
    organizationId: SharedEntityIds.OrganizationId.Type,
    _ontologyId?: undefined | KnowledgeEntityIds.OntologyId.Type
  ) => Effect.Effect<readonly number[], EmbeddingError | RateLimitError | CircuitOpenError, never>;
}

export class EmbeddingService extends Context.Tag($I`EmbeddingService`)<EmbeddingService, EmbeddingServiceShape>() {}

const serviceEffect: Effect.Effect<
  EmbeddingServiceShape,
  EmbeddingError,
  EmbeddingRepo | EmbeddingModel.EmbeddingModel | AuthContext | CentralRateLimiterService
> = Effect.gen(function* () {
  const embeddingModel = yield* EmbeddingModel.EmbeddingModel;
  const repo = yield* EmbeddingRepo;
  const authCtx = yield* AuthContext;
  const limiter = yield* CentralRateLimiterService;
  const organizationId = authCtx.session.activeOrganizationId;
  const currentUserId = authCtx.session.userId;

  const embed = Effect.fn("EmbeddingService.embed")(function* (
    text: string,
    _taskType: TaskType.Type,
    _ontologyId?: undefined | KnowledgeEntityIds.OntologyId.Type
  ) {
    const cacheKey = computeCacheKey(text, DEFAULT_EMBEDDING_MODEL);

    const cached = yield* repo.findByCacheKey(cacheKey, organizationId).pipe(Effect.orElseSucceed(() => O.none()));

    if (O.isSome(cached)) {
      yield* Effect.logDebug("EmbeddingService.embed: cache hit").pipe(Effect.annotateLogs({ cacheKey }));
      return cached.value.embedding;
    }

    yield* Effect.logDebug("EmbeddingService.embed: cache miss, generating").pipe(
      Effect.annotateLogs({ cacheKey, textLength: text.length })
    );

    yield* limiter.acquire(Str.length(text));
    const vector = yield* embeddingModel.embed(text).pipe(
      Effect.tap(() => limiter.release(0, true)),
      Effect.tapError(() => limiter.release(0, false)),
      Effect.mapError(mapAiError)
    );

    yield* Effect.logDebug("EmbeddingService: embedding generated (caching disabled)").pipe(
      Effect.annotateLogs({ cacheKey, vectorLength: vector.length })
    );

    return vector;
  });

  const embedEntities = Effect.fn("EmbeddingService.embedEntities")(function* (
    entities: ReadonlyArray<AssembledEntity>,
    ontologyId?: undefined | KnowledgeEntityIds.OntologyId.Type
  ) {
    if (A.isEmptyReadonlyArray(entities)) {
      yield* Effect.logDebug("EmbeddingService.embedEntities: no entities to embed");
      return;
    }

    yield* Effect.logInfo("EmbeddingService.embedEntities: starting").pipe(
      Effect.annotateLogs({ count: entities.length })
    );

    const indexed = A.map(entities, (entity, i) => ({
      index: i,
      entity,
      text: formatEntityForEmbedding(entity),
    }));

    const cacheResults = yield* Effect.forEach(indexed, (item) =>
      repo.findByCacheKey(computeCacheKey(item.text, DEFAULT_EMBEDDING_MODEL), organizationId).pipe(
        Effect.option,
        Effect.map((cached) => ({ ...item, cached }))
      )
    );

    const { uncached, cachedCount } = A.reduce(
      cacheResults,
      { uncached: A.empty<(typeof cacheResults)[number]>(), cachedCount: 0 },
      (acc, item) =>
        O.isSome(item.cached)
          ? { ...acc, cachedCount: acc.cachedCount + 1 }
          : { ...acc, uncached: A.append(acc.uncached, item) }
    );

    yield* Effect.logDebug("EmbeddingService.embedEntities: cache check complete").pipe(
      Effect.annotateLogs({
        cached: cachedCount,
        uncached: uncached.length,
      })
    );

    if (A.isEmptyReadonlyArray(uncached)) {
      yield* Effect.logInfo("EmbeddingService.embedEntities: all cached");
      return;
    }

    const uncachedTexts = A.map(uncached, (item) => item.text);
    const estimatedTokens = A.reduce(uncachedTexts, 0, (acc, t) => acc + Str.length(t));
    yield* limiter.acquire(estimatedTokens);
    const vectors = yield* embeddingModel.embedMany(uncachedTexts).pipe(
      Effect.tap(() => limiter.release(0, true)),
      Effect.tapError(() => limiter.release(0, false)),
      Effect.mapError(mapAiError)
    );

    yield* Effect.forEach(uncached, (item, j) =>
      O.match(A.get(vectors, j), {
        onNone: thunkEffectVoid,
        onSome: (vector) =>
          repo
            .insertVoid({
              id: KnowledgeEntityIds.EmbeddingId.create(),
              organizationId,
              ontologyId: O.fromNullable(ontologyId),
              entityType: "entity",
              entityId: item.entity.id,
              embedding: vector,
              contentText: O.some(Str.slice(0, 1000)(item.text)),
              model: DEFAULT_EMBEDDING_MODEL,
              source: O.some("embedding-service"),
              deletedAt: O.none(),
              createdBy: O.some(currentUserId),
              updatedBy: O.some(currentUserId),
              deletedBy: O.none(),
            })
            .pipe(
              Effect.catchTag("DatabaseError", (error) =>
                Effect.logWarning("EmbeddingService: failed to store entity embedding").pipe(
                  Effect.annotateLogs({
                    error: String(error),
                    entityId: item.entity.id,
                  })
                )
              )
            ),
      })
    );

    yield* Effect.logInfo("EmbeddingService.embedEntities: complete").pipe(
      Effect.annotateLogs({
        total: entities.length,
        generated: uncached.length,
        cached: cachedCount,
      })
    );
  });

  const findSimilar = Effect.fn("EmbeddingService.findSimilar")(function* (
    queryVector: ReadonlyArray<number>,
    limit = 10,
    threshold = 0.7
  ) {
    yield* Effect.logDebug("EmbeddingService.findSimilar").pipe(
      Effect.annotateLogs({ organizationId, limit, threshold })
    );

    const results = yield* repo.findSimilar(queryVector, limit, threshold).pipe(
      Effect.mapError(
        (error) =>
          new EmbeddingError({
            message: `Similarity search failed: ${String(error)}`,
            provider: "pgvector",
            retryable: false,
          })
      )
    );

    yield* Effect.logDebug("EmbeddingService.findSimilar: complete").pipe(
      Effect.annotateLogs({ resultCount: results.length })
    );

    return results;
  });

  const getOrCreate = (
    text: string,
    taskType: TaskType.Type,
    ontologyId: KnowledgeEntityIds.OntologyId.Type
  ): Effect.Effect<ReadonlyArray<number>, EmbeddingError | CircuitOpenError | RateLimitError> => embed(text, taskType, ontologyId);

  const getConfig = Effect.fn("EmbeddingService.getConfig")(function* () {
    return {
      model: DEFAULT_EMBEDDING_MODEL,
      dimensions: 768,
      provider: "openai",
    };
  });

  return EmbeddingService.of({
    embed,
    embedEntities,
    findSimilar,
    getOrCreate,
    getConfig,
  });
});

export const EmbeddingServiceLive = Layer.effect(EmbeddingService, serviceEffect);
