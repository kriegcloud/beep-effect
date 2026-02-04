/**
 * Entity Resolution Domain Model
 *
 * Types for the Entity Resolution Graph (ERG) that links extracted mentions
 * to canonical resolved entities while preserving full provenance.
 *
 * Architecture: Two-tier node graph (ERKG-style)
 * - MentionRecord: Evidence nodes with chunk provenance (never modified)
 * - ResolvedEntity: Canonical nodes aggregating clusters
 * - ResolutionEdge: Links MentionRecord → ResolvedEntity
 * - RelationEdge: Links ResolvedEntity → ResolvedEntity
 *
 * @since 2.0.0
 * @module Domain/Model/EntityResolution
 */

import { Schema } from "effect"
import { AttributesSchema, ConfidenceSchema, EntityIdSchema, OptionalConfidenceSchema } from "./shared.js"

// =============================================================================
// Node Types
// =============================================================================

/**
 * MentionRecord - Evidence record preserving original extraction
 *
 * INVARIANT: Never modified after creation. Each MentionRecord represents
 * a single extraction event with full provenance (chunkIndex).
 *
 * @example
 * ```typescript
 * const record = new MentionRecord({
 *   _tag: "MentionRecord",
 *   id: "arsenal_chunk0",
 *   mention: "Arsenal",
 *   types: ["http://schema.org/SportsTeam"],
 *   attributes: {},
 *   chunkIndex: 0,
 *   confidence: 0.95
 * })
 * ```
 *
 * @since 2.0.0
 * @category Domain
 */
export class MentionRecord extends Schema.Class<MentionRecord>("MentionRecord")({
  /**
   * Discriminator tag for union type
   */
  _tag: Schema.Literal("MentionRecord"),

  /**
   * Original entity ID from extraction
   *
   * @example "cristiano_ronaldo", "arsenal_chunk0"
   */
  id: EntityIdSchema.annotations({
    description: "Original entity ID from extraction"
  }),

  /**
   * Text mention as found in source
   *
   * @example "Cristiano Ronaldo", "Arsenal", "The Gunners"
   */
  mention: Schema.String.annotations({
    title: "Mention",
    description: "Exact text span extracted from source"
  }),

  /**
   * Ontology class URIs this entity instantiates
   *
   * @example ["http://schema.org/Person", "http://schema.org/Athlete"]
   */
  types: Schema.Array(Schema.String).annotations({
    title: "Types",
    description: "Ontology class URIs"
  }),

  /**
   * Extracted attributes as property-value pairs
   */
  attributes: AttributesSchema,

  /**
   * Source chunk index (provenance tracking)
   *
   * @example 0, 1, 2 (which chunk in the extraction pipeline)
   */
  chunkIndex: Schema.Number.annotations({
    title: "Chunk Index",
    description: "Which chunk this mention came from (provenance)"
  }),

  /**
   * Extraction confidence if available
   */
  confidence: OptionalConfidenceSchema.annotations({
    description: "Extraction confidence score (0.0-1.0)"
  })
}) {
  /**
   * Debugger-friendly representation
   */
  toJSON() {
    return {
      _tag: this._tag,
      id: this.id,
      mention: this.mention,
      types: this.types,
      attributes: this.attributes,
      chunkIndex: this.chunkIndex,
      confidence: this.confidence
    }
  }
}

/**
 * ResolvedEntity - Canonical entity aggregating multiple MentionRecords
 *
 * Created by clustering similar MentionRecords. Serves as the canonical
 * reference for downstream relation linking.
 *
 * @example
 * ```typescript
 * const entity = new ResolvedEntity({
 *   _tag: "ResolvedEntity",
 *   canonicalId: "arsenal_fc",
 *   mention: "Arsenal Football Club",
 *   types: ["http://schema.org/SportsTeam"],
 *   attributes: { "http://schema.org/foundingDate": "1886" },
 *   externalIds: { wikidata: "Q9617" }
 * })
 * ```
 *
 * @since 2.0.0
 * @category Domain
 */
