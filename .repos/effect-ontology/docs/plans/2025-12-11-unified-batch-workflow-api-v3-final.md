# Unified Batch Workflow API - Final Implementation Plan (v3)

**Date:** 2025-12-11
**Status:** Final - Ready for implementation
**Supersedes:** v1 and v2 plans (archived at `docs/archive/plans-2025-12/`)

## Executive Summary

This document provides production-ready implementation patterns for the unified batch workflow API, addressing all review feedback with correct Effect idioms.

---

## 1. Workflow.Result Handling

### 1.1 The Problem

`WorkflowEngine.poll` returns `Workflow.Result<A, E>` which is:
```typescript
type Result<A, E> = Complete<A, E> | Suspended

class Complete<A, E> {
  readonly exit: Exit.Exit<A, E>  // NOT the value directly!
}

class Suspended {
  readonly cause?: string
}
```

The v2 examples incorrectly accessed `result.value` - this doesn't exist.

### 1.2 Correct Pattern

```typescript
import { Exit, Effect, Match } from "effect"
import { Workflow } from "@effect/workflow"

const handleWorkflowResult = <A, E>(
  result: Workflow.Result<A, E> | undefined
): Effect<A, E | WorkflowError> =>
  Effect.gen(function* () {
    if (result === undefined) {
      return yield* Effect.fail(new WorkflowNotFoundError())
    }

    return yield* Match.value(result).pipe(
      Match.tag("Complete", (complete) =>
        Exit.matchEffect(complete.exit, {
          onSuccess: (value) => Effect.succeed(value),
          onFailure: (cause) => Effect.failCause(cause)
        })
      ),
      Match.tag("Suspended", (suspended) =>
        Effect.fail(new WorkflowSuspendedError({
          cause: suspended.cause,
          isResumable: true
        }))
      ),
      Match.exhaustive
    )
  })
```

### 1.3 Converting to BatchState

```typescript
const pollToBatchState = (executionId: string): Effect<BatchState, WorkflowError> =>
  Effect.gen(function* () {
    const engine = yield* WorkflowEngine
    const result = yield* engine.poll(BatchExtractionWorkflow, executionId)

    if (result === undefined) {
      // Not found - check state store for intermediate state
      return yield* getBatchStateFromStore(executionId)
    }

    return yield* Match.value(result).pipe(
      Match.tag("Complete", (complete) =>
        Exit.matchEffect(complete.exit, {
          onSuccess: (state) => Effect.succeed(state),
          onFailure: (cause) => Effect.gen(function* () {
            // Map workflow failure to BatchFailed state
            const batchId = yield* extractBatchIdFromExecution(executionId)
            return {
              _tag: "Failed" as const,
              batchId,
              failedAt: yield* DateTime.now,
              failedInStage: "extracting" as const,
              error: {
                code: "WORKFLOW_FAILED",
                message: Cause.pretty(cause),
                cause: Cause.squash(cause)
              },
              lastSuccessfulStage: undefined,
              manifestUri: "" as GcsUri,
              ontologyVersion: "" as OntologyVersion,
              createdAt: yield* DateTime.now,
              updatedAt: yield* DateTime.now
            } satisfies BatchState
          })
        })
      ),
      Match.tag("Suspended", (suspended) =>
        Effect.gen(function* () {
          const batchId = yield* extractBatchIdFromExecution(executionId)
          return {
            _tag: "Failed" as const,
            batchId,
            failedAt: yield* DateTime.now,
            failedInStage: "extracting" as const,
            error: {
              code: "WORKFLOW_SUSPENDED",
              message: suspended.cause ?? "Workflow suspended - can be resumed",
              cause: undefined
            },
            lastSuccessfulStage: undefined,
            manifestUri: "" as GcsUri,
            ontologyVersion: "" as OntologyVersion,
            createdAt: yield* DateTime.now,
            updatedAt: yield* DateTime.now
          } satisfies BatchState
        })
      ),
      Match.exhaustive
    )
  })
```

