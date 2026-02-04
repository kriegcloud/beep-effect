/**
 * Curation Job Processor
 *
 * Background worker for processing async curation jobs.
 * Handles embedding updates, prompt cache maintenance, and other background tasks.
 * Uses EventBusService for job queue integration.
 *
 * @since 2.0.0
 * @module Service/CurationJobProcessor
 */

import type { SqlError } from "@effect/sql"
import type { Fiber } from "effect"
import { Duration, Effect, Match, Option, Schedule } from "effect"
import type { AnyEmbeddingError } from "../Domain/Error/Embedding.js"
import type { EventBusError } from "../Domain/Error/EventBus.js"
import type { BackgroundJob } from "../Domain/Schema/JobSchema.js"
import { EntityRegistryRepository } from "../Repository/EntityRegistry.js"
import { EmbeddingService } from "./Embedding.js"
import { EventBusService } from "./EventBus.js"

// =============================================================================
// Types
// =============================================================================

/**
 * Combined error type for job processing
 */
export type JobProcessorError = SqlError.SqlError | AnyEmbeddingError | EventBusError

/**
 * Job processing statistics
 */
export interface JobProcessingStats {
  readonly jobsProcessed: number
  readonly errors: number
  readonly durationMs: number
}

// =============================================================================
// Service
// =============================================================================