export class ResolvedEntity extends Schema.Class<ResolvedEntity>("ResolvedEntity")({
  /**
   * Discriminator tag for union type
   */
  _tag: Schema.Literal("ResolvedEntity"),

  /**
   * Canonical ID for downstream use
   *
   * @example "arsenal_fc", "cristiano_ronaldo"
   */
  canonicalId: EntityIdSchema.annotations({
    description: "Canonical identifier for this resolved entity"
  }),

  /**
   * Best mention (longest or most frequent from cluster)
   *
   * @example "Arsenal Football Club" (from ["Arsenal", "The Gunners", "Arsenal Football Club"])
   */
  mention: Schema.String.annotations({
    title: "Mention",
    description: "Best/canonical mention from cluster"
  }),

  /**
   * Merged types (frequency voting from cluster)
   */
  types: Schema.Array(Schema.String).annotations({
    title: "Types",
    description: "Merged ontology class URIs"
  }),

  /**
   * Merged attributes from cluster
   */
  attributes: AttributesSchema.annotations({
    description: "Merged property-value pairs"
  }),

  /**
   * External entity IDs for future linking
   *
   * @example { wikidata: "Q9617", dbpedia: "Arsenal_F.C." }
   */
  externalIds: Schema.optional(
    Schema.Record({
      key: Schema.String,
      value: Schema.String
    })
  ).annotations({
    title: "External IDs",
    description: "External knowledge base identifiers (Wikidata, DBpedia, etc.)"
  })
}) {
  /**
   * Debugger-friendly representation
   */
  toJSON() {
    return {
      _tag: this._tag,
      canonicalId: this.canonicalId,
      mention: this.mention,
      types: this.types,
      attributes: this.attributes,
      externalIds: this.externalIds
    }
  }
}

/**
 * ERNode - Discriminated union of graph node types
 *
 * Used as the node type in Effect Graph: `Graph.DirectedGraph<ERNode, EREdge>`
 *
 * @since 2.0.0
 * @category Domain
 */
export const ERNode = Schema.Union(MentionRecord, ResolvedEntity)

/**
 * Type alias for ERNode
 *
 * @since 2.0.0
 */
export type ERNode = typeof ERNode.Type

// =============================================================================
// Edge Types
// =============================================================================

/**
 * ResolutionEdge - Links MentionRecord → ResolvedEntity
 *
 * Records how a mention was resolved to its canonical entity.
 *
 * @example
 * ```typescript
 * const edge = new ResolutionEdge({
 *   _tag: "ResolutionEdge",
 *   confidence: 0.95,
 *   method: "similarity"
 * })
 * ```
 *
 * @since 2.0.0
 * @category Domain
 */
export class ResolutionEdge extends Schema.Class<ResolutionEdge>("ResolutionEdge")({
  /**
   * Discriminator tag for union type
   */
  _tag: Schema.Literal("ResolutionEdge"),

  /**
   * Similarity score that triggered this resolution
   */
  confidence: ConfidenceSchema.annotations({
    description: "Similarity score that triggered resolution (0.0-1.0)"
  }),

  /**
   * Resolution method used
   *
   * - exact: Perfect string match
   * - similarity: Levenshtein/Jaccard above threshold
   * - containment: One mention contains the other
   * - neighbor: Resolved due to shared relations
   */
  method: Schema.Literal("exact", "similarity", "containment", "neighbor").annotations({
    title: "Method",
    description: "How the match was determined"
  })
}) {
  /**
   * Debugger-friendly representation
   */
  toJSON() {
    return {
      _tag: this._tag,
      confidence: this.confidence,
      method: this.method
    }
  }
}

/**
 * RelationEdge - Links ResolvedEntity → ResolvedEntity
 *
 * Represents a relation between resolved entities using ontology predicates.
 *
 * @example
 * ```typescript
 * const edge = new RelationEdge({
 *   _tag: "RelationEdge",
 *   predicate: "http://schema.org/memberOf",
 *   grounded: true,
 *   confidence: 0.9
 * })
 * ```
 *
 * @since 2.0.0
 * @category Domain
 */
