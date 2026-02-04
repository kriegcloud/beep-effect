/**
 * Curation Action Types
 *
 * Tagged union types for curation actions. These represent the
 * different ways a human curator can interact with extracted claims
 * and entities.
 *
 * @since 2.0.0
 * @module Domain/Schema/CurationAction
 */

import { Data, Schema } from "effect"

// =============================================================================
// Action Types (Tagged Union)
// =============================================================================

/**
 * Base fields common to all curation actions
 */
const CurationActionBase = Schema.Struct({
  /** Ontology scope for the action */
  ontologyId: Schema.String,
  /** ID of the user performing the curation */
  curatorId: Schema.optional(Schema.String),
  /** Optional note explaining the action */
  note: Schema.optional(Schema.String),
  /** Timestamp of the action (defaults to now) */
  timestamp: Schema.optional(Schema.DateTimeUtc)
})

/**
 * CorrectTripleAction - Replace an incorrect claim with a corrected one
 *
 * Deprecates the original claim and creates a new claim with the correct values.
 * Both claims are linked via a Correction entity.
 */
export class CorrectTripleAction extends Schema.TaggedClass<CorrectTripleAction>()(
  "CorrectTripleAction",
  {
    ...CurationActionBase.fields,
    /** ID of the claim to correct */
    originalClaimId: Schema.String,
    /** Corrected subject IRI */
    correctedSubject: Schema.optional(Schema.String),
    /** Corrected predicate IRI */
    correctedPredicate: Schema.optional(Schema.String),
    /** Corrected object (IRI or literal value) */
    correctedObject: Schema.optional(Schema.String),
    /** Reason for the correction */
    reason: Schema.optional(Schema.String),
    /** Whether to store as a positive example */
    storeAsExample: Schema.optional(Schema.Boolean)
  }
) {}

/**
 * MarkAsWrongAction - Mark a claim as incorrect without providing correction
 *
 * Deprecates the claim and optionally stores it as a negative example
 * to help the model avoid similar mistakes.
 */
export class MarkAsWrongAction extends Schema.TaggedClass<MarkAsWrongAction>()(
  "MarkAsWrongAction",
  {
    ...CurationActionBase.fields,
    /** ID of the claim to mark as wrong */
    claimId: Schema.String,
    /** Category of error (e.g., "hallucination", "wrong_type", "wrong_relation") */
    errorCategory: Schema.optional(Schema.String),
    /** Pattern description for negative example (e.g., "extracting occupation from job title mention") */
    negativePattern: Schema.optional(Schema.String),
    /** Whether to store as a negative example (defaults to true) */
    storeAsNegativeExample: Schema.optionalWith(Schema.Boolean, { default: () => true })
  }
) {}

/**
 * AddAliasAction - Add an alias for an entity
 *
 * Links a surface form mention to a canonical entity. This helps with
 * entity resolution on future extractions.
 */
export class AddAliasAction extends Schema.TaggedClass<AddAliasAction>()(
  "AddAliasAction",
  {
    ...CurationActionBase.fields,
    /** IRI of the canonical entity */
    canonicalEntityIri: Schema.String,
    /** The alias mention to add */
    aliasMention: Schema.String,
    /** Resolution method to record (defaults to "manual") */
    resolutionMethod: Schema.optionalWith(Schema.String, { default: () => "manual" }),
    /** Confidence for the alias link (defaults to 1.0) */
    confidence: Schema.optionalWith(Schema.Number, { default: () => 1.0 })
  }
) {}

/**
 * PromoteToPreferredAction - Promote a claim to preferred rank
 *
 * Changes the claim's rank from Normal to Preferred, indicating
 * it's the authoritative statement for this fact.
 */
export class PromoteToPreferredAction extends Schema.TaggedClass<PromoteToPreferredAction>()(
  "PromoteToPreferredAction",
  {
    ...CurationActionBase.fields,
    /** ID of the claim to promote */
    claimId: Schema.String,
    /** Reason for promotion (e.g., "verified from official source") */
    reason: Schema.optional(Schema.String)
  }
) {}

