import { $KnowledgeServerId } from "@beep/identity/packages";
import { Entities } from "@beep/knowledge-domain";
import {
  type SparqlSyntaxError,
  SparqlTimeoutError,
  type SparqlUnsupportedFeatureError,
} from "@beep/knowledge-domain/errors";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, type SharedEntityIds } from "@beep/shared-domain";
import type { DatabaseError } from "@beep/shared-domain/errors";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as MutableHashMap from "effect/MutableHashMap";
import * as MutableHashSet from "effect/MutableHashSet";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";
import { EntityRepo, EntityRepoLive } from "../db/repos/Entity.repo";
import { RelationRepo, RelationRepoLive } from "../db/repos/Relation.repo";
import { type EmbeddingError, EmbeddingService } from "../Embedding";
import {
  type QueryResult,
  type SparqlGenerationError,
  SparqlGenerator,
  SparqlGeneratorLive,
  SparqlService,
  SparqlServiceLive,
} from "../Sparql";
import { formatContextWithScores, truncateToTokenBudget } from "./ContextFormatter";
import { assignGraphRanks, fuseRankings } from "./RrfScorer";

const $I = $KnowledgeServerId.create("GraphRAG/GraphRAGService");

export class EntityFilters extends S.Class<EntityFilters>($I`EntityFilters`)(
  {
    typeIris: S.optional(S.Array(S.String)),
    minConfidence: S.optional(S.Number.pipe(S.greaterThanOrEqualTo(0), S.lessThanOrEqualTo(1))),
    ontologyId: S.optional(S.String),
  },
  $I.annotations("EntityFilters", {
    description: "Optional filters applied to graph retrieval (type IRIs, confidence threshold, ontology ID).",
  })
) {}

export class GraphRAGQuery extends S.Class<GraphRAGQuery>($I`GraphRAGQuery`)(
  {
    query: S.String.pipe(S.minLength(1)),
    topK: BS.toOptionalWithDefault(S.Number.pipe(S.greaterThan(0), S.lessThanOrEqualTo(50)))(10),
    hops: BS.toOptionalWithDefault(S.Number.pipe(S.greaterThanOrEqualTo(0), S.lessThanOrEqualTo(3)))(1),
    filters: S.optional(EntityFilters),
    maxTokens: BS.toOptionalWithDefault(S.Number.pipe(S.greaterThan(0)))(4000),
    similarityThreshold: BS.toOptionalWithDefault(S.Number.pipe(S.greaterThanOrEqualTo(0), S.lessThanOrEqualTo(1)))(
      0.5
    ),
    includeScores: BS.toOptionalWithDefault(S.Boolean)(false),
  },
  $I.annotations("GraphRAGQuery", {
    description: "GraphRAG query input (question + retrieval parameters).",
  })
) {}

export class GraphRagResultStats extends S.Class<GraphRagResultStats>($I`GraphRagResultStats`)(
  {
    seedEntityCount: S.Number,
    totalEntityCount: S.Number,
    totalRelationCount: S.Number,
    hopsTraversed: S.Number,
    estimatedTokens: S.Number,
    truncated: S.Boolean,
  },
  $I.annotations("GraphRagResultStats", {
    description: "Query execution stats returned with GraphRAG results (counts, hops, token estimates).",
  })
) {}

export class GraphRAGResult extends S.Class<GraphRAGResult>($I`GraphRAGResult`)(
  {
    entities: S.Array(Entities.Entity.Model),
    relations: S.Array(Entities.Relation.Model),
    scores: S.Record({ key: S.String, value: S.Number }),
    context: S.String,
    stats: GraphRagResultStats,
  },
  $I.annotations("GraphRAGResult", {
    description: "GraphRAG results (entities, relations, optional scores, and formatted context string).",
  })
) {}

export class GraphRAGError extends S.TaggedError<GraphRAGError>($I`GraphRAGError`)(
  "GraphRAGError",
  {
    message: S.String,
    cause: S.optional(S.String),
  },
  $I.annotations("GraphRAGError", {
    description: "GraphRAG service failure (message + optional serialized cause).",
  })
) {}