export class RelationEdge extends Schema.Class<RelationEdge>("RelationEdge")({
  /**
   * Discriminator tag for union type
   */
  _tag: Schema.Literal("RelationEdge"),

  /**
   * Ontology property IRI
   *
   * @example "http://schema.org/memberOf", "http://schema.org/knows"
   */
  predicate: Schema.String.annotations({
    title: "Predicate",
    description: "Ontology property IRI"
  }),

  /**
   * Whether this relation was verified by Grounder
   */
  grounded: Schema.Boolean.annotations({
    title: "Grounded",
    description: "Whether this relation was verified by Grounder"
  }),

  /**
   * Grounding confidence if verified
   */
  confidence: OptionalConfidenceSchema.annotations({
    description: "Grounding confidence score (0.0-1.0)"
  })
}) {
  /**
   * Debugger-friendly representation
   */
  toJSON() {
    return {
      _tag: this._tag,
      predicate: this.predicate,
      grounded: this.grounded,
      confidence: this.confidence
    }
  }
}

/**
 * EREdge - Discriminated union of graph edge types
 *
 * Used as the edge type in Effect Graph: `Graph.DirectedGraph<ERNode, EREdge>`
 *
 * @since 2.0.0
 * @category Domain
 */
export const EREdge = Schema.Union(ResolutionEdge, RelationEdge)

/**
 * Type alias for EREdge
 *
 * @since 2.0.0
 */
export type EREdge = typeof EREdge.Type

// =============================================================================
// Configuration
// =============================================================================

/**
 * Configuration for entity resolution
 *
 * @since 2.0.0
 * @category Configuration
 */
/**
 * EntityResolutionConfig - Configuration for entity resolution
 *
 * @since 2.0.0
 * @category Configuration
 */
export class EntityResolutionConfig extends Schema.Class<EntityResolutionConfig>("EntityResolutionConfig")({
  /**
   * Overall similarity threshold for clustering
   * @default 0.7
   */
  /**
   * Overall similarity threshold for clustering
   * @default 0.7
   */
  similarityThreshold: Schema.propertySignature(
    Schema.Number.pipe(Schema.between(0, 1))
  ).pipe(
    Schema.withConstructorDefault(() => 0.7)
  ),

  /**
   * Weight for mention string similarity
   * @default 0.5
   */
  mentionWeight: Schema.propertySignature(
    Schema.Number.pipe(Schema.between(0, 1))
  ).pipe(
    Schema.withConstructorDefault(() => 0.5)
  ),

  /**
   * Weight for type overlap
   * @default 0.3
   */
  typeWeight: Schema.propertySignature(
    Schema.Number.pipe(Schema.between(0, 1))
  ).pipe(
    Schema.withConstructorDefault(() => 0.3)
  ),

  /**
   * Weight for neighbor similarity
   * @default 0.2
   */
  neighborWeight: Schema.propertySignature(
    Schema.Number.pipe(Schema.between(0, 1))
  ).pipe(
    Schema.withConstructorDefault(() => 0.2)
  ),

  /**
   * Weight for embedding similarity (0 to disable)
   * @default 0
   */
  embeddingWeight: Schema.propertySignature(
    Schema.Number.pipe(Schema.between(0, 1))
  ).pipe(
    Schema.withConstructorDefault(() => 0)
  ),

  /**
   * Require type overlap for clustering
   * @default true
   */
  requireTypeOverlap: Schema.propertySignature(Schema.Boolean).pipe(
    Schema.withConstructorDefault(() => true)
  ),

  /**
   * Minimum type overlap ratio if required
   * @default 0.5
   */
  typeOverlapRatio: Schema.propertySignature(
    Schema.Number.pipe(Schema.between(0, 1))
  ).pipe(
    Schema.withConstructorDefault(() => 0.5)
  )
}) {}

/**
 * Default entity resolution configuration
 *
 * @since 2.0.0
 * @category Configuration
 */
export const defaultEntityResolutionConfig = new EntityResolutionConfig({})
