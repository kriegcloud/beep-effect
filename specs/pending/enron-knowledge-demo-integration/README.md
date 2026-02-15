# Enron Knowledge Demo Integration

> Replace `apps/todox/src/app/knowledge-demo` mock behavior with real Enron-backed extraction, GraphRAG, and LLM meeting prep over runtime RPC.

---

## Why This Spec Exists

`knowledge-demo` is currently powered by hardcoded mock entities/relations and synthetic delays. That makes the UI useful for component iteration, but not for product demonstration. We need an internal demo path that exercises real pipeline behavior end-to-end:

1. Select a curated Enron scenario
2. Ingest/extract to persistent org-scoped knowledge data
3. Query real entities/relations via GraphRAG
4. Generate meeting prep with live LLM synthesis
5. Inspect evidence references grounded in source spans

---

## Scope

### In Scope

- Replace mock data/actions in `apps/todox/src/app/knowledge-demo` with real RPC-backed data flow.
- Add deterministic curated scenario support (multi-scenario) using Enron curated dataset.
- Add explicit scenario ingestion trigger (`Ingest Scenario`) and extraction progress/state UX.
- Persist extracted data in org-scoped tables (RLS-compatible defaults).
- Rewrite `meetingprep_generate` in `packages/knowledge/server` to use LLM-backed bullet synthesis while preserving persisted bullet/evidence model.
- Use runtime RPC wiring in `packages/runtime/server/src/Rpc.layer.ts` + `@effect-atom/atom-react` RPC client in todox.
- Gate demo behind `ENABLE_ENRON_KNOWLEDGE_DEMO`.

### Out of Scope

- Public/customer rollout
- Non-curated dataset browsing
- New graph visualization framework rewrite
- Replacing all knowledge demo UI components if existing components can be reused

---

## Locked Decisions

1. **Spec shape**: separate spec from `enron-data-pipeline`
2. **Scenario source**: curated Enron dataset only
3. **Ingestion UX**: explicit user action per scenario (`Ingest Scenario`) with status
4. **Extraction scope**: full thread documents with deterministic cap (`maxDocumentsPerScenario = 25`)
5. **Persistence**: org-scoped by default (RLS-aligned)
6. **Meeting prep**: rewrite to live LLM synthesis (not template bullets)
7. **Transport**: runtime RPC websocket (`/v1/knowledge/rpc`, NDJSON serialization)
8. **Feature gating**: `ENABLE_ENRON_KNOWLEDGE_DEMO`

---

## Key Technical Constraints

- Preserve monorepo boundaries and Effect patterns (`no any`, no unchecked casts, no `@ts-ignore`).
- Avoid long-running dev processes unless explicitly needed.
- Do not introduce cross-slice direct imports; use package entrypoints and aliases.
- Ensure deterministic scenario ordering and selection rationale.
- Maintain evidence-chain invariants (every meeting prep bullet must map to persisted evidence where applicable).

---

## Architecture Targets

### Data/Control Flow

1. Scenario catalog in todox (curated, deterministic)
2. User clicks `Ingest Scenario`
3. Client calls RPC mutation (Batch start)
4. Server runs extraction workflow with curated docs + ontology content
5. Client polls/streams batch status via RPC
6. Once complete, client fetches real entities/relations/GraphRAG results
7. User requests meeting prep; RPC returns persisted bullets + disclaimer
8. Evidence panel resolves bullet citations via `Evidence.List`

### Ontology Source Decision

Use `tooling/cli/src/commands/enron/test-ontology.ttl` as the default ontology payload for scenario ingestion because it is already validated by prior Enron phases and keeps extraction behavior deterministic enough for internal demo iteration.

---

## Success Criteria

