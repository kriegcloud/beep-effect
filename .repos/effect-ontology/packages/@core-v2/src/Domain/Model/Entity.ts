/**
 * Domain Model: Entity and Relation
 *
 * Pure Schema.Class definitions for knowledge graph entities and relations.
 * No business logic - just data structures with validation.
 *
 * @since 2.0.0
 * @module Domain/Model/Entity
 */

import { Equal, Hash, pipe, Schema } from "effect"
import { AttributesSchema, EntityIdSchema } from "./shared.js"

// =============================================================================
// Evidence Span Types
// =============================================================================

/**
 * EvidenceSpan - Character-level text evidence for provenance
 *
 * Captures the exact text span and character offsets where a fact
 * was mentioned in the source document. Uses W3C Web Annotation
 * TextQuoteSelector semantics for interoperability.
 *
 * @example
 * ```typescript
 * const evidence: EvidenceSpan = {
 *   text: "Cristiano Ronaldo",
 *   startChar: 42,
 *   endChar: 59,
 *   confidence: 0.95
 * }
 * ```
 *
 * @since 2.0.0
 * @category Types
 */
export const EvidenceSpanSchema = Schema.Struct({
  /**
   * Exact text span from source document
   */
  text: Schema.String.annotations({
    title: "Text",
    description: "Exact text span from source document"
  }),

  /**
   * Character offset start (0-indexed)
   */
  startChar: Schema.Number.pipe(
    Schema.int(),
    Schema.nonNegative(),
    Schema.annotations({
      title: "Start Character",
      description: "Character offset start (0-indexed)"
    })
  ),

  /**
   * Character offset end (exclusive)
   */
  endChar: Schema.Number.pipe(
    Schema.int(),
    Schema.nonNegative(),
    Schema.annotations({
      title: "End Character",
      description: "Character offset end (exclusive)"
    })
  ),

  /**
   * Extraction confidence (0-1)
   */
  confidence: Schema.optional(
    Schema.Number.pipe(
      Schema.greaterThanOrEqualTo(0),
      Schema.lessThanOrEqualTo(1)
    )
  ).annotations({
    title: "Confidence",
    description: "Extraction confidence score (0-1)"
  })
}).annotations({
  title: "EvidenceSpan",
  description: "Character-level text evidence with offsets"
})

/**
 * Type alias for EvidenceSpan
 * @since 2.0.0
 */
export type EvidenceSpan = Schema.Schema.Type<typeof EvidenceSpanSchema>

// =============================================================================
// Entity Model
// =============================================================================

/**
 * Entity - Represents an extracted entity from text
 *
 * @example
 * ```typescript
 * const entity = new Entity({
 *   id: "cristiano_ronaldo",
 *   mention: "Cristiano Ronaldo",
 *   types: ["http://schema.org/Person", "http://schema.org/Athlete"],
 *   attributes: {
 *     "http://schema.org/birthDate": "1985-02-05",
 *     "http://schema.org/nationality": "Portuguese"
 *   }
 * })
 * ```
 *
 * @since 2.0.0
 * @category Domain
 */