export interface GraphRAGServiceShape {
  readonly query: (
    input: GraphRAGQuery,
    organizationId: SharedEntityIds.OrganizationId.Type,
    ontologyId: string
  ) => Effect.Effect<GraphRAGResult, GraphRAGError | EmbeddingError | DatabaseError>;
  readonly queryFromSeeds: (
    seedEntityIds: ReadonlyArray<KnowledgeEntityIds.KnowledgeEntityId.Type>,
    hops: number,
    organizationId: SharedEntityIds.OrganizationId.Type,
    options?: { readonly maxTokens?: undefined | number; readonly includeScores?: undefined | boolean }
  ) => Effect.Effect<GraphRAGResult, GraphRAGError | DatabaseError>;
  readonly questionToSparql: (
    question: string,
    schemaContext: string,
    timeoutMs?: number
  ) => Effect.Effect<
    QueryResult.Type,
    GraphRAGError | SparqlGenerationError | SparqlSyntaxError | SparqlUnsupportedFeatureError | SparqlTimeoutError
  >;
}

export class GraphRAGService extends Context.Tag($I`GraphRAGService`)<GraphRAGService, GraphRAGServiceShape>() {}

const serviceEffect: Effect.Effect<
  GraphRAGServiceShape,
  never,
  EmbeddingService | EntityRepo | RelationRepo | SparqlGenerator | SparqlService