- [ ] `knowledge-demo` no longer depends on mock entities/relations/actions from `apps/todox/src/app/knowledge-demo/actions.ts`
- [ ] Curated scenario picker supports multiple deterministic Enron scenarios
- [ ] `Ingest Scenario` triggers real extraction via runtime RPC and shows progress/completion state
- [ ] Extracted knowledge persists and is visible across users in the same org (RLS policy behavior)
- [ ] GraphRAG panel displays real entities/relations/context from persisted extraction data
- [ ] Meeting prep uses live LLM synthesis (not relation-id template text)
- [ ] Meeting prep evidence resolves via `Evidence.List` and supports source-span inspection
- [ ] Demo route is hidden unless `ENABLE_ENRON_KNOWLEDGE_DEMO` is enabled
- [ ] Phase outputs + reflection logs are updated for each phase
- [ ] Required verification gates pass

---

## Verification Gates

Mandatory for touched areas in this spec:

```bash
bun run check --filter @beep/todox
bun run test --filter @beep/todox
bun run check --filter @beep/server
bun run test --filter @beep/server
bun run check --filter @beep/runtime-server
bun run test --filter @beep/runtime-server
bun run check --filter @beep/knowledge-server
bun run test --filter @beep/knowledge-server
```

Also required:

- [ ] deterministic smoke run documented in `outputs/demo-validation.md`:
  - scenario ingest started
  - batch reaches terminal success state
  - entities/relations retrievable
  - GraphRAG query returns context
  - meeting prep returns synthesized bullets
  - evidence lookup resolves for returned bullets

---

## Phase Plan

### Phase 0: Discovery & Baseline

**Goal**: lock current mock behavior and target RPC contract usage.

Deliverables:
- `outputs/codebase-context.md`
- `outputs/current-vs-target-matrix.md`

### Phase 1: Scenario Catalog + Ingestion Wiring

**Goal**: introduce curated scenarios and real batch ingestion path.

Deliverables:
- deterministic scenario catalog + rationale
- ingestion action flow with status handling
- org-scoped persistence verification notes

### Phase 2: knowledge-demo RPC Client Migration

**Goal**: replace mock actions with Atom RPC queries/mutations over runtime protocol.

Deliverables:
- `AtomRpc.Tag` client wiring for knowledge RPC group
- extraction/graph panels powered by real RPC reads
- removal of dummy relations/entities path

### Phase 3: Meeting Prep LLM Rewrite

**Goal**: rewrite `meetingprep_generate` to produce synthesized, evidence-grounded bullets.

Deliverables:
- updated handler implementation
- safe failure handling (no defects on recoverable issues)
- evidence persistence retained and validated

### Phase 4: Demo UX Completion + Validation

**Goal**: ensure all existing `knowledge-demo` features use real data and are coherent for internal demo.

Deliverables:
- end-to-end user flow validation report
- mismatch/risk tracking with remediation
- `outputs/demo-validation.md`

### Phase 5: Closure

**Goal**: finalize reflection/handoffs and prepare spec transition.

Deliverables:
- complete reflection sections
- closure handoff + orchestrator prompt

---

## Primary Files Expected to Change

- `apps/todox/src/app/knowledge-demo/*`
- `apps/todox/src/app/knowledge-demo/actions.ts` (replace/remove mock behavior)
- `packages/knowledge/server/src/entities/MeetingPrep/rpc/generate.ts`
- `packages/runtime/server/src/Rpc.layer.ts` (only if additional RPC exposure is needed)
- supporting client/runtime layers under `packages/runtime/client` / `packages/shared/client` as needed

---

## Related Specs

- `/home/elpresidank/YeeBois/projects/beep-effect2/specs/pending/enron-data-pipeline/README.md`
- `/home/elpresidank/YeeBois/projects/beep-effect2/specs/pending/enron-data-pipeline/outputs/extraction-results.md`
- `/home/elpresidank/YeeBois/projects/beep-effect2/specs/pending/enron-data-pipeline/outputs/meeting-prep-quality.md`

---

## Workflow Docs

- `MASTER_ORCHESTRATION.md`
- `RUBRICS.md`
- `REFLECTION_LOG.md`
- `handoffs/`
