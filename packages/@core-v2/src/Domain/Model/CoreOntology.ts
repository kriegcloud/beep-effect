/**
 * Domain Model: Core Ontology Types
 *
 * TypeScript types corresponding to the Core Ontology V2 classes:
 * - TrackedEntity: Persistent domain entities (dul:Object)
 * - TrackedEvent: Occurrences in time (dul:Event)
 * - Mention: Text evidence (claims:Evidence)
 *
 * These types are used for RDF serialization and validation,
 * NOT for LLM extraction output (which uses Entity/Relation).
 *
 * @since 2.0.0
 * @module Domain/Model/CoreOntology
 */

import { Data, Schema } from "effect"
import { AttributesSchema, ConfidenceSchema } from "./shared.js"

// =============================================================================
// Core Ontology Namespace Constants
// =============================================================================

/**
 * Core ontology namespace IRI
 *
 * @since 2.0.0
 * @category Constants
 */
export const CORE_NAMESPACE = "http://effect-ontology.dev/core#" as const

/**
 * Core ontology class IRIs
 *
 * @since 2.0.0
 * @category Constants
 */
export const CoreClasses = {
  TrackedEntity: `${CORE_NAMESPACE}TrackedEntity`,
  TrackedEvent: `${CORE_NAMESPACE}TrackedEvent`,
  Mention: `${CORE_NAMESPACE}Mention`,
  // Domain subclasses (V2)
  Person: `${CORE_NAMESPACE}Person`,
  Organization: `${CORE_NAMESPACE}Organization`,
  Place: `${CORE_NAMESPACE}Place`,
  Artifact: `${CORE_NAMESPACE}Artifact`
} as const

/**
 * Core ontology property IRIs
 *
 * @since 2.0.0
 * @category Constants
 */
export const CoreProperties = {
  // Evidence linking
  hasEvidentialMention: `${CORE_NAMESPACE}hasEvidentialMention`,
  mentions: `${CORE_NAMESPACE}mentions`,

  // Event participation
  hasParticipant: `${CORE_NAMESPACE}hasParticipant`,
  isParticipantIn: `${CORE_NAMESPACE}isParticipantIn`,

  // Entity resolution (V2: canonicalEntity replaces sameEntityAs)
  canonicalEntity: `${CORE_NAMESPACE}canonicalEntity`,
  isCanonicalFormOf: `${CORE_NAMESPACE}isCanonicalFormOf`,
  mergedFrom: `${CORE_NAMESPACE}mergedFrom`,
  wasMergedInto: `${CORE_NAMESPACE}wasMergedInto`,
  resolutionConfidence: `${CORE_NAMESPACE}resolutionConfidence`,

  // Spatial
  hasLocation: `${CORE_NAMESPACE}hasLocation`,
  isLocationOf: `${CORE_NAMESPACE}isLocationOf`,

  // Datatype properties
  name: `${CORE_NAMESPACE}name`,
  description: `${CORE_NAMESPACE}description`,
  occurrenceTime: `${CORE_NAMESPACE}occurrenceTime`,
  startTime: `${CORE_NAMESPACE}startTime`,
  endTime: `${CORE_NAMESPACE}endTime`,
  groundingConfidence: `${CORE_NAMESPACE}groundingConfidence`
} as const

// =============================================================================
// Mention Schema and Type
// =============================================================================

/**
 * IRI schema for linked data references
 *
 * @since 2.0.0
 * @category Schemas
 */
export const IRISchema = Schema.String.pipe(
  Schema.pattern(/^https?:\/\/.+|^urn:.+/),
  Schema.brand("IRI"),
  Schema.annotations({
    title: "IRI",
    description: "Internationalized Resource Identifier"
  })
)

/**
 * IRI type alias
 *
 * @since 2.0.0
 */
export type IRI = typeof IRISchema.Type

/**
 * Create a branded IRI (unsafe - no validation)
 *
 * @since 2.0.0
 * @category Constructors
 */
export const IRI = (iri: string): IRI => iri as IRI