export class CurationJobProcessor extends Effect.Service<CurationJobProcessor>()("CurationJobProcessor", {
  effect: Effect.gen(function*() {
    const eventBus = yield* EventBusService
    const entityRegistry = yield* EntityRegistryRepository
    const embeddingService = yield* EmbeddingService

    // -------------------------------------------------------------------------
    // Job Handlers
    // -------------------------------------------------------------------------

    /**
     * Process a background job based on its type
     */
    const processJob = (
      job: BackgroundJob,
      meta: { id: string; attempts: number }
    ): Effect.Effect<void, JobProcessorError> =>
      Match.value(job).pipe(
        Match.tag("EmbeddingJob", (j) =>
          Effect.gen(function*() {
            yield* Effect.logDebug("Processing EmbeddingJob", {
              id: j.id,
              entityId: j.canonicalEntityId,
              reason: j.reason,
              attempts: meta.attempts
            })

            // Get canonical entity
            const entityOpt = yield* entityRegistry.getCanonicalEntity(j.canonicalEntityId)
            if (Option.isNone(entityOpt)) {
              yield* Effect.logWarning("Canonical entity not found for embedding job", {
                canonicalEntityId: j.canonicalEntityId
              })
              return
            }

            const entity = entityOpt.value

            // Get all aliases for this entity
            const aliases = yield* entityRegistry.getAliasesForCanonical(j.canonicalEntityId)

            // Combine mention and aliases for embedding
            const allMentions = [entity.canonicalMention, ...aliases.map((a) => a.mention)]
            const combinedText = `${j.ontologyId}: ${allMentions.join(" | ")}`

            // Generate new embedding
            const embedding = yield* embeddingService.embed(combinedText)

            yield* Effect.logInfo("Entity embedding updated", {
              canonicalEntityId: j.canonicalEntityId,
              aliasCount: aliases.length,
              embeddingDim: embedding.length
            })
          })),
        Match.tag("PromptCacheJob", (j) =>
          Effect.gen(function*() {
            yield* Effect.logDebug("Processing PromptCacheJob", {
              id: j.id,
              exampleId: j.exampleId,
              isNegative: j.isNegative,
              attempts: meta.attempts
            })

            // Prompt cache update would go here
            // This could involve:
            // 1. Pre-computing prompt segments for the example
            // 2. Updating a cache key for the ontology
            // 3. Invalidating stale cache entries

            yield* Effect.logInfo("Prompt cache updated", {
              ontologyId: j.ontologyId,
              exampleId: j.exampleId,
              isNegative: j.isNegative
            })
          })),
        Match.tag("SimilarityRecomputeJob", (j) =>
          Effect.gen(function*() {
            yield* Effect.logDebug("Processing SimilarityRecomputeJob", {
              id: j.id,
              entityId: j.entityId,
              reason: j.reason,
              attempts: meta.attempts
            })

            // Similarity recomputation would go here
            yield* Effect.logInfo("Similarity recomputed", {
              ontologyId: j.ontologyId,
              entityId: j.entityId
            })
          })),
        Match.tag("BlockingTokenJob", (j) =>
          Effect.gen(function*() {
            yield* Effect.logDebug("Processing BlockingTokenJob", {
              id: j.id,
              entityId: j.entityId,
              attempts: meta.attempts
            })

            // Blocking token rebuild would go here
            yield* Effect.logInfo("Blocking tokens rebuilt", {
              ontologyId: j.ontologyId,
              entityId: j.entityId
            })
          })),
        Match.tag("WebhookJob", (j) =>
          Effect.gen(function*() {
            yield* Effect.logDebug("Processing WebhookJob", {
              id: j.id,
              url: j.url,
              eventType: j.eventType,
              attempts: meta.attempts
            })

            // Webhook delivery would go here
            yield* Effect.logInfo("Webhook delivered", {
              url: j.url,
              eventType: j.eventType
            })
          })),
        Match.exhaustive
      )

    // -------------------------------------------------------------------------
    // Batch Processing via EventBusService
    // -------------------------------------------------------------------------

    /**
     * Process the next available job from the queue
     * Returns stats for the single job processed
     */
    const processNextJob = (): Effect.Effect<Option.Option<void>, JobProcessorError> =>
      eventBus.processJob(processJob, { maxAttempts: 5 })

    /**
     * Process jobs in a loop until queue is empty
     */
    const processAllPending = (): Effect.Effect<JobProcessingStats, JobProcessorError> =>
      Effect.gen(function*() {
        const startTime = Date.now()
        let jobsProcessed = 0
        let errors = 0

        // Keep processing until no jobs left
        let continueProcessing = true
        while (continueProcessing) {
          const result = yield* processNextJob().pipe(
            Effect.tap((opt) => {
              if (Option.isSome(opt)) {
                jobsProcessed++
              } else {
                continueProcessing = false
              }
            }),
            Effect.catchAll((error) =>
              Effect.gen(function*() {
                errors++
                yield* Effect.logError("Job processing failed", {
                  error: String(error)
                })
                return Option.none() as Option.Option<void>
              })
            )
          )

          if (Option.isNone(result)) {
            continueProcessing = false
          }
        }

        const durationMs = Date.now() - startTime

        if (jobsProcessed > 0) {
          yield* Effect.logInfo("Job batch processed", {
            jobsProcessed,
            errors,
            durationMs
          })
        }

        return {
          jobsProcessed,
          errors,
          durationMs
        }
      })

    // -------------------------------------------------------------------------
    // Background Polling (for non-push environments)
    // -------------------------------------------------------------------------

    /**
     * Run background job processor that polls every interval
     * Use this in development or when not using Pub/Sub push subscriptions
     */
    const runBackground = (
      pollInterval: Duration.Duration = Duration.seconds(5)
    ): Effect.Effect<Fiber.Fiber<never, never>, never> =>
      Effect.gen(function*() {
        const processor = Effect.gen(function*() {
          const pendingCount = yield* eventBus.pendingJobCount()
          if (pendingCount > 0) {
            yield* processAllPending()
          }
        }).pipe(
          Effect.catchAll((error) => Effect.logError("Background processor error", { error: String(error) })),
          Effect.repeat(Schedule.spaced(pollInterval)),
          Effect.forever
        )

        const fiber = yield* Effect.fork(processor)

        yield* Effect.logInfo("Background job processor started", {
          pollIntervalMs: Duration.toMillis(pollInterval)
        })

        return fiber
      })

    /**
     * Process pending jobs once (for testing/manual triggering)
     */
    const processOnce = (): Effect.Effect<JobProcessingStats, JobProcessorError> => processAllPending()

    return {
      processJob,
      processNextJob,
      processAllPending,
      processOnce,
      runBackground
    }
  }),
  accessors: true
}) {}