export class Entity extends Schema.Class<Entity>("Entity")({
  /**
   * Unique identifier for the entity (snake_case)
   *
   * @example "cristiano_ronaldo", "al_nassr_fc"
   */
  id: EntityIdSchema,

  /**
   * Original text mention from source
   *
   * @example "Cristiano Ronaldo", "Al-Nassr"
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
  types: Schema.Array(Schema.String).pipe(
    Schema.minItems(1),
    Schema.annotations({
      title: "Types",
      description: "Ontology class URIs (at least one required)"
    })
  ),

  /**
   * Entity attributes as property-value pairs
   *
   * Keys are property URIs, values are literals (string, number, boolean)
   *
   * @example
   * ```typescript
   * {
   *   "http://schema.org/birthDate": "1985-02-05",
   *   "http://schema.org/age": 39,
   *   "http://schema.org/active": true
   * }
   * ```
   */
  attributes: AttributesSchema,

  /**
   * Source chunk index for provenance tracking
   *
   * Set during streaming extraction to track which chunk this entity was extracted from.
   * Used by entity resolution to create MentionRecords with proper provenance.
   *
   * @example 0, 1, 2 (index of chunk in document)
   */
  chunkIndex: Schema.optional(Schema.Number).annotations({
    title: "Chunk Index",
    description: "Source chunk index for provenance (optional)"
  }),

  /**
   * Chunk ID for extraction run tracking
   *
   * Unique chunk identifier when extraction run is provided.
   * Format: `{documentId}-chunk-{index}` (e.g., `doc-abc123-chunk-0`).
   * Used for full provenance tracking in contained extraction artifacts.
   *
   * @example "doc-abc123def456-chunk-0"
   */
  chunkId: Schema.optional(Schema.String).annotations({
    title: "Chunk ID",
    description: "Unique chunk ID for extraction run provenance (optional)"
  }),

  /**
   * Document ID this entity was extracted from
   *
   * Links entity back to source document for provenance queries.
   * Set during extraction from DocumentMetadata.
   *
   * @example "doc-abc123def456"
   */
  documentId: Schema.optional(Schema.String).annotations({
    title: "Document ID",
    description: "Source document ID for provenance tracking"
  }),

  /**
   * Source URI where the document was loaded from
   *
   * GCS URI or other storage path to the source document.
   * Enables direct lookup of source content.
   *
   * @example "gs://bucket/documents/press-release.txt"
   */
  sourceUri: Schema.optional(Schema.String).annotations({
    title: "Source URI",
    description: "Storage URI of source document"
  }),

  /**
   * When this entity was extracted from text
   *
   * Auto-set during extraction. Used for temporal queries and audit trails.
   * This is a system timestamp (when KB was updated), not the event time.
   */
  extractedAt: Schema.optional(Schema.DateTimeUtc).annotations({
    title: "Extracted At",
    description: "System timestamp when entity was extracted"
  }),

  /**
   * When the real-world event involving this entity occurred
   *
   * Inherited from source document's eventTime or extracted from text.
   * @example A person's appointment date, an event's occurrence date
   */
  eventTime: Schema.optional(Schema.DateTimeUtc).annotations({
    title: "Event Time",
    description: "When the real-world event occurred"
  }),

  /**
   * Evidence spans showing where this entity was mentioned in source text
   *
   * Each span captures the exact text and character offsets for provenance.
   * Multiple spans support the same entity mentioned multiple times.
   *
   * @example
   * ```typescript
   * mentions: [
   *   { text: "Cristiano Ronaldo", startChar: 42, endChar: 59, confidence: 0.95 },
   *   { text: "Ronaldo", startChar: 156, endChar: 163, confidence: 0.88 }
   * ]
   * ```
   */
  mentions: Schema.optional(Schema.Array(EvidenceSpanSchema)).annotations({
    title: "Mentions",
    description: "Text spans where this entity was mentioned in source"
  }),

  /**
   * System-generated grounding confidence (0-1)
   *
   * Set by the Grounder service after verifying the entity is actually
   * mentioned in the source context with the claimed types. This replaces
   * unreliable LLM self-reported confidence with system verification.
   *
   * High confidence (>0.8): Entity clearly mentioned with matching type
   * Medium confidence (0.5-0.8): Entity mentioned but type inference weak
   * Low confidence (<0.5): Entity mention or type not well supported
   *
   * @example 0.92 (entity "Cristiano Ronaldo" verified as Person in context)
   */
  groundingConfidence: Schema.optional(
    Schema.Number.pipe(
      Schema.greaterThanOrEqualTo(0),
      Schema.lessThanOrEqualTo(1)
    )
  ).annotations({
    title: "Grounding Confidence",
    description: "System-verified confidence that entity is grounded in source text (0-1)"
  })
}) {
  /**
   * Debugger-friendly representation
   */
  toJSON() {
    return {
      _tag: "Entity" as const,
      id: this.id,
      mention: this.mention,
      types: this.types,
      attributes: this.attributes,
      chunkIndex: this.chunkIndex,
      chunkId: this.chunkId,
      documentId: this.documentId,
      sourceUri: this.sourceUri,
      extractedAt: this.extractedAt,
      eventTime: this.eventTime,
      mentions: this.mentions,
      groundingConfidence: this.groundingConfidence
    }
  }
}

/**
 * Relation - Represents a relationship between entities
 *
 * Links two entities via an ontology property.
 *
 * @example
 * ```typescript
 * const relation = new Relation({
 *   subjectId: "cristiano_ronaldo",
 *   predicate: "http://schema.org/memberOf",
 *   object: "al_nassr_fc"  // Entity reference
 * })
 *
 * const literalRelation = new Relation({
 *   subjectId: "cristiano_ronaldo",
 *   predicate: "http://schema.org/birthDate",
 *   object: "1985-02-05"  // Literal value
 * })
 * ```
 *
 * @since 2.0.0
 * @category Domain
 */
