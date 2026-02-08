import { $KnowledgeServerId } from "@beep/identity/packages";
import type { CircuitOpenError, RateLimitError } from "@beep/knowledge-domain/errors";
import type { EmbeddingError } from "@beep/knowledge-server/Embedding";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import { AuthContext } from "@beep/shared-domain/Policy";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as MutableHashMap from "effect/MutableHashMap";
import * as MutableHashSet from "effect/MutableHashSet";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as S from "effect/Schema";
import { EmbeddingService, EmbeddingServiceLive } from "../Embedding/EmbeddingService";
import { type AssembledEntity, KnowledgeGraph } from "../Extraction/GraphAssembler";
import { formatEntityForEmbedding } from "../utils/formatting";
import { cosineSimilarity } from "../utils/vector";

const $I = $KnowledgeServerId.create("EntityResolution/EntityClusterer");

type AssembledEntityModel = S.Schema.Type<typeof AssembledEntity>;
const KnowledgeGraphSchema = S.typeSchema(KnowledgeGraph);
type KnowledgeGraphModel = S.Schema.Type<typeof KnowledgeGraphSchema>;

export class ClusterConfig extends S.Class<ClusterConfig>($I`ClusterConfig`)(
  {
    similarityThreshold: S.optional(S.Number),
    maxClusterSize: S.optional(S.Number),
    requireTypeCompatibility: S.optional(S.Boolean),
  },
  $I.annotations("ClusterConfig", {
    description: "Cluster configuration",
  })
) {}

export class EntityCluster extends S.Class<EntityCluster>($I`EntityCluster`)(
  {
    id: S.String,
    canonicalEntityId: S.String,
    memberIds: S.Array(S.String),
    cohesion: S.Number,
    sharedTypes: S.Array(S.String),
  },
  $I.annotations("EntityCluster", {
    description: "A cluster of similar entities",
  })
) {}

export class EntitySimilarity extends S.Class<EntitySimilarity>($I`EntitySimilarity`)(
  {
    entityA: S.String,
    entityB: S.String,
    similarity: S.Number,
  },
  $I.annotations("EntitySimilarity", {
    description: "Similarity between two entities",
  })
) {}

const hasTypeOverlap = (entityA: AssembledEntityModel, entityB: AssembledEntityModel): boolean => {
  const typesA = MutableHashSet.fromIterable(entityA.types);
  return A.some(entityB.types, (t) => MutableHashSet.has(typesA, t));
};

const findSharedTypes = (entities: readonly AssembledEntityModel[]): readonly string[] => {
  if (A.isEmptyReadonlyArray(entities)) return [];

  return A.match(entities, {
    onEmpty: A.empty<string>,
    onNonEmpty: (nonEmpty) => {
      const first = A.headNonEmpty(nonEmpty);
      const sharedSet = MutableHashSet.fromIterable(first.types);

      A.forEach(A.tailNonEmpty(nonEmpty), (entity) => {
        const entityTypes = MutableHashSet.fromIterable(entity.types);
        const toRemove = A.filter(A.fromIterable(sharedSet), (type) => !MutableHashSet.has(entityTypes, type));
        A.forEach(toRemove, (type) => MutableHashSet.remove(sharedSet, type));
      });

      return A.fromIterable(sharedSet);
    },
  });
};

export interface EntityClustererShape {
  readonly findSimilar: (
    queryEntity: AssembledEntityModel,
    candidateEntities: readonly AssembledEntityModel[],
    ontologyId: KnowledgeEntityIds.OntologyId.Type,
    threshold?: undefined | number
  ) => Effect.Effect<
    {
      readonly entity: AssembledEntityModel;
      readonly similarity: number;
    }[],
    EmbeddingError | RateLimitError | CircuitOpenError,
    never
  >;
  readonly cluster: (
    graphs: readonly KnowledgeGraphModel[],
    ontologyId: KnowledgeEntityIds.OntologyId.Type,
    config?: ClusterConfig | undefined
  ) => Effect.Effect<readonly EntityCluster[], never, never>;
}

export class EntityClusterer extends Context.Tag($I`EntityClusterer`)<EntityClusterer, EntityClustererShape>() {}

