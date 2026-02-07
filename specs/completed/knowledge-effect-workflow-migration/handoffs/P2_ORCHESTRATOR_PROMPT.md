# Phase 2 Orchestrator Prompt

> **Full Context:** [HANDOFF_P2.md](./HANDOFF_P2.md)

Copy/paste this prompt to start Phase 2 execution.

---

## Prompt

You are implementing **Phase 2: Migration Blueprint** for `knowledge-effect-workflow-migration`.

### Goal

Translate P1 discovery results into an implementation-ready migration design for adopting `@effect/workflow` in knowledge-server while preserving shipped behavior.

### Required Inputs

- `specs/pending/knowledge-effect-workflow-migration/outputs/P1_COMPATIBILITY_REPORT.md`
- `specs/pending/knowledge-effect-workflow-migration/outputs/P1_FILE_INVENTORY.md`
- `specs/pending/knowledge-effect-workflow-migration/outputs/P1_RISK_REGISTER.md`

### Scope

- `packages/knowledge/server/src/Workflow/*`
- `packages/knowledge/server/src/Runtime/*`
- `packages/knowledge/server/test/Workflow/*`

### Operating Rules

1. Treat R1-R4 risks as gating design constraints.
2. Use file-level implementation mapping (not abstract architecture only).
3. Make rollback/cutover paths explicit.
4. Preserve parity-critical behavior identified in P1.
5. Generate next-phase handoff docs before marking P2 complete.

### Required Outputs

Create:
- `specs/pending/knowledge-effect-workflow-migration/outputs/P2_MIGRATION_BLUEPRINT.md`
- `specs/pending/knowledge-effect-workflow-migration/handoffs/HANDOFF_P3.md`
- `specs/pending/knowledge-effect-workflow-migration/handoffs/P3_ORCHESTRATOR_PROMPT.md`

### Mandatory Sections In P2 Blueprint

- target architecture (runtime, orchestration, persistence, event/progress compatibility)
- phased file-by-file implementation plan (P3, P4, P5)
- rollback and cutover strategy
- risk mitigation matrix (R1-R9)
- acceptance gates and regression test requirements
- deletion preconditions for each legacy candidate

### Verification

Run:

```bash
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-server
bun run lint --filter @beep/knowledge-server
bun test packages/knowledge/server/test/Workflow/
```

### Success Criteria

- [ ] P2 blueprint is concrete enough to execute without major reinterpretation
- [ ] all P1 high-priority risks have explicit mitigations and verification gates
- [ ] rollback and cutover sequencing is unambiguous
- [ ] `HANDOFF_P3.md` and `P3_ORCHESTRATOR_PROMPT.md` created
