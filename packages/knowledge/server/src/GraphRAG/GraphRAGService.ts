/**
 * GraphRAG Service
 *
 * Retrieval-Augmented Generation using knowledge graph traversal.
 * Combines embedding similarity search with graph structure exploration.
 *
 * @module knowledge-server/GraphRAG/GraphRAGService
 * @since 0.1.0
 */
import { $KnowledgeServerId } from "@beep/identity/packages";
import { Entities } from "@beep/knowledge-domain";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, type SharedEntityIds } from "@beep/shared-domain";
import type { DatabaseError } from "@beep/shared-domain/errors";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as MutableHashMap from "effect/MutableHashMap";
import * as MutableHashSet from "effect/MutableHashSet";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Struct from "effect/Struct";
import { EntityRepo } from "../db/repos/Entity.repo";
import { RelationRepo } from "../db/repos/Relation.repo";
import { type EmbeddingError, EmbeddingService } from "../Embedding";
import { formatContextWithScores, truncateToTokenBudget } from "./ContextFormatter";
import { assignGraphRanks, fuseRankings } from "./RrfScorer";

const $I = $KnowledgeServerId.create("GraphRAG/GraphRAGService");

// =============================================================================
// Input/Output Schemas
// =============================================================================

/**
 * Entity type filter options
 *
 * @since 0.1.0
 * @category schemas
 */
export class EntityFilters extends S.Class<EntityFilters>("EntityFilters")({
  /**
   * Filter by ontology type IRIs (entities must have at least one of these types)
   */
  typeIris: S.optional(S.Array(S.String)),

  /**
   * Filter by minimum grounding confidence
   */
  minConfidence: S.optional(S.Number.pipe(S.greaterThanOrEqualTo(0), S.lessThanOrEqualTo(1))),

  /**
   * Filter by ontology ID
   */
  ontologyId: S.optional(S.String),
}) {}

/**
 * GraphRAG query input
 *
 * @since 0.1.0
 * @category schemas
 */
export class GraphRAGQuery extends S.Class<GraphRAGQuery>("GraphRAGQuery")({
  /**
   * Natural language query to search for
   */
  query: S.String.pipe(S.minLength(1)),

  /**
   * Number of seed entities from k-NN search (default 10)
   */
  topK: BS.toOptionalWithDefault(S.Number.pipe(S.greaterThan(0), S.lessThanOrEqualTo(50)))(10),

  /**
   * Number of hops for graph traversal (default 1, max 3)
   */
  hops: BS.toOptionalWithDefault(S.Number.pipe(S.greaterThanOrEqualTo(0), S.lessThanOrEqualTo(3)))(1),

  /**
   * Optional entity type filters
   */
  filters: S.optional(EntityFilters),

  /**
   * Maximum token budget for context (default 4000)
   */
  maxTokens: BS.toOptionalWithDefault(S.Number.pipe(S.greaterThan(0)))(4000),

  /**
   * Minimum similarity threshold for k-NN (default 0.5)
   */
  similarityThreshold: BS.toOptionalWithDefault(S.Number.pipe(S.greaterThanOrEqualTo(0), S.lessThanOrEqualTo(1)))(0.5),

  /**
   * Include scores in output for debugging
   */
  includeScores: BS.toOptionalWithDefault(S.Boolean)(false),
}) {}

/**
 * GraphRAG query result
 *
 * @since 0.1.0
 * @category schemas
 */
export class GraphRAGResult extends S.Class<GraphRAGResult>("GraphRAGResult")({
  /**
   * Retrieved entities
   */
  entities: S.Array(Entities.Entity.Model), // Entities.Entity.Model not directly usable as schema

  /**
   * Retrieved relations
   */
  relations: S.Array(Entities.Relation.Model), // Entities.Relation.Model not directly usable as schema

  /**
   * Entity relevance scores (id -> score)
   */
  scores: S.Record({ key: S.String, value: S.Number }),

  /**
   * Formatted context string for LLM consumption
   */
  context: S.String,

  /**
   * Statistics about the retrieval
   */
  stats: S.Struct({
    seedEntityCount: S.Number,
    totalEntityCount: S.Number,
    totalRelationCount: S.Number,
    hopsTraversed: S.Number,
    estimatedTokens: S.Number,
    truncated: S.Boolean,
  }),
}) {}

// =============================================================================
// Error Types
// =============================================================================

