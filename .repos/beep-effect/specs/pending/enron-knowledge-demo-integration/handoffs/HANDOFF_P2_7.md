# HANDOFF_P2_7: Knowledge Pipeline Observability Implementation

> Observability-first instrumentation phase: add structured tracing, logging, and metrics to the knowledge extraction pipeline so that all subsequent debugging is data-driven rather than guesswork.

## Working Context (<=2K tokens)

### Phase 2.7 Objective

Implement comprehensive observability instrumentation across the knowledge extraction pipeline (server-side) and the knowledge-demo RPC client (client-side) so that:

1. Every extraction workflow step emits wide events with business context (batchId, documentId, scenario, step name, outcome, duration).
2. Errors are fully captured with structured cause chains — not swallowed or flattened.
3. Grafana dashboards display actionable traces (not `traceId: "noop"` as currently observed).
4. Client-side RPC calls emit spans with request/response metadata.

### Current Observability Gaps (From Grafana Analysis)

1. **`traceId: "noop"` on most log lines** — traces are not propagating through the knowledge workflow pipeline. Spans exist (`@effect/opentelemetry` scope) but trace context is lost.
2. **Error details buried in `cause` string** — the `ClassificationError` cause contains the full error chain as a single string field, not structured span annotations.
3. **No document-level span annotations** — when a document fails, there's no span showing which document, what step, or what the LLM response was.
4. **No batch-level aggregation spans** — no parent span wrapping the full batch lifecycle with outcome annotations.
5. **Client traces exist** (`beep-client` service in Grafana) but only show RPC method names and durations, no request/response payload summaries.

### Target Instrumentation Architecture

```
BatchOrchestrator.start
  └─ withSpan("batch.orchestrate", { batchId, scenarioId, documentCount })
     ├─ withSpan("batch.document.extract", { documentId, index })
     │  ├─ withSpan("extraction.classify", { documentId })
     │  ├─ withSpan("extraction.entities", { documentId, entityCount })
     │  ├─ withSpan("extraction.mentions", { documentId, mentionCount })
     │  └─ withSpan("extraction.relations", { documentId, relationCount })
     ├─ withSpan("batch.aggregate", { batchId })
     └─ annotateCurrentSpan("outcome.success", true/false)
        annotateCurrentSpan("outcome.errorTag", errorTag)
        annotateCurrentSpan("outcome.documentsCompleted", N)
        annotateCurrentSpan("outcome.documentsFailed", N)
```

### Files In Scope

Server-side (primary):
- `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts`
- `packages/knowledge/server/src/Workflow/ExtractionWorkflow.ts`
- `packages/knowledge/server/src/Extraction/ExtractionPipeline.ts`
- `packages/knowledge/server/src/Extraction/EntityExtractor.ts`
- `packages/knowledge/server/src/Extraction/MentionExtractor.ts`
- `packages/knowledge/server/src/Extraction/RelationExtractor.ts`
- `packages/knowledge/server/src/Service/DocumentClassifier.ts`
- `packages/knowledge/server/src/Workflow/WorkflowPersistence.ts`

Client-side (secondary):
- `apps/todox/src/app/knowledge-demo/rpc-client.ts`

Runtime tracing config:
- `packages/runtime/server/src/` (existing OTLP configuration)

### Implementation Approach

1. **Research phase**: Use the `observability-expert` agent to:
   - Audit current `@effect/opentelemetry` setup in `packages/runtime/server/`
   - Identify why `traceId: "noop"` appears (likely spans created outside traced scope)
   - Map all Effect.withSpan / Effect.annotateCurrentSpan usage in knowledge server
   - Check Grafana OTLP receiver config at `docker/grafana/`

2. **Planning phase**: Output a plan document covering:
   - Span hierarchy design for batch extraction pipeline
   - Wide event field catalog (what questions should traces answer?)
   - Error annotation strategy (structured cause decomposition)
   - Sampling strategy (retain 100% of errors, sample success)

3. **Implementation phase**: Add instrumentation following the target architecture above, ensuring:
   - Every LLM call has a span with model, prompt length, response status
   - Every document extraction step annotates outcome (success/failure + error tag)
   - Batch-level span aggregates document outcomes
   - Trace context propagates through `Effect.gen` / `Effect.forEach` boundaries

### Phase 2.7 Success Criteria

- [ ] `traceId` is no longer `"noop"` in Grafana logs for knowledge pipeline operations
- [ ] Batch extraction produces a parent span visible in Grafana traces
- [ ] Each document extraction step produces child spans with structured annotations
- [ ] Error spans include `error.tag`, `error.message`, and the upstream cause chain
- [ ] LLM API call spans include `llm.provider`, `llm.model`, `llm.status`, `llm.duration`
- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] `bun run test --filter @beep/knowledge-server` passes

### Critical Finding for Next Phase

**Root cause of "All documents failed" is now known from Grafana logs:**

```
ClassificationError: Document classification failed:
  HttpResponseError: StatusCode 401
  POST https://api.openai.com/v1/responses
  "The project you are requesting has been archived and is no longer accessible"
  code: "not_authorized_invalid_project"
```

The `AI_OPENAI_API_KEY` in `.env` points to an archived OpenAI project. This causes every `DocumentClassifier.classify()` call to fail with 401, which cascades through `ExtractionPipeline` → `ExtractionWorkflow` → `BatchOrchestrator` → `BatchFailed`.

**This finding MUST be passed to Phase 2.8** (the next handoff document) so that the fix loop starts with the known root cause rather than re-discovering it.

## Episodic Context (<=1K tokens)

- P2 through P2.6 fixed multiple layers of integration issues (ParseError, branded IDs, JSONB columns, `@effect/ai` schema bug).
- After all code fixes, the demo still shows "All documents failed" because the OpenAI API key is invalid.
- Current Grafana traces show `traceId: "noop"` making it impossible to follow request flows through the pipeline.
- This phase exists to make the pipeline observable BEFORE attempting the final fix loop.

## Semantic Context (<=500 tokens)

- Grafana dashboard: `http://localhost:4000`
- OTLP config: `docker/grafana/` and `docker-compose.yml`
- Effect tracing: `@effect/opentelemetry` (already in runtime layer)
- Server logs export: `specs/pending/enron-knowledge-demo-integration/outputs/beep-server-grafana-logs.json`
- Client traces export: `specs/pending/enron-knowledge-demo-integration/outputs/beep-client-traces.csv`
- Observability expert agent: `.claude/agents/observability-expert.md`

## Procedural Context (links only)

- `../README.md`
- `../MASTER_ORCHESTRATION.md`
- `../handoffs/HANDOFF_P2_6.md`
- `.claude/agents/observability-expert.md`

## Context Budget Audit

| Section | Estimated Tokens | Budget | Status |
|---|---:|---:|---|
| Working | 1800 | <=2000 | OK |
| Episodic | 200 | <=1000 | OK |
| Semantic | 180 | <=500 | OK |
| Procedural | links-only | links-only | OK |
| Total | 2180 | <=4000 | OK |

## Next Phase Required Outputs

After implementation, update `HANDOFF_P2_8.md` with:
- Exact Grafana queries/dashboard panels that show extraction pipeline traces
- How to filter for failed documents vs. successful ones
- What span attributes are available for debugging
- Tips for using the new observability data to diagnose issues
