# Unified Batch Workflow API Design

**Date:** 2025-12-11
**Status:** Validated via brainstorming
**Implements:** Unified extraction API with durable workflows

## Context

The codebase has two parallel systems:
- `JobManager` (in-memory) - handles current `/v1/jobs/*` API
- `WorkflowOrchestrator` (durable) - exists but isn't wired to server

With PostgreSQL infrastructure now deployed, we unify on durable workflows and delete the in-memory approach.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Single vs Batch | Unified - single doc is batch of 1 | Simplifies API surface |
| Response model | SSE streaming | Real-time progress feedback |
| Event schema | Use existing `BatchState` union | No duplication |
| Legacy API | Delete immediately | Greenfield, no migration needed |
| Extraction coupling | Keep contained for now | Decouple in future iteration |

## API Surface

### Endpoints

```
POST /v1/extract/batch  - Start batch extraction, return SSE stream
POST /v1/extract        - Single-doc convenience (wraps in batch of 1)
GET  /v1/batch/:id      - Query persisted batch state
```

### Streaming Response

SSE stream emits `BatchState` directly on each state transition:

```
data: {"_tag":"Pending","batchId":"batch-abc123",...}

data: {"_tag":"Extracting","batchId":"batch-abc123","documentsCompleted":1,"documentsTotal":3,...}

data: {"_tag":"Extracting","batchId":"batch-abc123","documentsCompleted":2,"documentsTotal":3,...}

data: {"_tag":"Resolving","batchId":"batch-abc123",...}

data: {"_tag":"Complete","batchId":"batch-abc123","stats":{...},...}
```

Stream terminates when `isTerminal(state) === true` (Complete or Failed).

### Request Schema

Uses existing `BatchManifest` from `Domain/Schema/Batch.ts`:

```typescript
// POST /v1/extract/batch body
{
  "ontologyUri": "gs://bucket/ontology.ttl",
  "ontologyVersion": "football/ontology@a1b2c3d4",
  "targetNamespace": "https://example.org/kg/",
  "documents": [
    {
      "documentId": "doc-abc123",
      "sourceUri": "gs://bucket/docs/article.txt",
      "contentType": "text/plain"
    }
  ]
}
```

## Existing Schemas (No Duplication)

### BatchState Union (`Domain/Model/BatchWorkflow.ts`)

```typescript
export const BatchState = Schema.Union(
  BatchPending,      // _tag: "Pending"
  BatchExtracting,   // _tag: "Extracting" + progress fields
  BatchResolving,    // _tag: "Resolving"
  BatchValidating,   // _tag: "Validating"
  BatchIngesting,    // _tag: "Ingesting" + progress fields
  BatchComplete,     // _tag: "Complete" + stats
  BatchFailed        // _tag: "Failed" + error details
)
```

### Helper Functions

- `stageDisplayName(state)` - Human-readable stage label
- `isTerminal(state)` - Check if Complete or Failed
- `progressPercent(state)` - 0-100 progress indicator
- `getError(state)` - Extract error details if present

### Identity Types (`Domain/Identity.ts`)

- `BatchId` - 12-hex chars (batch-xxxxxxxxxxxx)
- `DocumentId` - 12-hex chars (doc-xxxxxxxxxxxx)
- `GcsUri` - gs:// prefixed URIs
- `OntologyVersion` - namespace/name@hash format

## Server Wiring

### Layer Composition

```typescript
// server.ts startup
const ServerLayer = Layer.mergeAll(
  WorkflowOrchestrator.Live,
  PostgresPersistenceLive,  // Configured via POSTGRES_* env vars
  // ... other services
)
```

### SSE Handler Pattern

```typescript
const streamBatchState = (batchId: BatchId) =>
  Effect.gen(function* () {
    const orchestrator = yield* WorkflowOrchestrator

    // Subscribe to state transitions
    return yield* orchestrator.subscribeToStateChanges(batchId).pipe(
      Stream.map(state => `data: ${JSON.stringify(state)}\n\n`),
      Stream.encodeText,
      Stream.takeUntil(state => isTerminal(state))
    )
  })
```

### Single-Doc Convenience

```typescript
// POST /v1/extract wraps single document in batch
const singleDocExtract = (doc: DocumentInput) =>
  Effect.gen(function* () {
    const batchId = yield* generateBatchId()
    const manifest = {
      batchId,
      documents: [doc],
      // ... derive from request
    }
    return yield* startBatchAndStream(manifest)
  })
```

## Removal Plan

### Delete JobManager

1. Remove `packages/@core-v2/src/Service/JobManager.ts`
2. Remove all JobManager imports from server.ts
3. Remove `/v1/jobs/*` routes

### Delete Legacy Routes

```typescript
// REMOVE these routes:
// GET  /v1/jobs
// GET  /v1/jobs/:id
// POST /v1/jobs/:id/cancel
```

## Implementation Order

1. **Wire PostgresPersistenceLive** to server startup
   - Verify connectivity to deployed PostgreSQL
   - Test workflow persistence

2. **Add SSE streaming endpoint** `POST /v1/extract/batch`
   - Wire WorkflowOrchestrator
   - Implement SSE response handler
   - Stream BatchState transitions

3. **Add single-doc convenience** `POST /v1/extract`
   - Wrap in batch of 1
   - Same SSE response

