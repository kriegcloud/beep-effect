/**
 * Curation Service
 *
 * Service for applying curation actions to claims and entities.
 * Handles corrections, deprecations, alias additions, and rank promotions.
 * Publishes events via EventBusService and queues background jobs for async processing.
 *
 * @since 2.0.0
 * @module Service/Curation
 */

import type { SqlError } from "@effect/sql"
import type { Stream } from "effect"
import { DateTime, Effect, Option } from "effect"
import type { AnyEmbeddingError } from "../Domain/Error/Embedding.js"
import type { EventBusError } from "../Domain/Error/EventBus.js"
import type {
  AddAliasAction,
  CorrectTripleAction,
  CurationAction,
  LinkToWikidataAction,
  MarkAsWrongAction,
  PromoteToPreferredAction
} from "../Domain/Schema/CurationAction.js"
import { EmbeddingJob, PromptCacheJob } from "../Domain/Schema/JobSchema.js"
import { ClaimRepository } from "../Repository/Claim.js"
import { EntityRegistryRepository } from "../Repository/EntityRegistry.js"
import { ExamplesRepository } from "../Repository/Examples.js"
import { EmbeddingService } from "./Embedding.js"
import { EventBusService, type EventEntry } from "./EventBus.js"

// =============================================================================
// Types
// =============================================================================

/**
 * Combined error type for curation service operations
 */
export type CurationServiceError = SqlError.SqlError | AnyEmbeddingError | EventBusError

/**
 * Result of applying a curation action
 */
export interface CurationResult {
  readonly action: CurationAction["_tag"]
  readonly success: boolean
  readonly details?: Record<string, unknown>
}

// =============================================================================
// Service
// =============================================================================