export class Relation extends Schema.Class<Relation>("Relation")({
  /**
   * Entity ID of the subject
   *
   * @example "cristiano_ronaldo"
   */
  subjectId: Schema.String.annotations({
    title: "Subject ID",
    description: "Entity ID of the triple subject"
  }),

  /**
   * Ontology property URI
   *
   * @example "http://schema.org/memberOf"
   */
  predicate: Schema.String.annotations({
    title: "Predicate",
    description: "Ontology property URI"
  }),

  /**
   * Object - either entity ID or literal value
   *
   * - String starting with lowercase letter = entity reference
   * - Other string = literal
   * - Number/Boolean = literal
   */
  object: Schema.Union(
    Schema.String,
    Schema.Number,
    Schema.Boolean
  ).annotations({
    title: "Object",
    description: "Entity ID reference or literal value"
  }),

  /**
   * Evidence span showing where this relation was expressed in source text
   *
   * Captures the exact quote and character offsets for provenance tracking.
   * Shows users precisely where in the document this fact was stated.
   *
   * @example
   * ```typescript
   * evidence: {
   *   text: "Ronaldo joined Al-Nassr in January 2023",
   *   startChar: 245,
   *   endChar: 285,
   *   confidence: 0.92
   * }
   * ```
   */
  evidence: Schema.optional(EvidenceSpanSchema).annotations({
    title: "Evidence",
    description: "Text span where this relation was expressed in source"
  })
}) {
  /**
   * Check if object is an entity reference (vs literal)
   */
  get isEntityReference(): boolean {
    return typeof this.object === "string" && /^[a-z][a-z0-9_]*$/.test(this.object)
  }

  /**
   * Structural equality based on (subjectId, predicate, object) signature
   */
  [Equal.symbol](that: Relation): boolean {
    return (
      Equal.equals(this.subjectId, that.subjectId) &&
      Equal.equals(this.predicate, that.predicate) &&
      Equal.equals(this.object, that.object)
    )
  }

  /**
   * Structural hash based on (subjectId, predicate, object) signature
   */
  [Hash.symbol](): number {
    return Hash.cached(
      this,
      pipe(
        Hash.hash(this.subjectId),
        Hash.combine(Hash.hash(this.predicate)),
        Hash.combine(Hash.hash(this.object))
      )
    )
  }

  /**
   * Debugger-friendly representation
   */
  toJSON() {
    return {
      _tag: "Relation" as const,
      subjectId: this.subjectId,
      predicate: this.predicate,
      object: this.object,
      isEntityReference: this.isEntityReference,
      evidence: this.evidence
    }
  }
}

/**
 * KnowledgeGraph - Complete extraction result
 *
 * Contains all entities and relations extracted from a text.
 *
 * @since 2.0.0
 * @category Domain
 */
export class KnowledgeGraph extends Schema.Class<KnowledgeGraph>("KnowledgeGraph")({
  /**
   * All extracted entities
   */
  entities: Schema.Array(Entity).annotations({
    title: "Entities",
    description: "All entities extracted from text"
  }),

  /**
   * All extracted relations
   */
  relations: Schema.Array(Relation).annotations({
    title: "Relations",
    description: "All relations between entities"
  }),

  /**
   * Source text (optional, for provenance)
   */
  sourceText: Schema.optional(Schema.String).annotations({
    title: "Source Text",
    description: "Original text this graph was extracted from"
  })
}) {
  /**
   * Get entity by ID
   */
  getEntity(id: string): Entity | undefined {
    return this.entities.find((e) => e.id === id)
  }

  /**
   * Get all relations where entity is subject
   */
  getRelationsFrom(subjectId: string): Array<Relation> {
    return this.relations.filter((r) => r.subjectId === subjectId)
  }

  /**
   * Get all relations where entity is object
   */
  getRelationsTo(entityId: string): Array<Relation> {
    return this.relations.filter(
      (r) => typeof r.object === "string" && r.object === entityId
    )
  }

  toJSON() {
    return {
      _tag: "KnowledgeGraph" as const,
      entities: this.entities.map((e) => e.toJSON()),
      relations: this.relations.map((r) => r.toJSON()),
      sourceText: this.sourceText
    }
  }
}