---

## 2. Execution ID Generation

### 2.1 Use Workflow's Built-in Method

Instead of custom `deriveIdempotentBatchId`, use the workflow's own execution ID derivation:

```typescript
// Current workflow definition
export const BatchExtractionWorkflow = Workflow.make({
  name: "batch-extraction",
  payload: BatchWorkflowPayload,
  success: BatchState,
  error: Schema.String,
  idempotencyKey: (p) => p.batchId  // This drives executionId
})

// The workflow exposes .executionId() method
const getExecutionId = (payload: BatchWorkflowPayload): Effect<string> =>
  BatchExtractionWorkflow.executionId(payload)
```

### 2.2 Comprehensive Idempotency Key

Include ALL inputs that affect behavior to avoid collisions:

```typescript
// BatchWorkflowPayload - ensure it captures all semantically relevant fields
export const BatchWorkflowPayload = Schema.Struct({
  batchId: BatchId,           // Primary key
  manifestUri: GcsUri,        // Where manifest is staged
  ontologyVersion: OntologyVersion,
  // Add these if they affect behavior:
  ontologyUri: GcsUri,
  targetNamespace: Namespace,
  shaclUri: Schema.optional(GcsUri),
  documentIds: Schema.Array(DocumentId)  // All doc IDs for collision avoidance
})

// Idempotency key includes all semantic inputs
export const BatchExtractionWorkflow = Workflow.make({
  name: "batch-extraction",
  payload: BatchWorkflowPayload,
  success: BatchState,
  error: Schema.String,
  idempotencyKey: (p) => {
    // Hash all semantically relevant fields
    const hash = Hash.string(JSON.stringify({
      ontologyVersion: p.ontologyVersion,
      ontologyUri: p.ontologyUri,
      targetNamespace: p.targetNamespace,
      shaclUri: p.shaclUri,
      documentIds: p.documentIds.sort()  // Sort for determinism
    }))
    return `${p.batchId}-${Math.abs(hash).toString(16).slice(0, 8)}`
  },
  // Annotations
  annotations: Context.make(Workflow.SuspendOnFailure, true).pipe(
    Context.add(Workflow.CaptureDefects, true)
  ),
  // Auto-retry suspended workflows with exponential backoff
  suspendedRetrySchedule: Schedule.exponential("1 second").pipe(
    Schedule.compose(Schedule.recurs(5))  // Max 5 retries
  )
})
```

---

## 3. SSE Stream Shaping

### 3.1 Custom Equality with Stream.changesWith

`Stream.changes` uses reference equality - polling would emit every tick. Use custom comparison:

```typescript
const batchStateEquals = (a: BatchState, b: BatchState): boolean => {
  // Same tag and same updatedAt timestamp = no change
  if (a._tag !== b._tag) return false
  return a.updatedAt.getTime() === b.updatedAt.getTime()
}

const streamBatchState = (executionId: string): Stream<BatchState, WorkflowError> =>
  Stream.repeatEffectOption(
    pollToBatchState(executionId).pipe(
      Effect.map(Option.some),
      Effect.catchAll(() => Effect.succeed(Option.none()))
    )
  ).pipe(
    Stream.schedule(Schedule.spaced("500 millis")),
    Stream.changesWith(batchStateEquals),  // Custom equality
    Stream.takeUntil(state => isTerminal(state))
  )
```

### 3.2 Client Disconnection Handling

Use `Stream.interruptWhen` with a deferred that triggers on request abort:

