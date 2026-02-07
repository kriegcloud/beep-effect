# Phase 5 Orchestrator Prompt

> **Full Context:** [HANDOFF_P5.md](./HANDOFF_P5.md)

Copy/paste this prompt to start Phase 5 execution.

---

## Prompt

You are implementing **Phase 5: Legacy Removal** for `knowledge-effect-workflow-migration`.

### Goal

Remove legacy knowledge workflow runtime artifacts that are no longer needed after P4 cutover, while preserving engine-default behavior and verified parity.

### Required Inputs

- `specs/pending/knowledge-effect-workflow-migration/outputs/P1_COMPATIBILITY_REPORT.md`
- `specs/pending/knowledge-effect-workflow-migration/outputs/P1_FILE_INVENTORY.md`
- `specs/pending/knowledge-effect-workflow-migration/outputs/P1_RISK_REGISTER.md`
- `specs/pending/knowledge-effect-workflow-migration/outputs/P2_MIGRATION_BLUEPRINT.md`
- `specs/pending/knowledge-effect-workflow-migration/outputs/P4_PARITY_VALIDATION.md`
- `specs/pending/knowledge-effect-workflow-migration/handoffs/HANDOFF_P5.md`

### Scope

- `packages/knowledge/server/src/Workflow/*`
- `packages/knowledge/server/src/Runtime/*` (if cleanup needed)
- `packages/knowledge/server/test/Workflow/*`
- `packages/knowledge/server/test/Resilience/*`
- `specs/pending/knowledge-effect-workflow-migration/outputs/*`

### Operating Rules

1. Treat R1-R4 as stop-the-line regression risks.
2. Keep `engine` as the default runtime mode.
3. Preserve `BatchOrchestrator.run` external contract and payloads.
4. Do not remove parity coverage; rewrite tests if internals are removed.
5. Delete legacy files only when P2 preconditions are satisfied and evidenced.
6. Document every removed file/symbol and replacement path.

### Required Outputs

Create/update:
- legacy-removal code and tests under scope above
- `specs/pending/knowledge-effect-workflow-migration/outputs/P5_LEGACY_REMOVAL_REPORT.md`

### Mandatory Implementation Targets

- remove obsolete actor-machine runtime paths
- remove dead exports and references to deleted legacy files
- maintain policy/status/event/retry parity established in P4
- keep rollback strategy aligned with post-P5 design decision (documented)

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

- [ ] legacy runtime files are removed only when safe
- [ ] no runtime code path depends on removed legacy components
- [ ] engine-default behavior remains parity-validated
- [ ] `P5_LEGACY_REMOVAL_REPORT.md` contains concrete evidence (diff + verification results)
