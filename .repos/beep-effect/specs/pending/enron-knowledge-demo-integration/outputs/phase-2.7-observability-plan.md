# Phase 2.7 Observability Plan: Knowledge Extraction Pipeline

## Scope
Add additive tracing instrumentation to the knowledge batch extraction server pipeline so Grafana traces are queryable end-to-end, without changing extraction behavior, retry behavior, or dependency graph.

## 1. Current `@effect/opentelemetry` State in `packages/runtime/server`

### Runtime wiring
- `packages/runtime/server/src/Tracer.layer.ts`
  - Uses `NodeSdk.layer` from `@effect/opentelemetry`.
  - Configures OTLP trace/log/metric exporters via `serverEnv.otlp.*`.
  - Uses `BatchSpanProcessor`, `BatchLogRecordProcessor`, and periodic metric reader.
- `packages/runtime/server/src/Tooling.layer.ts`
  - Merges `Tracer.layer` + dev tools layer.
- `packages/runtime/server/src/Server.layer.ts`
  - Provides `Tooling.layer` at server boundary, so tracer provider is available globally.
- `packages/runtime/server/src/Runtime.ts`
  - `runServerPromise` and `runServerPromiseExit` wrap effects with `Effect.withSpan(...)`.

### HTTP/RPC layering details
- `packages/runtime/server/src/HttpRouter.layer.ts`
  - HTTP tracer is disabled for `/v1/knowledge/rpc` via `HttpMiddleware.withTracerDisabledWhen(...)`.
  - This removes HTTP-level server spans for knowledge RPC requests, but does not disable tracing globally.
- `packages/runtime/server/src/Rpc.layer.ts`
  - Knowledge RPC router uses `spanPrefix: "rpc"`, and handlers also use `Effect.withSpan(...)`.

### OTLP/Grafana transport config audit
- `docker-compose.yml`
  - Grafana OTLP stack exposes `4318` (OTLP HTTP).
- `docker/grafana/otelcol-config.yaml`
  - Collector receives OTLP on `4317` (gRPC) + `4318` (HTTP), exports traces/logs/metrics internally.
- Environment defaults in `.env.example` point server exporters to `http://localhost:4318/v1/{traces|logs|metrics}`.

Conclusion: exporter/runtime wiring is present and functioning; trace loss is not caused by missing OTLP transport.

## 2. Diagnosis: Why `traceId: "noop"` Appears

Primary diagnosis: many knowledge extraction log lines execute outside an active span context.

Evidence from existing Grafana export (`beep-server-grafana-logs.json`):
- Within the same extraction execution, some lines have real trace IDs (for example ontology cache/load logs and batch event logs), while nearby extraction logs (`Loading ontology`, `Chunking text`, `Extracting mentions`) show `traceId: "noop"`.
- This indicates tracer provider is active, but extraction pipeline steps are not consistently wrapped in explicit spans.

Contributing factors:
- Workflow engine execution is asynchronous and may not inherit request span context deterministically across orchestration boundaries unless a new workflow-local parent span is created.
- Target pipeline/extractor methods currently have little/no `Effect.withSpan(...)` coverage (except one incremental clustering span), so step logs often run spanless.
- `fnUntraced` wrappers in extraction components reduce built-in tracing metadata and make explicit span wrappers mandatory for observability.

Net: `noop` is a span coverage/context propagation issue inside workflow/extraction code paths, not an OTLP exporter failure.

## 3. Span Hierarchy Design (Batch Extraction)

Target hierarchy:

1. `knowledge.batch.orchestrate`
- Location: `BatchOrchestrator.executeBatchEngineWorkflow` entry.
- Attributes: batch identity/config, document count, failure policy.

2. `knowledge.batch.document`
- Location: per-document processing in `processDocument(...)`.
- Attributes: document id, index, retry attempt.

3. `knowledge.extraction.workflow`
- Location: `ExtractionWorkflow.run(...)` / engine execution activity boundary.
- Attributes: document id, ontology id, retry owner/attempt.

4. `knowledge.extraction.pipeline`
- Location: `ExtractionPipeline.run(...)`.
- Attributes: document id, text length, chunking mode, config thresholds.

5. Sub-step spans (children of pipeline)
- `knowledge.extraction.classify`
- `knowledge.extraction.mentions`
- `knowledge.extraction.entities`
- `knowledge.extraction.relations`
- `knowledge.extraction.graph_assemble`

6. LLM-operation spans inside extractors/classifier
- Mention extractor: per chunk/batch generation spans.
- Entity extractor: per batch generation spans.
- Relation extractor: per chunk generation spans.
- Document classifier: single/batch classification spans.

Outcome annotations at each scope:
- `outcome.success`
- `outcome.error_tag` (on failure)
- `outcome.error_message` (on failure, sanitized/truncated)
- `llm.status` where applicable.

## 4. Wide Event Field Catalog (Questions -> Span Attributes)