```typescript
const streamWithDisconnectHandling = (
  executionId: string,
  abortSignal: Deferred<never, void>
): Stream<BatchState, WorkflowError> =>
  streamBatchState(executionId).pipe(
    Stream.interruptWhen(Deferred.await(abortSignal))
  )

// In route handler - create abort signal from request lifecycle
const handleBatchStream = Effect.gen(function* () {
  const abortSignal = yield* Deferred.make<never, void>()

  // Use Effect.addFinalizer to trigger abort on scope close
  yield* Effect.addFinalizer(() => Deferred.succeed(abortSignal, void 0))

  const stream = streamWithDisconnectHandling(executionId, abortSignal)
  // ... convert to SSE response
})
```

### 3.3 Keep-Alive Messages

Use `Sse.Retry` for periodic keep-alives:

```typescript
import { Sse } from "@effect/experimental"
import { Duration, Stream } from "effect"

const keepAliveStream = Stream.repeat(
  Effect.succeed(new Sse.Retry({
    duration: Duration.seconds(15),
    lastEventId: undefined
  })),
  Schedule.spaced("15 seconds")
)

const sseStreamWithKeepalive = (stateStream: Stream<BatchState, WorkflowError>) =>
  Stream.mergeAll(2)(
    stateStream.pipe(Stream.map(batchStateToSseEvent)),
    keepAliveStream
  ).pipe(
    Stream.map(event => Sse.encoder.write(event)),
    Stream.encodeText
  )
```

---

## 4. State Persistence Architecture

### 4.1 Shared State Store with Reactivity

Use `@effect/experimental/Persistence` for consistent state across SSE and GET:

```typescript
import { Persistence, Reactivity } from "@effect/experimental"
import { KeyValueStore } from "@effect/platform"

// Adapt StorageService to KeyValueStore
const storageAsKvStore = Effect.gen(function* () {
  const storage = yield* StorageService
  return KeyValueStore.make({
    get: (key) => storage.get(key),
    set: (key, value) => storage.set(key, value),
    remove: (key) => storage.remove(key),
    has: (key) => storage.get(key).pipe(Effect.map(Option.isSome)),
    isEmpty: Effect.succeed(false),
    size: Effect.succeed(0),
    clear: Effect.void,
    modify: (key, f) => Effect.gen(function* () {
      const current = yield* storage.get(key)
      const next = f(current)
      if (Option.isSome(next)) {
        yield* storage.set(key, next.value)
      }
      return current
    })
  })
})

// Create persistence layer
const BatchStatePersistenceLayer = Persistence.layerKeyValueStore.pipe(
  Layer.provide(Layer.effect(KeyValueStore.KeyValueStore, storageAsKvStore))
)
```

### 4.2 Reactive State Stream with Hub

```typescript
// Shared hub for state updates
const BatchStateHub = Context.GenericTag<PubSub.PubSub<BatchState>>("BatchStateHub")

const BatchStateHubLayer = Layer.effect(
  BatchStateHub,
  PubSub.unbounded<BatchState>()
)

// Publish state changes from workflow
const publishState = (state: BatchState) =>
  Effect.gen(function* () {
    const hub = yield* BatchStateHub
    yield* PubSub.publish(hub, state)
    // Also persist to storage
    yield* persistState(state)
  })

// Subscribe for SSE
const subscribeToStateChanges = (batchId: BatchId): Stream<BatchState, never> =>
  Stream.asyncScoped<BatchState>((emit) =>
    Effect.gen(function* () {
      const hub = yield* BatchStateHub
      const queue = yield* PubSub.subscribe(hub)

      // Filter for this batch
      yield* Queue.take(queue).pipe(
        Effect.tap((state) =>
          state.batchId === batchId
            ? emit.single(state)
            : Effect.void
        ),
        Effect.forever,
        Effect.fork
      )
    })
  )
```

---

## 5. Compensation Scope

### 5.1 The Problem

`Workflow.withCompensation` only registers finalizers for **top-level workflow effects**, NOT nested `Activity.make` bodies. Storage writes currently happen inside activities.

### 5.2 Solution: Activity-Level Cleanup

Option A: Wrap storage writes in activities with explicit cleanup:

