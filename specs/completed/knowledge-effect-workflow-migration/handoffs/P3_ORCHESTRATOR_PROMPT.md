# Phase 3 Orchestrator Prompt

> **Full Context:** [HANDOFF_P3.md](./HANDOFF_P3.md)

Copy/paste this prompt to start Phase 3 execution.

---

## Prompt

You are implementing **Phase 3: Runtime + Persistence Implementation** for `knowledge-effect-workflow-migration`.

### Goal

Implement additive `@effect/workflow` integration in knowledge-server with mode-gated execution (`legacy`, `shadow`, `engine`) while preserving current shipped behavior and enabling safe P4 cutover.

### Required Inputs

- `specs/pending/knowledge-effect-workflow-migration/outputs/P1_COMPATIBILITY_REPORT.md`
- `specs/pending/knowledge-effect-workflow-migration/outputs/P1_FILE_INVENTORY.md`
- `specs/pending/knowledge-effect-workflow-migration/outputs/P1_RISK_REGISTER.md`
- `specs/pending/knowledge-effect-workflow-migration/outputs/P2_MIGRATION_BLUEPRINT.md`

### Scope

- `packages/knowledge/server/src/Workflow/*`
- `packages/knowledge/server/src/Runtime/*`
- `packages/knowledge/server/test/Workflow/*`

### Operating Rules

1. Treat R1-R4 as stop-the-line risks.
2. Keep P3 additive: do not delete legacy runtime files.
3. Preserve `BatchOrchestrator.run` external contract and payloads.
4. Implement explicit rollback path (`engine/shadow -> legacy`) and verify it.
5. Keep policy/event/status behavior parity-critical per P2 blueprint.
6. Generate next-phase handoff docs before marking P3 complete.

### Required Outputs

Create/update:
- source and test changes under the scope above
- `specs/pending/knowledge-effect-workflow-migration/handoffs/HANDOFF_P4.md`
- `specs/pending/knowledge-effect-workflow-migration/handoffs/P4_ORCHESTRATOR_PROMPT.md`

### Mandatory Implementation Targets

- mode-gated orchestrator flow in `BatchOrchestrator`
- engine workflow/activity path in extraction + batch orchestration
- retry ownership boundary (no duplicate retry loops)
- compatibility persistence adapter preserving existing response contracts
- regression tests covering policy parity, retries, status, and progress/event ordering

### Verification

Run:

```bash
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-server
bun run lint --filter @beep/knowledge-server
bun test packages/knowledge/server/test/Workflow/
```

### Success Criteria

- [ ] engine path implemented and runnable in non-default mode
- [ ] legacy default path unchanged
- [ ] rollback path operational and tested
- [ ] R1-R4 mitigations implemented with test evidence
- [ ] `HANDOFF_P4.md` and `P4_ORCHESTRATOR_PROMPT.md` created