| Debugging question | Span name(s) | Attributes to emit |
|---|---|---|
| Which batch failed and under what policy? | `knowledge.batch.orchestrate` | `knowledge.batch.id`, `knowledge.batch.failure_policy`, `knowledge.batch.total_documents`, `knowledge.batch.max_retries`, `knowledge.batch.enable_entity_resolution`, `outcome.success`, `outcome.error_tag` |
| Which document failed in the batch? | `knowledge.batch.document` | `knowledge.batch.id`, `knowledge.document.id`, `knowledge.document.index`, `knowledge.document.retry_attempt`, `outcome.success`, `outcome.error_tag`, `outcome.error_message` |
| Where in extraction did it fail? | sub-step spans | `knowledge.step` (implicit via span name), `knowledge.document.id`, `outcome.success`, `outcome.error_tag`, `outcome.error_message` |
| Are mention/entity/relation stages slow? | sub-step spans | `performance.duration_ms` (from span duration), `knowledge.chunk.count`, `knowledge.mention.count`, `knowledge.entity.count`, `knowledge.relation.count` |
| Which LLM provider/model/status was used? | extractor/classifier LLM spans | `llm.provider`, `llm.model`, `llm.operation`, `llm.status`, `llm.input_tokens`, `llm.output_tokens`, `llm.tokens_total` |
| Is failure concentrated by ontology or org? | workflow/pipeline spans | `knowledge.organization.id`, `knowledge.ontology.id`, `knowledge.document.id`, `outcome.*` |
| Did retries help? | batch/document/workflow spans | `knowledge.document.retry_attempt`, `knowledge.batch.max_retries`, `outcome.success` |

Notes:
- High-cardinality IDs (`batchId`, `documentId`, `traceId`) are intentionally included for incident drill-down.
- Avoid PII fields (document text, subject lines, participant names).

## 5. Error Annotation Strategy

Principles:
- Do not change error propagation semantics.
- On failure paths, annotate current span first, then rethrow original error/cause unchanged.
- Keep annotation values bounded and non-PII.

Implementation approach:
- Add local helpers in instrumented files:
  - `extractErrorTag(error | cause): string`
  - `extractErrorMessage(error | cause): string` (sanitized + truncated)
- For `Effect.catchAllCause(...)` blocks:
  - `Effect.annotateCurrentSpan("outcome.success", false)`
  - `Effect.annotateCurrentSpan("error.tag", <tag>)`
  - `Effect.annotateCurrentSpan("error.message", <message>)`
  - `Effect.failCause(cause)` to preserve the original cause channel.
- For typed `Effect.catchTag(...)` blocks:
  - annotate with that `_tag` + message before existing fallback behavior.
- On success paths:
  - annotate `outcome.success = true` and key output counts.

## 6. Files To Instrument With Specific Changes

### Runtime / tracing audit
1. `packages/runtime/server/src/Tracer.layer.ts`
- Audit only; no exporter changes planned unless implementation reveals runtime mismatch.

2. `packages/runtime/server/src/HttpRouter.layer.ts`
- Audit tracer-disabled rules; keep existing behavior unless needed for correctness.

3. `docker-compose.yml`
4. `docker/grafana/otelcol-config.yaml`
- Audit only; no changes planned.

### Batch/workflow instrumentation
5. `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts`
- Add batch-level `Effect.withSpan("knowledge.batch.orchestrate", ...)`.
- Add document-level `Effect.withSpan("knowledge.batch.document", ...)` in `processDocument`.
- Annotate batch/document outcomes and aggregated counters.
- In all `catchAllCause`/mapped failure paths, annotate `error.tag` and `error.message` before propagation.

6. `packages/knowledge/server/src/Workflow/ExtractionWorkflow.ts`
- Add `Effect.withSpan("knowledge.extraction.workflow", ...)` around workflow run/execution boundaries.
- Annotate retry owner/attempt, execution id, document id, ontology id.
- Annotate failure in `catchAllCause` before producing existing `ActivityFailedError`/string errors.

### Extraction pipeline and sub-steps
7. `packages/knowledge/server/src/Extraction/ExtractionPipeline.ts`
- Add parent pipeline span and child spans for:
  - classify
  - mentions
  - entities
  - relations
  - graph assembly
- Annotate counts/tokens/outcome at each step.
- Annotate failures in existing catch branches before current behavior continues.

8. `packages/knowledge/server/src/Extraction/EntityExtractor.ts`
- Add spans around batch classification and individual model calls.
- Annotate LLM metadata (`llm.provider`, `llm.model`, `llm.status`, token usage).
- Annotate malformed output / resilience failures with `error.*` attrs.

9. `packages/knowledge/server/src/Extraction/MentionExtractor.ts`
- Add spans for chunk-level and multi-chunk extraction loops.
- Add LLM metadata annotations and per-chunk outcome attrs.

10. `packages/knowledge/server/src/Extraction/RelationExtractor.ts`
- Add spans for `extract` and per-chunk operations in `extractFromChunks`.
- Add LLM metadata + success/error annotations.

11. `packages/knowledge/server/src/Service/DocumentClassifier.ts`
- Add spans for single and batch classification (`classify`, `classifyBatch`, `classifyWithAutoBatching`).
- Annotate provider/model, document/batch sizes, LLM status, and structured errors.

### Handoff update
12. `specs/pending/enron-knowledge-demo-integration/handoffs/HANDOFF_P2_8.md`
- Add field dictionary, Grafana queries, and usage tips after implementation verification.

## Verification Plan
1. Type-check/package validation:
- `bun run check --filter @beep/knowledge-server`

2. Test suite:
- `bun run test --filter @beep/knowledge-server`

3. Behavioral guardrails:
- No extraction logic changes.
- No error-contract changes.
- No new dependencies.

## Non-goals
- No OpenAI key fix in this phase (known issue deferred to Phase 2.8).
- No client-side observability expansion beyond current baseline.