> = Effect.gen(function* () {
  const embeddingService = yield* EmbeddingService;
  const entityRepo = yield* EntityRepo;
  const relationRepo = yield* RelationRepo;
  const sparqlGenerator = yield* SparqlGenerator;
  const sparqlService = yield* SparqlService;

  const query = (
    input: GraphRAGQuery,
    organizationId: SharedEntityIds.OrganizationId.Type,
    ontologyId: string
  ): Effect.Effect<GraphRAGResult, GraphRAGError | EmbeddingError | DatabaseError> =>
    Effect.gen(function* () {
      yield* Effect.logInfo("GraphRAGService.query: starting").pipe(
        Effect.annotateLogs({
          queryLength: Str.length(input.query),
          topK: input.topK,
          hops: input.hops,
        })
      );

      const queryVector = yield* embeddingService.embed(input.query, "search_query", organizationId, ontologyId);

      const similarResults = yield* embeddingService.findSimilar(
        queryVector,
        organizationId,
        input.topK,
        input.similarityThreshold
      );

      yield* Effect.logDebug("GraphRAGService.query: k-NN results").pipe(
        Effect.annotateLogs({ count: A.length(similarResults) })
      );

      if (A.isEmptyReadonlyArray(similarResults)) {
        return new GraphRAGResult({
          entities: A.empty<Entities.Entity.Model>(),
          relations: A.empty<Entities.Relation.Model>(),
          scores: {},
          context: "",
          stats: {
            seedEntityCount: 0,
            totalEntityCount: 0,
            totalRelationCount: 0,
            hopsTraversed: 0,
            estimatedTokens: 0,
            truncated: false,
          },
        });
      }

      const seedEntityIds = A.filterMap(similarResults, (r) => {
        if (KnowledgeEntityIds.KnowledgeEntityId.is(r.entityId)) {
          return O.some(r.entityId);
        }
        return O.none();
      });

      const embeddingRanks = A.map(seedEntityIds, (id) => id);

      const { allEntityIds, entityHops } = yield* traverseGraph(
        seedEntityIds,
        input.hops,
        organizationId,
        relationRepo
      );

      yield* Effect.logDebug("GraphRAGService.query: traversal complete").pipe(
        Effect.annotateLogs({
          seedCount: A.length(seedEntityIds),
          totalEntities: A.length(allEntityIds),
        })
      );

      const entities = yield* entityRepo.findByIds(allEntityIds, organizationId);

      const relations = yield* relationRepo.findByEntityIds(allEntityIds, organizationId);

      const graphRanks = assignGraphRanks(entityHops);
      const graphRankList = A.empty<string>();
      MutableHashMap.forEach(graphRanks, (_, id) => {
        graphRankList.push(id);
      });

      const fusedRanking = fuseRankings([embeddingRanks, graphRankList]);

      const scores = R.empty<string, number>();
      for (const item of fusedRanking) {
        scores[item.id] = item.score;
      }

      const sortedEntities = A.sort(
        entities,
        Order.mapInput(Num.Order, (e: Entities.Entity.Model) => -(scores[e.id] ?? 0))
      );

      const scoreMap = MutableHashMap.fromIterable(Struct.entries(scores));
      const { context, entityCount, relationCount } = truncateToTokenBudget(
        sortedEntities,
        relations,
        input.maxTokens ?? 4000
      );

      const truncated = entityCount < A.length(sortedEntities) || relationCount < A.length(relations);

      const result = new GraphRAGResult({
        entities: sortedEntities,
        relations,
        scores,
        context: input.includeScores ? formatContextWithScores(sortedEntities, relations, scoreMap) : context,
        stats: {
          seedEntityCount: A.length(seedEntityIds),
          totalEntityCount: A.length(entities),
          totalRelationCount: A.length(relations),
          hopsTraversed: input.hops ?? 1,
          estimatedTokens: Math.ceil(Str.length(context) / 4),
          truncated,
        },
      });

      yield* Effect.logInfo("GraphRAGService.query: complete").pipe(Effect.annotateLogs({ stats: result.stats }));

      return result;
    }).pipe(
      Effect.withSpan("GraphRAGService.query", {
        captureStackTrace: false,
        attributes: { topK: input.topK, hops: input.hops, organizationId, ontologyId },
      }),
      Effect.catchTag("RateLimitError", (e) =>
        Effect.fail(new GraphRAGError({ message: `Rate limit exceeded: ${e.reason}`, cause: String(e.retryAfterMs) }))
      ),
      Effect.catchTag("CircuitOpenError", (e) =>
        Effect.fail(new GraphRAGError({ message: "Circuit breaker open", cause: String(e.resetTimeoutMs) }))
      )
    );

  const queryFromSeeds = (
    seedEntityIds: ReadonlyArray<KnowledgeEntityIds.KnowledgeEntityId.Type>,
    hops: number,
    organizationId: SharedEntityIds.OrganizationId.Type,
    options: { readonly maxTokens?: undefined | number; readonly includeScores?: undefined | boolean } = {}
  ): Effect.Effect<GraphRAGResult, GraphRAGError | DatabaseError> =>
    Effect.gen(function* () {
      const maxTokens = options.maxTokens ?? 4000;
      const includeScores = options.includeScores ?? false;

      if (A.isEmptyReadonlyArray(seedEntityIds)) {
        return new GraphRAGResult({
          entities: A.empty<Entities.Entity.Model>(),
          relations: A.empty<Entities.Relation.Model>(),
          scores: {},
          context: "",
          stats: new GraphRagResultStats({
            seedEntityCount: 0,
            totalEntityCount: 0,
            totalRelationCount: 0,
            hopsTraversed: 0,
            estimatedTokens: 0,
            truncated: false,
          }),
        });
      }

      const { allEntityIds, entityHops } = yield* traverseGraph(seedEntityIds, hops, organizationId, relationRepo);

      const entities = yield* entityRepo.findByIds(allEntityIds, organizationId);
      const relations = yield* relationRepo.findByEntityIds(allEntityIds, organizationId);

      const graphRanks = assignGraphRanks(entityHops);
      const scores = R.empty<string, number>();
      MutableHashMap.forEach(graphRanks, (rank, id) => {
        scores[id] = 1 / (60 + rank);
      });

      const sortedEntities = A.sort(
        entities,
        Order.mapInput(Num.Order, (e: Entities.Entity.Model) => -(scores[e.id] ?? 0))
      );

      const scoreMap = MutableHashMap.fromIterable(Struct.entries(scores));
      const { context, entityCount, relationCount } = truncateToTokenBudget(sortedEntities, relations, maxTokens);

      return new GraphRAGResult({
        entities: sortedEntities,
        relations,
        scores,
        context: includeScores ? formatContextWithScores(sortedEntities, relations, scoreMap) : context,
        stats: GraphRagResultStats.make({
          seedEntityCount: A.length(seedEntityIds),
          totalEntityCount: A.length(entities),
          totalRelationCount: A.length(relations),
          hopsTraversed: hops,
          estimatedTokens: Math.ceil(Str.length(context) / 4),
          truncated: entityCount < A.length(sortedEntities) || relationCount < A.length(relations),
        }),
      });
    }).pipe(
      Effect.withSpan("GraphRAGService.queryFromSeeds", {
        captureStackTrace: false,
        attributes: { seedCount: A.length(seedEntityIds), hops, organizationId },
      })
    );

  const questionToSparql = (
    question: string,
    schemaContext: string,
    timeoutMs = 5_000
  ): Effect.Effect<
    QueryResult.Type,
    GraphRAGError | SparqlGenerationError | SparqlSyntaxError | SparqlUnsupportedFeatureError | SparqlTimeoutError
  > =>
    Effect.gen(function* () {
      const generated = yield* sparqlGenerator.generateReadOnlyQuery(question, schemaContext);
      const query = generated.query;

      const executeReadOnlyQuery = sparqlService.query(query).pipe(
        Effect.mapError(
          (cause) =>
            new GraphRAGError({
              message: "Failed to execute generated SPARQL query",
              cause: String(cause),
            })
        )
      );

      return yield* executeReadOnlyQuery.pipe(
        Effect.timeoutFail({
          duration: Duration.millis(timeoutMs),
          onTimeout: () =>
            new SparqlTimeoutError({
              query,
              timeoutMs,
              message: `SPARQL execution timed out after ${timeoutMs}ms`,
            }),
        })
      );
    });

  return GraphRAGService.of({
    query,
    queryFromSeeds,
    questionToSparql,
  });
});

