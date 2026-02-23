You are implementing Phase 2.7 for `enron-knowledge-demo-integration`.

**Target runtime**: Codex (multi-agent orchestration)

Read first:
- `specs/pending/enron-knowledge-demo-integration/handoffs/HANDOFF_P2_7.md`
- `specs/pending/enron-knowledge-demo-integration/MASTER_ORCHESTRATION.md`
- `.claude/agents/observability-expert.md`

## Mission

Add comprehensive observability instrumentation to the knowledge extraction pipeline so that every batch extraction operation produces structured, queryable traces in Grafana.

## Execution Strategy

### Step 1: Research & Plan (think step by step, output plan document)

Before writing any code, produce a plan document at:
`specs/pending/enron-knowledge-demo-integration/outputs/phase-2.7-observability-plan.md`

The plan must cover:
1. Current state of `@effect/opentelemetry` setup in `packages/runtime/server/`
2. Why `traceId: "noop"` appears in current Grafana logs (diagnosis)
3. Span hierarchy design for the batch extraction pipeline
4. Wide event field catalog mapping questions → span attributes
5. Error annotation strategy
6. List of files to instrument with specific changes

### Step 2: Implement using observability-expert agent

Use the `.claude/agents/observability-expert.md` agent to implement the plan end-to-end:

1. Fix trace context propagation (eliminate `traceId: "noop"`)
2. Add `Effect.withSpan` to batch orchestration entry point with batch-level annotations
3. Add `Effect.withSpan` to each document extraction step with document-level annotations
4. Add `Effect.withSpan` to each extraction sub-step (classify, entities, mentions, relations)
5. Add `Effect.annotateCurrentSpan` for LLM call metadata (provider, model, status)
6. Add structured error annotations (error.tag, error.message) on failure paths
7. Ensure `Effect.catchAllCause` paths annotate spans before error propagation

### Step 3: Verify

Run:
```bash
bun run check --filter @beep/knowledge-server
bun run test --filter @beep/knowledge-server
```

### Step 4: Update Phase 2.8 handoff

After implementation, update `specs/pending/enron-knowledge-demo-integration/handoffs/HANDOFF_P2_8.md` with:
- Available span attributes and their meaning
- Grafana query examples for common debugging scenarios
- Tips for using the new observability data

## Hard Constraints

- Do NOT fix the OpenAI API key issue (that's Phase 2.8)
- Do NOT change extraction logic or error handling semantics
- Do NOT add new dependencies — use existing `@effect/opentelemetry` and `Effect` APIs
- Do NOT instrument client-side code beyond what already exists
- Preserve all existing behavior — this phase is additive instrumentation only

## Key Files

Server pipeline (instrument these):
- `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts`
- `packages/knowledge/server/src/Workflow/ExtractionWorkflow.ts`
- `packages/knowledge/server/src/Extraction/ExtractionPipeline.ts`
- `packages/knowledge/server/src/Extraction/EntityExtractor.ts`
- `packages/knowledge/server/src/Extraction/MentionExtractor.ts`
- `packages/knowledge/server/src/Extraction/RelationExtractor.ts`
- `packages/knowledge/server/src/Service/DocumentClassifier.ts`

Runtime tracing config (audit/fix):
- `packages/runtime/server/src/` (OTLP layer setup)
- `docker/grafana/` (Grafana datasource config)
- `docker-compose.yml` (OTLP receiver ports)

## Success Criteria

- [ ] `traceId` is no longer `"noop"` for knowledge pipeline operations
- [ ] Batch extraction produces visible parent span in Grafana
- [ ] Document-level child spans show extraction step outcomes
- [ ] Error spans have structured `error.tag` and `error.message` annotations
- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] `bun run test --filter @beep/knowledge-server` passes
