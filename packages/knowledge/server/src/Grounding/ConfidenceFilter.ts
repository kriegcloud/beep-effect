/**
 * ConfidenceFilter - Threshold-based filtering utilities
 *
 * Provides functions for filtering entities and relations
 * based on confidence scores.
 *
 * @module knowledge-server/Grounding/ConfidenceFilter
 * @since 0.1.0
 */
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Order from "effect/Order";
import * as R from "effect/Record";
import type { AssembledEntity, AssembledRelation, KnowledgeGraph } from "../Extraction/GraphAssembler";
// =============================================================================
// Types
// =============================================================================

/**
 * Filter configuration
 *
 * @since 0.1.0
 * @category configuration
 */
export interface FilterConfig {
  /**
   * Minimum confidence for entities (0-1)
   * @default 0.5
   */
  readonly entityThreshold?: number;

  /**
   * Minimum confidence for relations (0-1)
   * @default 0.5
   */
  readonly relationThreshold?: number;

  /**
   * Remove entities that have no relations after filtering
   * @default true
   */
  readonly removeOrphanEntities?: boolean;
}

/**
 * Filter statistics
 *
 * @since 0.1.0
 * @category schemas
 */
export interface FilterStats {
  readonly originalEntityCount: number;
  readonly filteredEntityCount: number;
  readonly removedEntityCount: number;
  readonly originalRelationCount: number;
  readonly filteredRelationCount: number;
  readonly removedRelationCount: number;
  readonly orphanEntitiesRemoved: number;
}

/**
 * Filter result
 *
 * @since 0.1.0
 * @category schemas
 */
export interface FilterResult {
  readonly graph: KnowledgeGraph;
  readonly stats: FilterStats;
}

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_ENTITY_THRESHOLD = 0.5;
const DEFAULT_RELATION_THRESHOLD = 0.5;

// =============================================================================
// Filter Functions
// =============================================================================

/**
 * Filter entities by confidence threshold
 *
 * @param entities - Entities to filter
 * @param threshold - Minimum confidence (0-1)
 * @returns Filtered entities
 *
 * @since 0.1.0
 * @category filters
 */
export const filterEntities = (entities: readonly AssembledEntity[], threshold: number): readonly AssembledEntity[] =>
  A.filter(entities, (entity) => entity.confidence >= threshold);

/**
 * Filter relations by confidence threshold
 *
 * @param relations - Relations to filter
 * @param threshold - Minimum confidence (0-1)
 * @returns Filtered relations
 *
 * @since 0.1.0
 * @category filters
 */
export const filterRelations = (
  relations: readonly AssembledRelation[],
  threshold: number
): readonly AssembledRelation[] => A.filter(relations, (relation) => relation.confidence >= threshold);

/**
 * Remove orphan entities (entities with no relations)
 *
 * @param entities - All entities
 * @param relations - Filtered relations
 * @returns Entities that participate in at least one relation
 *
 * @since 0.1.0
 * @category filters
 */
export const removeOrphanEntities = (
  entities: readonly AssembledEntity[],
  relations: readonly AssembledRelation[]
): readonly AssembledEntity[] => {
  // Build set of entity IDs that are referenced in relations
  const referencedIds = new Set<string>();
  for (const relation of relations) {
    referencedIds.add(relation.subjectId);
    if (relation.objectId) {
      referencedIds.add(relation.objectId);
    }
  }

  // Filter to only referenced entities
  return A.filter(entities, (entity) => referencedIds.has(entity.id));
};

/**
 * Filter knowledge graph by confidence thresholds
 *
 * Applies entity and relation thresholds, optionally removing orphan entities.
 *
 * @param graph - Knowledge graph to filter
 * @param config - Filter configuration
 * @returns Filtered graph with statistics
 *
 * @since 0.1.0
 * @category filters
 */
