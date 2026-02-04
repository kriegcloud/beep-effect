/**
 * Schema: Knowledge Model
 *
 * Three-layer model for news domain where facts can conflict.
 * - Claim: Reported fact from document (may conflict with others)
 * - Assertion: Normalized RDF triple (curated/accepted)
 * - DerivedAssertion: Inferred by reasoning rule
 *
 * @since 2.0.0
 * @module Domain/Schema/KnowledgeModel
 */

import { Schema } from "effect"
import { GcsUri } from "../Identity.js"
import { IriSchema, Literal } from "../Rdf/Types.js"

// =============================================================================
// Identity Types
// =============================================================================

/**
 * ClaimId: claim-{12 hex chars}
 * Unique identifier for extracted claims
 *
 * @since 2.0.0
 * @category Identity
 */
export const ClaimId = Schema.String.pipe(
  Schema.pattern(/^claim-[a-f0-9]{12}$/),
  Schema.brand("ClaimId"),
  Schema.annotations({
    title: "Claim ID",
    description: "Unique identifier for an extracted claim"
  })
)
export type ClaimId = typeof ClaimId.Type

/**
 * AssertionId: assertion-{12 hex chars}
 * Unique identifier for curated assertions
 *
 * @since 2.0.0
 * @category Identity
 */
export const AssertionId = Schema.String.pipe(
  Schema.pattern(/^assertion-[a-f0-9]{12}$/),
  Schema.brand("AssertionId"),
  Schema.annotations({
    title: "Assertion ID",
    description: "Unique identifier for a curated assertion"
  })
)
export type AssertionId = typeof AssertionId.Type

/**
 * DerivedAssertionId: derived-{12 hex chars}
 * Unique identifier for inferred assertions
 *
 * @since 2.0.0
 * @category Identity
 */
export const DerivedAssertionId = Schema.String.pipe(
  Schema.pattern(/^derived-[a-f0-9]{12}$/),
  Schema.brand("DerivedAssertionId"),
  Schema.annotations({
    title: "Derived Assertion ID",
    description: "Unique identifier for an inferred assertion"
  })
)
export type DerivedAssertionId = typeof DerivedAssertionId.Type

/**
 * RuleId: rule-{identifier}
 * Unique identifier for reasoning rules
 *
 * @since 2.0.0
 * @category Identity
 */
export const RuleId = Schema.String.pipe(
  Schema.pattern(/^rule-[a-z0-9-]+$/),
  Schema.brand("RuleId"),
  Schema.annotations({
    title: "Rule ID",
    description: "Unique identifier for a reasoning rule"
  })
)
export type RuleId = typeof RuleId.Type

// =============================================================================
// Evidence
// =============================================================================

/**
 * Text span evidence from source document
 *
 * Captures the exact location of evidence in the source text.
 *
 * @since 2.0.0
 * @category Evidence
 */
export class TextSpan extends Schema.Class<TextSpan>("TextSpan")({
  /** Start character offset in source document */
  start: Schema.Number.pipe(
    Schema.int(),
    Schema.nonNegative(),
    Schema.annotations({
      title: "Start Offset",
      description: "Start character offset (0-indexed)"
    })
  ),
  /** End character offset in source document */
  end: Schema.Number.pipe(
    Schema.int(),
    Schema.nonNegative(),
    Schema.annotations({
      title: "End Offset",
      description: "End character offset (exclusive)"
    })
  ),
  /** Extracted text snippet */
  text: Schema.String.annotations({
    title: "Text",
    description: "Extracted text from the span"
  })
}) {
  toJSON() {
    return {
      _tag: "TextSpan" as const,
      start: this.start,
      end: this.end,
      text: this.text
    }
  }
}

/**
 * Evidence supporting a claim
 *
 * Contains source document reference and text spans that support the claim.
 *
 * @since 2.0.0
 * @category Evidence
 */