```typescript
// Activities.ts - add cleanup to activity bodies
export const makeExtractionActivity = (input: ExtractionInput): Activity<...> => ({
  name: "extraction",
  execute: Effect.gen(function* () {
    const storage = yield* StorageService
    const graphPath = `batches/${input.batchId}/extraction-output.json`

    // Write with scoped cleanup
    yield* Effect.acquireRelease(
      storage.set(graphPath, graphBody),
      () => storage.remove(graphPath).pipe(Effect.ignore)
    ).pipe(Effect.scoped)

    return { graphPath }
  })
})
```

Option B: Add explicit cleanup activities:

```typescript
// Define cleanup activity
export const makeCleanupActivity = (batchId: BatchId, paths: string[]): Activity<void, string> => ({
  name: "cleanup",
  execute: Effect.gen(function* () {
    const storage = yield* StorageService
    yield* Effect.forEach(paths, (path) =>
      storage.remove(path).pipe(Effect.ignore),
      { concurrency: "unbounded" }
    )
  })
})

// In workflow - call cleanup on failure
const runWithCleanup = Effect.gen(function* () {
  const extractionResult = yield* extractionActivity.execute

  return yield* resolutionActivity.execute.pipe(
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        // Cleanup extraction artifacts on resolution failure
        yield* cleanupActivity([extractionResult.graphPath]).execute
        return yield* Effect.fail(error)
      })
    )
  )
})
```

Option C: Move writes to workflow level (recommended for new code):

```typescript
// In workflow body - writes at workflow level can use withCompensation
const runWorkflow = Effect.gen(function* () {
  // Run extraction activity (computes but doesn't write)
  const extractionData = yield* extractionActivity.execute

  // Write at workflow level with compensation
  const extractionUri = yield* Workflow.withCompensation(
    writeToStorage(`batches/${batchId}/extraction.json`, extractionData),
    (uri, _cause) => deleteFromStorage(uri)
  )

  // Continue with next stage...
})
```

---

## 6. Suspension Policy

### 6.1 Automatic Retry Schedule

Add `suspendedRetrySchedule` to automatically retry suspended workflows:

```typescript
export const BatchExtractionWorkflow = Workflow.make({
  name: "batch-extraction",
  payload: BatchWorkflowPayload,
  success: BatchState,
  error: Schema.String,
  idempotencyKey: (p) => p.batchId,

  // Annotations
  annotations: Context.make(Workflow.SuspendOnFailure, true).pipe(
    Context.add(Workflow.CaptureDefects, true)
  ),

  // Auto-retry with exponential backoff: 1s, 2s, 4s, 8s, 16s then give up
  suspendedRetrySchedule: Schedule.exponential("1 second").pipe(
    Schedule.compose(Schedule.recurs(5)),
    Schedule.jittered  // Add jitter to avoid thundering herd
  )
})
```

### 6.2 Manual Resume Endpoint

Also expose manual resume for operator intervention:

```typescript
// POST /v1/batch/:id/resume
export const resumeBatchRoute = HttpRouter.post(
  "/v1/batch/:id/resume",
  Effect.gen(function* () {
    const { id } = yield* HttpRouter.params
    const batchId = yield* Schema.decode(BatchId)(id)

    const orchestrator = yield* WorkflowOrchestrator
    yield* orchestrator.resume(batchId)

    return HttpServerResponse.json({ resumed: true, batchId })
  })
)
```

---

## 7. Schema Encoding

### 7.1 Use Schema.encode (Effectful)

Replace `Schema.encodeSync` with `Schema.encode` for proper error handling:

