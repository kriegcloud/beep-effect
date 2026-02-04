# Workflow Engine End-to-End Audit (Effect Ontology)

Scope: request → workflow orchestration → activities → storage/output. References: `packages/@core-v2/src/Runtime/HttpServer.ts`, `Service/WorkflowOrchestrator.ts`, `Workflow/Activities.ts`, `Workflow/DurableActivities.ts`, `Service/BatchState.ts`, `Runtime/server.ts`.

## End-to-End Data Flow
- Ingress (HTTP): `POST /v1/extract` or `/v1/extract/batch` validates `BatchRequest`, generates `batchId/documentId` if absent, optionally sizes source objects, stages a manifest at `batches/{batchId}/manifest.json`, then calls `WorkflowOrchestrator.start` and immediately streams SSE of batch state (500ms poll cadence).
- Workflow registration: `BatchExtractionWorkflow` (`Workflow.make`) sets idempotency key from payload fields and annotations `SuspendOnFailure` + `CaptureDefects`.
- Execution (current implementation uses non-durable activities in `Workflow/Activities.ts`):
  1) **Pending → Extracting**: For each manifest document (concurrency=5) `makeExtractionActivity` reads source, runs ontology hybrid class search, entity extraction, relation extraction (if ≥2 entities & properties), serializes to Turtle via `RdfBuilder`, writes to `documents/{docId}/extraction/graph.ttl`, emits state updates via `publishState`.
  2) **Resolving**: `makeResolutionActivity` loads all graph.ttl files, parses Turtle, concatenates them, writes merged to `batches/{batchId}/resolution/merged.ttl`, computes basic stats.
  3) **Validating**: Stub; reads merged graph, copies to `batches/{batchId}/validation/validated.ttl`, writes stub report, always `conforms=true`.
  4) **Ingesting**: Writes validated graph to batch canonical and namespace canonical paths, counts triples, marks complete with aggregate stats.
- State & streaming: Each stage emits `BatchState` to PubSub + `StorageService` (`batches/{batchId}/status.json`). `/v1/batch/:id` polls engine result; on not-found falls back to stored state. SSE stops on terminal states.
- Engine wiring: `server.ts` currently uses `WorkflowEngine.layerMemory` (even when `POSTGRES_*` is set); `ClusterWorkflowEngine` is defined but not provided. Resume/interrupt endpoints call engine but rely on in-memory state.

## Findings (ordered by severity)
- **Not actually durable (engine)**: Server forces `WorkflowEngine.layerMemory` (see `server.ts`) even when Postgres is configured; resume/suspend semantics and crash recovery are non-functional. Impact: any pod restart loses in-flight workflows; `/resume` is ineffective. Fix: provide `ClusterWorkflowEngine.layer` with `PgClient` when `POSTGRES_HOST` is set; gate startup on DB readiness.
- **Not actually durable (activities)**: `BatchExtractionWorkflowLayer` uses non-`Activity.make` implementations from `Workflow/Activities.ts`, so no journaling/checkpointing occurs; annotations (`SuspendOnFailure`, `CaptureDefects`) don’t help without `Activity.make`/`Workflow.suspend`. Impact: crashes lose progress, retries rerun entire workflow. Fix: swap to `Workflow/DurableActivities.ts` (or port real logic into durable versions) and use `Workflow.step`/activities for each stage.
- **DurableActivities are stubs**: Durable extraction writes a comment + source content (no ontology/LLM), validation is stub, resolution simple concat. If we flip to durable layer as-is, we regress functionality. Fix: port the real extraction/resolution/validation/ingestion logic into `DurableActivities.ts` before switching.
- **Validation stub always passes**: `makeValidationActivity` (both durable and non-durable) copies graphs and sets `conforms=true`. Impact: schema violations never surface; downstream consumes bad data. Fix: implement SHACL validation with RdfBuilder; fail workflow with violations, emit error state.
- **Resolution is naive concat**: No entity resolution, just concatenation and counting; `clustersFormed` is “graphs parsed” not actual clusters. Impact: duplicates remain; downstream stats misleading. Fix: implement resolution strategy or flag stage as stub; adjust stats to reflect real resolution.
- **Engine result lifecycle**: `start` calls `engine.execute(..., discard: true)`. Depending on @effect/workflow semantics, completed results may be discarded; `/v1/batch/:id` polls engine first and may get undefined even for completed runs, relying on stored state. Align discard/poll expectations or always persist final state/digest in engine.
- **State fidelity gaps**: During extraction, `lastSuccessfulStage` remains undefined if any doc fails mid-batch; failure state cannot indicate partial progress. `extractionOutputUri` in resolving state uses only the first graph URI, not the merged set. Impact: observability/debugging noise. Fix: track per-doc failures and include the list of graph URIs in state.
- **Manifest robustness**: `createManifest` silently sets `sizeBytes=0` when a source object is missing; extraction later fails with “Missing object” after starting workflow. Fix: fail fast on missing source during manifest staging; optionally pre-validate ontology/shacl URIs.
- **Config/engine mismatch**: Resume/interrupt endpoints surface even though engine is in-memory and activities aren’t suspendable. Impact: API contract misleading. Fix: hide/disable resume when not running durable engine; return 501 or clear message.
- **Health/metrics gaps**: No per-stage timings or retry counts exposed; SSE stream emits only state. Impact: harder to diagnose slow stages. Fix: add metrics (per-stage duration, retry count) to state payloads and logs.

## Recommendations (handoff-ready)
1) Wire real durability: provide `ClusterWorkflowEngine.layer` when Postgres config exists; add readiness check and downgrade to memory only when explicitly requested. Document non-durable mode as dev-only.
2) Port real logic into `Workflow/DurableActivities.ts`, use those in `BatchExtractionWorkflowLayer`, and wrap each stage in `Workflow.step`/activities to get journaling and replay. Keep retry policy in activity definitions (currently 3x exp backoff).
3) Implement SHACL validation with `RdfBuilder` (or fail closed until shapes are ready); surface violations in `BatchFailed` and HTTP response.
4) Replace resolution concat with actual entity resolution or clearly mark the stage as stub and block ingestion when unresolved; adjust stats to reflect truth.
5) Improve state fidelity: track per-doc failures, include full `documentGraphUris` in resolving state, store per-stage duration and retry counts.
6) Manifest pre-flight: check existence/size of all source URIs and ontology/shacl before starting the workflow; reject invalid manifests with 400.
7) Clarify API behaviour: disable `/resume` (or respond 501) when running in-memory engine; document that SSE/polling state is best-effort without durable engine.
8) Observability: add span annotations (`Effect.withSpan`) around each stage, emit counters for documents processed, retries, and durations; expose a `/health/deep` check that validates DB connectivity when durable mode is enabled.
