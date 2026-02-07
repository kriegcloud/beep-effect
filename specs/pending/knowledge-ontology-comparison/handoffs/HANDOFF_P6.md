# Phase 6 Handoff: Parity Closure

**Date**: 2026-02-07  
**From**: Phase 5 complete (Infrastructure Polish)  
**To**: Phase 6 (Parity Closure with `.repos/effect-ontology`)  
**Status**: Ready for implementation

---

## Mission

Close remaining high-value parity gaps against `.repos/effect-ontology` after Phase 5 completion.

Primary objective: bring all **P0/P1 parity gaps** to either:
- implemented parity (`FULL`), or
- explicit intentional divergence with tests + operational rationale.

Reference parity matrix:  
`specs/pending/knowledge-ontology-comparison/outputs/P6_PARITY_GAP_MATRIX.md`

---

## Current Baseline

Phase 5 completed and validated:
- Named graphs + GRAPH clause support
- PROV-O constants + provenance emission
- Token budget integration
- Runtime service bundles (baseline)
- NL-to-SPARQL read-only generation path

Current code evidence lives in:
- `packages/knowledge/server/src/Rdf/*`
- `packages/knowledge/server/src/Sparql/*`
- `packages/knowledge/server/src/LlmControl/*`
- `packages/knowledge/server/src/Runtime/ServiceBundles.ts`

---

## Phase 6 Priority Gaps

### P0
1. Workflow engine parity (`@effect/workflow` level behavior)
2. Cluster workflow persistence parity (`SqlMessageStorage`/runner-level equivalence or explicit divergence)

### P1
1. EventBus abstraction
2. Storage abstraction (local/memory/remote + safe writes)
3. Ontology registry / multi-ontology resolution
4. LLM resilience parity (circuit breaker + retry/fallback strategy)

---

## Suggested Tracks

### Track A: Workflow Reliability
- Scope: P6-01, P6-02
- Files likely touched:
  - `packages/knowledge/server/src/Workflow/*`
  - `packages/knowledge/tables/src/tables/workflow-*.table.ts`
  - `packages/knowledge/server/src/Runtime/*`

### Track B: Platform Services
- Scope: P6-03, P6-04, P6-05
- Files likely touched:
  - `packages/knowledge/server/src/Service`-equivalent directories (new)
  - `packages/knowledge/server/src/Ontology/*`
  - `packages/knowledge/server/src/index.ts`

### Track C: LLM Resilience
- Scope: P6-09
- Files likely touched:
  - `packages/knowledge/server/src/LlmControl/*`
  - `packages/knowledge/server/src/Runtime/*`
  - LLM-consuming services in Extraction + GraphRAG

---

## Constraints

1. Preserve existing Phase 5 behavior (no regressions in named graphs/provenance/NL-to-SPARQL).
2. Any divergence from effect-ontology must be documented in parity matrix with concrete reason.
3. Additive changes preferred; avoid disruptive rewrites unless required for P0.
4. Keep Effect patterns (tagged errors, namespace imports, Layer composition).

---

## Verification Checklist

Run after each major sub-task:

```bash
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-server
bun run lint --filter @beep/knowledge-server
bun test packages/knowledge/server/test/Rdf/
bun test packages/knowledge/server/test/Sparql/
bun test packages/knowledge/server/test/Resilience/
```

Workflow-focused verification additions:

```bash
bun test packages/knowledge/server/test/Workflow/
```

---

## Success Criteria

- [ ] All P0 parity rows addressed (`FULL` or intentional divergence with rationale)
- [ ] All P1 parity rows addressed (`FULL` or intentional divergence with rationale)
- [ ] Parity matrix updated with post-implementation statuses
- [ ] Typecheck + lint pass for knowledge packages
- [ ] Relevant workflow/resilience tests pass
- [ ] `REFLECTION_LOG.md` includes Phase 6 learnings and decisions

---

## Handoff Notes

If context size grows, checkpoint at:
1. End of Track A (workflow reliability)
2. End of Track B (platform services)
3. End of Track C (LLM resilience)

Each checkpoint should include:
- files changed
- parity rows closed
- outstanding blockers
- exact verification command outputs