/**
 * GraphRAG error
 *
 * @since 0.1.0
 * @category errors
 */
export class GraphRAGError extends S.TaggedError<GraphRAGError>()("GraphRAGError", {
  message: S.String,
  cause: S.optional(S.String),
}) {}

// =============================================================================
// Service Implementation
// =============================================================================

/**
 * GraphRAGService - Knowledge graph retrieval for RAG
 *
 * Provides subgraph retrieval combining:
 * 1. k-NN embedding search for initial seed entities
 * 2. N-hop graph traversal to explore connected entities
 * 3. RRF scoring to rank by combined relevance
 * 4. Context formatting for LLM consumption
 *
 * @example
 * ```ts
 * import { GraphRAGService, GraphRAGQuery } from "@beep/knowledge-server/GraphRAG";
 * import * as Effect from "effect/Effect";
 *
 * const program = Effect.gen(function* () {
 *   const graphrag = yield* GraphRAGService;
 *
 *   const result = yield* graphrag.query(
 *     new GraphRAGQuery({
 *       query: "Who are the key investors in AI startups?",
 *       topK: 10,
 *       hops: 2,
 *     }),
 *     organizationId,
 *     "my-ontology"
 *   );
 *
 *   console.log(result.context); // Formatted for LLM
 * });
 * ```
 *
 * @since 0.1.0
 * @category services
 */
export class GraphRAGService extends Effect.Service<GraphRAGService>()($I`GraphRAGService`, {
  accessors: true,
  effect: Effect.gen(function* () {
    const embeddingService = yield* EmbeddingService;
    const entityRepo = yield* EntityRepo;
    const relationRepo = yield* RelationRepo;

    /**
     * Retrieve subgraph via k-NN + N-hop traversal
     */
    const query = (
      input: GraphRAGQuery,
      organizationId: SharedEntityIds.OrganizationId.Type,
      ontologyId: string
    ): Effect.Effect<GraphRAGResult, GraphRAGError | EmbeddingError | DatabaseError> =>
      Effect.gen(function* () {
        yield* Effect.logInfo("GraphRAGService.query: starting", {
          queryLength: input.query.length,
          topK: input.topK,
          hops: input.hops,
        });

        // 1. Embed query
        const queryVector = yield* embeddingService.embed(input.query, "search_query", organizationId, ontologyId);

        // 2. k-NN search for seed entities
        const similarResults = yield* embeddingService.findSimilar(
          queryVector,
          organizationId,
          input.topK,
          input.similarityThreshold
        );

        yield* Effect.logDebug("GraphRAGService.query: k-NN results", {
          count: similarResults.length,
        });

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

        // Extract entity IDs from embeddings
        // Embeddings store entityId field that maps to the entity
        const seedEntityIds = A.filterMap(similarResults, (r) => {
          // Embedding entityId should be a knowledge_entity__ ID
          if (KnowledgeEntityIds.KnowledgeEntityId.is(r.entityId)) {
            return O.some(r.entityId);
          }
          return O.none();
        });

        // Build embedding similarity ranks (1-indexed)
        const embeddingRanks = A.map(seedEntityIds, (id) => id);

        // 3. N-hop traversal
        const { allEntityIds, entityHops } = yield* traverseGraph(
          seedEntityIds,
          input.hops,
          organizationId,
          relationRepo
        );

        yield* Effect.logDebug("GraphRAGService.query: traversal complete", {
          seedCount: seedEntityIds.length,
          totalEntities: allEntityIds.length,
        });

        // 4. Fetch all entities
        const entities = yield* entityRepo.findByIds(allEntityIds, organizationId);

        // 5. Fetch all relations between discovered entities
        const relations = yield* relationRepo.findByEntityIds(allEntityIds, organizationId);

        // 6. RRF scoring
        const graphRanks = assignGraphRanks(entityHops);
        const graphRankList = A.empty<string>();
        MutableHashMap.forEach(graphRanks, (_, id) => {
          graphRankList.push(id);
        });

        const fusedRanking = fuseRankings([embeddingRanks, graphRankList]);

        // Build score map
        const scores = R.empty<string, number>();
        for (const item of fusedRanking) {
          scores[item.id] = item.score;
        }

        // 7. Sort entities by RRF score (descending)
        const sortedEntities = A.sort(
          entities,
          Order.mapInput(Num.Order, (e: Entities.Entity.Model) => -(scores[e.id] ?? 0))
        );

        // 8. Format context
        const scoreMap = MutableHashMap.fromIterable(Struct.entries(scores));
        const { context, entityCount, relationCount } = truncateToTokenBudget(
          sortedEntities,
          relations,
          input.maxTokens ?? 4000
        );

        const truncated = entityCount < sortedEntities.length || relationCount < relations.length;

        const result = new GraphRAGResult({
          entities: sortedEntities,
          relations,
          scores,
          context: input.includeScores ? formatContextWithScores(sortedEntities, relations, scoreMap) : context,
          stats: {
            seedEntityCount: seedEntityIds.length,
            totalEntityCount: entities.length,
            totalRelationCount: relations.length,
            hopsTraversed: input.hops ?? 1,
            estimatedTokens: Math.ceil(context.length / 4),
            truncated,
          },
        });

        yield* Effect.logInfo("GraphRAGService.query: complete", result.stats);

        return result;
      }).pipe(
        Effect.withSpan("GraphRAGService.query", {
          captureStackTrace: false,
          attributes: { topK: input.topK, hops: input.hops, organizationId, ontologyId },
        })
      );

    /**
     * Query with pre-computed seed entity IDs (skip embedding search)
     *
     * Useful when you already know the starting entities.
     */
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

        // N-hop traversal
        const { allEntityIds, entityHops } = yield* traverseGraph(seedEntityIds, hops, organizationId, relationRepo);

        // Fetch entities and relations
        const entities = yield* entityRepo.findByIds(allEntityIds, organizationId);
        const relations = yield* relationRepo.findByEntityIds(allEntityIds, organizationId);

        // Score by graph distance only (no embedding ranking)
        const graphRanks = assignGraphRanks(entityHops);
        const scores = R.empty<string, number>();
        MutableHashMap.forEach(graphRanks, (rank, id) => {
          scores[id] = 1 / (60 + rank); // Simple RRF from graph rank
        });

        // Sort and format (descending by score)
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
          stats: {
            seedEntityCount: seedEntityIds.length,
            totalEntityCount: entities.length,
            totalRelationCount: relations.length,
            hopsTraversed: hops,
            estimatedTokens: Math.ceil(context.length / 4),
            truncated: entityCount < sortedEntities.length || relationCount < relations.length,
          },
        });
      }).pipe(
        Effect.withSpan("GraphRAGService.queryFromSeeds", {
          captureStackTrace: false,
          attributes: { seedCount: seedEntityIds.length, hops, organizationId },
        })
      );

    return {
      query,
      queryFromSeeds,
    };
  }),
}) {}

