/**
 * Event Schemas for EventLog
 *
 * Defines domain events using @effect/experimental EventGroup.
 * These events are persisted to EventJournal for idempotency
 * and can be bridged to Cloud Pub/Sub for distribution.
 *
 * @since 2.0.0
 * @module Domain/Schema/EventSchema
 */

import * as EventGroup from "@effect/experimental/EventGroup"
import { Schema } from "effect"

// =============================================================================
// Curation Events
// =============================================================================

/**
 * Events related to curation actions (corrections, deprecations, aliases)
 *
 * @since 2.0.0
 */
export const CurationEventGroup = EventGroup.empty
  .add({
    tag: "ClaimCorrected",
    primaryKey: (p) => `${p.ontologyId}:correction:${p.originalClaimId}`,
    payload: Schema.Struct({
      ontologyId: Schema.String,
      originalClaimId: Schema.String,
      newClaimId: Schema.String,
      correctionId: Schema.String,
      curatorId: Schema.optionalWith(Schema.String, { as: "Option" }),
      timestamp: Schema.DateFromSelf
    }),
    success: Schema.Void
  })
  .add({
    tag: "ClaimDeprecated",
    primaryKey: (p) => `${p.ontologyId}:deprecation:${p.claimId}`,
    payload: Schema.Struct({
      ontologyId: Schema.String,
      claimId: Schema.String,
      reason: Schema.optionalWith(Schema.String, { as: "Option" }),
      negativeExampleId: Schema.optionalWith(Schema.String, { as: "Option" }),
      curatorId: Schema.optionalWith(Schema.String, { as: "Option" }),
      timestamp: Schema.DateFromSelf
    }),
    success: Schema.Void
  })
  .add({
    tag: "AliasAdded",
    primaryKey: (p) => `${p.ontologyId}:alias:${p.aliasId}`,
    payload: Schema.Struct({
      ontologyId: Schema.String,
      canonicalEntityIri: Schema.String,
      aliasMention: Schema.String,
      aliasId: Schema.String,
      curatorId: Schema.optionalWith(Schema.String, { as: "Option" }),
      timestamp: Schema.DateFromSelf
    }),
    success: Schema.Void
  })
  .add({
    tag: "ClaimPromoted",
    primaryKey: (p) => `${p.ontologyId}:promotion:${p.claimId}`,
    payload: Schema.Struct({
      ontologyId: Schema.String,
      claimId: Schema.String,
      curatorId: Schema.optionalWith(Schema.String, { as: "Option" }),
      timestamp: Schema.DateFromSelf
    }),
    success: Schema.Void
  })
  .add({
    tag: "EntityLinked",
    primaryKey: (p) => `${p.ontologyId}:link:${p.canonicalEntityIri}:${p.wikidataQid}`,
    payload: Schema.Struct({
      ontologyId: Schema.String,
      canonicalEntityIri: Schema.String,
      wikidataQid: Schema.String,
      reconciliationScore: Schema.optionalWith(Schema.Number, { as: "Option" }),
      curatorId: Schema.optionalWith(Schema.String, { as: "Option" }),
      timestamp: Schema.DateFromSelf
    }),
    success: Schema.Void
  })

/**
 * Type of events in CurationEventGroup
 *
 * @since 2.0.0
 */
export type CurationEvent = EventGroup.EventGroup.Events<typeof CurationEventGroup>

// =============================================================================
// Extraction Events
// =============================================================================

/**
 * Events related to extraction workflow
 *
 * @since 2.0.0
 */
export const ExtractionEventGroup = EventGroup.empty
  .add({
    tag: "ExtractionCompleted",
    primaryKey: (p) => `extraction:${p.batchId}`,
    payload: Schema.Struct({
      batchId: Schema.String,
      ontologyId: Schema.String,
      entityCount: Schema.Number,
      relationCount: Schema.Number,
      tripleCount: Schema.Number,
      outputUri: Schema.optionalWith(Schema.String, { as: "Option" }),
      status: Schema.Literal("success", "partial", "failed"),
      timestamp: Schema.DateFromSelf
    }),
    success: Schema.Void
  })
  .add({
    tag: "ValidationFailed",
    primaryKey: (p) => `validation:${p.batchId}:${p.validationId}`,
    payload: Schema.Struct({
      batchId: Schema.String,
      validationId: Schema.String,
      ontologyId: Schema.String,
      errorCount: Schema.Number,
      warningCount: Schema.Number,
      reportUri: Schema.optionalWith(Schema.String, { as: "Option" }),
      timestamp: Schema.DateFromSelf
    }),
    success: Schema.Void
  })
  .add({
    tag: "BatchStateChanged",
    primaryKey: (p) => `batch:${p.batchId}`,
    payload: Schema.Struct({
      batchId: Schema.String,
      ontologyId: Schema.String,
      /** The batch state tag (Pending, Extracting, Complete, etc.) */
      stage: Schema.String,
      /** Full state payload as JSON */
      state: Schema.Unknown,
      timestamp: Schema.DateFromSelf
    }),
    success: Schema.Void
  })

/**
 * Type of events in ExtractionEventGroup
 *
 * @since 2.0.0
 */
export type ExtractionEvent = EventGroup.EventGroup.Events<typeof ExtractionEventGroup>

// =============================================================================
// Combined Event Schema
// =============================================================================

/**
 * All domain events combined into a single EventLog schema
 *
 * @since 2.0.0
 */
export const OntologyEventGroups = [CurationEventGroup, ExtractionEventGroup] as const

/**
 * Union of all domain events
 *
 * @since 2.0.0
 */
export type OntologyEvent = CurationEvent | ExtractionEvent
