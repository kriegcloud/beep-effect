/**
 * EntityClusterer - Similarity-based entity clustering
 *
 * Groups similar entities using embedding similarity for entity resolution.
 *
 * @module knowledge-server/EntityResolution/EntityClusterer
 * @since 0.1.0
 */
import { $KnowledgeServerId } from "@beep/identity/packages";
import { KnowledgeEntityIds, type SharedEntityIds } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Iterable from "effect/Iterable";
import * as MutableHashMap from "effect/MutableHashMap";
import * as MutableHashSet from "effect/MutableHashSet";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import { EmbeddingService } from "../Embedding/EmbeddingService";
import type { AssembledEntity, KnowledgeGraph } from "../Extraction/GraphAssembler";
import { formatEntityForEmbedding } from "../utils/formatting";
import { cosineSimilarity } from "../utils/vector";

const $I = $KnowledgeServerId.create("EntityResolution/EntityClusterer");

// =============================================================================
// Configuration Types
// =============================================================================

/**
 * Configuration for entity clustering
 *
 * @since 0.1.0
 * @category config
 */
export interface ClusterConfig {
  /**
   * Minimum similarity to consider entities as potential matches
   * @default 0.85
   */
  readonly similarityThreshold?: undefined | number;

  /**
   * Maximum cluster size before splitting
   * @default 50
   */
  readonly maxClusterSize?: undefined | number;

  /**
   * Whether to use type compatibility as constraint
   * @default true
   */
  readonly requireTypeCompatibility?: undefined | boolean;
}

// =============================================================================
// Result Types
// =============================================================================

/**
 * Represents a cluster of entities identified as the same real-world entity
 *
 * @since 0.1.0
 * @category types
 */
export interface EntityCluster {
  /**
   * Cluster ID
   */
  readonly id: string;

  /**
   * Canonical entity ID (selected representative)
   */
  readonly canonicalEntityId: string;

  /**
   * All member entity IDs
   */
  readonly memberIds: readonly string[];

  /**
   * Average internal similarity (cohesion)
   */
  readonly cohesion: number;

  /**
   * Shared type IRIs across all members
   */
  readonly sharedTypes: readonly string[];
}

/**
 * Pairwise similarity between two entities
 */
