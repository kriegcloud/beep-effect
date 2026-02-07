# Phase 7 Orchestrator Prompt

> **Full Context:** [HANDOFF_P7.md](./HANDOFF_P7.md)  
> **Parity Matrix (refresh first):** [P6_PARITY_GAP_MATRIX.md](../outputs/P6_PARITY_GAP_MATRIX.md)

Copy/paste this prompt to start Phase 7 execution.

---

## Prompt

You are implementing **Phase 7: Capability Parity Acceleration** for `knowledge-ontology-comparison`.

### Goal

Advance feature capability parity with `.repos/effect-ontology` after completed workflow migration by:
1. reconciling stale parity artifacts, and
2. closing remaining high-value P1/P2 gaps with concrete test evidence.

### Required Inputs

- `specs/pending/knowledge-ontology-comparison/outputs/P6_PARITY_GAP_MATRIX.md`
- `specs/pending/knowledge-ontology-comparison/outputs/COMPARISON_MATRIX.md`
- `specs/pending/knowledge-ontology-comparison/outputs/GAP_ANALYSIS.md`
- `specs/pending/knowledge-ontology-comparison/outputs/IMPLEMENTATION_ROADMAP.md`
- `specs/pending/knowledge-ontology-comparison/handoffs/HANDOFF_P7.md`
- `specs/completed/knowledge-effect-workflow-migration/outputs/P4_PARITY_VALIDATION.md`
- `specs/completed/knowledge-effect-workflow-migration/outputs/P5_LEGACY_REMOVAL_REPORT.md`

### Scope

- `packages/knowledge/server/src/Service/*`
- `packages/knowledge/server/src/Extraction/*`
- `packages/knowledge/server/src/LlmControl/*`
- `packages/knowledge/server/src/EntityResolution/*`
- `packages/knowledge/server/src/Runtime/*`
- `packages/knowledge/server/test/{Service,Extraction,Resilience,EntityResolution,GraphRAG,Workflow}/*`
- `specs/pending/knowledge-ontology-comparison/outputs/*`

### Operating Rules

1. Treat stale parity claims as stop-the-line issues; fix artifacts before implementation.
2. Do not regress completed workflow migration behavior.
3. Preserve external contracts for existing extraction and batch RPC surfaces.
4. No unsafe type assertions; keep schema-safe construction patterns.
5. Every parity closure must include code path + test evidence + matrix row update.

### Mandatory Implementation Targets

- `P7-00` Artifact reconciliation:
  - Refresh `COMPARISON_MATRIX.md`, `GAP_ANALYSIS.md`, `IMPLEMENTATION_ROADMAP.md`, `P6_PARITY_GAP_MATRIX.md`.
  - Remove stale “workflow durability gap” language now covered by completed migration.
- `P7-01` Document classifier parity (`P6-06`).
- `P7-02` Reconciliation service parity (`P6-08`) with reviewable outputs.
- `P7-03` Content enrichment parity (`P6-07`) via service/agent integration.
- `P7-04` LLM fallback chain parity (`P6-09` remainder).
- `P7-05` Cross-batch resolver parity uplift (`P6-11`) as dedicated service API.

### Required Outputs

Create/update:
- `specs/pending/knowledge-ontology-comparison/outputs/P7_PARITY_CLOSURE_REPORT.md`
- `specs/pending/knowledge-ontology-comparison/outputs/P6_PARITY_GAP_MATRIX.md`
- `specs/pending/knowledge-ontology-comparison/outputs/COMPARISON_MATRIX.md`
- `specs/pending/knowledge-ontology-comparison/outputs/GAP_ANALYSIS.md`
- `specs/pending/knowledge-ontology-comparison/outputs/IMPLEMENTATION_ROADMAP.md`
- `specs/pending/knowledge-ontology-comparison/REFLECTION_LOG.md`

### Verification

Run:

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

### Success Criteria

- [ ] parity artifacts are reconciled with post-migration reality
- [ ] remaining P1/P2 targets are either `FULL` or documented divergence with tests
- [ ] no runtime path reintroduces removed legacy workflow behavior
- [ ] all verification commands pass
- [ ] `P7_PARITY_CLOSURE_REPORT.md` includes matrix diffs + evidence links + verification results

