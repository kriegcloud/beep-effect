/**
 * EntityClusterer - Similarity-based entity clustering
 *
 * Groups similar entities using embedding similarity for entity resolution.
 *
 * @module knowledge-server/EntityResolution/EntityClusterer
 * @since 0.1.0
 */
import type { SharedEntityIds } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import type { EmbeddingError } from "../Embedding/EmbeddingProvider";
import { EmbeddingService } from "../Embedding/EmbeddingService";
import type { AssembledEntity, KnowledgeGraph } from "../Extraction/GraphAssembler";

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
 * Format entity text for embedding
 */
const formatEntityText = (entity: AssembledEntity): string => {
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

/**
 * Check if two entities have compatible types
 */
const hasTypeOverlap = (entityA: AssembledEntity, entityB: AssembledEntity): boolean => {
  const typesA = new Set(entityA.types);
  return A.some(entityB.types, typesA.has);
};

/**
 * Find shared types between entities
 */
const findSharedTypes = (entities: readonly AssembledEntity[]): readonly string[] => {
  if (entities.length === 0) return [];
  if (entities.length === 1) return entities[0]?.types ?? [];

  const firstEntity = entities[0];
  if (!firstEntity) return [];

  const sharedSet = new Set(firstEntity.types);

  for (let i = 1; i < entities.length; i++) {
    const entity = entities[i];
    if (!entity) continue;

    const entityTypes = new Set(entity.types);
    for (const type of sharedSet) {
      if (!entityTypes.has(type)) {
        sharedSet.delete(type);
      }
    }
  }

  return Array.from(sharedSet);
};

/**
 * Compute cosine similarity between two vectors
 */
const cosineSimilarity = (a: readonly number[], b: readonly number[]): number => {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    const valA = a[i] ?? 0;
    const valB = b[i] ?? 0;
    dotProduct += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
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
export class EntityClusterer extends Effect.Service<EntityClusterer>()("@beep/knowledge-server/EntityClusterer", {
  accessors: true,
  effect: Effect.gen(function* () {
    const embeddingService = yield* EmbeddingService;

    /**
     * Compute similarity matrix for entities
     */
    const computeSimilarities = (
      entities: readonly AssembledEntity[],
      embeddings: Map<string, readonly number[]>,
      threshold: number,
      requireTypeCompatibility: boolean
    ): readonly EntitySimilarity[] => {
      const similarities = A.empty<EntitySimilarity>();

      for (let i = 0; i < entities.length; i++) {
        const entityA = entities[i];
        if (!entityA) continue;

        const embeddingA = embeddings.get(entityA.id);
        if (!embeddingA) continue;

        for (let j = i + 1; j < entities.length; j++) {
          const entityB = entities[j];
          if (!entityB) continue;

          // Check type compatibility if required
          if (requireTypeCompatibility && !hasTypeOverlap(entityA, entityB)) {
            continue;
          }

          const embeddingB = embeddings.get(entityB.id);
          if (!embeddingB) continue;

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
      const parent = new Map<string, string>();
      const rank = new Map<string, number>();

      for (const entity of entities) {
        parent.set(entity.id, entity.id);
        rank.set(entity.id, 0);
      }

      // Find with path compression
      const find = (x: string): string => {
        const p = parent.get(x);
        if (p === undefined) return x;
        if (p !== x) {
          const root = find(p);
          parent.set(x, root);
          return root;
        }
        return x;
      };

      // Union by rank
      const union = (x: string, y: string): void => {
        const rootX = find(x);
        const rootY = find(y);

        if (rootX === rootY) return;

        const rankX = rank.get(rootX) ?? 0;
        const rankY = rank.get(rootY) ?? 0;

        if (rankX < rankY) {
          parent.set(rootX, rootY);
        } else if (rankX > rankY) {
          parent.set(rootY, rootX);
        } else {
          parent.set(rootY, rootX);
          rank.set(rootX, rankX + 1);
        }
      };

      // Sort similarities by descending similarity
      const sortedSimilarities = [...similarities].sort((a, b) => b.similarity - a.similarity);

      // Track cluster sizes
      const clusterSizes = new Map<string, number>();
      for (const entity of entities) {
        clusterSizes.set(entity.id, 1);
      }

      // Merge similar entities
      for (const sim of sortedSimilarities) {
        const rootA = find(sim.entityA);
        const rootB = find(sim.entityB);

        if (rootA === rootB) continue;

        const sizeA = clusterSizes.get(rootA) ?? 1;
        const sizeB = clusterSizes.get(rootB) ?? 1;

        // Check cluster size constraint
        if (sizeA + sizeB > maxClusterSize) continue;

        union(sim.entityA, sim.entityB);

        // Update cluster size
        const newRoot = find(sim.entityA);
        clusterSizes.set(newRoot, sizeA + sizeB);
      }

      // Build clusters from union-find
      const clusterMap = new Map<string, string[]>();
      for (const entity of entities) {
        const root = find(entity.id);
        const cluster = clusterMap.get(root) ?? [];
        cluster.push(entity.id);
        clusterMap.set(root, cluster);
      }

      // Create entity lookup
      const entityById = new Map<string, AssembledEntity>();
      for (const entity of entities) {
        entityById.set(entity.id, entity);
      }

      // Convert to EntityCluster format
      const clusters: EntityCluster[] = [];

      for (const [_root, memberIds] of clusterMap) {
        const members = memberIds.map((id) => entityById.get(id)).filter((e): e is AssembledEntity => e !== undefined);

        if (members.length === 0) continue;

        // Compute cohesion (average pairwise similarity within cluster)
        let cohesion = 1.0;
        if (members.length > 1) {
          let totalSimilarity = 0;
          let pairCount = 0;

          for (const sim of similarities) {
            const rootA = find(sim.entityA);
            const rootB = find(sim.entityB);
            if (rootA === rootB && memberIds.includes(sim.entityA) && memberIds.includes(sim.entityB)) {
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
        if (!canonical) continue;

        clusters.push({
          id: `knowledge_entity_cluster__${crypto.randomUUID()}`,
          canonicalEntityId: canonical.id,
          memberIds,
          cohesion,
          sharedTypes,
        });
      }

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
      cluster: (
        graphs: readonly KnowledgeGraph[],
        organizationId: SharedEntityIds.OrganizationId.Type,
        ontologyId: string,
        config: ClusterConfig = {}
      ): Effect.Effect<readonly EntityCluster[]> =>
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

          if (allEntities.length === 0) {
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
          const embeddings = new Map<string, readonly number[]>();

          for (const entity of allEntities) {
            const text = formatEntityText(entity);
            const embedding = yield* embeddingService
              .getOrCreate(text, "clustering", organizationId, ontologyId)
              .pipe(Effect.catchAll(() => Effect.succeed([] as readonly number[])));

            if (embedding.length > 0) {
              embeddings.set(entity.id, embedding);
            }
          }

          yield* Effect.logDebug("EntityClusterer.cluster: embeddings generated", {
            embeddedCount: embeddings.size,
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
      findSimilar: (
        queryEntity: AssembledEntity,
        candidateEntities: readonly AssembledEntity[],
        organizationId: SharedEntityIds.OrganizationId.Type,
        ontologyId: string,
        threshold = 0.8
      ): Effect.Effect<readonly { entity: AssembledEntity; similarity: number }[], EmbeddingError> =>
        Effect.gen(function* () {
          const queryText = formatEntityText(queryEntity);
          const queryEmbedding = yield* embeddingService.getOrCreate(
            queryText,
            "search_query",
            organizationId,
            ontologyId
          );

          const results = A.empty<{ readonly entity: AssembledEntity; readonly similarity: number }>();

          for (const candidate of candidateEntities) {
            if (candidate.id === queryEntity.id) continue;

            const candidateText = formatEntityText(candidate);
            const candidateEmbedding = yield* embeddingService
              .getOrCreate(candidateText, "search_document", organizationId, ontologyId)
              .pipe(Effect.catchAll(() => Effect.succeed([] as readonly number[])));

            if (candidateEmbedding.length === 0) continue;

            const similarity = cosineSimilarity(queryEmbedding, candidateEmbedding);

            if (similarity >= threshold) {
              results.push({ entity: candidate, similarity });
            }
          }

          // Sort by similarity descending
          return results.sort((a, b) => b.similarity - a.similarity);
        }),
    };
  }),
}) {}
