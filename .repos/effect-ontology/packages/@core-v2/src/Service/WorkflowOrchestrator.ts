/**
 * Workflow Orchestrator Service
 *
 * Provides a high-level API for executing batch extraction workflows
 * with durable persistence via @effect/workflow's WorkflowEngine.
 *
 * Architecture:
 * - Uses Workflow.make for workflow definition with typed payload/success/error schemas
 * - Durable activities are journaled for crash recovery
 * - ClusterWorkflowEngine provides PostgreSQL-backed persistence
 * - Supports both synchronous (blocking) and fire-and-forget execution
 *
 * @since 2.0.0
 * @module Service/WorkflowOrchestrator
 */

import { Workflow, WorkflowEngine } from "@effect/workflow"
import { Cause, Context, DateTime, Effect, Exit, Hash, Layer, Match, Option, Ref, Schedule, Schema } from "effect"
import { WorkflowError, WorkflowNotFoundError, WorkflowSuspendedError } from "../Domain/Error/Workflow.js"
import type { BatchId, DocumentId, GcsUri } from "../Domain/Identity.js"
import { BatchState, type DocumentStatus } from "../Domain/Model/BatchWorkflow.js"
import { BatchManifest, BatchWorkflowPayload } from "../Domain/Schema/Batch.js"
import { EnrichedManifest } from "../Domain/Schema/DocumentMetadata.js"
import {
  makeClaimPersistenceActivity,
  makeCrossBatchResolutionActivity,
  makeInferenceActivity,
  makeIngestionActivity,
  makePreprocessingActivity,
  makeResolutionActivity,
  makeValidationActivity
} from "../Workflow/DurableActivities.js"
import { makeStreamingExtractionActivity } from "../Workflow/StreamingExtractionActivity.js"
import { getBatchStateFromStore, publishState } from "./BatchState.js"
import { ConfigService } from "./Config.js"
import { EventBusService } from "./EventBus.js"
import { StorageService } from "./Storage.js"

/**
 * Serialize an error to a human-readable string
 *
 * Handles:
 * - Standard Error instances (uses message)
 * - Schema ParseError (uses _message property)
 * - Effect Cause objects (uses pretty format)
 * - Objects with message property
 * - Falls back to JSON.stringify for other objects
 */
const serializeError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  // Schema ParseError has _message property
  if (typeof error === "object" && error !== null) {
    if ("_message" in error && typeof (error as { _message: unknown })._message === "string") {
      return (error as { _message: string })._message
    }
    if ("message" in error && typeof (error as { message: unknown }).message === "string") {
      return (error as { message: string }).message
    }
    // Try JSON.stringify for other objects
    try {
      return JSON.stringify(error, null, 2)
    } catch {
      return String(error)
    }
  }
  return String(error)
}

/**
 * Extract filename from a path (local or GCS URI)
 */
const extractFilename = (path: string): string => {
  if (path.startsWith("gs://")) {
    const parts = path.split("/")
    return parts[parts.length - 1]
  }
  const parts = path.split("/")
  return parts[parts.length - 1]
}

/**
 * Validate that manifest ontologyUri is consistent with config.
 */
const validateOntologyConsistency = (
  manifestOntologyUri: string,
  configOntologyPath: string,
  strictValidation: boolean,
  batchId: string
) =>
  Effect.gen(function*() {
    const manifestFilename = extractFilename(manifestOntologyUri)
    const configFilename = extractFilename(configOntologyPath)

    if (manifestFilename !== configFilename) {
      const message =
        `Ontology mismatch: manifest uses "${manifestOntologyUri}" but extraction uses "${configOntologyPath}". ` +
        `Extraction will use the configured ontology, not the manifest ontology.`

      if (strictValidation) {
        yield* Effect.logError("Ontology validation failed (strict mode)", {
          batchId,
          manifestOntologyUri,
          configOntologyPath
        })
        return yield* Effect.fail(
          `Ontology mismatch: extraction uses "${configOntologyPath}" but manifest specifies "${manifestOntologyUri}".`
        )
      }

      yield* Effect.logWarning(message, { batchId, manifestOntologyUri, configOntologyPath })
    }
  })

type BatchWorkflowPayloadType = typeof BatchWorkflowPayload.Type
type PipelineStage = "pending" | "preprocessing" | "extracting" | "resolving" | "validating" | "ingesting"