export class Evidence extends Schema.Class<Evidence>("Evidence")({
  /** Source document URI (GCS or HTTP) */
  documentUri: Schema.Union(GcsUri, Schema.String).annotations({
    title: "Document URI",
    description: "Source document URI (gs:// or http://)"
  }),
  /** Text spans supporting the claim */
  spans: Schema.Array(TextSpan).annotations({
    title: "Spans",
    description: "Text spans supporting this claim"
  }),
  /** Optional: Section/paragraph context */
  context: Schema.optional(Schema.String).annotations({
    title: "Context",
    description: "Section or paragraph context"
  })
}) {
  toJSON() {
    return {
      _tag: "Evidence" as const,
      documentUri: this.documentUri,
      spans: this.spans.map((s) => s.toJSON()),
      context: this.context
    }
  }
}

// =============================================================================
// RDF Object Value
// =============================================================================

/**
 * RDF object value (IRI or Literal)
 *
 * @since 2.0.0
 * @category RDF
 */
export const RdfObject = Schema.Union(
  IriSchema,
  Schema.instanceOf(Literal)
).annotations({
  title: "RDF Object",
  description: "RDF object value (IRI or Literal)"
})
export type RdfObject = typeof RdfObject.Type

// =============================================================================
// Claim
// =============================================================================

/**
 * Wikidata-style rank for claims
 *
 * - preferred: Current best value
 * - normal: Standard claim
 * - deprecated: Superseded or incorrect
 *
 * @since 2.0.0
 * @category Claim
 */
export const ClaimRank = Schema.Literal("preferred", "normal", "deprecated").annotations({
  title: "Claim Rank",
  description: "Wikidata-style rank (preferred > normal > deprecated)"
})
export type ClaimRank = typeof ClaimRank.Type

/**
 * Claim - Reported fact from document
 *
 * A claim represents a single fact extracted from a source document.
 * Claims may conflict with other claims and require curation.
 *
 * @example
 * ```typescript
 * const claim = new Claim({
 *   id: "claim-abc123def456" as ClaimId,
 *   subject: "http://example.org/entity/123" as IRI,
 *   predicate: "http://schema.org/name" as IRI,
 *   object: new Literal({ value: "John Doe" }),
 *   documentUri: "gs://bucket/docs/article.txt" as GcsUri,
 *   evidence: new Evidence({ documentUri: "gs://...", spans: [...] }),
 *   extractedAt: new Date(),
 *   confidence: 0.95
 * })
 * ```
 *
 * @since 2.0.0
 * @category Claim
 */
export class Claim extends Schema.Class<Claim>("Claim")({
  /** Unique claim identifier */
  id: ClaimId,
  /** Subject IRI of the claim */
  subject: IriSchema.annotations({
    title: "Subject",
    description: "Subject entity IRI"
  }),
  /** Predicate IRI of the claim */
  predicate: IriSchema.annotations({
    title: "Predicate",
    description: "Predicate/property IRI"
  }),
  /** Object value (IRI or Literal) */
  object: RdfObject.annotations({
    title: "Object",
    description: "Object value (IRI or Literal)"
  }),
  /** Source document URI */
  documentUri: GcsUri.annotations({
    title: "Document URI",
    description: "Source document URI"
  }),
  /** Evidence supporting the claim */
  evidence: Evidence,
  /** When the claim was extracted */
  extractedAt: Schema.DateTimeUtc.annotations({
    title: "Extracted At",
    description: "Timestamp when claim was extracted"
  }),
  /** Confidence score (0-1) */
  confidence: Schema.Number.pipe(
    Schema.greaterThanOrEqualTo(0),
    Schema.lessThanOrEqualTo(1),
    Schema.annotations({
      title: "Confidence",
      description: "Extraction confidence score (0-1)"
    })
  ),
  /** Claim rank (Wikidata-style) */
  rank: Schema.optionalWith(ClaimRank, { default: () => "normal" as const }).annotations({
    title: "Rank",
    description: "Wikidata-style rank (default: normal)"
  }),
  /** Optional temporal validity start */
  validFrom: Schema.optional(Schema.DateTimeUtc).annotations({
    title: "Valid From",
    description: "Start of temporal validity period"
  }),
  /** Optional temporal validity end */
  validTo: Schema.optional(Schema.DateTimeUtc).annotations({
    title: "Valid To",
    description: "End of temporal validity period"
  })
}) {
  toJSON() {
    return {
      _tag: "Claim" as const,
      id: this.id,
      subject: this.subject,
      predicate: this.predicate,
      object: this.object instanceof Literal ? this.object.toJSON() : this.object,
      documentUri: this.documentUri,
      evidence: this.evidence.toJSON(),
      extractedAt: this.extractedAt,
      confidence: this.confidence,
      rank: this.rank,
      validFrom: this.validFrom,
      validTo: this.validTo
    }
  }
}

