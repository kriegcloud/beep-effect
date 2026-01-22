/**
 * EntityResolutionService - Main entity resolution orchestrator
 *
 * Coordinates clustering, canonical selection, and link generation
 * to deduplicate entities across multiple knowledge graphs.
 *
 * @module knowledge-server/EntityResolution/EntityResolutionService
 * @since 0.1.0
 */
import type { SharedEntityIds } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as R from "effect/Record";
import type { AssembledEntity, AssembledRelation, KnowledgeGraph } from "../Extraction/GraphAssembler";
import { CanonicalSelector, type CanonicalSelectorConfig } from "./CanonicalSelector";
import { type ClusterConfig, type EntityCluster, EntityClusterer } from "./EntityClusterer";
import { type SameAsLink, SameAsLinker } from "./SameAsLinker";

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
  const idMapping = new Map<string, string>();
  for (const cluster of clusters) {
    for (const memberId of cluster.memberIds) {
      idMapping.set(memberId, cluster.canonicalEntityId);
    }
  }

  // Build canonical entity lookup
  const canonicalById = new Map<string, AssembledEntity>();
  for (const entity of canonicalEntities) {
    canonicalById.set(entity.id, entity);
  }

  // Collect and remap relations
  const relationSet = new Set<string>();
  const resolvedRelations = A.empty<AssembledRelation>();

  for (const graph of graphs) {
    for (const relation of graph.relations) {
      // Remap subject and object IDs to canonical entities
      const mappedSubjectId = idMapping.get(relation.subjectId) ?? relation.subjectId;
      const mappedObjectId = relation.objectId ? (idMapping.get(relation.objectId) ?? relation.objectId) : undefined;

      // Skip relations where subject or object doesn't exist
      if (!canonicalById.has(mappedSubjectId)) continue;
      if (mappedObjectId && !canonicalById.has(mappedObjectId)) continue;

      // Deduplicate relations by key
      const key = `${mappedSubjectId}|${relation.predicate}|${mappedObjectId ?? relation.literalValue ?? ""}`;

      if (!relationSet.has(key)) {
        relationSet.add(key);
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
    const key = (entity.canonicalName ?? entity.mention).toLowerCase();
    entityIndex[key] = entity.id;

    // Also index by raw mention
    const mentionKey = entity.mention.toLowerCase();
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
export class EntityResolutionService extends Effect.Service<EntityResolutionService>()(
  "@beep/knowledge-server/EntityResolutionService",
  {
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
        resolve: (
          graphs: readonly KnowledgeGraph[],
          organizationId: SharedEntityIds.OrganizationId.Type,
          ontologyId: string,
          config: ResolutionConfig = {}
        ): Effect.Effect<ResolutionResult> =>
          Effect.gen(function* () {
            // Calculate original entity count
            const originalCount = graphs.reduce((sum, g) => sum + g.entities.length, 0);

            if (originalCount === 0) {
              yield* Effect.logDebug("EntityResolutionService.resolve: no entities to resolve");
              return {
                graph: {
                  entities: [],
                  relations: [],
                  entityIndex: {},
                  stats: {
                    entityCount: 0,
                    relationCount: 0,
                    unresolvedSubjects: 0,
                    unresolvedObjects: 0,
                  },
                },
                clusters: [],
                sameAsLinks: [],
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
            const entityById = new Map<string, AssembledEntity>();
            for (const graph of graphs) {
              for (const entity of graph.entities) {
                entityById.set(entity.id, entity);
              }
            }

            // Step 3: Select canonical entity for each cluster and merge attributes
            const canonicalEntities = A.empty<AssembledEntity>();
            const updatedClusters = A.empty<EntityCluster>();

            for (const cluster of clusters) {
              const members = F.pipe(
                cluster.memberIds,
                A.map((id) => entityById.get(id)),
                A.filter((e): e is AssembledEntity => e !== undefined)
              );

              if (members.length === 0) continue;

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
            const confidenceMap = new Map<string, number>();
            for (const entity of entityById.values()) {
              confidenceMap.set(entity.id, entity.confidence);
            }

            const sameAsLinks = yield* sameAsLinker.generateLinks(updatedClusters, confidenceMap);

            // Step 5: Build resolved graph
            const resolvedGraph = buildResolvedGraph(graphs, canonicalEntities, updatedClusters);

            // Calculate statistics
            const maxClusterSize = Math.max(...A.map(updatedClusters, (c) => c.memberIds.length), 0);
            const totalMembers = A.reduce(updatedClusters, 0, (sum, c) => sum + c.memberIds.length);
            const averageClusterSize = updatedClusters.length > 0 ? totalMembers / updatedClusters.length : 0;

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
          ),
      };
    }),
  }
) {}

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