const traverseGraph = (
  seedIds: ReadonlyArray<KnowledgeEntityIds.KnowledgeEntityId.Type>,
  maxHops: number,
  organizationId: SharedEntityIds.OrganizationId.Type,
  relationRepo: Context.Tag.Service<RelationRepo>
): Effect.Effect<
  {
    allEntityIds: ReadonlyArray<KnowledgeEntityIds.KnowledgeEntityId.Type>;
    entityHops: MutableHashMap.MutableHashMap<KnowledgeEntityIds.KnowledgeEntityId.Type, number>;
  },
  DatabaseError
> =>
  Effect.gen(function* () {
    const visited = MutableHashSet.empty<string>();
    const entityHops = MutableHashMap.empty<KnowledgeEntityIds.KnowledgeEntityId.Type, number>();

    let frontier: Array<KnowledgeEntityIds.KnowledgeEntityId.Type> = [...seedIds];
    for (const id of seedIds) {
      MutableHashSet.add(visited, id);
      MutableHashMap.set(entityHops, id, 0);
    }

    for (let hop = 1; hop <= maxHops && A.isNonEmptyReadonlyArray(frontier); hop++) {
      const relations = yield* relationRepo.findBySourceIds(frontier, organizationId);
      const incomingRelations = yield* relationRepo.findByTargetIds(frontier, organizationId);

      const newFrontier = A.empty<KnowledgeEntityIds.KnowledgeEntityId.Type>();

      for (const rel of relations) {
        const objectIdOpt = rel.objectId;
        if (O.isSome(objectIdOpt)) {
          const objectId = objectIdOpt.value;
          if (!MutableHashSet.has(visited, objectId)) {
            MutableHashSet.add(visited, objectId);
            MutableHashMap.set(entityHops, objectId, hop);
            newFrontier.push(objectId);
          }
        }
      }

      for (const rel of incomingRelations) {
        if (!MutableHashSet.has(visited, rel.subjectId)) {
          MutableHashSet.add(visited, rel.subjectId);
          MutableHashMap.set(entityHops, rel.subjectId, hop);
          newFrontier.push(rel.subjectId);
        }
      }

      frontier = newFrontier;
    }

    const allEntityIds = A.empty<KnowledgeEntityIds.KnowledgeEntityId.Type>();
    MutableHashMap.forEach(entityHops, (_, id) => {
      allEntityIds.push(id);
    });

    return {
      allEntityIds,
      entityHops,
    };
  });

export const GraphRAGServiceLive = Layer.effect(GraphRAGService, serviceEffect).pipe(
  Layer.provide(EntityRepoLive),
  Layer.provide(RelationRepoLive),
  Layer.provide(SparqlServiceLive),
  Layer.provide(SparqlGeneratorLive)
);