// =============================================================================
// Assertion
// =============================================================================

/**
 * Assertion status
 *
 * @since 2.0.0
 * @category Assertion
 */
export const AssertionStatus = Schema.Literal("accepted", "rejected", "pending").annotations({
  title: "Assertion Status",
  description: "Curation status of the assertion"
})
export type AssertionStatus = typeof AssertionStatus.Type

/**
 * Assertion - Normalized, curated RDF triple
 *
 * An assertion is a curated fact derived from one or more claims.
 * After curation, assertions are accepted into the knowledge base.
 *
 * @example
 * ```typescript
 * const assertion = new Assertion({
 *   id: "assertion-abc123def456" as AssertionId,
 *   subject: "http://example.org/entity/123" as IRI,
 *   predicate: "http://schema.org/name" as IRI,
 *   object: new Literal({ value: "John Doe" }),
 *   assertedAt: new Date(),
 *   derivedFrom: ["claim-abc123def456" as ClaimId],
 *   status: "accepted"
 * })
 * ```
 *
 * @since 2.0.0
 * @category Assertion
 */
export class Assertion extends Schema.Class<Assertion>("Assertion")({
  /** Unique assertion identifier */
  id: AssertionId,
  /** Subject IRI of the assertion */
  subject: IriSchema.annotations({
    title: "Subject",
    description: "Subject entity IRI"
  }),
  /** Predicate IRI of the assertion */
  predicate: IriSchema.annotations({
    title: "Predicate",
    description: "Predicate/property IRI"
  }),
  /** Object value (IRI or Literal) */
  object: RdfObject.annotations({
    title: "Object",
    description: "Object value (IRI or Literal)"
  }),
  /** When the assertion was created */
  assertedAt: Schema.DateTimeUtc.annotations({
    title: "Asserted At",
    description: "Timestamp when assertion was created"
  }),
  /** Claims this assertion was derived from */
  derivedFrom: Schema.Array(ClaimId).annotations({
    title: "Derived From",
    description: "Source claims this assertion was derived from"
  }),
  /** Curation status */
  status: AssertionStatus,
  /** Optional temporal validity start */
  validFrom: Schema.optional(Schema.DateTimeUtc).annotations({
    title: "Valid From",
    description: "Start of temporal validity period"
  }),
  /** Optional temporal validity end */
  validTo: Schema.optional(Schema.DateTimeUtc).annotations({
    title: "Valid To",
    description: "End of temporal validity period"
  })
}) {
  toJSON() {
    return {
      _tag: "Assertion" as const,
      id: this.id,
      subject: this.subject,
      predicate: this.predicate,
      object: this.object instanceof Literal ? this.object.toJSON() : this.object,
      assertedAt: this.assertedAt,
      derivedFrom: this.derivedFrom,
      status: this.status,
      validFrom: this.validFrom,
      validTo: this.validTo
    }
  }
}

// =============================================================================
// DerivedAssertion
// =============================================================================

/**
 * DerivedAssertion - Inferred by reasoning
 *
 * A derived assertion is created by applying a reasoning rule
 * to existing assertions in the knowledge base.
 *
 * @example
 * ```typescript
 * const derived = new DerivedAssertion({
 *   id: "derived-abc123def456" as DerivedAssertionId,
 *   assertion: new Assertion({ ... }),
 *   ruleId: "rule-transitivity" as RuleId,
 *   supportingFacts: ["assertion-111..." as AssertionId, ...],
 *   derivedAt: new Date()
 * })
 * ```
 *
 * @since 2.0.0
 * @category DerivedAssertion
 */