// -----------------------------------------------------------------------------
// Workflow Definition
// -----------------------------------------------------------------------------

/**
 * Batch Extraction Workflow
 *
 * Orchestrates the 5-stage pipeline:
 * 1. Preprocessing: Classify documents, compute metadata, determine chunking strategies
 * 2. Extraction: Extract entities/relations from each document
 * 3. Resolution: Merge graphs and resolve entity references
 * 4. Validation: Validate against SHACL shapes (optional)
 * 5. Ingestion: Write to canonical store
 *
 * The workflow is durable - if it crashes, it will resume from the last
 * completed activity on restart. Preprocessing has graceful fallback -
 * if classification fails, the workflow continues with default metadata.
 */
export const BatchExtractionWorkflow = Workflow.make({
  name: "batch-extraction",
  payload: BatchWorkflowPayload,
  success: BatchState,
  error: Schema.String,
  idempotencyKey: (payload: BatchWorkflowPayloadType) => {
    const hash = Hash.string(JSON.stringify({
      ontologyVersion: payload.ontologyVersion,
      ontologyUri: payload.ontologyUri,
      targetNamespace: payload.targetNamespace,
      shaclUri: payload.shaclUri,
      documentIds: [...payload.documentIds].sort()
    }))

    return `${payload.batchId}-${Math.abs(hash).toString(16).slice(0, 8)}`
  },
  annotations: Context.make(Workflow.SuspendOnFailure, true).pipe(
    Context.add(Workflow.CaptureDefects, true)
  ),
  suspendedRetrySchedule: Schedule.exponential("1 second").pipe(
    Schedule.compose(Schedule.recurs(5)),
    Schedule.jittered
  )
})

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

