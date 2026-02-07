# Implementation Roadmap (Reconciled)

## Executive Summary

This roadmap is reconciled to the current repository state on 2026-02-07.

Previously, this document treated workflow durability and orchestration as open P0 work. That is now stale. Workflow migration to `@effect/workflow` has been completed and legacy runtime paths were removed in `specs/completed/knowledge-effect-workflow-migration/`.

Current parity acceleration work should focus on remaining capability gaps from `P6_PARITY_GAP_MATRIX.md`:
- `P6-06` Document classification preprocessing (`GAP`, P1)
- `P6-07` Content enrichment agent (`GAP`, P2)
- `P6-08` Reconciliation service (`GAP`, P2)
- `P6-09` LLM fallback provider chain (`DIVERGENCE`, P1 remainder)
- `P6-10` Workflow composition bundles parity (`PARTIAL`, P2)
- `P6-11` Cross-batch resolver standalone service (`PARTIAL`, P2)
- `P6-12` Multi-modal ingestion (`GAP`, P3 deferred)

## Baseline (Already Implemented)

| Area | Status | Evidence |
|---|---|---|
| Workflow orchestration via `@effect/workflow` | Complete | `packages/knowledge/server/src/Workflow/ExtractionWorkflow.ts`, `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts`, `specs/completed/knowledge-effect-workflow-migration/outputs/P4_PARITY_VALIDATION.md` |
| Legacy runtime removal | Complete | `specs/completed/knowledge-effect-workflow-migration/outputs/P5_LEGACY_REMOVAL_REPORT.md` |
| SPARQL + RDF + Named Graph + PROV | Complete | `packages/knowledge/server/src/{Sparql,Rdf}/` |
| SHACL + reasoning profiles + OWL integration baseline | Complete/Partial parity | `packages/knowledge/server/src/{Validation,Reasoning}/` |
| EventBus/Storage/Ontology Registry abstractions | Implemented with scoped divergence | `packages/knowledge/server/src/Service/{EventBus,Storage,OntologyRegistry}.ts` |

## Principles

1. No stale parity assumptions in planning artifacts.
2. No regressions to workflow migration and legacy-removal outcomes.
3. Close P1 items before P2 items unless blocked.
4. Every row status change in parity matrix must cite code + tests.

## Phase Plan

### Phase 7A: Artifact Reconciliation (Week 1)

**Goal**: Ensure parity documents match real implementation state before new changes.

**Deliverables**:
- Refresh:
  - `outputs/COMPARISON_MATRIX.md`
  - `outputs/GAP_ANALYSIS.md`
  - `outputs/IMPLEMENTATION_ROADMAP.md` (this file)
  - `outputs/P6_PARITY_GAP_MATRIX.md`
- Add `outputs/P7_PARITY_CLOSURE_REPORT.md` with matrix-diff evidence.

**Acceptance**:
- No references to deleted workflow artifacts (`DurableActivities.ts`, removed actor-machine files).
- Workflow rows use `@effect/workflow` evidence paths.

### Phase 7B: P1 Capability Closure (Weeks 1-2)

**Goal**: Close highest-value P1 items.

| Item | Matrix Row | Target | Notes |
|---|---|---|---|
| Document classifier | `P6-06` | `FULL` | Add preprocessing classifier service and extraction integration |
| LLM fallback chain | `P6-09` | `FULL` or documented `DIVERGENCE` | Extend `LlmResilience` recover path into explicit provider fallback order |

**Acceptance**:
- Passing tests for new classifier and fallback behavior.
- Updated matrix rows with evidence paths.

### Phase 7C: P2 Capability Uplift (Weeks 2-4)

**Goal**: Close or explicitly stabilize remaining P2 items.

| Item | Matrix Row | Target | Notes |
|---|---|---|---|
| Content enrichment agent | `P6-07` | `FULL` or `DIVERGENCE` | Service/agent integration with deterministic test seams |
| Reconciliation service | `P6-08` | `FULL` or `DIVERGENCE` | Reviewable candidate queue semantics |
| Bundle parity uplift | `P6-10` | `FULL` or `PARTIAL` with rationale | Expand service bundle coverage where needed |
| Cross-batch resolver service | `P6-11` | `FULL` or `DIVERGENCE` | Promote existing capabilities to dedicated API/service |

**Acceptance**:
- Status changes backed by concrete code and tests.
- No workflow runtime regressions.

### Deferred Backlog

| Item | Matrix Row | Priority | Defer Reason |
|---|---|---|---|
| Multi-modal/image ingestion | `P6-12` | P3 | Separate ingestion/media spec recommended |

## Timeline Overview

| Window | Focus | Exit Condition |
|---|---|---|
| Week 1 | 7A + 7B start | Artifacts reconciled; P1 implementations in progress |
| Week 2 | 7B close | `P6-06` and `P6-09` statuses finalized with tests |
| Weeks 3-4 | 7C | P2 items closed or explicitly diverged with rationale |

## Verification Standard

Run after each major milestone:

```bash
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-server
bun run lint --filter @beep/knowledge-server
bun test packages/knowledge/server/test/Workflow/
bun test packages/knowledge/server/test/Resilience/
bun test packages/knowledge/server/test/Service/
bun test packages/knowledge/server/test/Extraction/
bun test packages/knowledge/server/test/EntityResolution/
bun test packages/knowledge/server/test/GraphRAG/
```

## Risk Register (Active)

| Risk | Impact | Mitigation |
|---|---|---|
| Parity documents drift from implementation | High | Update matrix/roadmap in same PR as behavior changes |
| Fallback chain causes provider-specific regressions | Medium | Add deterministic fallback tests with injected failures |
| New services increase runtime coupling | Medium | Keep service boundaries explicit and layer composition tested |
| Cross-batch uplift regresses workflow paths | High | Preserve orchestrator contracts and rerun workflow parity tests |

## Completion Criteria

- [ ] Reconciled artifacts contain no stale workflow assumptions.
- [ ] `P6-06` and `P6-09` resolved to `FULL` or explicit tested divergence.
- [ ] `P6-07`, `P6-08`, `P6-10`, `P6-11` resolved or explicitly deferred with rationale.
- [ ] Verification suite passes.
- [ ] `P7_PARITY_CLOSURE_REPORT.md` completed with matrix diff + evidence links.