/**
 * LinkToWikidataAction - Link a canonical entity to Wikidata
 *
 * Adds an owl:sameAs link to a Wikidata entity after confirmation
 * (typically requires high reconciliation score).
 */
export class LinkToWikidataAction extends Schema.TaggedClass<LinkToWikidataAction>()(
  "LinkToWikidataAction",
  {
    ...CurationActionBase.fields,
    /** IRI of the canonical entity */
    canonicalEntityIri: Schema.String,
    /** Wikidata QID (e.g., "Q12345") */
    wikidataQid: Schema.String,
    /** Reconciliation score that led to this link */
    reconciliationScore: Schema.optional(Schema.Number)
  }
) {}

/**
 * Union of all curation action types
 */
export type CurationAction =
  | CorrectTripleAction
  | MarkAsWrongAction
  | AddAliasAction
  | PromoteToPreferredAction
  | LinkToWikidataAction

/**
 * Schema for the curation action union
 */
export const CurationActionSchema = Schema.Union(
  CorrectTripleAction,
  MarkAsWrongAction,
  AddAliasAction,
  PromoteToPreferredAction,
  LinkToWikidataAction
)

// =============================================================================
// Event Types (Published after action is applied)
// =============================================================================

/**
 * ClaimCorrectedEvent - Emitted when a claim is corrected
 */
export class ClaimCorrectedEvent extends Data.TaggedClass("ClaimCorrectedEvent")<{
  readonly ontologyId: string
  readonly originalClaimId: string
  readonly newClaimId: string
  readonly correctionId: string
  readonly curatorId?: string
  readonly timestamp: Date
}> {}

/**
 * ClaimDeprecatedEvent - Emitted when a claim is marked as wrong
 */
export class ClaimDeprecatedEvent extends Data.TaggedClass("ClaimDeprecatedEvent")<{
  readonly ontologyId: string
  readonly claimId: string
  readonly reason?: string
  readonly negativeExampleId?: string
  readonly curatorId?: string
  readonly timestamp: Date
}> {}

/**
 * AliasAddedEvent - Emitted when an alias is added
 */
export class AliasAddedEvent extends Data.TaggedClass("AliasAddedEvent")<{
  readonly ontologyId: string
  readonly canonicalEntityIri: string
  readonly aliasMention: string
  readonly aliasId: string
  readonly curatorId?: string
  readonly timestamp: Date
}> {}

/**
 * ClaimPromotedEvent - Emitted when a claim is promoted to preferred
 */
export class ClaimPromotedEvent extends Data.TaggedClass("ClaimPromotedEvent")<{
  readonly ontologyId: string
  readonly claimId: string
  readonly curatorId?: string
  readonly timestamp: Date
}> {}

/**
 * EntityLinkedEvent - Emitted when an entity is linked to Wikidata
 */
export class EntityLinkedEvent extends Data.TaggedClass("EntityLinkedEvent")<{
  readonly ontologyId: string
  readonly canonicalEntityIri: string
  readonly wikidataQid: string
  readonly reconciliationScore?: number
  readonly curatorId?: string
  readonly timestamp: Date
}> {}

/**
 * Union of all curation events
 */
export type CurationEvent =
  | ClaimCorrectedEvent
  | ClaimDeprecatedEvent
  | AliasAddedEvent
  | ClaimPromotedEvent
  | EntityLinkedEvent

// =============================================================================
// Job Types (Queued for async processing)
// =============================================================================

/**
 * EmbeddingJob - Re-embed an entity after alias addition
 */
export class EmbeddingJob extends Data.TaggedClass("EmbeddingJob")<{
  readonly ontologyId: string
  readonly canonicalEntityId: string
  readonly reason: string
}> {}

/**
 * PromptCacheJob - Update prompt cache with new example
 */
export class PromptCacheJob extends Data.TaggedClass("PromptCacheJob")<{
  readonly ontologyId: string
  readonly exampleId: string
  readonly isNegative: boolean
}> {}

/**
 * Union of all curation jobs
 */
export type CurationJob = EmbeddingJob | PromptCacheJob
