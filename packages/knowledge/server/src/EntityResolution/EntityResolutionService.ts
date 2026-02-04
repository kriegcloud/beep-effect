/**
 * EntityResolutionService - Main entity resolution orchestrator
 *
 * Coordinates clustering, canonical selection, and link generation
 * to deduplicate entities across multiple knowledge graphs.
 *
 * @module knowledge-server/EntityResolution/EntityResolutionService
 * @since 0.1.0
 */
import { $KnowledgeServerId } from "@beep/identity/packages";
import type { SharedEntityIds } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as MutableHashMap from "effect/MutableHashMap";
import * as MutableHashSet from "effect/MutableHashSet";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as Str from "effect/String";
import type { AssembledEntity, AssembledRelation, KnowledgeGraph } from "../Extraction/GraphAssembler";
import { CanonicalSelector, type CanonicalSelectorConfig } from "./CanonicalSelector";
import { type ClusterConfig, type EntityCluster, EntityClusterer } from "./EntityClusterer";
import { type SameAsLink, SameAsLinker } from "./SameAsLinker";

const $I = $KnowledgeServerId.create("EntityResolution/EntityResolutionService");

// Re-export EntityCluster type for external use
export type { EntityCluster } from "./EntityClusterer";

// =============================================================================
// Configuration Types
// =============================================================================

/**
 * Configuration for entity resolution
 *
 * @since 0.1.0
 * @category config
 */
export interface ResolutionConfig {
  /**
   * Clustering configuration
   */
  readonly clustering?: undefined | ClusterConfig;

  /**
   * Canonical selection configuration
   */
  readonly canonical?: undefined | CanonicalSelectorConfig;
}

// =============================================================================
// Result Types
// =============================================================================

/**
 * Result of entity resolution
 *
 * @since 0.1.0
 * @category types
 */
export interface ResolutionResult {
  /**
   * Resolved graph with deduplicated entities
   */
  readonly graph: KnowledgeGraph;

  /**
   * Entity clusters from resolution
   */
  readonly clusters: readonly EntityCluster[];

  /**
   * owl:sameAs provenance links
   */
  readonly sameAsLinks: readonly SameAsLink[];