interface EntitySimilarity {
  readonly entityA: string;
  readonly entityB: string;
  readonly similarity: number;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Check if two entities have compatible types
 */
const hasTypeOverlap = (entityA: AssembledEntity, entityB: AssembledEntity): boolean => {
  const typesA = MutableHashSet.fromIterable(entityA.types);
  return A.some(entityB.types, (t) => MutableHashSet.has(typesA, t));
};

/**
 * Find shared types between entities
 */
const findSharedTypes = (entities: readonly AssembledEntity[]): readonly string[] => {
  if (A.isEmptyReadonlyArray(entities)) return [];
  if (entities.length === 1) return entities[0]?.types ?? [];

  const firstEntity = entities[0];
  if (!firstEntity) return [];

  const sharedSet = MutableHashSet.fromIterable(firstEntity.types);

  for (let i = 1; i < entities.length; i++) {
    const entity = entities[i];
    if (!entity) continue;

    const entityTypes = MutableHashSet.fromIterable(entity.types);
    const toRemove = A.empty<string>();
    Iterable.forEach(sharedSet, (type) => {
      if (!MutableHashSet.has(entityTypes, type)) {
        toRemove.push(type);
      }
    });
    for (const type of toRemove) {
      MutableHashSet.remove(sharedSet, type);
    }
  }

  return A.fromIterable(sharedSet);
};

// =============================================================================
// Service Implementation
// =============================================================================

/**
 * EntityClusterer Service
 *
 * Clusters entities based on embedding similarity for entity resolution.
 * Uses agglomerative clustering with configurable similarity threshold.
 *
 * @example
 * ```ts
 * import { EntityClusterer } from "@beep/knowledge-server/EntityResolution";
 * import * as Effect from "effect/Effect";
 *
 * const program = Effect.gen(function* () {
 *   const clusterer = yield* EntityClusterer;
 *   const clusters = yield* clusterer.cluster(
 *     graphs,
 *     organizationId,
 *     ontologyId,
 *     { similarityThreshold: 0.85 }
 *   );
 *
 *   console.log(`Found ${clusters.length} clusters`);
 * });
 * ```
 *
 * @since 0.1.0
 * @category services
 */
export class EntityClusterer extends Effect.Service<EntityClusterer>()($I`EntityClusterer`, {
  accessors: true,
  effect: Effect.gen(function* () {
    const embeddingService = yield* EmbeddingService;

    /**
     * Compute similarity matrix for entities
     */
    const computeSimilarities = (
      entities: readonly AssembledEntity[],
      embeddings: MutableHashMap.MutableHashMap<string, readonly number[]>,
      threshold: number,
      requireTypeCompatibility: boolean
    ): readonly EntitySimilarity[] => {
      const similarities = A.empty<EntitySimilarity>();

      for (let i = 0; i < entities.length; i++) {
        const entityA = entities[i];
        if (!entityA) continue;

        const embeddingAOpt = MutableHashMap.get(embeddings, entityA.id);
        if (O.isNone(embeddingAOpt)) continue;
        const embeddingA = embeddingAOpt.value;

        for (let j = i + 1; j < entities.length; j++) {
          const entityB = entities[j];
          if (!entityB) continue;

          // Check type compatibility if required
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

    /**
     * Perform agglomerative clustering using union-find
     */
    const agglomerativeClustering = (
      entities: readonly AssembledEntity[],
      similarities: readonly EntitySimilarity[],
      maxClusterSize: number
    ): readonly EntityCluster[] => {
      // Initialize union-find structure
      const parent = MutableHashMap.empty<string, string>();
      const rank = MutableHashMap.empty<string, number>();

      for (const entity of entities) {
        MutableHashMap.set(parent, entity.id, entity.id);
        MutableHashMap.set(rank, entity.id, 0);
      }

      // Find with path compression
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

      // Union by rank
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

      // Sort similarities by descending similarity
      const sortedSimilarities = A.sort(
        similarities,
        Order.reverse(Order.mapInput(Order.number, (s: EntitySimilarity) => s.similarity))
      );

      // Track cluster sizes
      const clusterSizes = MutableHashMap.empty<string, number>();
      for (const entity of entities) {
        MutableHashMap.set(clusterSizes, entity.id, 1);
      }

      // Merge similar entities
      for (const sim of sortedSimilarities) {
        const rootA = find(sim.entityA);
        const rootB = find(sim.entityB);

        if (rootA === rootB) continue;

        const sizeA = O.getOrElse(MutableHashMap.get(clusterSizes, rootA), () => 1);
        const sizeB = O.getOrElse(MutableHashMap.get(clusterSizes, rootB), () => 1);

        // Check cluster size constraint
        if (sizeA + sizeB > maxClusterSize) continue;

        union(sim.entityA, sim.entityB);

        // Update cluster size
        const newRoot = find(sim.entityA);
        MutableHashMap.set(clusterSizes, newRoot, sizeA + sizeB);
      }

      // Build clusters from union-find
      const clusterMap = MutableHashMap.empty<string, string[]>();
      for (const entity of entities) {
        const root = find(entity.id);
        const cluster = O.getOrElse(MutableHashMap.get(clusterMap, root), () => [] as string[]);
        cluster.push(entity.id);
        MutableHashMap.set(clusterMap, root, cluster);
      }

      // Create entity lookup
      const entityById = MutableHashMap.empty<string, AssembledEntity>();
      for (const entity of entities) {
        MutableHashMap.set(entityById, entity.id, entity);
      }

      // Convert to EntityCluster format
      const clusters: EntityCluster[] = [];

      MutableHashMap.forEach(clusterMap, (memberIds, _root) => {
        const members = A.filterMap(memberIds, (id) => MutableHashMap.get(entityById, id));

        if (A.isEmptyReadonlyArray(members)) return;

        // Compute cohesion (average pairwise similarity within cluster)
        let cohesion = 1.0;
        if (members.length > 1) {
          let totalSimilarity = 0;
          let pairCount = 0;

          for (const sim of similarities) {
            const rootA = find(sim.entityA);
            const rootB = find(sim.entityB);
            if (rootA === rootB && A.contains(memberIds, sim.entityA) && A.contains(memberIds, sim.entityB)) {
              totalSimilarity += sim.similarity;
              pairCount++;
            }
          }

          cohesion = pairCount > 0 ? totalSimilarity / pairCount : 0.5;
        }

        // Find shared types
        const sharedTypes = findSharedTypes(members);

        // Select first member as initial canonical (will be refined by CanonicalSelector)
        const canonical = members[0];
        if (!canonical) return;

        clusters.push({
          id: KnowledgeEntityIds.EntityClusterId.create(),
          canonicalEntityId: canonical.id,
          memberIds,
          cohesion,
          sharedTypes,
        });
      });

      return clusters;
    };

    return {
      /**
       * Cluster entities by embedding similarity
       *
       * @param graphs - Knowledge graphs containing entities to cluster
       * @param organizationId - Organization ID for embedding lookup
       * @param ontologyId - Ontology ID for embedding lookup
       * @param config - Clustering configuration
       * @returns Array of entity clusters
       */
      cluster: Effect.fn(
        (
          graphs: readonly KnowledgeGraph[],
          organizationId: SharedEntityIds.OrganizationId.Type,
          ontologyId: string,
          config: ClusterConfig = {}
        ) =>
          Effect.gen(function* () {
          const threshold = config.similarityThreshold ?? 0.85;
          const maxClusterSize = config.maxClusterSize ?? 50;
          const requireTypeCompatibility = config.requireTypeCompatibility ?? true;

          // Collect all entities
          const allEntities: AssembledEntity[] = [];
          for (const graph of graphs) {
            for (const entity of graph.entities) {
              allEntities.push(entity);
            }
          }

          if (A.isEmptyReadonlyArray(allEntities)) {
            yield* Effect.logDebug("EntityClusterer.cluster: no entities to cluster");
            return [];
          }

          yield* Effect.logInfo("EntityClusterer.cluster: starting", {
            entityCount: allEntities.length,
            threshold,
            maxClusterSize,
            requireTypeCompatibility,
          });

          // Generate embeddings for all entities
          const embeddings = MutableHashMap.empty<string, readonly number[]>();

          for (const entity of allEntities) {
            const text = formatEntityForEmbedding(entity);
            const embedding = yield* embeddingService
              .getOrCreate(text, "clustering", organizationId, ontologyId)
              .pipe(Effect.catchAll(() => Effect.succeed([] as readonly number[])));

            if (A.isNonEmptyReadonlyArray(embedding)) {
              MutableHashMap.set(embeddings, entity.id, embedding);
            }
          }

          yield* Effect.logDebug("EntityClusterer.cluster: embeddings generated", {
            embeddedCount: MutableHashMap.size(embeddings),
          });

          // Compute similarity matrix
          const similarities = computeSimilarities(allEntities, embeddings, threshold, requireTypeCompatibility);

          yield* Effect.logDebug("EntityClusterer.cluster: similarities computed", {
            pairCount: similarities.length,
          });

          // Perform clustering
          const clusters = agglomerativeClustering(allEntities, similarities, maxClusterSize);

          yield* Effect.logInfo("EntityClusterer.cluster: complete", {
            clusterCount: clusters.length,
            singletonCount: A.filter(clusters, (c) => c.memberIds.length === 1).length,
            multiMemberCount: A.filter(clusters, (c) => c.memberIds.length > 1).length,
          });

          return clusters;
        }).pipe(
          Effect.withSpan("EntityClusterer.cluster", {
            captureStackTrace: false,
            attributes: {
              graphCount: graphs.length,
              threshold: config.similarityThreshold ?? 0.85,
            },
          })
        )
      ),

      /**
       * Find entities similar to a query entity
       *
       * @param queryEntity - Entity to find similar entities for
       * @param candidateEntities - Entities to search
       * @param organizationId - Organization ID
       * @param ontologyId - Ontology ID
       * @param threshold - Minimum similarity
       * @returns Similar entities with scores
       */
      findSimilar: Effect.fn(
        (
          queryEntity: AssembledEntity,
          candidateEntities: readonly AssembledEntity[],
          organizationId: SharedEntityIds.OrganizationId.Type,
          ontologyId: string,
          threshold = 0.8
        ) =>
          Effect.gen(function* () {
          const queryText = formatEntityForEmbedding(queryEntity);
          const queryEmbedding = yield* embeddingService.getOrCreate(
            queryText,
            "search_query",
            organizationId,
            ontologyId
          );

          const results = A.empty<{ readonly entity: AssembledEntity; readonly similarity: number }>();

          for (const candidate of candidateEntities) {
            if (candidate.id === queryEntity.id) continue;

            const candidateText = formatEntityForEmbedding(candidate);
            const candidateEmbedding = yield* embeddingService
              .getOrCreate(candidateText, "search_document", organizationId, ontologyId)
              .pipe(Effect.catchAll(() => Effect.succeed([] as readonly number[])));

            if (A.isEmptyReadonlyArray(candidateEmbedding)) continue;

            const similarity = cosineSimilarity(queryEmbedding, candidateEmbedding);

            if (similarity >= threshold) {
              results.push({ entity: candidate, similarity });
            }
          }

          // Sort by similarity descending
          return A.sort(
            results,
            Order.reverse(
              Order.mapInput(
                Order.number,
                (r: { readonly entity: AssembledEntity; readonly similarity: number }) => r.similarity
              )
            )
          );
        })
      ),
    };
  }),
}) {}
