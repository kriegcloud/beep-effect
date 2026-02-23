# Phase 6 Orchestrator Prompt

> **Full Context:** [HANDOFF_P6.md](./HANDOFF_P6.md)  
> **Parity Matrix:** [P6_PARITY_GAP_MATRIX.md](../outputs/P6_PARITY_GAP_MATRIX.md)

Copy/paste this prompt to start Phase 6 execution.

---

## Prompt

You are implementing **Phase 6: Parity Closure** for `knowledge-ontology-comparison`.

### Goal

Close all remaining **P0/P1 parity gaps** between:
- reference: `.repos/effect-ontology/packages/@core-v2/src`
- target: `packages/knowledge/*`

Use this matrix as the source of truth:
`specs/pending/knowledge-ontology-comparison/outputs/P6_PARITY_GAP_MATRIX.md`

### Operating Rules

1. Delegate implementation tasks to workers; orchestrator coordinates and verifies.
2. Keep Phase 5 capabilities intact (named graphs, provenance, token budget, bundles, NL->SPARQL).
3. If a parity item is intentionally not implemented, document explicit divergence rationale and tests.
4. Prefer additive changes and strong test coverage.

### Execution Plan

#### Track A (P0): Workflow reliability parity
- P6-01: workflow engine parity decision + implementation path
- P6-02: workflow persistence parity

#### Track B (P1): Platform services parity
- P6-03: EventBus abstraction
- P6-04: Storage abstraction
- P6-05: Ontology registry support

#### Track C (P1): LLM resilience parity
- P6-09: circuit breaker + retry/fallback strategy

### Required Verification

Run after each major milestone:

```bash
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-server
bun run lint --filter @beep/knowledge-server
bun test packages/knowledge/server/test/Workflow/
bun test packages/knowledge/server/test/Resilience/
```

### Completion Criteria

- [ ] P0/P1 rows in parity matrix resolved
- [ ] matrix status updated with evidence file paths
- [ ] typecheck/lint pass
- [ ] relevant tests pass
- [ ] `REFLECTION_LOG.md` updated with Phase 6 decisions
