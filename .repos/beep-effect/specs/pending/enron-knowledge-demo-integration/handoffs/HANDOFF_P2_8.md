# HANDOFF_P2_8: Knowledge Demo End-to-End Fix Loop

> Final demo fix phase: diagnose, fix, and verify the knowledge-demo until scenario ingest completes successfully with entities and relations visible.

## Working Context (<=2K tokens)

### Phase 2.8 Objective

Iterate on the knowledge-demo until "Ingest Scenario" works end-to-end:
1. Select scenario → click "Ingest Scenario"
2. Batch lifecycle progresses through `pending → extracting → resolving → completed`
3. Entities and relations are extracted and visible via GraphRAG query
4. No unhandled errors in browser console or server logs

### Known Root Cause (From Grafana Logs — Phase 2.6/2.7 Discovery)

**The OpenAI API key (`AI_OPENAI_API_KEY`) in `.env` points to an archived OpenAI project.**

Grafana log evidence (from `outputs/beep-server-grafana-logs.json`):
```
ClassificationError: Document classification failed:
  HttpResponseError: StatusCode 401
  POST https://api.openai.com/v1/responses
  "The project you are requesting has been archived and is no longer accessible"
  code: "not_authorized_invalid_project"
```

This 401 error cascades through the entire pipeline:
1. `DocumentClassifier.classify()` fails with `ClassificationError` (401 from OpenAI)
2. `ExtractionPipeline.extractDocument()` catches it and continues without classification
3. But subsequent extraction steps (`EntityExtractor`, `MentionExtractor`, `RelationExtractor`) also call OpenAI and fail with the same 401
4. All documents fail → `BatchFailed` event → UI shows "All documents failed"

**The 401 appears 4 times in the exported Grafana logs** — once per document extraction attempt.

### Fix Strategy (Ordered by Priority)

1. **Fix the OpenAI API key** — Ask the user for a valid API key, or switch to Anthropic provider if available. Check which LLM provider the knowledge pipeline uses and whether it can be configured.

2. **Verify LLM provider configuration** — The knowledge server uses `@effect/ai` with OpenAI. Check:
   - `packages/knowledge/server/src/` for provider configuration
   - `.env` / `.env.example` for `AI_OPENAI_API_KEY` and `AI_ANTHROPIC_API_KEY`
   - Whether the pipeline can use Anthropic instead of OpenAI

3. **After API key fix, test ingest again** — Run scenario-1 ingest and monitor:
   - Grafana traces (if Phase 2.7 instrumentation is in place)
   - Server terminal logs
   - Browser console for errors
   - Batch status progression in the UI

4. **Fix any subsequent errors** — The 401 was masking everything downstream. Once the LLM calls succeed, new issues may surface (schema validation, entity persistence, relation extraction, GraphRAG query). Fix each one iteratively.

### Debugging Toolkit

Use these tools in order of preference:

1. **Grafana Dashboard** (`http://localhost:4000`)
   - Check traces for the knowledge extraction pipeline
   - Filter by `service_name: "beep-server"` and `http_url: "/v1/knowledge/rpc"`
   - Look for error spans and their annotations

2. **Claude in Chrome** (browser automation)
   - Navigate to `localhost:3000/knowledge-demo`
   - Use `mcp__claude-in-chrome__read_console_messages` to check for JS errors
   - Use `mcp__claude-in-chrome__read_network_requests` to inspect RPC responses
   - Take screenshots to verify UI state

3. **Next DevTools** (browser)
   - Check Next.js server component errors
   - Inspect RSC payload for data issues

4. **Server terminal logs**
   - Watch for Effect structured logs with batch/document context
   - Look for unhandled defects (`die` / uncaught exceptions)

5. **Observability data from Phase 2.7** (if implemented)
   - Span attributes for document-level extraction outcomes
   - Error annotations with structured cause chains
   - Batch-level outcome aggregation

### Phase 2.7 Observability Surface (Now Available)

#### Span attribute catalog

Batch / workflow identity:
- `knowledge.batch.id`: Batch execution id
- `knowledge.batch.execution_id`: Workflow execution id
- `knowledge.organization.id`: Org id
- `knowledge.ontology.id`: Ontology id
- `knowledge.document.id`: Document id
- `knowledge.document.index`: Position in batch
- `knowledge.document.retry_owner`: `activity` or `orchestrator`
- `knowledge.document.retry_attempt`: Retry attempt index