/**
 * Mention ID schema - hash-based for deduplication
 *
 * Format: mention-{12 hex chars}
 *
 * @since 2.0.0
 * @category Schemas
 */
export const MentionIdSchema = Schema.String.pipe(
  Schema.pattern(/^mention-[a-f0-9]{12}$/),
  Schema.brand("MentionId"),
  Schema.annotations({
    title: "Mention ID",
    description: "Hash-based identifier for text mentions"
  })
)

/**
 * MentionId type alias
 *
 * @since 2.0.0
 */
export type MentionId = typeof MentionIdSchema.Type

/**
 * Mention - Text evidence for entity/event references
 *
 * Represents a specific span of text in a source document that references
 * a TrackedEntity or TrackedEvent. Corresponds to core:Mention which
 * extends claims:Evidence.
 *
 * @example
 * ```typescript
 * const mention = new Mention({
 *   id: "mention-a1b2c3d4e5f6" as MentionId,
 *   evidenceText: "Mayor Bruce Harrell",
 *   startOffset: 42,
 *   endOffset: 60,
 *   confidence: 0.95,
 *   mentionsEntity: IRI("http://example.org/entity/bruce_harrell"),
 *   sourceDocument: IRI("gs://bucket/docs/article.txt"),
 *   extractedAt: new Date().toISOString()
 * })
 * ```
 *
 * @since 2.0.0
 * @category Domain
 */
export class Mention extends Schema.Class<Mention>("Mention")({
  /**
   * Unique mention identifier (hash-based)
   *
   * Generated from: Hash(documentId + startOffset + endOffset)
   */
  id: MentionIdSchema,

  /**
   * The exact quoted text from the source document
   *
   * Corresponds to claims:evidenceText
   */
  evidenceText: Schema.String.pipe(
    Schema.minLength(1),
    Schema.annotations({
      title: "Evidence Text",
      description: "Exact text span from source document"
    })
  ),

  /**
   * Character offset where the mention starts (0-indexed)
   *
   * Corresponds to claims:startOffset
   */
  startOffset: Schema.Number.pipe(
    Schema.int(),
    Schema.nonNegative(),
    Schema.annotations({
      title: "Start Offset",
      description: "Character offset start (0-indexed)"
    })
  ),

  /**
   * Character offset where the mention ends (exclusive)
   *
   * Corresponds to claims:endOffset
   */
  endOffset: Schema.Number.pipe(
    Schema.int(),
    Schema.nonNegative(),
    Schema.annotations({
      title: "End Offset",
      description: "Character offset end (exclusive)"
    })
  ),

  /**
   * Extraction confidence score (0.0-1.0)
   *
   * System-computed, NOT LLM self-reported.
   * Corresponds to claims:confidence
   */
  confidence: ConfidenceSchema,

  /**
   * IRI of the entity or event this mention references
   *
   * Corresponds to core:mentions property
   */
  mentionsEntity: IRISchema.annotations({
    title: "Mentions Entity",
    description: "IRI of the TrackedEntity or TrackedEvent referenced"
  }),

  /**
   * IRI of the source document
   *
   * Corresponds to claims:evidenceSource / claims:statedIn
   */
  sourceDocument: Schema.optional(IRISchema).annotations({
    title: "Source Document",
    description: "IRI of the source document (GCS URI or other)"
  }),

  /**
   * Extraction timestamp
   *
   * Corresponds to claims:extractedAt
   */
  extractedAt: Schema.optional(Schema.DateTimeUtc).annotations({
    title: "Extracted At",
    description: "When this mention was extracted"
  })
}) {
  /**
   * Debugger-friendly representation
   */
  toJSON() {
    return {
      _tag: "Mention" as const,
      id: this.id,
      evidenceText: this.evidenceText,
      startOffset: this.startOffset,
      endOffset: this.endOffset,
      confidence: this.confidence,
      mentionsEntity: this.mentionsEntity,
      sourceDocument: this.sourceDocument,
      extractedAt: this.extractedAt
    }
  }
}

// =============================================================================
// TrackedEntity Schema and Type
// =============================================================================

