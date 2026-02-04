/**
 * Domain Model: Entity Resolution Graph
 *
 * Types for the Entity Resolution Graph structure and statistics.
 *
 * @since 2.0.0
 * @module Domain/Model/EntityResolutionGraph
 */

import type { DateTime, Graph } from "effect"
import type { Entity } from "./Entity.js"
import type { EREdge, ERNode } from "./EntityResolution.js"

/**
 * Resolution method type
 *
 * @since 2.0.0
 * @category Types
 */
export type ResolutionMethod = "exact" | "similarity" | "containment" | "neighbor"

/**
 * Similarity edge in the clustering graph
 *
 * @since 2.0.0
 * @category Types
 */
export interface SimilarityEdge {
  /** Similarity score between entities */
  readonly similarity: number
  /** Method used to determine similarity */
  readonly method: ResolutionMethod
}

/**
 * Per-entity resolution info (how a mention resolved to canonical)
 *
 * @since 2.0.0
 * @category Types
 */
export interface EntityResolutionInfo {
  /** Original entity ID */
  readonly entityId: string
  /** Similarity score to the canonical entity */
  readonly similarity: number
  /** Method used to resolve this entity */
  readonly method: ResolutionMethod
}

/**
 * Result of entity clustering
 *
 * @since 2.0.0
 * @category Types
 */
export interface EntityCluster {
  /** Entities in this cluster */
  readonly entities: ReadonlyArray<Entity>
  /** Minimum similarity within the cluster */
  readonly minSimilarity: number
  /** How entities were clustered */
  readonly methods: ReadonlyArray<ResolutionMethod>
}

/**
 * Result of clustering with embeddings
 *
 * @since 2.0.0
 * @category Types
 */
export interface ClusteringResult {
  /** Entity clusters */
  readonly clusters: ReadonlyArray<EntityCluster>
  /** Embedding map: entity ID → embedding vector */
  readonly embeddingMap: ReadonlyMap<string, ReadonlyArray<number>>
}

/**
 * Statistics for the Entity Resolution Graph
 *
 * @since 2.0.0
 * @category Types
 */
export interface EntityResolutionStats {
  readonly mentionCount: number
  readonly resolvedCount: number
  readonly relationCount: number
  readonly clusterCount: number
}

/**
 * Complete Entity Resolution Graph with indexes
 *
 * Contains the two-tier graph (MentionRecords → ResolvedEntities)
 * plus O(1) lookup indexes.
 *
 * @since 2.0.0
 * @category Types
 */
export interface EntityResolutionGraph {
  /** The Effect Graph structure */
  readonly graph: Graph.DirectedGraph<ERNode, EREdge>
  /** O(1) lookup: entity ID → NodeIndex */
  readonly entityIndex: Record<string, Graph.NodeIndex>
  /** O(1) lookup: entity ID → canonical ID */
  readonly canonicalMap: Record<string, string>
  /** Creation timestamp */
  readonly createdAt: DateTime.Utc
  /** Statistics */
  readonly stats: EntityResolutionStats
}
