# Phase 4 Orchestrator Prompt

> **Full Context:** [HANDOFF_P4.md](./HANDOFF_P4.md)

Copy/paste this prompt to start Phase 4 execution.

---

## Prompt

You are implementing **Phase 4: Cutover + Parity Validation** for `knowledge-effect-workflow-migration`.

### Goal

Switch knowledge-server workflow runtime default mode to `engine`, preserve rollback safety to `legacy`, and produce explicit parity validation evidence.

### Required Inputs

- `specs/pending/knowledge-effect-workflow-migration/outputs/P1_COMPATIBILITY_REPORT.md`
- `specs/pending/knowledge-effect-workflow-migration/outputs/P1_FILE_INVENTORY.md`
- `specs/pending/knowledge-effect-workflow-migration/outputs/P1_RISK_REGISTER.md`
- `specs/pending/knowledge-effect-workflow-migration/outputs/P2_MIGRATION_BLUEPRINT.md`
- `specs/pending/knowledge-effect-workflow-migration/handoffs/HANDOFF_P4.md`

### Scope

- `packages/knowledge/server/src/Workflow/*`
- `packages/knowledge/server/src/Runtime/*`
- `packages/knowledge/server/test/Workflow/*`
- `packages/knowledge/server/test/Resilience/*`
- `specs/pending/knowledge-effect-workflow-migration/outputs/*`

### Operating Rules

1. Treat R1-R4 as stop-the-line cutover risks.
2. Flip default to `engine`, but preserve explicit rollback path (`engine -> legacy`).
3. Preserve `BatchOrchestrator.run` external contract and payloads.
4. Keep policy/event/status/progress behavior parity-critical unless an explicit divergence is approved and documented.
5. Do not delete legacy runtime files in P4 (deletion belongs to P5).
6. Generate next-phase handoff docs before marking P4 complete.

### Required Outputs

Create/update:
- code and tests under scope above for engine-default cutover + rollback validation
- `specs/pending/knowledge-effect-workflow-migration/outputs/P4_PARITY_VALIDATION.md`
- parity evidence updates under `specs/pending/knowledge-ontology-comparison/outputs/*` (if touched)
- `specs/pending/knowledge-effect-workflow-migration/handoffs/HANDOFF_P5.md`
- `specs/pending/knowledge-effect-workflow-migration/handoffs/P5_ORCHESTRATOR_PROMPT.md`

### Mandatory Implementation Targets

- runtime default switched to `engine`
- rollback toggle to `legacy` remains operational and tested
- policy parity across all supported failure policies
- retry ownership parity (single retry owner)
- persistence/status response contract parity
- batch/progress event ordering parity
- suspend/resume behavior parity for forced failure cases

### Verification

Run:

```bash
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-server
bun run lint --filter @beep/knowledge-server
bun test packages/knowledge/server/test/Workflow/
bun test packages/knowledge/server/test/Resilience/
```

### Success Criteria

- [ ] `engine` path is default and runnable
- [ ] rollback path (`engine -> legacy`) is operational and test-covered
- [ ] R1-R4 mitigations are validated with test evidence
- [ ] parity evidence is written to `P4_PARITY_VALIDATION.md`
- [ ] `HANDOFF_P5.md` and `P5_ORCHESTRATOR_PROMPT.md` are created
