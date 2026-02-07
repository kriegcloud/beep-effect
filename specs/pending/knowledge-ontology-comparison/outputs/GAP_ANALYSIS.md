# Gap Analysis (Reconciled)

**Spec**: `knowledge-ontology-comparison`  
**Date**: 2026-02-07  
**Baseline**: Post-Phase 6 + completed `knowledge-effect-workflow-migration` (P5 legacy removal)

## Executive Summary

This gap analysis replaces stale assumptions that workflow durability and workflow runtime migration were still open. Those items are now closed at migration-spec level and reflected in the reconciled parity matrix.

Current remaining parity work is concentrated in:
- ingestion quality features (classifier, enrichment, reconciliation),
- LLM fallback-chain completion,
- service composition/resolver uplift,
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
| P6-02 | Cluster workflow persistence parity | DIVERGENCE | P0 | Intentional divergence candidate |
| P6-03 | EventBus abstraction parity | DIVERGENCE | P1 | Intentional divergence candidate |
| P6-04 | Storage abstraction parity | DIVERGENCE | P1 | Intentional divergence candidate |
| P6-05 | Ontology registry parity | FULL | P1 | Closed |
| P6-06 | Document classification preprocessing | GAP | P1 | Open implementation target |
| P6-07 | Content enrichment agent | GAP | P2 | Open implementation target |
| P6-08 | Reconciliation service | GAP | P2 | Open implementation target |
| P6-09 | LLM resilience fallback chain | DIVERGENCE | P1 | Open parity remainder |
| P6-10 | Workflow composition bundles | PARTIAL | P2 | Open uplift target |
| P6-11 | Cross-batch resolver standalone service | PARTIAL | P2 | Open uplift target |
| P6-12 | Multi-modal/image ingestion | GAP | P3 | Deferred candidate |

## Priority Breakdown

| Priority | Open Rows | Notes |
|---|---|---|
| P0 | 1 (`P6-02`) | Divergence decision/documentation quality matters most |
| P1 | 4 (`P6-03`, `P6-04`, `P6-06`, `P6-09`) | Highest next implementation value is `P6-06` + `P6-09` |
| P2 | 4 (`P6-07`, `P6-08`, `P6-10`, `P6-11`) | Feature parity uplift track |
| P3 | 1 (`P6-12`) | Keep deferred unless product scope changes |

## Recommended Phase 7 Execution Order

1. Track 0 artifact reconciliation (already started): keep all outputs aligned to the canonical matrix.
2. P1 closure:
   - `P6-06` document classifier
   - `P6-09` fallback provider chain
3. P2 uplift:
   - `P6-07` enrichment
   - `P6-08` reconciliation
   - `P6-10` bundle parity
   - `P6-11` cross-batch resolver service API
4. Confirm or tighten divergence rationale for `P6-02`, `P6-03`, `P6-04`.

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