```typescript
import { Schema, Effect } from "effect"

// Schema.encode returns an Effect
const encodeManifest = Schema.encode(BatchManifest)
const encodeBatchState = Schema.encode(BatchState)

// In ingress - handle encoding errors
const stageManifest = (manifest: BatchManifest): Effect<GcsUri, SystemError | ParseError> =>
  Effect.gen(function* () {
    const storage = yield* StorageService
    const config = yield* ConfigService

    // Encode with error handling
    const manifestJson = yield* Schema.encode(Schema.parseJson(BatchManifest))(manifest).pipe(
      Effect.mapError((parseError) => new SystemError({
        code: "MANIFEST_ENCODE_ERROR",
        message: ParseResult.TreeFormatter.formatErrorSync(parseError)
      }))
    )

    const manifestPath = `batches/${manifest.batchId}/manifest.json`
    yield* storage.set(manifestPath, manifestJson)

    return `gs://${config.storage.bucket}/${manifestPath}` as GcsUri
  })
```

### 7.2 HTTP Error Response for Validation Failures

```typescript
import { HttpServerResponse } from "@effect/platform"

const batchExtractRoute = HttpRouter.post(
  "/v1/extract/batch",
  Effect.gen(function* () {
    // Decode with proper error handling
    const request = yield* HttpServerRequest.schemaBodyJson(BatchRequest).pipe(
      Effect.catchTag("ParseError", (error) =>
        Effect.fail(HttpServerResponse.json(
          {
            error: "VALIDATION_ERROR",
            message: ParseResult.TreeFormatter.formatErrorSync(error),
            details: error.issue
          },
          { status: 400 }
        ))
      )
    )

    // Process valid request...
  })
)
```

### 7.3 Populate sizeBytes from Content

```typescript
const createManifest = (request: BatchRequest): Effect<BatchManifest> =>
  Effect.gen(function* () {
    const storage = yield* StorageService
    const now = yield* DateTime.now

    const documents = yield* Effect.forEach(request.documents, (doc) =>
      Effect.gen(function* () {
        const id = doc.documentId ?? (yield* generateDocumentId())

        // Populate sizeBytes from storage if not provided
        const sizeBytes = doc.sizeBytes ?? (yield* Effect.gen(function* () {
          const content = yield* storage.get(stripGsPrefix(doc.sourceUri))
          return Option.match(content, {
            onNone: () => 0,
            onSome: (c) => new TextEncoder().encode(c).length
          })
        }))

        return {
          documentId: id,
          sourceUri: doc.sourceUri,
          contentType: doc.contentType,
          sizeBytes
        }
      })
    )

    // ... rest of manifest creation
  })
```

---

## 8. Endpoint Typing & Response Semantics

### 8.1 Distinct Response Types for GET /v1/batch/:id

```typescript
// Domain/Schema/BatchStatusResponse.ts

export const BatchStatusResponse = Schema.Union(
  // Active or completed workflow
  Schema.Struct({
    _tag: Schema.Literal("Active"),
    state: BatchState
  }),
  // Suspended workflow (can be resumed)
  Schema.Struct({
    _tag: Schema.Literal("Suspended"),
    batchId: BatchId,
    cause: Schema.optional(Schema.String),
    lastKnownState: Schema.optional(BatchState),
    canResume: Schema.Boolean
  }),
  // Not found
  Schema.Struct({
    _tag: Schema.Literal("NotFound"),
    batchId: BatchId
  })
)