const stripGsPrefix = (uri: string): string => uri.startsWith("gs://") ? uri.replace(/^gs:\/\/[^/]+\//, "") : uri

const parseManifest = (raw: string) => Schema.decodeUnknownSync(Schema.parseJson(BatchManifest))(raw)

const expectValue = <A>(opt: Option.Option<A>, key: string) =>
  Option.match(opt, {
    onNone: () => Effect.fail(new Error(`Missing object at ${key}`)),
    onSome: (value) => Effect.succeed(value)
  })

const stageFromState = (state: BatchState): PipelineStage =>
  Match.value(state).pipe(
    Match.tag("Pending", () => "pending" as const),
    Match.tag("Preprocessing", () => "preprocessing" as const),
    Match.tag("Extracting", () => "extracting" as const),
    Match.tag("Resolving", () => "resolving" as const),
    Match.tag("Validating", () => "validating" as const),
    Match.tag("Ingesting", () => "ingesting" as const),
    Match.tag("Complete", () => "ingesting" as const),
    Match.tag("Failed", (s) => s.failedInStage),
    Match.exhaustive
  )

const toFailedState = (state: BatchState, cause: Cause.Cause<unknown>): BatchState => {
  if (state._tag === "Failed") {
    return state
  }

  const failedAt = DateTime.unsafeNow()
  const failedStage = stageFromState(state)

  return {
    _tag: "Failed",
    batchId: state.batchId,
    ontologyId: state.ontologyId,
    manifestUri: state.manifestUri,
    ontologyVersion: state.ontologyVersion,
    createdAt: state.createdAt,
    updatedAt: failedAt,
    failedAt,
    failedInStage: failedStage,
    error: {
      code: "WORKFLOW_FAILED",
      message: Cause.pretty(cause),
      cause: Cause.squash(cause)
    },
    lastSuccessfulStage: state._tag === "Pending" ? undefined : failedStage
  }
}

export const handleWorkflowResult = <A, E>(
  executionId: string,
  result: Workflow.Result<A, E> | undefined
): Effect.Effect<A, E | WorkflowError | WorkflowNotFoundError | WorkflowSuspendedError> =>
  Effect.gen(function*() {
    if (result === undefined) {
      return yield* Effect.fail(
        new WorkflowNotFoundError({
          message: `Workflow ${executionId} not found`,
          executionId
        })
      )
    }

    return yield* Match.value(result).pipe(
      Match.tag("Complete", (complete) =>
        Exit.matchEffect(complete.exit, {
          onSuccess: (value) => Effect.succeed(value),
          onFailure: (cause) => Effect.failCause(cause)
        })),
      Match.tag("Suspended", (suspended) =>
        Effect.fail(
          new WorkflowSuspendedError({
            message: `Workflow ${executionId} suspended`,
            cause: typeof suspended.cause === "string" ? suspended.cause : undefined,
            isResumable: true
          })
        )),
      Match.exhaustive
    )
  })

export const pollToBatchState = (executionId: string) =>
  Effect.gen(function*() {
    const engine = yield* WorkflowEngine.WorkflowEngine
    const result = yield* engine.poll(BatchExtractionWorkflow, executionId)

    if (result === undefined) {
      const stored = yield* getBatchStateFromStore(executionId as BatchId)

      return yield* Option.match(stored, {
        onSome: Effect.succeed,
        onNone: () =>
          Effect.fail(
            new WorkflowNotFoundError({
              message: `Workflow ${executionId} not found`,
              executionId
            })
          )
      })
    }

    return yield* Match.value(result).pipe(
      Match.tag("Complete", (complete) =>
        Exit.matchEffect(complete.exit, {
          onSuccess: (state) => Effect.succeed(state),
          onFailure: (cause) =>
            Effect.gen(function*() {
              const stored = yield* getBatchStateFromStore(executionId as BatchId)
              const fallback = Option.getOrUndefined(stored)

              if (fallback) {
                return toFailedState(fallback, cause)
              }

              return yield* Effect.fail(
                new WorkflowError({
                  message: `Workflow ${executionId} failed`,
                  cause: Cause.squash(cause)
                })
              )
            })
        })),
      Match.tag("Suspended", (suspended) =>
        Effect.fail(
          new WorkflowSuspendedError({
            message: `Workflow ${executionId} suspended`,
            cause: typeof suspended.cause === "string" ? suspended.cause : undefined,
            isResumable: true
          })
        )),
      Match.exhaustive
    )
  })

// -----------------------------------------------------------------------------
// Workflow Implementation Layer
// -----------------------------------------------------------------------------

/**
 * Layer that registers the batch extraction workflow with WorkflowEngine
 */
export const BatchExtractionWorkflowLayer = BatchExtractionWorkflow.toLayer(
  (payload) =>
    Effect.gen(function*() {
      const { batchId, manifestUri, ontologyVersion } = payload
      const storage = yield* StorageService
      const config = yield* ConfigService
      const eventBus = yield* EventBusService
      const workflowStart = yield* DateTime.now
      const progressRef = yield* Ref.make(0)
      let currentStage: PipelineStage = "pending"
      let lastSuccessfulStage: PipelineStage | undefined = undefined

      const manifestKey = stripGsPrefix(manifestUri)
      const manifestRaw = yield* storage.get(manifestKey).pipe(
        Effect.flatMap((opt) => expectValue(opt, manifestKey))
      )
      const manifest = parseManifest(manifestRaw)

      // Validate ontology consistency between manifest and config
      yield* validateOntologyConsistency(
        manifest.ontologyUri,
        config.ontology.path,
        config.ontology.strictValidation,
        batchId
      )

      const emitState = (state: BatchState) =>
        Effect.gen(function*() {
          const existing = yield* getBatchStateFromStore(batchId)

          // Only publish if state is newer (idempotency guard)
          const shouldPublish = Option.match(existing, {
            onNone: () => true,
            onSome: (e) => DateTime.greaterThan(state.updatedAt, e.updatedAt)
          })

          if (shouldPublish) {
            yield* publishState(state)
          } else {
            yield* Effect.logDebug("Skipping state publish (not newer)", {
              batchId,
              existingUpdatedAt: Option.map(existing, (e) => e.updatedAt),
              newUpdatedAt: state.updatedAt
            })
          }
        }).pipe(
          Effect.catchAll((error) => Effect.logWarning("Failed to publish batch state", { batchId, error }))
        )

      const runWorkflow = Effect.gen(function*() {
        const pendingState: BatchState = {
          _tag: "Pending",
          batchId,
          ontologyId: manifest.ontologyId,
          manifestUri,
          ontologyVersion,
          createdAt: workflowStart,
          updatedAt: workflowStart,
          documentCount: manifest.documents.length
        }
        yield* emitState(pendingState)

        // -------------------------------------------------------------------------
        // Stage 1: Preprocessing (document classification and metadata enrichment)
        // -------------------------------------------------------------------------
        yield* Effect.logInfo("Starting preprocessing stage", {
          batchId,
          documentCount: manifest.documents.length
        })

        currentStage = "preprocessing"

        const preprocessingState: BatchState = {
          _tag: "Preprocessing",
          batchId,
          ontologyId: manifest.ontologyId,
          manifestUri,
          ontologyVersion,
          createdAt: workflowStart,
          updatedAt: yield* DateTime.now,
          documentsTotal: manifest.documents.length,
          documentsClassified: 0,
          documentsFailed: 0,
          enrichedManifestUri: undefined
        }
        yield* emitState(preprocessingState)

        // Run preprocessing activity with graceful fallback
        // Skip entirely if preprocessing.enabled is false
        const preprocessingEnabled = payload.preprocessing?.enabled !== false
        const preprocessingResult = yield* (preprocessingEnabled
          ? makePreprocessingActivity({
            batchId,
            manifestUri,
            preprocessing: payload.preprocessing,
            skipClassification: payload.preprocessing?.classifyDocuments === false
          }).execute
          : Effect.succeed({
            enrichedManifestUri: manifestUri as GcsUri,
            totalDocuments: manifest.documents.length,
            classifiedCount: 0,
            failedCount: 0,
            totalEstimatedTokens: 0,
            averageComplexity: 0.5,
            durationMs: 0
          })).pipe(
            Effect.tap((result) =>
              Effect.gen(function*() {
                const updatedPreprocessingState: BatchState = {
                  _tag: "Preprocessing",
                  batchId,
                  ontologyId: manifest.ontologyId,
                  manifestUri,
                  ontologyVersion,
                  createdAt: workflowStart,
                  updatedAt: yield* DateTime.now,
                  documentsTotal: result.totalDocuments,
                  documentsClassified: result.classifiedCount,
                  documentsFailed: result.failedCount,
                  enrichedManifestUri: result.enrichedManifestUri
                }
                yield* emitState(updatedPreprocessingState)
              })
            ),
            // Graceful fallback: if preprocessing fails, continue with original manifest
            Effect.catchAll((error) =>
              Effect.gen(function*() {
                yield* Effect.logWarning("Preprocessing failed, continuing with original manifest", {
                  batchId,
                  error: String(error)
                })
                return {
                  enrichedManifestUri: manifestUri as GcsUri,
                  totalDocuments: manifest.documents.length,
                  classifiedCount: 0,
                  failedCount: 0,
                  totalEstimatedTokens: 0,
                  averageComplexity: 0.5,
                  durationMs: 0
                }
              })
            )
          )

        lastSuccessfulStage = "preprocessing"

        yield* Effect.logInfo("Preprocessing complete", {
          batchId,
          classifiedCount: preprocessingResult.classifiedCount,
          failedCount: preprocessingResult.failedCount,
          enrichedManifestUri: preprocessingResult.enrichedManifestUri
        })

        // -------------------------------------------------------------------------
        // Stage 2: Extraction (extract entities/relations from each document)
        // -------------------------------------------------------------------------

        // Load enriched manifest to get DocumentMetadata with provenance fields
        const enrichedManifestKey = stripGsPrefix(preprocessingResult.enrichedManifestUri)
        const enrichedManifestRaw = yield* storage.get(enrichedManifestKey).pipe(
          Effect.flatMap((opt) => expectValue(opt, enrichedManifestKey)),
          Effect.catchAll((error) =>
            Effect.gen(function*() {
              yield* Effect.logWarning("Failed to load enriched manifest, falling back to basic manifest", {
                batchId,
                enrichedManifestUri: preprocessingResult.enrichedManifestUri,
                error: String(error)
              })
              // Return null to signal fallback
              return null as string | null
            })
          )
        )

        // Parse enriched manifest or use basic manifest as fallback
        const enrichedManifest = enrichedManifestRaw
          ? Schema.decodeUnknownSync(Schema.parseJson(EnrichedManifest))(enrichedManifestRaw)
          : null

        yield* Effect.logInfo("Starting extraction stage", {
          batchId,
          documentCount: manifest.documents.length,
          usingEnrichedManifest: enrichedManifest !== null
        })

        currentStage = "extracting"

        // Initialize document status tracking for partial failure visibility
        const documentStatusesRef = yield* Ref.make<Array<DocumentStatus>>(
          manifest.documents.map((doc) => ({
            documentId: doc.documentId as DocumentId,
            status: "pending" as const
          }))
        )

        // Reset progress counter for extraction stage
        yield* Ref.set(progressRef, 0)

        // Process documents with per-document error handling
        // Continues processing remaining documents even when some fail
        const extractionResults = yield* Effect.forEach(
          manifest.documents,
          (doc) =>
            Effect.gen(function*() {
              const startedAt = yield* DateTime.now

              // Mark document as processing
              yield* Ref.update(documentStatusesRef, (statuses) =>
                statuses.map((s) =>
                  s.documentId === doc.documentId
                    ? { ...s, status: "processing" as const, startedAt }
                    : s
                ))

              // Look up DocumentMetadata from enriched manifest if available
              const docMetadata = enrichedManifest?.documents.find(
                (d) => d.documentId === doc.documentId
              )

              // Execute extraction with error handling per document
              const result = yield* makeStreamingExtractionActivity({
                batchId,
                documentId: doc.documentId,
                sourceUri: doc.sourceUri,
                ontologyUri: manifest.ontologyUri,
                ontologyId: manifest.ontologyId,
                targetNamespace: manifest.targetNamespace,
                eventTime: docMetadata?.eventTime,
                publishedAt: docMetadata?.publishedAt,
                title: docMetadata?.title,
                language: docMetadata?.language
              }).execute.pipe(
                Effect.map((output) => ({ success: true as const, output, documentId: doc.documentId })),
                Effect.catchAll((error) =>
                  Effect.gen(function*() {
                    const completedAt = yield* DateTime.now
                    const errorMessage = serializeError(error)

                    yield* Effect.logWarning("Document extraction failed", {
                      batchId,
                      documentId: doc.documentId,
                      error: errorMessage
                    })

                    // Mark document as failed with error details
                    yield* Ref.update(documentStatusesRef, (statuses) =>
                      statuses.map((s) =>
                        s.documentId === doc.documentId
                          ? {
                            ...s,
                            status: "failed" as const,
                            completedAt,
                            error: { code: "EXTRACTION_FAILED", message: errorMessage }
                          }
                          : s
                      ))

                    return { success: false as const, documentId: doc.documentId, error: errorMessage }
                  })
                )
              )

              // Update progress and document status for successful extraction
              if (result.success) {
                const completedAt = yield* DateTime.now
                yield* Ref.update(documentStatusesRef, (statuses) =>
                  statuses.map((s) =>
                    s.documentId === doc.documentId
                      ? {
                        ...s,
                        status: "success" as const,
                        completedAt,
                        graphUri: result.output.graphUri as GcsUri,
                        entityCount: result.output.entityCount,
                        relationCount: result.output.relationCount,
                        claimCount: result.output.claimCount
                      }
                      : s
                  ))
              }

              // Update batch state with current progress
              const currentStatuses = yield* Ref.get(documentStatusesRef)
              const successCount = currentStatuses.filter((s) => s.status === "success").length
              const failedCount = currentStatuses.filter((s) => s.status === "failed").length

              const extractingState: BatchState = {
                _tag: "Extracting",
                batchId,
                ontologyId: manifest.ontologyId,
                manifestUri,
                ontologyVersion,
                createdAt: workflowStart,
                updatedAt: yield* DateTime.now,
                documentsTotal: manifest.documents.length,
                documentsCompleted: successCount,
                documentsFailed: failedCount,
                currentDocumentId: doc.documentId as DocumentId,
                documentStatuses: currentStatuses
              }
              yield* emitState(extractingState)

              return result
            }),
          { concurrency: 5 }
        )

        // Separate successful and failed results
        const successfulResults = extractionResults.flatMap((r) => r.success ? [r.output] : [])
        const failedResults = extractionResults.flatMap((r) =>
          !r.success ? [{ documentId: r.documentId, error: r.error }] : []
        )

        const finalDocumentStatuses = yield* Ref.get(documentStatusesRef)
        // Store for use in Complete state
        const _documentStatuses = finalDocumentStatuses

        yield* Effect.logInfo("Extraction stage complete", {
          batchId,
          documentsSucceeded: successfulResults.length,
          documentsFailed: failedResults.length,
          failedDocumentIds: failedResults.map((r) => r.documentId)
        })

        // If ALL documents failed, fail the entire batch
        if (successfulResults.length === 0) {
          return yield* Effect.fail(
            `All ${failedResults.length} documents failed extraction. ` +
              `First error: ${failedResults[0]?.error ?? "unknown"}`
          )
        }

        // Continue with successful documents (partial success)
        lastSuccessfulStage = "extracting"

        currentStage = "resolving"

        const resolvingState: BatchState = {
          _tag: "Resolving",
          batchId,
          ontologyId: manifest.ontologyId,
          manifestUri,
          ontologyVersion,
          createdAt: workflowStart,
          updatedAt: yield* DateTime.now,
          extractionOutputUri: successfulResults[0]?.graphUri ?? manifestUri,
          entitiesTotal: 0,
          clustersFormed: 0
        }
        yield* emitState(resolvingState)

        const resolutionResult = yield* makeResolutionActivity({
          batchId,
          documentGraphUris: successfulResults.map((r) => r.graphUri)
        }).execute

        lastSuccessfulStage = "resolving"

        yield* Effect.logInfo("Resolution complete", {
          batchId,
          entitiesResolved: resolutionResult.entitiesTotal
        })

        // Cross-batch entity resolution (optional - requires Postgres + pgvector)
        // Links entities to persistent canonical registry across extraction batches
        const crossBatchResult = yield* makeCrossBatchResolutionActivity({
          batchId,
          resolvedGraphUri: resolutionResult.resolvedUri,
          enabled: config.entityRegistry.enabled,
          ontologyId: manifest.ontologyId
        }).execute

        if (config.entityRegistry.enabled) {
          yield* Effect.logInfo("Cross-batch resolution complete", {
            batchId,
            matchedToExisting: crossBatchResult.matchedToExisting,
            newCanonicals: crossBatchResult.newCanonicals,
            entitiesTotal: crossBatchResult.entitiesTotal
          })
        } else {
          yield* Effect.logDebug("Cross-batch resolution skipped (not configured)", { batchId })
        }

        // RDFS Inference stage (optional)
        // Applies RDFS reasoning to generate new facts through forward-chaining inference
        const inferenceEnabled = config.inference?.enabled ?? false
        const inferenceResult = yield* makeInferenceActivity({
          batchId,
          resolvedGraphUri: resolutionResult.resolvedUri,
          profile: config.inference?.profile ?? "rdfs",
          enabled: inferenceEnabled
        }).execute

        // Use enriched graph for validation if inference produced new triples
        const graphForValidation = inferenceResult.inferredTripleCount > 0
          ? inferenceResult.enrichedGraphUri
          : resolutionResult.resolvedUri

        if (inferenceEnabled) {
          yield* Effect.logInfo("Inference complete", {
            batchId,
            inferredTriples: inferenceResult.inferredTripleCount,
            totalTriples: inferenceResult.totalTripleCount,
            provenanceQuads: inferenceResult.provenanceQuadCount,
            rulesApplied: inferenceResult.rulesApplied
          })
        } else {
          yield* Effect.logDebug("Inference skipped (not configured)", { batchId })
        }

        currentStage = "validating"
        const validatingState: BatchState = {
          _tag: "Validating",
          batchId,
          ontologyId: manifest.ontologyId,
          manifestUri,
          ontologyVersion,
          createdAt: workflowStart,
          updatedAt: yield* DateTime.now,
          resolvedGraphUri: graphForValidation,
          validationStartedAt: yield* DateTime.now
        }
        yield* emitState(validatingState)

        // Pass validation policy from manifest to activity
        // The activity's validateWithPolicy will fail with ValidationPolicyError if policy violated
        const validationResult = yield* makeValidationActivity({
          batchId,
          resolvedGraphUri: graphForValidation,
          ontologyUri: manifest.ontologyUri,
          shaclUri: manifest.shaclUri,
          validationPolicy: manifest.validationPolicy
        }).execute

        yield* Effect.logInfo("Validation complete", {
          batchId,
          conforms: validationResult.conforms,
          violations: validationResult.violations,
          policyApplied: manifest.validationPolicy ?? { failOnViolation: true, failOnWarning: false }
        })

        // Publish ValidationFailed event if there are violations
        if (!validationResult.conforms) {
          yield* eventBus.publishExtractionEvent("ValidationFailed", {
            batchId,
            validationId: `val-${batchId}-${Date.now()}`,
            ontologyId: manifest.ontologyId,
            errorCount: validationResult.violations,
            warningCount: 0,
            reportUri: Option.fromNullable(validationResult.reportUri),
            timestamp: new Date()
          }).pipe(
            Effect.catchAll((error) =>
              Effect.logWarning("Failed to publish ValidationFailed event", {
                batchId,
                error: String(error)
              })
            )
          )
        }

        // Note: Policy enforcement is handled by validateWithPolicy in the activity.
        // If failOnViolation=true (default) and violations exist, activity throws ValidationPolicyError.
        // If failOnViolation=false, we proceed to ingestion even with non-conformance.

        lastSuccessfulStage = "validating"

        // Persist validated claims to PostgreSQL
        yield* Effect.logInfo("Persisting validated claims to database", { batchId })

        const claimPersistenceResult = yield* makeClaimPersistenceActivity({
          batchId,
          ontologyId: manifest.ontologyId,
          documentGraphUris: successfulResults.map((r) => r.graphUri),
          targetNamespace: manifest.targetNamespace,
          documentMetadata: manifest.documents.map((doc) => ({
            documentId: doc.documentId,
            sourceUri: doc.sourceUri
          }))
        }).execute

        yield* Effect.logInfo("Claim persistence complete", {
          batchId,
          claimsPersisted: claimPersistenceResult.claimsPersisted,
          documentsProcessed: claimPersistenceResult.documentsProcessed,
          documentsFailed: claimPersistenceResult.documentsFailed
        })

        yield* Effect.logInfo("Starting ingestion stage", { batchId })

        currentStage = "ingesting"

        const ingestingState: BatchState = {
          _tag: "Ingesting",
          batchId,
          ontologyId: manifest.ontologyId,
          manifestUri,
          ontologyVersion,
          createdAt: workflowStart,
          updatedAt: yield* DateTime.now,
          validatedGraphUri: validationResult.validatedUri,
          triplesTotal: 0,
          triplesIngested: 0
        }
        yield* emitState(ingestingState)

        const ingestionResult = yield* makeIngestionActivity({
          batchId,
          validatedGraphUri: validationResult.validatedUri,
          targetNamespace: manifest.targetNamespace
        }).execute

        lastSuccessfulStage = "ingesting"

        yield* Effect.logInfo("Ingestion complete", {
          batchId,
          triplesIngested: ingestionResult.triplesIngested
        })

        const workflowEnd = yield* DateTime.now

        const complete: BatchState = {
          _tag: "Complete",
          batchId,
          ontologyId: manifest.ontologyId,
          manifestUri,
          ontologyVersion,
          createdAt: workflowStart,
          updatedAt: workflowEnd,
          canonicalGraphUri: ingestionResult.canonicalUri,
          stats: {
            documentsProcessed: successfulResults.length,
            documentsSucceeded: successfulResults.length,
            documentsFailed: failedResults.length,
            entitiesExtracted: successfulResults.reduce((sum, r) => sum + r.entityCount, 0),
            relationsExtracted: successfulResults.reduce((sum, r) => sum + r.relationCount, 0),
            claimsExtracted: successfulResults.reduce((sum, r) => sum + (r.claimCount ?? 0), 0),
            clustersResolved: resolutionResult.clustersFormed,
            triplesIngested: ingestionResult.triplesIngested,
            totalDurationMs: DateTime.distance(workflowStart, workflowEnd)
          },
          documentStatuses: _documentStatuses,
          completedAt: workflowEnd
        }

        yield* Effect.logInfo("Workflow complete", {
          batchId,
          stats: complete.stats
        })

        yield* emitState(complete)

        // Publish extraction completed event via EventBusService
        yield* eventBus.publishExtractionEvent("ExtractionCompleted", {
          batchId,
          ontologyId: manifest.ontologyId,
          entityCount: complete.stats.entitiesExtracted,
          relationCount: complete.stats.relationsExtracted,
          tripleCount: complete.stats.triplesIngested,
          outputUri: Option.fromNullable(complete.canonicalGraphUri),
          status: failedResults.length === 0 ? "success" : "partial",
          timestamp: new Date()
        }).pipe(
          Effect.catchAll((error) =>
            Effect.logWarning("Failed to publish ExtractionCompleted event", {
              batchId,
              error: String(error)
            })
          )
        )

        return complete
      })

      return yield* Effect.catchAllCause(
        runWorkflow,
        (cause) =>
          Effect.gen(function*() {
            const failedAt = yield* DateTime.now
            const failedState: BatchState = {
              _tag: "Failed",
              batchId,
              ontologyId: manifest.ontologyId,
              manifestUri,
              ontologyVersion,
              createdAt: workflowStart,
              updatedAt: failedAt,
              failedAt,
              failedInStage: currentStage,
              error: {
                code: "WORKFLOW_FAILED",
                message: Cause.pretty(cause),
                cause: Cause.squash(cause)
              },
              lastSuccessfulStage
            }

            yield* emitState(failedState)

            return yield* Effect.fail(Cause.pretty(cause))
          })
      )
    }).pipe(Effect.mapError(String))
)

// -----------------------------------------------------------------------------
// WorkflowOrchestrator Service
// -----------------------------------------------------------------------------

/**
 * WorkflowOrchestrator Service Interface
 *
 * High-level API for batch workflow operations.
 */
export interface WorkflowOrchestrator {
  /**
   * Start a new batch extraction workflow
   *
   * @param payload - Workflow payload containing batchId, manifestUri, ontologyVersion
   * @returns The execution ID (same as batchId for idempotency)
   */
  readonly start: (payload: BatchWorkflowPayloadType) => Effect.Effect<string, string>

  /**
   * Start and wait for workflow completion
   *
   * @param payload - Workflow payload
   * @returns The final BatchState on success
   */
  readonly startAndWait: (payload: BatchWorkflowPayloadType) => Effect.Effect<BatchState, string>

  /**
   * Poll for workflow result
   *
   * @param executionId - The workflow execution ID (batchId)
   * @returns The workflow result if complete, undefined if still running
   */
  readonly poll: (executionId: string) => Effect.Effect<Workflow.Result<BatchState, string> | undefined>

  /**
   * Interrupt a running workflow
   *
   * @param executionId - The workflow execution ID
   */
  readonly interrupt: (executionId: string) => Effect.Effect<void>

  /**
   * Resume a suspended workflow
   *
   * @param executionId - The workflow execution ID
   */
  readonly resume: (executionId: string) => Effect.Effect<void>
}

export const WorkflowOrchestrator = Context.GenericTag<WorkflowOrchestrator>("@effect-ontology/WorkflowOrchestrator")

// -----------------------------------------------------------------------------
// WorkflowOrchestrator Implementation
// -----------------------------------------------------------------------------

/**
 * Create the WorkflowOrchestrator service
 *
 * Requires WorkflowEngine to be provided (via ClusterWorkflowEngine or memory layer)
 */
export const makeWorkflowOrchestrator = Effect.gen(function*() {
  const engine = yield* WorkflowEngine.WorkflowEngine

  return WorkflowOrchestrator.of({
    start: (payload) =>
      Effect.gen(function*() {
        const executionId = yield* BatchExtractionWorkflow.executionId(payload)
        return yield* engine.execute(BatchExtractionWorkflow, {
          executionId,
          payload,
          discard: true
        })
      }),

    startAndWait: (payload) =>
      Effect.gen(function*() {
        const executionId = yield* BatchExtractionWorkflow.executionId(payload)
        return yield* engine.execute(BatchExtractionWorkflow, {
          executionId,
          payload,
          discard: false
        })
      }),

    poll: (executionId) => engine.poll(BatchExtractionWorkflow, executionId),

    interrupt: (executionId) => engine.interrupt(BatchExtractionWorkflow, executionId),

    resume: (executionId) => engine.resume(BatchExtractionWorkflow, executionId)
  })
})

// -----------------------------------------------------------------------------
// Layers
// -----------------------------------------------------------------------------

/**
 * WorkflowOrchestrator layer
 *
 * Requires:
 * - WorkflowEngine (from ClusterWorkflowEngine or memory)
 */
export const WorkflowOrchestratorLive = Layer.effect(
  WorkflowOrchestrator,
  makeWorkflowOrchestrator
)

/**
 * Full workflow layer with orchestrator and workflow registration
 *
 * Requires:
 * - StorageService
 * - ConfigService
 * - RdfBuilder
 * - WorkflowEngine
 * - EntityExtractor (for Activities.ts extraction)
 * - RelationExtractor (for Activities.ts extraction)
 * - OntologyService (for Activities.ts ontology lookup)
 */
export const WorkflowOrchestratorFullLive = Layer.mergeAll(
  WorkflowOrchestratorLive,
  BatchExtractionWorkflowLayer
)

export { BatchWorkflowPayload }