4. **Delete JobManager** and legacy routes
   - Clean break, no migration

5. **Add batch status query** `GET /v1/batch/:id`
   - Query persisted state from PostgreSQL
   - Return current BatchState

## Testing

Each step can be tested against deployed dev infrastructure:

```bash
# 1. Verify PostgreSQL connectivity
curl -X POST https://effect-ontology-core-dev-xxx.run.app/v1/extract/batch \
  -H "Content-Type: application/json" \
  -d '{"documents":[...]}'

# 2. Observe SSE stream
curl -N https://effect-ontology-core-dev-xxx.run.app/v1/extract/batch/... \
  --header "Accept: text/event-stream"

# 3. Query batch state
curl https://effect-ontology-core-dev-xxx.run.app/v1/batch/batch-abc123
```

## Future Work (Out of Scope)

- Decouple NLP/extraction services into separate deployable units
- Add webhook callbacks as alternative to SSE
- Batch retry/resume from last successful stage
- Rate limiting and quotas

## Review Notes (Effect-focused refinements)

- **Schema + request alignment**: `BatchManifest` currently requires `batchId`, `sizeBytes`, and `createdAt`, while the sample request omits them. Decide whether the API constructs the manifest (using `BatchId` generation + `DateTime.now` + optional `sizeBytes` inference) or make these fields optional in the schema. Otherwise every request will fail decode at ingress when we switch to `HttpServerRequest.schemaBodyJson`.
- **Manifest staging contract**: `BatchExtractionWorkflowLayer` assumes the manifest already exists in storage (`stripGsPrefix(manifestUri)` + `StorageService.get`). Add an ingress step that writes the manifest (and optionally uploads raw documents) to the configured bucket before invoking `WorkflowEngine.execute`; surface the final `manifestUri` back to the caller for `GET /v1/batch/:id`.
- **Use workflow annotations for resumability**: `@effect/workflow` supports `Workflow.SuspendOnFailure` and `Workflow.CaptureDefects` annotations (see `Workflow.SuspendOnFailure` / `Workflow.CaptureDefects` docs). Annotating `BatchExtractionWorkflow` enables clean `resume` semantics for partial batches and ensures defects are captured in `Workflow.Result` instead of crashing the worker.
- **Typed execution IDs instead of ad-hoc generators**: `Workflow.make` exposes `.executionId` to deterministically derive IDs from payloads. Prefer `BatchExtractionWorkflow.executionId(payload)` over a custom `generateBatchId` so idempotency is enforced uniformly across HTTP, workflow, and persistence.
- **Stage state emission**: The workflow currently only returns a terminal `BatchState`. To drive SSE and `GET /v1/batch/:id`, persist intermediate `BatchState` snapshots (Pending → Extracting → Resolving → Validating → Ingesting) either via a `SubscriptionRef`/`DurableQueue` fed inside the workflow or by writing to Postgres alongside each activity result. Map these snapshots to `Workflow.Result<BatchState, string>` so `poll` can return useful progress instead of only Complete/Failed.
- **SSE implementation detail**: Replace manual string concatenation with `@effect/experimental/Sse.encoder` + `HttpServerResponse.stream` (`HttpServerResponse.stream` expects a `Stream<Uint8Array>`). Example shape: `states.pipe(Stream.map(toSseEvent), Stream.mapChunks(Sse.encoder.encode), Stream.mapChunks(Chunk.map(Uint8Array.from)))` to guarantee correct SSE framing and avoid double-newline bugs. Set headers (`Cache-Control: no-cache`, `Connection: keep-alive`, `Content-Type: text/event-stream`).
- **Streaming source of truth**: `WorkflowOrchestrator` lacks `subscribeToStateChanges`; implement SSE by polling `WorkflowEngine.poll` with `Stream.repeatEffectOption` until `isTerminal(state)` or by emitting from the state store/hub used above. Handle `Workflow.Result` variants (`Complete` vs `Suspended`) explicitly in `GET /v1/batch/:id` and SSE to show suspension causes.
- **Compensation & cleanup**: Wrap storage writes with `Workflow.withCompensation` to clean temp graphs on failure/resume (e.g., delete resolution/validation artifacts if ingestion fails). This reduces leaked objects and aligns with the durability model.
- **Configurable concurrency + backpressure**: Extraction uses hardcoded `concurrency: 5`. Hoist to config (align with `ConfigService`) and emit progress after each document to drive SSE without waiting for the whole `forEach` to finish. If SSE queues up, reuse the backpressure guidance from `PROGRESS_STREAMING_DELIVERY.md` (Hub/PubSub + sampling).
- **HTTP surface**: Use `HttpServerRequest.schemaBodyJson`/`HttpServerResponse.schemaJson` with `BatchManifest`/`BatchState` to keep responses validated. For single-doc convenience, build a manifest (including `sizeBytes`/`createdAt`) and then delegate to the batch endpoint—no parallel code paths.
- **Persistence wiring**: When wiring `PostgresPersistenceLive`, ensure the workflow layer is provided (e.g., `Layer.mergeAll(WorkflowOrchestratorLive, BatchExtractionWorkflowLayer, PostgresPersistenceLive, BunHttpServer.layer(...))`). Add a smoke test using `WorkflowEngine.layerMemory` to validate HTTP → workflow plumbing before hitting Postgres.