export type BatchStatusResponse = typeof BatchStatusResponse.Type
```

### 8.2 Typed Status Route

```typescript
export const batchStatusRoute = HttpRouter.get(
  "/v1/batch/:id",
  Effect.gen(function* () {
    const { id } = yield* HttpRouter.params
    const batchId = yield* Schema.decode(BatchId)(id).pipe(
      Effect.mapError(() => HttpServerResponse.json(
        { error: "INVALID_BATCH_ID", message: `Invalid batch ID format: ${id}` },
        { status: 400 }
      ))
    )

    const engine = yield* WorkflowEngine
    const result = yield* engine.poll(BatchExtractionWorkflow, batchId)

    if (result === undefined) {
      // Check state store for in-progress or historical state
      const storedState = yield* getBatchStateFromStore(batchId).pipe(
        Effect.catchAll(() => Effect.succeed(Option.none()))
      )

      return yield* Option.match(storedState, {
        onNone: () => HttpServerResponse.schemaJson(BatchStatusResponse)({
          _tag: "NotFound",
          batchId
        }, { status: 404 }),
        onSome: (state) => HttpServerResponse.schemaJson(BatchStatusResponse)({
          _tag: "Active",
          state
        })
      })
    }

    return yield* Match.value(result).pipe(
      Match.tag("Complete", (complete) =>
        Exit.matchEffect(complete.exit, {
          onSuccess: (state) =>
            HttpServerResponse.schemaJson(BatchStatusResponse)({
              _tag: "Active",
              state
            }),
          onFailure: (cause) =>
            Effect.gen(function* () {
              const lastState = yield* getBatchStateFromStore(batchId).pipe(
                Effect.catchAll(() => Effect.succeed(Option.none()))
              )
              return HttpServerResponse.schemaJson(BatchStatusResponse)({
                _tag: "Active",
                state: Option.getOrElse(lastState, () => ({
                  _tag: "Failed" as const,
                  batchId,
                  error: { code: "WORKFLOW_FAILED", message: Cause.pretty(cause) },
                  // ... fill other required fields
                }))
              })
            })
        })
      ),
      Match.tag("Suspended", (suspended) =>
        Effect.gen(function* () {
          const lastState = yield* getBatchStateFromStore(batchId).pipe(
            Effect.catchAll(() => Effect.succeed(Option.none()))
          )
          return HttpServerResponse.schemaJson(BatchStatusResponse)({
            _tag: "Suspended",
            batchId,
            cause: suspended.cause,
            lastKnownState: Option.getOrUndefined(lastState),
            canResume: true
          })
        })
      ),
      Match.exhaustive
    )
  })
)
```

---

## 9. Complete SSE Implementation

### 9.1 Full SSE Handler

```typescript
// Http/Routes/Extract.ts

import { Sse } from "@effect/experimental"
import { HttpServerRequest, HttpServerResponse } from "@effect/platform"
import { Stream, Effect, Duration, Schedule, PubSub, Queue, Deferred } from "effect"

const batchStateToSseEvent = (state: BatchState): Sse.Event => ({
  _tag: "Event",
  event: "state",
  id: `${state.batchId}-${state._tag}-${state.updatedAt.getTime()}`,
  data: JSON.stringify(Schema.encodeSync(BatchState)(state))
})

const keepAliveEvent = new Sse.Retry({
  duration: Duration.seconds(15),
  lastEventId: undefined
})

export const streamBatchExtraction = (executionId: string) =>
  Effect.gen(function* () {
    // State polling stream with custom equality
    const stateStream = Stream.repeatEffectOption(
      pollToBatchState(executionId).pipe(
        Effect.map(Option.some),
        Effect.catchAll(() => Effect.succeed(Option.none()))
      )
    ).pipe(
      Stream.schedule(Schedule.spaced("500 millis")),
      Stream.changesWith(batchStateEquals),
      Stream.takeUntil(state => isTerminal(state))
    )

    // Keep-alive stream
    const keepAliveStream = Stream.repeat(
      Effect.succeed(keepAliveEvent),
      Schedule.spaced("15 seconds")
    )

    // Merge state events and keep-alives
    const sseStream = Stream.merge(
      stateStream.pipe(Stream.map(batchStateToSseEvent)),
      keepAliveStream
    ).pipe(
      Stream.map(event => Sse.encoder.write(event)),
      Stream.encodeText
    )

    return HttpServerResponse.stream(sseStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no"  // Disable nginx buffering
      }
    })
  })