export class DerivedAssertion extends Schema.Class<DerivedAssertion>("DerivedAssertion")({
  /** Unique derived assertion identifier */
  id: DerivedAssertionId,
  /** The inferred assertion */
  assertion: Assertion,
  /** Rule that produced this assertion */
  ruleId: RuleId,
  /** Assertions that support this derivation */
  supportingFacts: Schema.Array(AssertionId).annotations({
    title: "Supporting Facts",
    description: "Assertions used to derive this assertion"
  }),
  /** When the derivation was computed */
  derivedAt: Schema.DateTimeUtc.annotations({
    title: "Derived At",
    description: "Timestamp when derivation was computed"
  })
}) {
  toJSON() {
    return {
      _tag: "DerivedAssertion" as const,
      id: this.id,
      assertion: this.assertion.toJSON(),
      ruleId: this.ruleId,
      supportingFacts: this.supportingFacts,
      derivedAt: this.derivedAt
    }
  }
}

// =============================================================================
// Event - First-Class Node
// =============================================================================

/**
 * EventId: event-{12 hex chars}
 * Unique identifier for events
 *
 * @since 2.0.0
 * @category Identity
 */
export const EventId = Schema.String.pipe(
  Schema.pattern(/^event-[a-f0-9]{12}$/),
  Schema.brand("EventId"),
  Schema.annotations({
    title: "Event ID",
    description: "Unique identifier for an event"
  })
)
export type EventId = typeof EventId.Type

/**
 * EventType - Categorizes events for timeline visualization
 *
 * Event types determine how events are displayed and grouped:
 * - StaffAnnouncement: Personnel changes, hires, departures
 * - PolicyInitiative: New policies, programs, initiatives
 * - CouncilVote: Legislative votes, resolutions
 * - Appointment: Official appointments to positions
 * - BudgetAction: Budget decisions, allocations
 * - PublicMeeting: Meetings, hearings, public events
 * - Generic: Uncategorized events
 *
 * @since 2.0.0
 * @category Event
 */
export const EventType = Schema.Literal(
  "StaffAnnouncement",
  "PolicyInitiative",
  "CouncilVote",
  "Appointment",
  "BudgetAction",
  "PublicMeeting",
  "Generic"
).annotations({
  title: "Event Type",
  description: "Category of event for timeline grouping"
})
export type EventType = typeof EventType.Type

/**
 * EntityRef - Reference to an entity by IRI
 *
 * Used in event participants to link to entity nodes.
 *
 * @since 2.0.0
 * @category Event
 */
export class EntityRef extends Schema.Class<EntityRef>("EntityRef")({
  /** Entity IRI */
  iri: IriSchema.annotations({
    title: "Entity IRI",
    description: "IRI of the referenced entity"
  }),
  /** Entity role in the event (e.g., "appointee", "voter", "subject") */
  role: Schema.optional(Schema.String).annotations({
    title: "Role",
    description: "Role of the entity in this event"
  }),
  /** Display label for the entity */
  label: Schema.optional(Schema.String).annotations({
    title: "Label",
    description: "Human-readable label for display"
  })
}) {
  toJSON() {
    return {
      _tag: "EntityRef" as const,
      iri: this.iri,
      role: this.role,
      label: this.label
    }
  }
}

/**
 * Event - First-class node for timeline representation
 *
 * Events group related assertions and provide temporal context for
 * knowledge graph visualization. Each event represents a real-world
 * occurrence (announcement, vote, policy change) with participants
 * and associated facts.
 *
 * @example
 * ```typescript
 * const event = new Event({
 *   id: "event-abc123def456" as EventId,
 *   type: "StaffAnnouncement",
 *   title: "City Manager Announces New Finance Director",
 *   eventTime: new Date("2024-01-15T09:00:00Z"),
 *   publishedAt: new Date("2024-01-15T14:30:00Z"),
 *   participants: [
 *     new EntityRef({ iri: "http://example.org/person/jane_doe" as IRI, role: "appointee" }),
 *     new EntityRef({ iri: "http://example.org/person/city_manager" as IRI, role: "announcer" })
 *   ],
 *   factGroup: ["assertion-111..." as AssertionId],
 *   sourceDocuments: ["gs://bucket/docs/press-release.txt" as GcsUri]
 * })
 * ```
 *
 * @since 2.0.0
 * @category Event
 */
