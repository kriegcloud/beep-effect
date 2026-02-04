# Production Deployment Spec – core-v2 Extraction Service

This spec defines the work required to ship @core-v2 as a production cloud service that ingests document sets, performs ontology-constrained extraction, streams progress/results, and produces a fully canonicalized knowledge graph.

## Goals (production)
- Managed HTTP + WebSocket API for submit/status/stream of extraction jobs.
- Idempotent, retry-safe execution with durable progress for document sets (not just single text).
- Ontology-compliant KG output (entities canonicalized, relations rewritten to canonical IDs) in JSON + RDF.
- Bounded LLM spend with rate limits, budgets, and circuit breakers.
- Observability (traces, metrics, logs) and auditability of every run.

## Current baseline (what exists)
- Demo-only entry (`src/main.ts`) runs a hardcoded text locally; no API surface.
- HTTP server (`src/Runtime/HttpServer.ts`, `src/server.ts`) exposes health only; extraction routes are “coming soon.”
- Streaming pipeline exists (`src/Workflow/StreamingExtraction.ts`) but assumes single text; no job orchestration, persistence of progress, or streaming transport.
- Entity resolution graph exists but is not wired into persisted outputs; `src/Utils/RefineKG.ts` is unused.
- Rate limiter/circuit breaker added (`src/Runtime/RateLimitedLanguageModel.ts`) but not configured per environment/budget.
- Documentation for idempotency/persistence/streaming exists in `docs/` but is not implemented in code.

## Architecture decisions
1. **Execution model (Effect Cluster / Workflow)**
   - MVP single-runner durability: use `@effect/cluster` `SingleRunner.layer` (Effect docs: Sharding/SingleRunner.layer) with SQL-backed message/runner storage (`SqlMessageStorage.layer`, `SqlRunnerStorage.layer`) so restarts don’t drop jobs.
   - Scale-out: move to `Sharding.layer` + multi-runner (Effect docs: Sharding.layer, SocketRunner.layer) once horizontal capacity is needed. Keep the protocol compatible (same entity handlers, message storage).
   - Entities: one entity per job (document set), concurrency=1 per entity to simplify state; internal parallelism is handled in the extraction workflow per document/chunk.

2. **Transport/API**
   - Add HTTP endpoints:
     - `POST /api/v1/extract` → submit document set (text or storage URIs), returns `{jobId, idempotencyKey}`.
     - `GET /api/v1/extract/:jobId` → status (queued/running/succeeded/failed) + summary counts.
   - Add WS endpoint `GET /api/v1/extract/:jobId/stream` for progress + partial outputs.
   - Implement in `src/Runtime/HttpServer.ts` and surface in `src/server.ts`; integrate schema validation with existing Config/EnvConfig services.

3. **Job identity & idempotency**
   - Use the key from `docs/idempotency-implementation.ts` (text hash + ontologyId + ontologyVersion + extraction params). Store `idempotencyKey` on submission.
   - Deduplicate in-flight work: maintain an in-memory map of `idempotencyKey -> Deferred` and a durable record (SQL table or FS metadata) to prevent duplicate runs after restart.
   - Invalidate cache when ontology version changes (see `computeOntologyVersion` in the idempotency reference).

4. **Persistence surfaces**
   - Authoritative run record: adopt the FileSystem layout in `docs/PERSISTENCE_SUMMARY.md` for Phase 1 (runs under `output/runs/{runId}/` with `metadata.json` + outputs). For cloud, mount an object-store-backed FS or write directly to S3/GCS with the same layout.
   - Add `metadata.json` with `events[]` and `errors[]` (from the MVP schema in `docs/DELIVERY_SUMMARY.md`). Implement `emitEvent/emitError` in `ExtractionRunService`.
   - For durability of job state and progress in cluster: back MessageStorage/RunnerStorage with SQL (Effect docs: SqlMessageStorage.layer, SqlRunnerStorage.layer) when running on multiple replicas.

5. **Workflow wiring**
   - Build a Job workflow/entity that:
     1. Persists submission + idempotencyKey.
     2. Iterates documents in the set (URLs or inline text), calling `streamingExtraction` per document.
     3. Runs ER → `buildEntityResolutionGraph` → `refineKnowledgeGraph` (use `src/Utils/RefineKG.ts`) before persisting final KG/RDF.
     4. Emits progress events per document/chunk (see Progress Streaming section).
   - Expose “cancel” support: mark job canceled in state and short-circuit further LLM calls.

6. **LLM control**
   - Make rate limits configurable via env (provider-specific), not hard-coded (see `src/Runtime/RateLimitedLanguageModel.ts`); expose RPM/TPM and concurrent-call caps in ConfigService.
   - Add per-job budget (max tokens, max cost) and fail fast when exceeded.
   - Keep circuit breaker defaults but emit metrics when open; bubble an operational error to the client.

7. **Progress streaming contract**
   - WS messages: `{type: "run"|"document"|"chunk"|"artifact"|"error"|"complete", jobId, docId?, chunkIndex?, data}`.
   - Emit from pipeline hooks:
     - After chunking, after mention/entity/relation phases, after Grounder filter (use instrumentation points already present in `StreamingExtraction.ts`).
     - When artifacts are saved (KG JSON, ERG JSON, RDF).
   - Backpressure: use bounded queue per client; drop to “latest” mode if the client falls behind, but never drop final artifact notifications.

