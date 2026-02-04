# Workflow Engine Implementation Spec (Effect Ontology)

Goal: align the batch workflow with durable activities, remove duplication between stub/real implementations, and tighten observability/error semantics. Stubs for resolution/validation are acceptable initially, but the execution path should be durable-ready. This spec is grounded in the current codebase and Effect constructs.

## Current State (References)
- Ingress & streaming: `packages/@core-v2/src/Runtime/HttpServer.ts` (`/v1/extract`, `/v1/extract/batch`, SSE streaming via `pollToBatchState`).
- Workflow orchestration: `packages/@core-v2/src/Service/WorkflowOrchestrator.ts` (BatchExtractionWorkflow with idempotency, annotations, state emission, uses non-durable Activities.ts).
- Non-durable activities: `packages/@core-v2/src/Workflow/Activities.ts` (real extraction/resolution/validation/ingestion logic).
- Durable activities (stubbed): `packages/@core-v2/src/Workflow/DurableActivities.ts` (Activity.make, journaling, but business logic is placeholder).
- Engine wiring: `packages/@core-v2/src/server.ts` forces `WorkflowEngine.layerMemory`; ClusterWorkflowEngine defined but not provided.
- State persistence/streaming: `packages/@core-v2/src/Service/BatchState.ts`.
- Domain schemas: `packages/@core-v2/src/Domain/Schema/Batch.ts`, `.../BatchRequest.ts`, `.../Model/BatchWorkflow.ts`.

## Objectives
1) Make the execution path durable-ready: use Activity.make-based implementations and journaled engine when Postgres is configured.
2) Remove duplication between Activities.ts and DurableActivities.ts by consolidating logic into the durable versions.
3) Keep validation/resolution stubbed for now, but clearly marked and surfaced in state/metrics.
4) Improve fidelity of state, errors, and observability without changing the public API shape.

## Implementation Plan

### 1) Engine Selection & Bootstrapping
- In `server.ts`, provide `ClusterWorkflowEngine.layer` when `POSTGRES_HOST` is present; fall back to `WorkflowEngine.layerMemory` only when Postgres is absent or an explicit `WORKFLOW_ENGINE=memory` escape hatch is set.
- Add a readiness check: before launching `ServerLive`, probe DB connectivity (PgClient) and surface failure clearly. If DB is configured but unreachable, fail fast rather than silently falling back to memory.
- Log which engine is active; expose in `/health/deep` for observability.

Context: current code logs Postgres but still uses memory (server.ts:57-100), making resume/suspend ineffective.

### 2) Consolidate Activities into DurableActivities.ts
- Move the real logic from `Workflow/Activities.ts` into `Workflow/DurableActivities.ts`:
  - Extraction: ontology class search, entity extraction, property fetch, relation extraction, graph build, Turtle serialization, storage write.
  - Resolution: load graphs, parse, merge/concat (stub acceptable), stats.
  - Validation: stub pass-through plus report write.
  - Ingestion: write canonical + namespace copies, stats.
- Ensure schemas in DurableActivities match the outputs used by orchestrator (ExtractionOutput, etc.).
- Delete or deprecate the duplicate implementations in Activities.ts, or make them thin wrappers that call the durable versions’ `execute` to avoid drift.

Context: durable activities are placeholders today (`DurableActivities.ts:45-198`); the orchestrator uses non-durable versions (`WorkflowOrchestrator.ts:274-360`).

### 3) Switch Workflow to Durable Activities
- In `BatchExtractionWorkflowLayer` (WorkflowOrchestrator.ts), replace calls to `makeExtractionActivity`/`Resolution`/`Validation`/`Ingestion` from Activities.ts with the `Activity.make` versions from DurableActivities.ts.
- Wrap each stage with `Workflow.step` (or keep current structure but invoke `Activity.run` semantics) so @effect/workflow journals progress and can replay after crash.
- Keep current concurrency (extraction concurrency=5) but validate compatibility with Activity.run (per @effect/workflow docs, Activity.make is journaled and retried with the provided interruptRetryPolicy).

Context: annotations `SuspendOnFailure`/`CaptureDefects` are set, but without Activity.make journaling nothing is durable.

### 4) State & Error Fidelity
- Add per-stage timings and retry counts to BatchState updates (e.g., include `stageDurationMs`, `attempt` if activity retry fires).
- For extraction, track per-document failures and include `documentsFailed`; do not always emit `documentsFailed: 0`.
- For resolving state, include the full list of `documentGraphUris` or a digest, not just the first URI.
- When stubs run (resolution/validation), include a `stub: true` flag in stage logs and optionally in state (or in stats) so operators know behavior is incomplete.

Context: current BatchState omits failed docs and uses placeholder values in several stages (WorkflowOrchestrator.ts:274-360).

### 5) Manifest Preflight
- During manifest staging (`createManifest`/`stageManifest` in HttpServer.ts), check existence of all `sourceUri`, `ontologyUri`, and `shaclUri` (if provided) via StorageService before starting the workflow; fail with 400 if missing.
- Preserve sizeBytes if provided; if not, compute and fail if content is missing rather than defaulting to 0.

Context: today missing sources become sizeBytes=0 and fail later during extraction (Activities.ts:68-118).

### 6) API/Resume Semantics
- If running in memory engine, have `/v1/batch/:id/resume` respond 501 with a message (“resume requires durable engine”) to avoid false expectations.
- Once ClusterWorkflowEngine is active, enable resume/interrupt and document the behavior (idempotent by executionId/idempotencyKey).

Context: resume endpoint exists but engine is memory-only (HttpServer.ts:150-198).

### 7) Observability & Logging
- Add spans around each stage (`Effect.withSpan("workflow.extract")`, etc.) and annotate batchId, docId.
- Log the active engine type at startup and in health checks.
- Optionally expose per-stage metrics (counters/histograms) later; not required for initial alignment.