// Main route
export const batchExtractRoute = HttpRouter.post(
  "/v1/extract/batch",
  Effect.gen(function* () {
    // Decode and validate request
    const request = yield* HttpServerRequest.schemaBodyJson(BatchRequest).pipe(
      Effect.catchTag("ParseError", (error) =>
        Effect.fail(HttpServerResponse.json({
          error: "VALIDATION_ERROR",
          message: ParseResult.TreeFormatter.formatErrorSync(error)
        }, { status: 400 }))
      )
    )

    // Create and stage manifest
    const manifest = yield* createManifest(request)
    const manifestUri = yield* stageManifest(manifest)

    // Build workflow payload
    const payload: BatchWorkflowPayload = {
      batchId: manifest.batchId,
      manifestUri,
      ontologyVersion: manifest.ontologyVersion,
      ontologyUri: manifest.ontologyUri,
      targetNamespace: manifest.targetNamespace,
      shaclUri: manifest.shaclUri,
      documentIds: manifest.documents.map(d => d.documentId)
    }

    // Start workflow (idempotent)
    const orchestrator = yield* WorkflowOrchestrator
    const executionId = yield* orchestrator.start(payload)

    // Return SSE stream
    return yield* streamBatchExtraction(executionId)
  })
)
```

---

## 10. Layer Composition

### 10.1 Production Layer

```typescript
// Runtime/ProductionRuntime.ts

import { WorkflowEngine } from "@effect/workflow"
import { PostgresPersistence } from "@effect/workflow/PostgresPersistence"

export const ProductionLayer = Layer.mergeAll(
  // Config
  ConfigService.Live,

  // Storage
  StorageService.GcsLive,

  // Workflow engine with PostgreSQL
  WorkflowEngine.layerCluster,
  PostgresPersistence.layer({
    host: Config.string("POSTGRES_HOST"),
    port: Config.integer("POSTGRES_PORT"),
    database: Config.string("POSTGRES_DATABASE"),
    user: Config.string("POSTGRES_USER"),
    password: Config.redacted("POSTGRES_PASSWORD")
  }),

  // Workflow definitions
  BatchExtractionWorkflow.layer,
  WorkflowOrchestrator.Live,

  // State persistence hub
  BatchStateHubLayer,
  BatchStatePersistenceLayer,

  // HTTP server
  BunHttpServer.layer({ port: 8080 }),

  // Extraction services
  ExtractionService.Live,
  NlpService.Live
)
```

### 10.2 Test Layer (Memory)

```typescript
// Runtime/TestRuntime.ts

export const TestLayer = Layer.mergeAll(
  ConfigService.Test,
  StorageService.MemoryLive,

  // In-memory workflow engine - no PostgreSQL needed
  WorkflowEngine.layerMemory,

  BatchExtractionWorkflow.layer,
  WorkflowOrchestrator.Live,

  BatchStateHubLayer,
  BatchStatePersistenceLayer,

  BunHttpServer.layer({ port: 0 }),  // Random port

  ExtractionService.Mock,
  NlpService.Mock
)
```

### 10.3 Smoke Test

```typescript
// test/integration/batch-api.test.ts

import { it } from "@effect/vitest"