// =============================================================================
// Internal Utilities
// =============================================================================

/**
 * Traverse graph N hops from seed entities
 *
 * Returns all discovered entity IDs and their hop distances.
 */
const traverseGraph = (
  seedIds: ReadonlyArray<KnowledgeEntityIds.KnowledgeEntityId.Type>,
  maxHops: number,
  organizationId: SharedEntityIds.OrganizationId.Type,
  relationRepo: RelationRepo
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

    // Initialize with seeds at hop 0
    let frontier: Array<KnowledgeEntityIds.KnowledgeEntityId.Type> = [...seedIds];
    for (const id of seedIds) {
      MutableHashSet.add(visited, id);
      MutableHashMap.set(entityHops, id, 0);
    }

    // BFS traversal
    for (let hop = 1; hop <= maxHops && A.isNonEmptyReadonlyArray(frontier); hop++) {
      // Get outgoing relations from frontier
      const relations = yield* relationRepo.findBySourceIds(frontier, organizationId);

      // Also get incoming relations (bidirectional traversal)
      const incomingRelations = yield* relationRepo.findByTargetIds(frontier, organizationId);

      // Collect new entity IDs
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

    // Collect all entity IDs from the entityHops map
    const allEntityIds = A.empty<KnowledgeEntityIds.KnowledgeEntityId.Type>();
    MutableHashMap.forEach(entityHops, (_, id) => {
      allEntityIds.push(id);
    });

    return {
      allEntityIds,
      entityHops,
    };
  });

/**
 * GraphRAGService live layer with dependencies
 *
 * @since 0.1.0
 * @category layers
 */
export const GraphRAGServiceLive = GraphRAGService.Default.pipe(
  Layer.provide(EntityRepo.Default),
  Layer.provide(RelationRepo.Default)
);