### 8) Stubs Accepted (but explicit)
- Resolution: keep concat/stats, mark stub in state/logs, and set `clustersFormed` to meaningful metric (e.g., number of graphs merged).
- Validation: keep pass-through, mark stub, and set `conforms=true`, `violations=0`.

## Suggested Work Breakdown
1) Engine wiring & readiness (server.ts, health): switch to ClusterWorkflowEngine when DB present; fail fast on DB miss; log engine type.
2) Port logic into DurableActivities and make non-durable wrappers delegate.
3) Orchestrator swap to durable activities + Activity.make execution; add spans/timings.
4) Manifest preflight + improved state fields (failed docs, doc URIs, stub flag).
5) Resume/interrupt semantics: 501 when memory, enable when durable.
6) Clean-up: remove unused duplication, update docs/DEPLOY.md to describe durable vs dev mode.

## Notes on Effect APIs (for implementers)
- `Activity.make` (from @effect/workflow) is journaled; use `interruptRetryPolicy` to control retries (existing policy in DurableActivities.ts).
- `Workflow.make` annotations `SuspendOnFailure` + `CaptureDefects` already set; journaling only works when activities are Activity-based.
- `WorkflowEngine.execute` with `discard: true` may drop results; ensure `discard` is false if you want to poll results from the engine, or rely on persisted BatchState as the source of truth.

## Acceptance Criteria
- With POSTGRES_* set and reachable, engine reports durable mode in logs/health; workflows survive process restart without losing progress.
- DurableActivities contain the real business logic (or explicit stub markers); Activities.ts no longer diverges.
- BatchState reflects retries, per-doc failure counts, and stub indicators; resolving state shows merged inputs.
- `/resume` communicates accurately based on engine mode.

## Addendum: Layer Map & Composition (for engineering)

Layer landscape (current wiring):
- Platform/IO: `BunContext.layer` (`packages/@core-v2/src/server.ts:45-46`) supplies FileSystem/Path.
- Config: `ConfigService.Default` (`server.ts:24,108`) loads env-backed config groups.
- Storage/Persistence: `StorageServiceLive` (`server.ts:30,106`) + Batch state layers (`BatchStateHubLayer`, `BatchStatePersistenceLayer` using `StorageService` via KeyValueStore adapter in `Service/BatchState.ts`).
- LLM/Extraction: `makeLanguageModelLayer` + `EntityExtractor.Default` + `RelationExtractor.Default` bundled in `ExtractionServicesLive` (`server.ts:81-87`).
- Ontology: `OntologyService.Default` with `NlpService.Default` (`server.ts:88-92`) and `RdfBuilder.Default` (`server.ts:105`).
- Workflow: engine selection (`WorkflowEngineLive` currently memory at `server.ts:63-73`), workflow registration/orchestrator (`WorkflowOrchestratorFullLive` + `.pipe(Layer.provide(WorkflowEngineLive))` at `server.ts:75-79`; definition at `Service/WorkflowOrchestrator.ts:223-360`).
- HTTP/runtime: `HttpServerLive` router + health/shutdown (`server.ts:94-109`).
- Architecture doc reminder: multi-layer stack (workflow definitions → ClusterWorkflowEngine → runner socket → persistence) in `docs/plans/2025-12-10-batch-workflow-architecture.md:1527-1554`.

Recommended composition patterns:
- Bundle by concern, then provide shared deps once:
  - `PlatformBundle = BunContext.layer`.
  - `ConfigBundle = ConfigService.Default`.
  - `StorageBundle = StorageServiceLive > BatchStatePersistenceLayer > BatchStateHubLayer` (provide order: storage → persistence → hub consumers).
  - `OntologyBundle = RdfBuilder.Default > NlpService.Default > OntologyService.Default`.
  - `LlmExtractionBundle = makeLanguageModelLayer > EntityExtractor.Default > RelationExtractor.Default`.
  - `WorkflowBundle = WorkflowEngineSelected > BatchExtractionWorkflowLayer > WorkflowOrchestratorLive`.
  - `HttpBundle = BunHttpServer.layer({ port }) > HealthCheckService.Default > ShutdownService.Default > HttpServerLive`.
- Compose with `Layer.mergeAll` inside bundles to flatten, then stitch bundles via `provideMerge` from dependents to providers (e.g., `HttpBundle.provideMerge(WorkflowBundle).provideMerge(StorageBundle)...provide(PlatformBundle)`), mirroring the current order in `ServerLive` (`server.ts:94-110`).
- Pre-provide the engine into the workflow layer before merging (`WorkflowOrchestratorFullLive.pipe(Layer.provide(WorkflowEngineSelected))`) to ensure registration sees the right engine.
- For tests, build a `TestWorkflowBundle` with `WorkflowEngine.layerMemory`, `BatchStatePersistenceMemory` (if added), and `Layer.provideMerge(TestContext)` as sketched in the architecture plan (`docs/plans/2025-12-10-batch-workflow-architecture.md:1291-1310`).
- When ClusterWorkflowEngine is enabled, insert `PgClient.layerConfig` and the runner/socket layers ahead of WorkflowBundle, following the diagram in the architecture doc (`docs/plans/2025-12-10-batch-workflow-architecture.md:1527-1554`).

Organization goals:
- Minimize repetition: prefer small bundles (Platform, Config, Storage, Ontology, LLM/Extraction, Workflow, HTTP) and keep `ServerLive` as a readable provide chain.
- Keep dependency direction explicit: dependents first, providers later in `provideMerge`; avoid hidden global provides.
- Make the engine selection explicit (memory vs cluster) and pass it once into the workflow bundle to avoid accidental drift.