const serviceEffect: Effect.Effect<EntityClustererShape, EmbeddingError, EmbeddingService | AuthContext> = Effect.gen(
  function* () {
    const embeddingService = yield* EmbeddingService;
    const authCtx = yield* AuthContext;

    const organizationId = authCtx.session.activeOrganizationId;

    const computeSimilarities = (
      entities: readonly AssembledEntityModel[],
      embeddings: MutableHashMap.MutableHashMap<string, readonly number[]>,
      threshold: number,
      requireTypeCompatibility: boolean
    ): readonly EntitySimilarity[] => {
      const similarities = A.empty<EntitySimilarity>();

      for (let i = 0; i < A.length(entities); i++) {
        const entityA = entities[i];
        if (!entityA) continue;

        const embeddingAOpt = MutableHashMap.get(embeddings, entityA.id);
        if (O.isNone(embeddingAOpt)) continue;
        const embeddingA = embeddingAOpt.value;

        for (let j = i + 1; j < A.length(entities); j++) {
          const entityB = entities[j];
          if (!entityB) continue;

          if (requireTypeCompatibility && !hasTypeOverlap(entityA, entityB)) {
            continue;
          }

          const embeddingBOpt = MutableHashMap.get(embeddings, entityB.id);
          if (O.isNone(embeddingBOpt)) continue;
          const embeddingB = embeddingBOpt.value;

          const similarity = cosineSimilarity(embeddingA, embeddingB);

          if (similarity >= threshold) {
            similarities.push({
              entityA: entityA.id,
              entityB: entityB.id,
              similarity,
            });
          }
        }
      }

      return similarities;
    };

    const agglomerativeClustering = (
      entities: readonly AssembledEntityModel[],
      similarities: readonly EntitySimilarity[],
      maxClusterSize: number
    ): readonly EntityCluster[] => {
      const parent = MutableHashMap.empty<string, string>();
      const rank = MutableHashMap.empty<string, number>();

      A.forEach(entities, (entity) => {
        MutableHashMap.set(parent, entity.id, entity.id);
        MutableHashMap.set(rank, entity.id, 0);
      });

      const find = (x: string): string => {
        const pOpt = MutableHashMap.get(parent, x);
        if (O.isNone(pOpt)) return x;
        const p = pOpt.value;
        if (p !== x) {
          const root = find(p);
          MutableHashMap.set(parent, x, root);
          return root;
        }
        return x;
      };

      const union = (x: string, y: string): void => {
        const rootX = find(x);
        const rootY = find(y);

        if (rootX === rootY) return;

        const rankX = O.getOrElse(MutableHashMap.get(rank, rootX), () => 0);
        const rankY = O.getOrElse(MutableHashMap.get(rank, rootY), () => 0);

        if (rankX < rankY) {
          MutableHashMap.set(parent, rootX, rootY);
        } else if (rankX > rankY) {
          MutableHashMap.set(parent, rootY, rootX);
        } else {
          MutableHashMap.set(parent, rootY, rootX);
          MutableHashMap.set(rank, rootX, rankX + 1);
        }
      };

      const sortedSimilarities = A.sort(
        similarities,
        Order.reverse(Order.mapInput(Order.number, (s: EntitySimilarity) => s.similarity))
      );

      const clusterSizes = MutableHashMap.empty<string, number>();
      A.forEach(entities, (entity) => {
        MutableHashMap.set(clusterSizes, entity.id, 1);
      });

      A.forEach(sortedSimilarities, (sim) => {
        const rootA = find(sim.entityA);
        const rootB = find(sim.entityB);

        if (rootA === rootB) return;

        const sizeA = O.getOrElse(MutableHashMap.get(clusterSizes, rootA), () => 1);
        const sizeB = O.getOrElse(MutableHashMap.get(clusterSizes, rootB), () => 1);

        if (sizeA + sizeB > maxClusterSize) return;

        union(sim.entityA, sim.entityB);

        const newRoot = find(sim.entityA);
        MutableHashMap.set(clusterSizes, newRoot, sizeA + sizeB);
      });

      const clusterMap = MutableHashMap.empty<string, string[]>();
      A.forEach(entities, (entity) => {
        const root = find(entity.id);
        const cluster = O.getOrElse(MutableHashMap.get(clusterMap, root), () => [] as string[]);
        cluster.push(entity.id);
        MutableHashMap.set(clusterMap, root, cluster);
      });

      const entityById = MutableHashMap.empty<string, AssembledEntityModel>();
      A.forEach(entities, (entity) => {
        MutableHashMap.set(entityById, entity.id, entity);
      });

      const clusters = A.empty<EntityCluster>();

      MutableHashMap.forEach(clusterMap, (memberIds, _root) => {
        const members = A.filterMap(memberIds, (id) => MutableHashMap.get(entityById, id));

        if (A.isEmptyReadonlyArray(members)) return;

        let cohesion = 1.0;
        if (A.length(members) > 1) {
          let totalSimilarity = 0;
          let pairCount = 0;

          A.forEach(similarities, (sim) => {
            const rootA = find(sim.entityA);
            const rootB = find(sim.entityB);
            if (rootA === rootB && A.contains(memberIds, sim.entityA) && A.contains(memberIds, sim.entityB)) {
              totalSimilarity += sim.similarity;
              pairCount++;
            }
          });

          cohesion = pairCount > 0 ? totalSimilarity / pairCount : 0.5;
        }

        const sharedTypes = findSharedTypes(members);

        const canonical = A.head(members);
        if (O.isNone(canonical)) return;

        clusters.push({
          id: KnowledgeEntityIds.EntityClusterId.create(),
          canonicalEntityId: canonical.value.id,
          memberIds,
          cohesion,
          sharedTypes,
        });
      });

      return clusters;
    };

    const findSimilar = Effect.fn(function* (
      queryEntity: AssembledEntityModel,
      candidateEntities: readonly AssembledEntityModel[],
      ontologyId: string,
      threshold = 0.8
    ) {
      const queryText = formatEntityForEmbedding(queryEntity);
      const queryEmbedding = yield* embeddingService.getOrCreate(queryText, "search_query", organizationId, ontologyId);

      const results: Array<{ readonly entity: AssembledEntityModel; readonly similarity: number }> = [];

      for (const candidate of candidateEntities) {
        if (candidate.id === queryEntity.id) continue;

        const candidateText = formatEntityForEmbedding(candidate);
        const candidateEmbedding = yield* embeddingService
          .getOrCreate(candidateText, "search_document", organizationId, ontologyId)
          .pipe(Effect.catchAll(() => Effect.succeed(A.empty<number>())));

        if (A.isEmptyReadonlyArray(candidateEmbedding)) continue;

        const similarity = cosineSimilarity(queryEmbedding, candidateEmbedding);

        if (similarity >= threshold) {
          results.push({ entity: candidate, similarity });
        }
      }

      return A.sort(
        results,
        Order.reverse(
          Order.mapInput(
            Order.number,
            (r: { readonly entity: AssembledEntityModel; readonly similarity: number }) => r.similarity
          )
        )
      );
    });
    const cluster = Effect.fn(
      function* (graphs: readonly KnowledgeGraphModel[], ontologyId: string, config: ClusterConfig = {}) {
        const threshold = config.similarityThreshold ?? 0.85;
        const maxClusterSize = config.maxClusterSize ?? 50;
        const requireTypeCompatibility = config.requireTypeCompatibility ?? true;

        const allEntities = A.flatMap(graphs, (graph) => graph.entities);

        if (A.isEmptyReadonlyArray(allEntities)) {
          yield* Effect.logDebug("EntityClusterer.cluster: no entities to cluster");
          return A.empty<EntityCluster>();
        }

        yield* Effect.logInfo("EntityClusterer.cluster: starting").pipe(
          Effect.annotateLogs({
            entityCount: A.length(allEntities),
            threshold,
            maxClusterSize,
            requireTypeCompatibility,
          })
        );

        const embeddings = MutableHashMap.empty<string, readonly number[]>();

        for (const entity of allEntities) {
          const text = formatEntityForEmbedding(entity);
          const embedding = yield* embeddingService
            .getOrCreate(text, "clustering", organizationId, ontologyId)
            .pipe(Effect.catchAll(() => Effect.succeed(A.empty<number>())));

          if (A.isNonEmptyReadonlyArray(embedding)) {
            MutableHashMap.set(embeddings, entity.id, embedding);
          }
        }

        yield* Effect.logDebug("EntityClusterer.cluster: embeddings generated").pipe(
          Effect.annotateLogs({
            embeddedCount: MutableHashMap.size(embeddings),
          })
        );

        const similarities = computeSimilarities(allEntities, embeddings, threshold, requireTypeCompatibility);

        yield* Effect.logDebug("EntityClusterer.cluster: similarities computed").pipe(
          Effect.annotateLogs({
            pairCount: A.length(similarities),
          })
        );

        const clusters = agglomerativeClustering(allEntities, similarities, maxClusterSize);

        yield* Effect.logInfo("EntityClusterer.cluster: complete").pipe(
          Effect.annotateLogs({
            clusterCount: A.length(clusters),
            singletonCount: A.length(A.filter(clusters, (c) => A.length(c.memberIds) === 1)),
            multiMemberCount: A.length(A.filter(clusters, (c) => A.length(c.memberIds) > 1)),
          })
        );

        return clusters;
      },
      (effect, graphs, _organizationId, _ontologyId, config: ClusterConfig = {}) =>
        effect.pipe(
          Effect.withSpan("EntityClusterer.cluster", {
            captureStackTrace: false,
            attributes: {
              graphCount: A.length(graphs),
              threshold: config.similarityThreshold ?? 0.85,
            },
          })
        )
    );

    return EntityClusterer.of({
      cluster,
      findSimilar,
    });
  }
);

export const EntityClustererLive = Layer.effect(EntityClusterer, serviceEffect).pipe(
  Layer.provide(EmbeddingServiceLive)
);