export class CurationService extends Effect.Service<CurationService>()("CurationService", {
  effect: Effect.gen(function*() {
    const claimRepo = yield* ClaimRepository
    const entityRegistry = yield* EntityRegistryRepository
    const examplesRepo = yield* ExamplesRepository
    const embeddingService = yield* EmbeddingService
    const eventBus = yield* EventBusService

    // -------------------------------------------------------------------------
    // Action Handlers
    // -------------------------------------------------------------------------

    /**
     * Apply a curation action and publish resulting events
     */
    const applyAction = (
      action: CurationAction
    ): Effect.Effect<CurationResult, CurationServiceError> =>
      Effect.gen(function*() {
        const now = DateTime.unsafeNow()

        const result: CurationResult = yield* (() => {
          switch (action._tag) {
            case "CorrectTripleAction":
              return handleCorrectTriple(action, now)
            case "MarkAsWrongAction":
              return handleMarkAsWrong(action, now)
            case "AddAliasAction":
              return handleAddAlias(action, now)
            case "PromoteToPreferredAction":
              return handlePromoteToPreferred(action, now)
            case "LinkToWikidataAction":
              return handleLinkToWikidata(action, now)
          }
        })()

        return result
      })

    /**
     * Handle CorrectTripleAction
     */
    const handleCorrectTriple = (
      action: CorrectTripleAction,
      now: DateTime.Utc
    ): Effect.Effect<CurationResult, CurationServiceError> =>
      Effect.gen(function*() {
        // Get original claim
        const originalOpt = yield* claimRepo.getClaim(action.originalClaimId)
        if (Option.isNone(originalOpt)) {
          yield* Effect.logWarning("Claim not found for correction", {
            claimId: action.originalClaimId
          })
          return { action: "CorrectTripleAction", success: false, details: { reason: "claim_not_found" } }
        }

        const original = originalOpt.value

        // Create correction record
        const correction = yield* claimRepo.insertCorrection({
          correctionType: "update",
          correctionDate: DateTime.toDate(now),
          reason: action.reason ?? action.note ?? "Manual correction"
        })

        // Deprecate original claim
        yield* claimRepo.deprecateClaim(action.originalClaimId, correction.id)

        // Create corrected claim
        const newClaim = yield* claimRepo.insertClaim({
          ontologyId: action.ontologyId,
          subjectIri: action.correctedSubject ?? original.subjectIri,
          predicateIri: action.correctedPredicate ?? original.predicateIri,
          objectValue: action.correctedObject ?? original.objectValue,
          rank: "normal",
          articleId: original.articleId,
          confidenceScore: original.confidenceScore,
          validFrom: original.validFrom,
          validTo: original.validTo
        })

        // Link claims to correction
        yield* claimRepo.linkClaimsToCorrection(
          correction.id,
          action.originalClaimId,
          newClaim.id
        )

        // Store as example if requested
        if (action.storeAsExample) {
          const example = yield* createExampleFromClaim(
            action.ontologyId,
            newClaim,
            original,
            false
          )

          // Queue prompt cache update job via EventBusService
          yield* eventBus.enqueueJob(
            new PromptCacheJob({
              id: PromptCacheJob.makeId(action.ontologyId, example.id, DateTime.toEpochMillis(now)),
              ontologyId: action.ontologyId,
              exampleId: example.id,
              isNegative: false,
              createdAt: now
            })
          )
        }

        // Publish event via EventBusService
        yield* eventBus.publishCurationEvent("ClaimCorrected", {
          ontologyId: action.ontologyId,
          originalClaimId: action.originalClaimId,
          newClaimId: newClaim.id,
          correctionId: correction.id,
          curatorId: Option.fromNullable(action.curatorId),
          timestamp: DateTime.toDate(now)
        })

        return {
          action: "CorrectTripleAction",
          success: true,
          details: { newClaimId: newClaim.id, correctionId: correction.id }
        }
      })

    /**
     * Handle MarkAsWrongAction
     */
    const handleMarkAsWrong = (
      action: MarkAsWrongAction,
      now: DateTime.Utc
    ): Effect.Effect<CurationResult, CurationServiceError> =>
      Effect.gen(function*() {
        // Get claim
        const claimOpt = yield* claimRepo.getClaim(action.claimId)
        if (Option.isNone(claimOpt)) {
          yield* Effect.logWarning("Claim not found for deprecation", {
            claimId: action.claimId
          })
          return { action: "MarkAsWrongAction", success: false, details: { reason: "claim_not_found" } }
        }

        const claim = claimOpt.value

        // Create correction record for deprecation
        const correction = yield* claimRepo.insertCorrection({
          correctionType: "retraction",
          correctionDate: DateTime.toDate(now),
          reason: action.note ?? action.errorCategory ?? "Marked as wrong"
        })

        // Deprecate the claim
        yield* claimRepo.deprecateClaim(action.claimId, correction.id)

        // Link claim to correction (no new claim)
        yield* claimRepo.linkClaimsToCorrection(
          correction.id,
          action.claimId
        )

        // Store as negative example if requested
        let negativeExampleId: string | undefined
        if (action.storeAsNegativeExample !== false) {
          const example = yield* createNegativeExample(action.ontologyId, claim, action)
          negativeExampleId = example.id

          // Queue prompt cache update job via EventBusService
          yield* eventBus.enqueueJob(
            new PromptCacheJob({
              id: PromptCacheJob.makeId(action.ontologyId, example.id, DateTime.toEpochMillis(now)),
              ontologyId: action.ontologyId,
              exampleId: example.id,
              isNegative: true,
              createdAt: now
            })
          )
        }

        // Publish event via EventBusService
        yield* eventBus.publishCurationEvent("ClaimDeprecated", {
          ontologyId: action.ontologyId,
          claimId: action.claimId,
          reason: Option.fromNullable(action.errorCategory ?? action.note),
          negativeExampleId: Option.fromNullable(negativeExampleId),
          curatorId: Option.fromNullable(action.curatorId),
          timestamp: DateTime.toDate(now)
        })

        return {
          action: "MarkAsWrongAction",
          success: true,
          details: { negativeExampleId }
        }
      })

    /**
     * Handle AddAliasAction
     */
    const handleAddAlias = (
      action: AddAliasAction,
      now: DateTime.Utc
    ): Effect.Effect<CurationResult, CurationServiceError> =>
      Effect.gen(function*() {
        // Find canonical entity by IRI
        const canonicalOpt = yield* entityRegistry.getCanonicalEntityByIri(action.canonicalEntityIri)
        if (Option.isNone(canonicalOpt)) {
          yield* Effect.logWarning("Canonical entity not found for alias", {
            iri: action.canonicalEntityIri
          })
          return { action: "AddAliasAction", success: false, details: { reason: "entity_not_found" } }
        }

        const canonical = canonicalOpt.value

        // Embed the alias
        const prefixedMention = `${action.ontologyId}: ${action.aliasMention}`
        const embedding = yield* embeddingService.embed(prefixedMention)

        // Insert alias
        const alias = yield* entityRegistry.insertAlias({
          ontologyId: action.ontologyId,
          canonicalEntityId: canonical.id,
          mention: action.aliasMention,
          mentionNormalized: action.aliasMention.toLowerCase().trim(),
          embedding: embedding as Array<number>,
          resolutionMethod: action.resolutionMethod ?? "manual",
          resolutionConfidence: String(action.confidence ?? 1.0)
        })

        // Rebuild blocking tokens
        yield* entityRegistry.rebuildBlockingTokens(
          action.ontologyId,
          canonical.id,
          `${canonical.canonicalMention} ${action.aliasMention}`
        )

        // Queue embedding job to update canonical entity embedding via EventBusService
        yield* eventBus.enqueueJob(
          new EmbeddingJob({
            id: EmbeddingJob.makeId(action.ontologyId, canonical.id, DateTime.toEpochMillis(now)),
            ontologyId: action.ontologyId,
            canonicalEntityId: canonical.id,
            reason: "alias_added",
            createdAt: now
          })
        )

        // Publish event via EventBusService
        yield* eventBus.publishCurationEvent("AliasAdded", {
          ontologyId: action.ontologyId,
          canonicalEntityIri: action.canonicalEntityIri,
          aliasMention: action.aliasMention,
          aliasId: alias.id,
          curatorId: Option.fromNullable(action.curatorId),
          timestamp: DateTime.toDate(now)
        })

        return {
          action: "AddAliasAction",
          success: true,
          details: { aliasId: alias.id }
        }
      })

    /**
     * Handle PromoteToPreferredAction
     */
    const handlePromoteToPreferred = (
      action: PromoteToPreferredAction,
      now: DateTime.Utc
    ): Effect.Effect<CurationResult, CurationServiceError> =>
      Effect.gen(function*() {
        yield* claimRepo.promoteToPreferred(action.claimId)

        // Publish event via EventBusService
        yield* eventBus.publishCurationEvent("ClaimPromoted", {
          ontologyId: action.ontologyId,
          claimId: action.claimId,
          curatorId: Option.fromNullable(action.curatorId),
          timestamp: DateTime.toDate(now)
        })

        return {
          action: "PromoteToPreferredAction",
          success: true,
          details: { claimId: action.claimId }
        }
      })

    /**
     * Handle LinkToWikidataAction
     */
    const handleLinkToWikidata = (
      action: LinkToWikidataAction,
      now: DateTime.Utc
    ): Effect.Effect<CurationResult, CurationServiceError> =>
      Effect.gen(function*() {
        // Log the link - actual linking would involve updating the RDF store
        yield* Effect.logInfo("Wikidata link recorded", {
          entity: action.canonicalEntityIri,
          qid: action.wikidataQid,
          score: action.reconciliationScore
        })

        // Publish event via EventBusService
        yield* eventBus.publishCurationEvent("EntityLinked", {
          ontologyId: action.ontologyId,
          canonicalEntityIri: action.canonicalEntityIri,
          wikidataQid: action.wikidataQid,
          reconciliationScore: Option.fromNullable(action.reconciliationScore),
          curatorId: Option.fromNullable(action.curatorId),
          timestamp: DateTime.toDate(now)
        })

        return {
          action: "LinkToWikidataAction",
          success: true,
          details: { wikidataQid: action.wikidataQid }
        }
      })

    // -------------------------------------------------------------------------
    // Helper Functions
    // -------------------------------------------------------------------------

    /**
     * Create a positive example from a corrected claim
     */
    const createExampleFromClaim = (
      ontologyId: string,
      newClaim: { id: string; subjectIri: string; predicateIri: string; objectValue: string },
      originalClaim: { subjectIri: string; predicateIri: string; objectValue: string },
      isNegative: boolean
    ) =>
      Effect.gen(function*() {
        // Build input text from original claim
        const inputText =
          `Subject: ${originalClaim.subjectIri}, Predicate: ${originalClaim.predicateIri}, Object: ${originalClaim.objectValue}`

        // Build expected output
        const expectedOutput = {
          subject: newClaim.subjectIri,
          predicate: newClaim.predicateIri,
          object: newClaim.objectValue
        }

        const prefixedInput = `${ontologyId}: ${inputText}`
        const embedding = yield* embeddingService.embed(prefixedInput)

        return yield* examplesRepo.create({
          ontologyId,
          exampleType: "entity_extraction",
          source: "validated",
          inputText,
          expectedOutput,
          embedding,
          isNegative,
          explanation: "Corrected claim - use as positive example"
        })
      })

    /**
     * Create a negative example from a wrong claim
     */
    const createNegativeExample = (
      ontologyId: string,
      claim: { subjectIri: string; predicateIri: string; objectValue: string },
      action: MarkAsWrongAction
    ) =>
      Effect.gen(function*() {
        const inputText = `Subject: ${claim.subjectIri}, Predicate: ${claim.predicateIri}, Object: ${claim.objectValue}`

        const expectedOutput = {
          shouldNotExtract: true,
          errorCategory: action.errorCategory,
          pattern: action.negativePattern
        }

        const prefixedInput = `${ontologyId}: ${inputText}`
        const embedding = yield* embeddingService.embed(prefixedInput)

        return yield* examplesRepo.create({
          ontologyId,
          exampleType: "negative",
          source: "validated",
          inputText,
          expectedOutput,
          embedding,
          isNegative: true,
          negativePattern: action.negativePattern,
          explanation: action.note ?? `Error category: ${action.errorCategory ?? "unknown"}`
        })
      })

    // -------------------------------------------------------------------------
    // Subscriptions
    // -------------------------------------------------------------------------

    /**
     * Subscribe to curation events (scoped - requires Effect.scoped)
     */
    const subscribe = (): Effect.Effect<Stream.Stream<EventEntry, EventBusError>, EventBusError> =>
      eventBus.subscribeEvents()

    return {
      applyAction,
      subscribe
    }
  }),
  accessors: true
}) {}