/**
 * Canonical entity ID schema
 *
 * Format: entity-{12 hex chars} or snake_case ID
 *
 * @since 2.0.0
 * @category Schemas
 */
export const CanonicalEntityIdSchema = Schema.String.pipe(
  Schema.pattern(/^entity-[a-f0-9]{12}$|^[a-z][a-z0-9_]*$/),
  Schema.brand("CanonicalEntityId"),
  Schema.annotations({
    title: "Canonical Entity ID",
    description: "Unique identifier for resolved entities"
  })
)

/**
 * CanonicalEntityId type alias
 *
 * @since 2.0.0
 */
export type CanonicalEntityId = typeof CanonicalEntityIdSchema.Type

/**
 * TrackedEntity - Persistent domain entity
 *
 * Represents a persistent entity in the domain (Person, Organization, Place)
 * that is tracked across multiple documents. Corresponds to core:TrackedEntity
 * which extends dul:Object.
 *
 * @example
 * ```typescript
 * const entity = new TrackedEntity({
 *   id: "entity-a1b2c3d4e5f6" as CanonicalEntityId,
 *   iri: IRI("http://example.org/entity/bruce_harrell"),
 *   name: "Bruce Harrell",
 *   description: "Mayor of Seattle since 2022",
 *   types: [IRI("http://xmlns.com/foaf/0.1/Person")],
 *   groundingConfidence: 0.92
 * })
 * ```
 *
 * @since 2.0.0
 * @category Domain
 */
export class TrackedEntity extends Schema.Class<TrackedEntity>("TrackedEntity")({
  /**
   * Canonical entity identifier
   */
  id: CanonicalEntityIdSchema,

  /**
   * Full IRI of this entity in the knowledge graph
   */
  iri: IRISchema.annotations({
    title: "Entity IRI",
    description: "Full IRI in the knowledge graph namespace"
  }),

  /**
   * Canonical name of the entity
   *
   * Corresponds to core:name
   */
  name: Schema.String.pipe(
    Schema.minLength(1),
    Schema.annotations({
      title: "Name",
      description: "Canonical name of the entity"
    })
  ),

  /**
   * Brief description
   *
   * Corresponds to core:description
   */
  description: Schema.optional(Schema.String).annotations({
    title: "Description",
    description: "Brief description of the entity"
  }),

  /**
   * Ontology class IRIs this entity instantiates
   *
   * At minimum should include a domain class (foaf:Person, org:Organization, etc.)
   * and optionally core:TrackedEntity
   */
  types: Schema.Array(IRISchema).pipe(
    Schema.minItems(1),
    Schema.annotations({
      title: "Types",
      description: "Ontology class IRIs (at least one required)"
    })
  ),

  /**
   * Entity attributes as property-value pairs
   */
  attributes: Schema.optional(AttributesSchema).annotations({
    title: "Attributes",
    description: "Additional property-value pairs"
  }),

  /**
   * System-computed grounding confidence
   *
   * Corresponds to core:groundingConfidence
   */
  groundingConfidence: Schema.optional(ConfidenceSchema).annotations({
    title: "Grounding Confidence",
    description: "System-computed confidence (0.0-1.0)"
  }),

  /**
   * Entity resolution confidence
   *
   * Corresponds to core:resolutionConfidence
   */
  resolutionConfidence: Schema.optional(ConfidenceSchema).annotations({
    title: "Resolution Confidence",
    description: "Confidence in entity resolution match"
  }),

  /**
   * IRIs of entities merged into this canonical entity
   *
   * Corresponds to core:mergedFrom
   */
  mergedFrom: Schema.optional(Schema.Array(IRISchema)).annotations({
    title: "Merged From",
    description: "Source entities merged into this canonical entity"
  }),

  /**
   * Location IRI if spatially grounded
   *
   * Corresponds to core:hasLocation
   */
  location: Schema.optional(IRISchema).annotations({
    title: "Location",
    description: "Spatial location (dul:Place IRI)"
  }),

  /**
   * External KB links (Wikidata, DBpedia, etc.)
   */
  externalIds: Schema.optional(
    Schema.Record({
      key: Schema.String,
      value: Schema.String
    })
  ).annotations({
    title: "External IDs",
    description: "Links to external knowledge bases"
  })
}) {
  /**
   * Check if this entity has been resolved (merged from other entities)
   */
  get isResolved(): boolean {
    return this.mergedFrom !== undefined && this.mergedFrom.length > 0
  }

  /**
   * Debugger-friendly representation
   */
  toJSON() {
    return {
      _tag: "TrackedEntity" as const,
      id: this.id,
      iri: this.iri,
      name: this.name,
      description: this.description,
      types: this.types,
      attributes: this.attributes,
      groundingConfidence: this.groundingConfidence,
      resolutionConfidence: this.resolutionConfidence,
      mergedFrom: this.mergedFrom,
      location: this.location,
      externalIds: this.externalIds
    }
  }
}

