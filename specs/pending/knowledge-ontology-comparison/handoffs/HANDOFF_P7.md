# Phase 7 Handoff: Capability Parity Acceleration

**Date**: 2026-02-07  
**From**: Phase 6 parity closure + completed `knowledge-effect-workflow-migration` (Phase 5 legacy removal)  
**To**: Phase 7 (`knowledge-ontology-comparison`)  
**Status**: Ready for implementation

---

## Mission

Close the highest-value remaining capability gaps versus `.repos/effect-ontology` after workflow migration completion, while first reconciling stale parity documents so implementation and evidence stay consistent.

Primary objective for Phase 7:
- move remaining P1/P2 parity items to `FULL`, or
- document explicit intentional divergence with tests and operational rationale.

---

## Current Baseline

### Completed and should be treated as closed

- Workflow migration to `@effect/workflow` is complete in:
  - `specs/completed/knowledge-effect-workflow-migration/outputs/P4_PARITY_VALIDATION.md`
  - `specs/completed/knowledge-effect-workflow-migration/outputs/P5_LEGACY_REMOVAL_REPORT.md`
- Legacy workflow runtime artifacts were removed and engine-default behavior validated.
- P6 infrastructure and resilience work exists in knowledge server code:
  - `packages/knowledge/server/src/Service/{EventBus,Storage,OntologyRegistry}.ts`
  - `packages/knowledge/server/src/LlmControl/LlmResilience.ts`

### Known inconsistency to resolve first

Some `knowledge-ontology-comparison` outputs still reflect older assumptions (for example, treating workflow durability as unresolved). Phase 7 must reconcile these artifacts before further implementation work.

---

## Phase 7 Priority Targets

### Track 0: Baseline Reconciliation (mandatory first)

1. Update parity artifacts to match post-migration reality:
   - `outputs/COMPARISON_MATRIX.md`
   - `outputs/GAP_ANALYSIS.md`
   - `outputs/IMPLEMENTATION_ROADMAP.md`
   - `outputs/P6_PARITY_GAP_MATRIX.md`
2. Ensure each updated row contains concrete evidence paths (code + tests).

### Track A: Ingestion Quality Parity

1. Document classifier parity (`P6-06`): add classification preprocessing service + extraction integration.
2. Content enrichment parity (`P6-07`): add enrichment agent/service path (config-guarded if needed).
3. Reconciliation parity (`P6-08`): add reconciliation service with reviewable outputs/queue semantics.

### Track B: Reliability/Control-Plane Parity

1. LLM fallback chain parity (`P6-09` remaining gap): add provider fallback sequence in resilience wrapper.
2. Cross-batch resolver parity (`P6-11`): promote existing partial flows to dedicated standalone service with explicit API and tests.
3. Workflow bundles parity (`P6-10`): expand service bundle composition where needed to support new services cleanly.

---

## Constraints

1. Do not regress workflow behavior validated in completed migration spec.
2. Keep Effect patterns and strict typing; no unsafe casts or assertion chains.
3. Maintain additive rollout where possible; if behavior changes, document migration/rollback.
4. Every claimed parity closure must include executable test evidence.

---

## Verification Checklist

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

---

## Success Criteria

- [ ] Phase 7 starts from reconciled parity artifacts (no stale workflow-gap claims).
- [ ] Document classifier, enrichment, and reconciliation capabilities are implemented or explicitly diverged with tests.
- [ ] LLM fallback chain and cross-batch resolver parity items are closed with evidence.
- [ ] Updated matrix/roadmap accurately reflect post-Phase 7 status.
- [ ] Typecheck, lint, and targeted test suites pass.
- [ ] `REFLECTION_LOG.md` updated with decisions, tradeoffs, and deferred items.

---

## Required Handoff Outputs

Create/update:
- `specs/pending/knowledge-ontology-comparison/outputs/P7_PARITY_CLOSURE_REPORT.md`
- `specs/pending/knowledge-ontology-comparison/outputs/P6_PARITY_GAP_MATRIX.md` (status refresh)
- `specs/pending/knowledge-ontology-comparison/REFLECTION_LOG.md`