it.effect("streams batch state via SSE", () =>
  Effect.gen(function* () {
    const request: BatchRequest = {
      ontologyUri: "gs://test/ontology.ttl" as GcsUri,
      ontologyVersion: "test/v1@abc123" as OntologyVersion,
      targetNamespace: "https://test.org/" as Namespace,
      documents: [{
        sourceUri: "gs://test/doc.txt" as GcsUri,
        contentType: "text/plain"
      }]
    }

    // Make request to batch endpoint
    const client = yield* HttpClient.HttpClient
    const response = yield* client.post("/v1/extract/batch", {
      body: HttpClientRequest.jsonBody(request),
      headers: { Accept: "text/event-stream" }
    })

    expect(response.status).toBe(200)
    expect(response.headers["content-type"]).toBe("text/event-stream")

    // Collect SSE events
    const events: BatchState[] = []
    yield* response.stream.pipe(
      Stream.decodeText,
      Stream.splitLines,
      Stream.filter(line => line.startsWith("data: ")),
      Stream.map(line => JSON.parse(line.slice(6)) as BatchState),
      Stream.tap(state => Effect.sync(() => events.push(state))),
      Stream.runDrain
    )

    // Verify state progression
    expect(events.some(e => e._tag === "Pending")).toBe(true)
    expect(events.some(e => e._tag === "Extracting")).toBe(true)
    expect(events[events.length - 1]._tag).toBe("Complete")
  }).pipe(Effect.provide(TestLayer))
)
```

---

## 11. Implementation Checklist

### Phase 1: Schema & Types
- [ ] Create `Domain/Schema/BatchRequest.ts` (request without server-generated fields)
- [ ] Create `Domain/Schema/BatchStatusResponse.ts` (typed status response)
- [ ] Update `BatchWorkflowPayload` to include all semantic inputs
- [ ] Add `WorkflowError`, `WorkflowNotFoundError`, `WorkflowSuspendedError` types

### Phase 2: Workflow Updates
- [ ] Add `SuspendOnFailure` and `CaptureDefects` annotations
- [ ] Add `suspendedRetrySchedule` with exponential backoff
- [ ] Update `idempotencyKey` to hash all semantic inputs
- [ ] Add state persistence calls at each workflow stage

### Phase 3: State Management
- [ ] Create `BatchStateHub` service for pub/sub
- [ ] Implement `publishState` for workflow → hub
- [ ] Implement `subscribeToStateChanges` for SSE
- [ ] Create storage-backed state persistence

### Phase 4: HTTP Routes
- [ ] Implement `POST /v1/extract/batch` with SSE response
- [ ] Implement `POST /v1/extract` single-doc convenience
- [ ] Implement `GET /v1/batch/:id` with typed response
- [ ] Implement `POST /v1/batch/:id/resume` for manual resume
- [ ] Add proper error responses for validation failures

### Phase 5: SSE Implementation
- [ ] Add `@effect/experimental` dependency
- [ ] Implement `batchStateToSseEvent` with proper encoding
- [ ] Implement `streamBatchExtraction` with keep-alives
- [ ] Add `Stream.changesWith` for deduplication
- [ ] Add disconnection handling

### Phase 6: Cleanup & Testing
- [ ] Delete `JobManager.ts`
- [ ] Remove `/v1/jobs/*` routes
- [ ] Update layer composition in `server.ts`
- [ ] Add integration tests with `WorkflowEngine.layerMemory`
- [ ] Add SSE parsing tests

### Phase 7: Deploy & Verify
- [ ] Deploy to dev environment
- [ ] Verify PostgreSQL connectivity
- [ ] Test SSE streaming end-to-end
- [ ] Test workflow suspension/resume
- [ ] Test idempotency (same request → same execution)

---

## 12. API Reference

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/v1/extract/batch` | Start batch extraction, return SSE stream |
| `POST` | `/v1/extract` | Single-doc convenience, return SSE stream |
| `GET` | `/v1/batch/:id` | Query batch state (Active/Suspended/NotFound) |
| `POST` | `/v1/batch/:id/resume` | Resume suspended workflow |

### SSE Event Format

```
event: state
id: batch-abc123-Extracting-1702300000000
data: {"_tag":"Extracting","batchId":"batch-abc123","documentsCompleted":1,"documentsTotal":3,...}

retry: 15000
```

### Status Response Types

```typescript
// 200 OK - Active
{ "_tag": "Active", "state": { "_tag": "Extracting", ... } }

// 200 OK - Suspended (can resume)
{ "_tag": "Suspended", "batchId": "batch-abc123", "cause": "Rate limited", "canResume": true }

// 404 Not Found
{ "_tag": "NotFound", "batchId": "batch-abc123" }

// 400 Bad Request (validation error)
{ "error": "VALIDATION_ERROR", "message": "..." }
```