// =============================================================================
// TrackedEvent Schema and Type
// =============================================================================

/**
 * Event ID schema
 *
 * Format: event-{12 hex chars}
 *
 * @since 2.0.0
 * @category Schemas
 */
export const EventIdSchema = Schema.String.pipe(
  Schema.pattern(/^event-[a-f0-9]{12}$/),
  Schema.brand("EventId"),
  Schema.annotations({
    title: "Event ID",
    description: "Unique identifier for events"
  })
)

/**
 * EventId type alias
 *
 * @since 2.0.0
 */
export type EventId = typeof EventIdSchema.Type

/**
 * Participant with optional role
 *
 * @since 2.0.0
 * @category Schemas
 */
export const ParticipantSchema = Schema.Struct({
  /**
   * IRI of the participating entity
   */
  entityIri: IRISchema,

  /**
   * Optional role the entity plays in this event
   */
  role: Schema.optional(IRISchema)
}).annotations({
  title: "Participant",
  description: "Entity participating in an event with optional role"
})

/**
 * Participant type alias
 *
 * @since 2.0.0
 */
export type Participant = typeof ParticipantSchema.Type

/**
 * TrackedEvent - Occurrence in time
 *
 * Represents a specific occurrence in time involving TrackedEntities.
 * Corresponds to core:TrackedEvent which extends dul:Event.
 *
 * @example
 * ```typescript
 * const event = new TrackedEvent({
 *   id: "event-a1b2c3d4e5f6" as EventId,
 *   iri: IRI("http://example.org/event/announcement_001"),
 *   types: [IRI("http://effect-ontology.dev/seattle/StaffAnnouncementEvent")],
 *   occurrenceTime: new Date("2025-01-15T10:00:00Z"),
 *   participants: [
 *     { entityIri: IRI("http://example.org/entity/bruce_harrell") }
 *   ],
 *   groundingConfidence: 0.88
 * })
 * ```
 *
 * @since 2.0.0
 * @category Domain
 */
