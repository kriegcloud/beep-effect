# Gap Analysis (Reconciled)

**Spec**: `knowledge-ontology-comparison`  
**Date**: 2026-02-08  
**Baseline**: Post-Phase 7 (capability parity acceleration applied) + completed `knowledge-effect-workflow-migration` (P5 legacy removal)

## Executive Summary

This gap analysis replaces stale assumptions that workflow durability and workflow runtime migration were still open. Those items are now closed at migration-spec level and reflected in the reconciled parity matrix.

Current remaining parity work is concentrated in:
- divergence decisions/documentation quality (cluster workflow persistence + Storage),
- bundle uplift,
- and selected intentional divergences where full parity is not required.

## Closed / Reclassified Since Earlier Analysis

| Prior Assumption | Current State | Evidence |
|---|---|---|
| No durable workflow execution | Closed (`@effect/workflow` active) | `packages/knowledge/server/src/Workflow/ExtractionWorkflow.ts`, `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts`, `specs/completed/knowledge-effect-workflow-migration/outputs/P4_PARITY_VALIDATION.md` |
| Legacy runtime still present | Closed (legacy artifacts removed) | `specs/completed/knowledge-effect-workflow-migration/outputs/P5_LEGACY_REMOVAL_REPORT.md` |
| Workflow rows require engine adoption decision | Stale | Reconciled in `outputs/P6_PARITY_GAP_MATRIX.md` |

## Current Gap Set (Canonical)

Use `outputs/P6_PARITY_GAP_MATRIX.md` as source of truth.

| ID | Capability | Status | Priority | Classification |
|---|---|---|---|---|
| P6-01 | Durable workflow engine parity | FULL | P0 | Closed |
| P6-02 | Cluster workflow persistence parity | DIVERGENCE | P0 | Single-node durable SQL engine implemented; multi-runner sharding is still intentionally deferred |
| P6-03 | EventBus abstraction parity | FULL | P1 | Durable EventJournal + PersistedQueue implementation exists (memory + SQL layers) with tests |
| P6-04 | Storage abstraction parity | DIVERGENCE | P1 | Storage backends (memory/local/sqlite) + generation preconditions implemented; cloud signed URL support intentionally deferred |
| P6-05 | Ontology registry parity | FULL | P1 | Closed |
| P6-06 | Document classification preprocessing | FULL | P1 | Closed |
| P6-07 | Content enrichment agent | FULL | P2 | Closed |
| P6-08 | Reconciliation service | FULL | P2 | Closed |
| P6-09 | LLM resilience fallback chain | FULL | P1 | Retry + circuit feedback + provider fallback chains implemented for LanguageModel + EmbeddingModel with tests |
| P6-10 | Workflow composition bundles | PARTIAL | P2 | Open uplift target |
| P6-11 | Cross-batch resolver standalone service | FULL | P2 | Closed |
| P6-12 | Multi-modal/image ingestion | GAP | P3 | Deferred candidate |

## Priority Breakdown

| Priority | Open Rows | Notes |
|---|---|---|
| P0 | 1 (`P6-02`) | Divergence decision/documentation quality matters most |
| P1 | 1 (`P6-04`) | Remaining work is signed URL / cloud backend parity (intentionally deferred) |
| P2 | 1 (`P6-10`) | Bundle parity uplift track |
| P3 | 1 (`P6-12`) | Keep deferred unless product scope changes |

## Recommended Next Execution Order (Post-Phase 7)

1. Tighten divergence rationale and operational evidence for `P6-02` and `P6-04`.
2. Uplift bundle parity (`P6-10`) if call sites need more ergonomic composition.
3. Keep `P6-12` deferred unless product scope changes.

## Acceptance Criteria

- Every non-`FULL` row is either:
  - implemented to `FULL`, or
  - explicitly documented as intentional `DIVERGENCE` with tests and operational rationale.
- No stale references to deleted workflow artifacts remain in analysis documents.
- `P7_PARITY_CLOSURE_REPORT.md` includes matrix diffs and verification evidence.

## Verification Commands

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