8. **Ontology compliance / KG correctness**
   - Normalize to canonical IDs via ERG before saving KG/RDF (`refineKnowledgeGraph`).
   - Validate output against ontology shapes before emit:
     - Types restricted to ontology classes used in prompt/schema.
     - Predicates validated against ontology properties (object vs datatype).
   - Persist both unresolved and resolved graphs for debugging; mark resolved as authoritative.

9. **Document-set handling**
   - Support mixed inputs: inline text, uploaded files, and remote URLs. Normalize to UTF-8 text, then chunk via `NlpService.chunkText`.
   - Parallelize at document level with a bounded pool (respect LLM rate limits; share the semaphore).
   - Capture per-document stats (entities, relations, resolved, errors) in `metadata.json`.

10. **Observability**
    - Tracing: ensure spans wrap LLM calls (already in `StreamingExtraction.ts`), chunk phases, and persistence; export via `TracingLive` in `ProductionRuntime.ts`.
    - Metrics: implement counters/histograms in `src/Telemetry/Metrics.ts` for LLM latency, rate-limiter wait, chunks processed, errors; expose Prometheus endpoint via HttpServer.
    - Structured logs: include `jobId`, `idempotencyKey`, `docId`, `chunkIndex`.

11. **Security**
    - AuthN/Z on API endpoints (token or OIDC) before submission/stream.
    - Request size limits and content-type validation; reject oversized uploads server-side.
    - Secrets via env (LLM keys) with minimal scope; never log prompts or keys.

12. **Testing & rollout**
    - Unit: schema validation for API payloads; idempotency key determinism; refineKnowledgeGraph behavior.
    - Integration: end-to-end job over small doc set; cancellation; retry after crash (with SingleRunner layer); rate-limit saturation test.
    - Load: soak with N documents and enforce LLM budget adherence.
    - Rollout: start with single-runner + FS storage, then migrate to SQL-backed SingleRunner, then multi-runner sharding.

## Implementation imperatives (ordered)
1. **API surface**
   - Implement POST/GET/WS routes in `src/Runtime/HttpServer.ts`; wire to a new Job handler that enqueues/starts jobs.
   - Add OpenAPI/Schema docs (Effect Schema) for request/response and WS event types.

2. **Idempotency + cache**
   - Lift the reference implementation from `docs/idempotency-implementation.ts` into a service; persist (FS/SQL) keyed by `idempotencyKey`.
   - Deduplicate concurrent submits and short-circuit with cached result if not expired.

3. **Job orchestration**
   - Implement a Job entity/workflow that manages document-set iteration and status; expose status to API and progress stream.
   - Add cancel path that interrupts outstanding LLM work.

4. **Canonical KG output**
   - Integrate `refineKnowledgeGraph` into the main pipeline; persist `knowledge-graph.json` (unresolved), `knowledge-graph-resolved.json`, `entity-resolution-graph.json`, and RDF for the resolved graph.

5. **Persistence and audit**
   - Extend `ExtractionRunService` to write `metadata.json` with `events[]/errors[]` per `DELIVERY_SUMMARY.md`; emit events from chunk/entity/relation/grounder phases.
   - Ensure outputs are written to object storage-compatible paths.

6. **Progress streaming**
   - Implement WS producer that consumes pipeline events and artifact saves; apply bounded buffering/backpressure policy.
   - Include heartbeats to keep idle connections alive during long LLM calls.

7. **LLM control**
   - Parameterize rate limits in Config; surface metrics for limiter wait and breaker state.
   - Add per-job budgets; abort when exceeded.

8. **Resilience**
   - Run with `SingleRunner.layer` + SQL message/runner storage for durability; configure `ShardingConfig` (Effect docs: ShardingConfig.layer) with safe lock TTLs for cloud.
   - On restart, resume in-flight jobs or mark them failed with retry guidance.

9. **Observability**
   - Wire `TracingLive` in `ProductionRuntime.ts`; add metrics endpoint; standardize logging fields.

10. **Release readiness**
    - Add integration tests for timeout/cancellation (`test/Workflow/StreamingExtraction.timeout.test.ts` scaffold exists), API e2e, and idempotency collisions.
    - Provide runbooks in `docs/` for ops (deploy, rotate keys, inspect runs).

## Effect references (for implementers)
- Sharding/Single runner: `@effect/cluster` `SingleRunner.layer`, `Sharding.layer`, `SqlMessageStorage.layer`, `SqlRunnerStorage.layer` (Effect docs: Sharding.layer, SqlMessageStorage.layer, SqlRunnerStorage.layer, SingleRunner.layer).
- Layer composition patterns: see `src/Runtime/ProductionRuntime.ts` for existing extraction stack; extend with API/job/persistence layers.
- Pipeline hooks to reuse: `src/Workflow/StreamingExtraction.ts` (phase spans/logs), `src/Runtime/RateLimitedLanguageModel.ts` (rate limit + circuit breaker).