Batch configuration and outcomes:
- `knowledge.batch.failure_policy`: `continue-on-failure` / `abort-all` / `retry-failed`
- `knowledge.batch.total_documents`: Batch document count
- `knowledge.batch.max_retries`: Configured retries
- `knowledge.batch.enable_entity_resolution`: Resolution toggle
- `knowledge.batch.success_count`: Successful documents
- `knowledge.batch.failure_count`: Failed documents

Extraction stage metrics:
- `knowledge.chunk.count`: Chunk count
- `knowledge.mention.count`: Mention count
- `knowledge.entity.count`: Entity count
- `knowledge.entity.invalid_count`: Invalid entity type count
- `knowledge.entity.unclassified_count`: Mention-to-entity misses
- `knowledge.relation.raw_count`: Pre-dedup relation count
- `knowledge.relation.count`: Final relation count
- `knowledge.relation.invalid_count`: Invalid predicate count
- `knowledge.incremental_clustering.enabled`: Clustering toggle
- `performance.duration_ms`: Pipeline duration in milliseconds

LLM metadata:
- `llm.provider`: Provider id (for example `openai` / `anthropic` when available)
- `llm.model`: Model id
- `llm.operation`: Logical operation name (`classify_single`, `mention_extract_chunk`, etc.)
- `llm.status`: `success` / `error` / `skipped`
- `llm.input_tokens`, `llm.output_tokens`, `llm.tokens_total`

Error annotations:
- `outcome.success`: Boolean success signal
- `error.tag`: Tagged error discriminator (or fallback)
- `error.message`: Truncated error message (safe for querying)

#### Grafana query examples (common debugging flows)

1. Find failed batch orchestrations:
- Tempo/trace filter:
  - `service.name = beep-server`
  - `span.name = knowledge.batch.orchestrate`
  - `outcome.success = false`

2. Find document-level failures for a specific batch:
- Filter:
  - `span.name = knowledge.batch.document`
  - `knowledge.batch.id = <batch-id>`
  - `outcome.success = false`

3. Isolate relation extraction errors:
- Filter:
  - `span.name = knowledge.extraction.relations OR span.name = knowledge.relation_extractor.extract_from_chunks`
  - `error.tag != ""`

4. Compare token usage by operation:
- Filter by:
  - `llm.operation = mention_extract_chunk` (or entity/relation/classification operation)
  - Group/inspect `llm.tokens_total`

5. Confirm `traceId: "noop"` regression is resolved:
- In logs/traces, filter extraction spans:
  - `span.name starts with knowledge.extraction.`
  - Verify trace id is populated and spans are attached to batch/document parents.

#### Practical usage tips

1. Start from `knowledge.batch.orchestrate`, then drill into `knowledge.batch.document` child spans to isolate the failing document quickly.
2. Use `error.tag` first (high-signal), then read `error.message` for specifics.
3. For cost/perf analysis, pivot on `llm.operation` + `llm.tokens_total` before looking at raw logs.
4. If batch-level status is `failed` but step spans look healthy, check `knowledge.batch.failure_policy` and retry fields to confirm expected policy behavior.
5. Keep searches scoped by `knowledge.batch.id` to avoid mixing concurrent demo runs.

### All Prior Fixes Applied (Context from P2 through P2.6)

These issues have been fixed and should not regress:
- `EngineBatchPayload` ParseError at orchestrator boundary (P2.6)
- `WorkflowExecutionId` branded type vs hex hash mismatch (P2.6)
- JSONB columns returning raw strings (P2.6)
- Missing `WorkflowPersistenceLive` and `BatchEventEmitterLive` in Batch RPC layer (P2.6)
- `@effect/ai` `generateObject` failing on `S.Class` schemas — workaround: `S.encodedSchema()` + decode step (P2.6)
- `BatchNotFoundError` phantom batchId (P2.5)

### Files Likely Needing Changes

LLM provider configuration:
- `.env` (API key values)
- `packages/knowledge/server/src/` (provider layer/config)
- `packages/runtime/server/src/` (LLM provider layer composition)