  /**
   * Resolution statistics
   */
  readonly stats: {
    readonly originalEntityCount: number;
    readonly resolvedEntityCount: number;
    readonly clusterCount: number;
    readonly sameAsLinkCount: number;
    readonly averageClusterSize: number;
    readonly maxClusterSize: number;
    readonly mergedEntityCount: number;
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Build resolved graph from canonical entities and clusters
 */
const buildResolvedGraph = (
  graphs: readonly KnowledgeGraph[],
  canonicalEntities: readonly AssembledEntity[],
  clusters: readonly EntityCluster[]
): KnowledgeGraph => {
  // Build entity ID mapping (member ID -> canonical ID)
  const idMapping = MutableHashMap.empty<string, string>();
  for (const cluster of clusters) {
    for (const memberId of cluster.memberIds) {
      MutableHashMap.set(idMapping, memberId, cluster.canonicalEntityId);
    }
  }

  // Build canonical entity lookup
  const canonicalById = MutableHashMap.empty<string, AssembledEntity>();
  for (const entity of canonicalEntities) {
    MutableHashMap.set(canonicalById, entity.id, entity);
  }

  // Collect and remap relations
  const relationSet = MutableHashSet.empty<string>();
  const resolvedRelations = A.empty<AssembledRelation>();

  for (const graph of graphs) {
    for (const relation of graph.relations) {
      // Remap subject and object IDs to canonical entities
      const mappedSubjectId = O.getOrElse(MutableHashMap.get(idMapping, relation.subjectId), () => relation.subjectId);
      const mappedObjectId = relation.objectId
        ? O.getOrElse(MutableHashMap.get(idMapping, relation.objectId), () => relation.objectId)
        : undefined;

      // Skip relations where subject or object doesn't exist
      if (!MutableHashMap.has(canonicalById, mappedSubjectId)) continue;
      if (mappedObjectId && !MutableHashMap.has(canonicalById, mappedObjectId)) continue;

      // Deduplicate relations by key
      const key = `${mappedSubjectId}|${relation.predicate}|${mappedObjectId ?? relation.literalValue ?? ""}`;

      if (!MutableHashSet.has(relationSet, key)) {
        MutableHashSet.add(relationSet, key);
        resolvedRelations.push({
          ...relation,
          subjectId: mappedSubjectId,
          ...(mappedObjectId !== undefined && { objectId: mappedObjectId }),
        });
      }
    }
  }

  // Build entity index
  const entityIndex = R.empty<string, string>();
  for (const entity of canonicalEntities) {
    const key = Str.toLowerCase(entity.canonicalName ?? entity.mention);
    entityIndex[key] = entity.id;

    // Also index by raw mention
    const mentionKey = Str.toLowerCase(entity.mention);
    if (!(mentionKey in entityIndex)) {
      entityIndex[mentionKey] = entity.id;
    }
  }

  return {
    entities: canonicalEntities,
    relations: resolvedRelations,
    entityIndex,
    stats: {
      entityCount: canonicalEntities.length,
      relationCount: resolvedRelations.length,
      unresolvedSubjects: 0,
      unresolvedObjects: 0,
    },
  };
};

// =============================================================================
// Service Implementation
// =============================================================================

/**
 * EntityResolutionService
 *
 * Main service for entity resolution that coordinates clustering,
 * canonical selection, and same-as link generation.
 *
 * @example
 * ```ts
 * import { EntityResolutionService } from "@beep/knowledge-server/EntityResolution";
 * import * as Effect from "effect/Effect";
 *
 * const program = Effect.gen(function* () {
 *   const resolver = yield* EntityResolutionService;
 *
 *   // Resolve entities across multiple graphs
 *   const result = yield* resolver.resolve(
 *     [graphA, graphB],
 *     organizationId,
 *     ontologyId,
 *     { clustering: { similarityThreshold: 0.85 } }
 *   );
 *
 *   console.log(`Resolved ${result.stats.originalEntityCount} entities to ${result.stats.resolvedEntityCount}`);
 * });
 * ```
 *
 * @since 0.1.0
 * @category services
 */
export class EntityResolutionService extends Effect.Service<EntityResolutionService>()($I`EntityResolutionService`, {
  accessors: true,
  effect: Effect.gen(function* () {
    const clusterer = yield* EntityClusterer;
    const canonicalSelector = yield* CanonicalSelector;
    const sameAsLinker = yield* SameAsLinker;

    return {
      /**
       * Resolve entities across multiple knowledge graphs
       *
       * @param graphs - Knowledge graphs to resolve
       * @param organizationId - Organization ID
       * @param ontologyId - Ontology ID
       * @param config - Resolution configuration
       * @returns Resolution result with deduplicated graph and provenance
       */
      resolve: Effect.fn(
        (
          graphs: readonly KnowledgeGraph[],
          organizationId: SharedEntityIds.OrganizationId.Type,
          ontologyId: string,
          config: ResolutionConfig = {}
        ) =>
          Effect.gen(function* () {
            // Calculate original entity count
            const originalCount = graphs.reduce((sum, g) => sum + g.entities.length, 0);

            if (originalCount === 0) {
              yield* Effect.logDebug("EntityResolutionService.resolve: no entities to resolve");
              return {
                graph: {
                  entities: A.empty<AssembledEntity>(),
                  relations: A.empty<AssembledRelation>(),
                  entityIndex: {},
                  stats: {
                    entityCount: 0,
                    relationCount: 0,
                    unresolvedSubjects: 0,
                    unresolvedObjects: 0,
                  },
                },
                clusters: A.empty<EntityCluster>(),
                sameAsLinks: A.empty<SameAsLink>(),
                stats: {
                  originalEntityCount: 0,
                  resolvedEntityCount: 0,
                  clusterCount: 0,
                  sameAsLinkCount: 0,
                  averageClusterSize: 0,
                  maxClusterSize: 0,
                  mergedEntityCount: 0,
                },
              };
            }

            yield* Effect.logInfo("EntityResolutionService.resolve: starting", {
              graphCount: graphs.length,
              originalEntityCount: originalCount,
            });

            // Step 1: Cluster entities by similarity
            const clusters = yield* clusterer.cluster(graphs, organizationId, ontologyId, config.clustering);

            // Step 2: Build entity lookup
            const entityById = MutableHashMap.empty<string, AssembledEntity>();
            for (const graph of graphs) {
              for (const entity of graph.entities) {
                MutableHashMap.set(entityById, entity.id, entity);
              }
            }

            // Step 3: Select canonical entity for each cluster and merge attributes
            const canonicalEntities = A.empty<AssembledEntity>();
            const updatedClusters = A.empty<EntityCluster>();

            for (const cluster of clusters) {
              const members = A.filterMap(cluster.memberIds, (id) => MutableHashMap.get(entityById, id));

              if (A.isEmptyReadonlyArray(members)) continue;

              // Select canonical
              const canonical = yield* canonicalSelector.selectCanonical(members, config.canonical);

              // Merge attributes from other members
              const otherMembers = members.filter((m) => m.id !== canonical.id);
              const mergedCanonical = yield* canonicalSelector.mergeAttributes(canonical, otherMembers);

              canonicalEntities.push(mergedCanonical);

              // Update cluster with selected canonical
              updatedClusters.push({
                ...cluster,
                canonicalEntityId: canonical.id,
              });
            }

            // Step 4: Generate same-as links
            const confidenceMap = MutableHashMap.empty<string, number>();
            MutableHashMap.forEach(entityById, (entity) => {
              MutableHashMap.set(confidenceMap, entity.id, entity.confidence);
            });

            const sameAsLinks = yield* sameAsLinker.generateLinks(updatedClusters, confidenceMap);

            // Step 5: Build resolved graph
            const resolvedGraph = buildResolvedGraph(graphs, canonicalEntities, updatedClusters);

            // Calculate statistics
            const maxClusterSize = Math.max(...A.map(updatedClusters, (c) => c.memberIds.length), 0);
            const totalMembers = A.reduce(updatedClusters, 0, (sum, c) => sum + c.memberIds.length);
            const averageClusterSize = A.isNonEmptyReadonlyArray(updatedClusters)
              ? totalMembers / updatedClusters.length
              : 0;

            const result: ResolutionResult = {
              graph: resolvedGraph,
              clusters: updatedClusters,
              sameAsLinks,
              stats: {
                originalEntityCount: originalCount,
                resolvedEntityCount: canonicalEntities.length,
                clusterCount: updatedClusters.length,
                sameAsLinkCount: sameAsLinks.length,
                averageClusterSize,
                maxClusterSize,
                mergedEntityCount: originalCount - canonicalEntities.length,
              },
            };

            yield* Effect.logInfo("EntityResolutionService.resolve: complete", result.stats);

            return result;
          }).pipe(
            Effect.withSpan("EntityResolutionService.resolve", {
              captureStackTrace: false,
              attributes: {
                graphCount: graphs.length,
              },
            })
          )
      ),
    };
  }),
}) {}

/**
 * EntityResolutionService layer with all dependencies
 *
 * @since 0.1.0
 * @category layers
 */
export const EntityResolutionServiceLive = EntityResolutionService.Default.pipe(
  Layer.provide(EntityClusterer.Default),
  Layer.provide(CanonicalSelector.Default),
  Layer.provide(SameAsLinker.Default)
);