export const filterGraph = (graph: KnowledgeGraph, config: FilterConfig = {}): FilterResult => {
  const entityThreshold = config.entityThreshold ?? DEFAULT_ENTITY_THRESHOLD;
  const relationThreshold = config.relationThreshold ?? DEFAULT_RELATION_THRESHOLD;
  const shouldRemoveOrphans = config.removeOrphanEntities ?? true;

  // Filter entities by confidence
  let filteredEntities = filterEntities(graph.entities, entityThreshold);

  // Build set of valid entity IDs for relation filtering
  const validEntityIds = new Set(A.map(filteredEntities, (e) => e.id));

  // Filter relations by confidence AND ensure both ends exist
  const filteredRelations = A.filter(graph.relations, (relation) => {
    if (relation.confidence < relationThreshold) {
      return false;
    }
    if (!validEntityIds.has(relation.subjectId)) {
      return false;
    }
    if (relation.objectId && !validEntityIds.has(relation.objectId)) {
      return false;
    }
    return true;
  });

  // Optionally remove orphan entities
  let orphanEntitiesRemoved = 0;
  if (shouldRemoveOrphans) {
    const entitiesBeforeOrphanRemoval = filteredEntities.length;
    filteredEntities = removeOrphanEntities(filteredEntities, filteredRelations);
    orphanEntitiesRemoved = entitiesBeforeOrphanRemoval - filteredEntities.length;
  }

  // Rebuild entity index
  const entityIndex = R.empty<string, string>();
  for (const entity of filteredEntities) {
    const key = (entity.canonicalName ?? entity.mention).toLowerCase();
    entityIndex[key] = entity.id;
  }

  const filteredGraph: KnowledgeGraph = {
    entities: filteredEntities,
    relations: filteredRelations,
    entityIndex,
    stats: {
      entityCount: filteredEntities.length,
      relationCount: filteredRelations.length,
      unresolvedSubjects: 0,
      unresolvedObjects: 0,
    },
  };

  const stats: FilterStats = {
    originalEntityCount: graph.entities.length,
    filteredEntityCount: filteredEntities.length,
    removedEntityCount: graph.entities.length - filteredEntities.length,
    originalRelationCount: graph.relations.length,
    filteredRelationCount: filteredRelations.length,
    removedRelationCount: graph.relations.length - filteredRelations.length,
    orphanEntitiesRemoved,
  };

  return { graph: filteredGraph, stats };
};

/**
 * Filter knowledge graph (Effect version with logging)
 *
 * @param graph - Knowledge graph to filter
 * @param config - Filter configuration
 * @returns Effect with filtered graph and statistics
 *
 * @since 0.1.0
 * @category filters
 */
export const filterGraphEffect = Effect.fnUntraced(function* (graph: KnowledgeGraph, config: FilterConfig = {}) {
  yield* Effect.logDebug("ConfidenceFilter.filterGraph: starting", {
    entityCount: graph.entities.length,
    relationCount: graph.relations.length,
    entityThreshold: config.entityThreshold ?? DEFAULT_ENTITY_THRESHOLD,
    relationThreshold: config.relationThreshold ?? DEFAULT_RELATION_THRESHOLD,
  });

  const result = filterGraph(graph, config);

  yield* Effect.logInfo("ConfidenceFilter.filterGraph: complete", result.stats);

  return result;
});

/**
 * Get entities below confidence threshold
 *
 * Useful for review/debugging low-confidence extractions.
 *
 * @param entities - Entities to check
 * @param threshold - Confidence threshold
 * @returns Entities below threshold
 *
 * @since 0.1.0
 * @category filters
 */
export const getLowConfidenceEntities = (
  entities: readonly AssembledEntity[],
  threshold: number
): readonly AssembledEntity[] => A.filter(entities, (entity) => entity.confidence < threshold);

/**
 * Get relations below confidence threshold
 *
 * @param relations - Relations to check
 * @param threshold - Confidence threshold
 * @returns Relations below threshold
 *
 * @since 0.1.0
 * @category filters
 */
export const getLowConfidenceRelations = (
  relations: readonly AssembledRelation[],
  threshold: number
): readonly AssembledRelation[] => A.filter(relations, (relation) => relation.confidence < threshold);

/**
 * Compute confidence distribution statistics
 *
 * @param values - Array of confidence values
 * @returns Distribution statistics
 *
 * @since 0.1.0
 * @category utilities
 */
export const computeConfidenceStats = (
  values: readonly number[]
): {
  readonly min: number;
  readonly max: number;
  readonly mean: number;
  readonly median: number;
} => {
  if (values.length === 0) {
    return { min: 0, max: 0, mean: 0, median: 0 };
  }

  const sorted = A.sort(values, Order.number);
  const min = sorted[0]!;
  const max = sorted[sorted.length - 1]!;
  const mean = A.reduce(values, 0, (acc, v) => acc + v) / values.length;
  const midIndex = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0 ? (sorted[midIndex - 1]! + sorted[midIndex]!) / 2 : sorted[midIndex]!;

  return { min, max, mean, median };
};