export class Event extends Schema.Class<Event>("Event")({
  /** Unique event identifier */
  id: EventId,

  /** Event type for categorization and display */
  type: EventType,

  /** Human-readable event title/headline */
  title: Schema.optional(Schema.String).annotations({
    title: "Title",
    description: "Event headline for display"
  }),

  /**
   * When the real-world event occurred
   *
   * May be approximate or extracted from text.
   * Optional because some events have unknown occurrence times.
   */
  eventTime: Schema.optional(Schema.DateTimeUtc).annotations({
    title: "Event Time",
    description: "When the real-world event occurred"
  }),

  /**
   * When the source document was published
   *
   * Used for sorting when eventTime is unavailable.
   */
  publishedAt: Schema.DateTimeUtc.annotations({
    title: "Published At",
    description: "Publication date of source document"
  }),

  /**
   * When this event was ingested into the knowledge base
   */
  ingestedAt: Schema.optional(Schema.DateTimeUtc).annotations({
    title: "Ingested At",
    description: "System timestamp when event was created"
  }),

  /**
   * Entities participating in this event
   *
   * Includes people, organizations, and other entities with their roles.
   */
  participants: Schema.Array(EntityRef).annotations({
    title: "Participants",
    description: "Entities involved in this event"
  }),

  /**
   * Assertions grouped under this event
   *
   * All facts extracted from the same source document that relate
   * to this event are grouped together.
   */
  factGroup: Schema.Array(AssertionId).annotations({
    title: "Fact Group",
    description: "Assertions belonging to this event"
  }),

  /**
   * Source documents from which this event was extracted
   *
   * At least one source document is required.
   */
  sourceDocuments: Schema.NonEmptyArray(GcsUri).annotations({
    title: "Source Documents",
    description: "GCS URIs of source documents"
  }),

  /**
   * Optional summary or description of the event
   */
  summary: Schema.optional(Schema.String).annotations({
    title: "Summary",
    description: "Brief description of the event"
  }),

  /**
   * Optional tags for additional categorization
   */
  tags: Schema.optional(Schema.Array(Schema.String)).annotations({
    title: "Tags",
    description: "Additional categorization tags"
  })
}) {
  toJSON() {
    return {
      _tag: "Event" as const,
      id: this.id,
      type: this.type,
      title: this.title,
      eventTime: this.eventTime,
      publishedAt: this.publishedAt,
      ingestedAt: this.ingestedAt,
      participants: this.participants.map((p) => p.toJSON()),
      factGroup: this.factGroup,
      sourceDocuments: this.sourceDocuments,
      summary: this.summary,
      tags: this.tags
    }
  }
}

// =============================================================================
// Helper Constructors
// =============================================================================

/**
 * Create a ClaimId from a hash
 *
 * @since 2.0.0
 * @category Constructors
 */
export const claimIdFromHash = (hash: string): ClaimId => `claim-${hash.slice(0, 12)}` as ClaimId

/**
 * Create an AssertionId from a hash
 *
 * @since 2.0.0
 * @category Constructors
 */
export const assertionIdFromHash = (hash: string): AssertionId => `assertion-${hash.slice(0, 12)}` as AssertionId

/**
 * Create a DerivedAssertionId from a hash
 *
 * @since 2.0.0
 * @category Constructors
 */
export const derivedAssertionIdFromHash = (hash: string): DerivedAssertionId =>
  `derived-${hash.slice(0, 12)}` as DerivedAssertionId

/**
 * Create an EventId from a hash
 *
 * @since 2.0.0
 * @category Constructors
 */
export const eventIdFromHash = (hash: string): EventId => `event-${hash.slice(0, 12)}` as EventId