If extraction logic needs fixes:
- `packages/knowledge/server/src/Extraction/ExtractionPipeline.ts`
- `packages/knowledge/server/src/Extraction/EntityExtractor.ts`
- `packages/knowledge/server/src/Extraction/MentionExtractor.ts`
- `packages/knowledge/server/src/Extraction/RelationExtractor.ts`
- `packages/knowledge/server/src/Service/DocumentClassifier.ts`

If persistence/query needs fixes:
- `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts`
- `packages/knowledge/server/src/Workflow/WorkflowPersistence.ts`
- `packages/knowledge/server/src/entities/GraphRAG/rpc/query.ts`

### Phase 2.8 Success Criteria (Per Phase 2 Contract)

- [ ] Default flow no longer calls mock `extractFromText` / `queryGraphRAG` actions
- [ ] Knowledge RPC client wiring is explicit and points to `/v1/knowledge/rpc` with NDJSON
- [ ] Scenario ingest lifecycle is visible (`pending/extracting/resolving/completed/failed/cancelled`)
- [ ] Duplicate ingest starts are deterministically blocked client-side
- [ ] Scenario switching keeps org-scoped persisted state coherent
- [ ] Route is internally gated behind `ENABLE_ENRON_KNOWLEDGE_DEMO`
- [ ] **Scenario-1 ingest completes successfully** (not "All documents failed")
- [ ] **Extracted entities are visible in the UI** after batch completion
- [ ] **GraphRAG query returns results** for completed scenarios
- [ ] No unhandled errors in browser console during full ingest lifecycle
- [ ] No unhandled errors in server logs during full ingest lifecycle
- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] `bun run test --filter @beep/knowledge-server` passes
- [ ] `bun run check --filter @beep/todox` passes

## Episodic Context (<=1K tokens)

- P2 through P2.6 resolved all code-level integration bugs in the knowledge pipeline.
- The demo currently shows "All documents failed" after ingest.
- Grafana logs confirm the root cause: OpenAI API key points to an archived project (401 Unauthorized).
- The 401 cascades through DocumentClassifier → ExtractionPipeline → all extraction steps → BatchFailed.
- Phase 2.7 (if completed) adds structured observability that makes debugging subsequent issues data-driven.
- This phase is the final fix loop — iterate until the demo works 100%.

## Semantic Context (<=500 tokens)

Key environment variables:
- `AI_OPENAI_API_KEY` — currently invalid (archived project)
- `AI_ANTHROPIC_API_KEY` — may be available as alternative

Key endpoints:
- Knowledge RPC: `ws://localhost:8080/v1/knowledge/rpc`
- Knowledge demo UI: `http://localhost:3000/knowledge-demo`
- Grafana: `http://localhost:4000`

Dev server commands:
- `bun run dev` (starts both server + todox)
- `bun run purge` (clear all build artifacts if cache suspected)
- Tell user to restart dev servers when needed

## Procedural Context (links only)

- `../README.md`
- `../MASTER_ORCHESTRATION.md`
- `../handoffs/HANDOFF_P2.md` (Phase 2 contract / success checklist)
- `../handoffs/HANDOFF_P2_7.md` (observability implementation)
- `../outputs/beep-server-grafana-logs.json` (error evidence)
- `../outputs/beep-client-traces.csv` (client trace evidence)

## Context Budget Audit

| Section | Estimated Tokens | Budget | Status |
|---|---:|---:|---|
| Working | 1900 | <=2000 | OK |
| Episodic | 250 | <=1000 | OK |
| Semantic | 180 | <=500 | OK |
| Procedural | links-only | links-only | OK |
| Total | 2330 | <=4000 | OK |

## Fix Loop Protocol (Non-Negotiable)

```
repeat:
  1. diagnose   → use Grafana, browser console, server logs, Claude in Chrome
  2. research   → find the correct fix (read source, check docs, verify approach)
  3. implement  → apply the fix
  4. verify     → bun run check, bun run test, browser verification
  5. evidence   → screenshot/log showing the fix worked
until: ALL success criteria are met
```

Do not stop at "compiles" or "tests pass" if browser behavior is still broken.
If you need the user to take action (restart servers, provide API key), ask explicitly.

## Next Phase Required Outputs

- `outputs/phase-2.8-root-cause-confirmed.md` (confirmed root cause + fix applied)
- `outputs/phase-2.8-validation.md` (browser evidence showing successful ingest + entity display)