export class TrackedEvent extends Schema.Class<TrackedEvent>("TrackedEvent")({
  /**
   * Unique event identifier
   */
  id: EventIdSchema,

  /**
   * Full IRI of this event in the knowledge graph
   */
  iri: IRISchema.annotations({
    title: "Event IRI",
    description: "Full IRI in the knowledge graph namespace"
  }),

  /**
   * Ontology class IRIs this event instantiates
   *
   * Should include at least one domain event type
   */
  types: Schema.Array(IRISchema).pipe(
    Schema.minItems(1),
    Schema.annotations({
      title: "Types",
      description: "Event type class IRIs"
    })
  ),

  /**
   * When the event occurred
   *
   * Corresponds to core:occurrenceTime
   */
  occurrenceTime: Schema.optional(Schema.DateTimeUtc).annotations({
    title: "Occurrence Time",
    description: "When the event occurred (ISO 8601)"
  }),

  /**
   * Time interval for events with duration
   *
   * Alternative to occurrenceTime for events with explicit start/end
   */
  timeInterval: Schema.optional(
    Schema.Struct({
      start: Schema.DateTimeUtc,
      end: Schema.optional(Schema.DateTimeUtc)
    })
  ).annotations({
    title: "Time Interval",
    description: "Start and optional end time for duration events"
  }),

  /**
   * Entities participating in this event
   *
   * Corresponds to core:hasParticipant
   */
  participants: Schema.optional(Schema.Array(ParticipantSchema)).annotations({
    title: "Participants",
    description: "Entities involved in this event"
  }),

  /**
   * Location where the event occurred
   *
   * Corresponds to core:hasLocation
   */
  location: Schema.optional(IRISchema).annotations({
    title: "Location",
    description: "Where the event occurred (dul:Place IRI)"
  }),

  /**
   * Event attributes as property-value pairs
   */
  attributes: Schema.optional(AttributesSchema).annotations({
    title: "Attributes",
    description: "Additional event properties"
  }),

  /**
   * System-computed grounding confidence
   *
   * Corresponds to core:groundingConfidence
   */
  groundingConfidence: Schema.optional(ConfidenceSchema).annotations({
    title: "Grounding Confidence",
    description: "System-computed confidence (0.0-1.0)"
  })
}) {
  /**
   * Check if event has temporal grounding
   */
  get hasTemporalGrounding(): boolean {
    return this.occurrenceTime !== undefined || this.timeInterval !== undefined
  }

  /**
   * Debugger-friendly representation
   */
  toJSON() {
    return {
      _tag: "TrackedEvent" as const,
      id: this.id,
      iri: this.iri,
      types: this.types,
      occurrenceTime: this.occurrenceTime,
      timeInterval: this.timeInterval,
      participants: this.participants,
      location: this.location,
      attributes: this.attributes,
      groundingConfidence: this.groundingConfidence
    }
  }
}

// =============================================================================
// Tagged Errors for Core Ontology Operations
// =============================================================================

/**
 * Error creating a Mention
 *
 * @since 2.0.0
 * @category Errors
 */
export class MentionError extends Data.TaggedError("MentionError")<{
  readonly message: string
  readonly cause?: unknown
}> {}

/**
 * Error with TrackedEntity operations
 *
 * @since 2.0.0
 * @category Errors
 */
export class TrackedEntityError extends Data.TaggedError("TrackedEntityError")<{
  readonly message: string
  readonly cause?: unknown
}> {}

/**
 * Error with TrackedEvent operations
 *
 * @since 2.0.0
 * @category Errors
 */
export class TrackedEventError extends Data.TaggedError("TrackedEventError")<{
  readonly message: string
  readonly cause?: unknown
}> {}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Generate a mention ID from document ID and character offsets
 *
 * Creates a deterministic, content-addressed ID for deduplication.
 *
 * @param documentId - Source document identifier
 * @param startOffset - Start character offset
 * @param endOffset - End character offset
 * @returns MentionId in format "mention-{12 hex chars}"
 *
 * @since 2.0.0
 * @category Constructors
 */
export const generateMentionId = (
  documentId: string,
  startOffset: number,
  endOffset: number
): MentionId => {
  // Simple hash based on input - in production use crypto.createHash
  const input = `${documentId}:${startOffset}:${endOffset}`
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(12, "0").slice(0, 12)
  return `mention-${hex}` as MentionId
}

/**
 * Generate a canonical entity ID
 *
 * @param seed - Seed value (typically entity name or original ID)
 * @returns CanonicalEntityId in format "entity-{12 hex chars}"
 *
 * @since 2.0.0
 * @category Constructors
 */
export const generateEntityId = (seed: string): CanonicalEntityId => {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  const hex = Math.abs(hash).toString(16).padStart(12, "0").slice(0, 12)
  return `entity-${hex}` as CanonicalEntityId
}

/**
 * Generate an event ID
 *
 * @param seed - Seed value (typically event description or timestamp)
 * @returns EventId in format "event-{12 hex chars}"
 *
 * @since 2.0.0
 * @category Constructors
 */
export const generateEventId = (seed: string): EventId => {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  const hex = Math.abs(hash).toString(16).padStart(12, "0").slice(0, 12)
  return `event-${hex}` as EventId
}
