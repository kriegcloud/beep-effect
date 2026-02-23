# HANDOFF P6: Final Verification + Completion

## Context Budget

Read first:
- `specs/completed/unified-ai-tooling/README.md`
- `specs/completed/unified-ai-tooling/handoffs/HANDOFF_P5.md`
- `specs/completed/unified-ai-tooling/outputs/p1-schema-and-contract.md`
- `specs/completed/unified-ai-tooling/outputs/p2-adapter-design.md`
- `specs/completed/unified-ai-tooling/outputs/p3-runtime-integration.md`
- `specs/completed/unified-ai-tooling/outputs/p4-cutover-playbook.md`
- `specs/completed/unified-ai-tooling/outputs/p5-runtime-implementation.md`
- `specs/completed/unified-ai-tooling/outputs/quality-gates-and-test-strategy.md`
- `specs/completed/unified-ai-tooling/outputs/residual-risk-closure.md`
- `specs/completed/unified-ai-tooling/outputs/poc-06-end-to-end-dry-run-results.md`

Budget guidance:
- This phase is proof and closure, not net-new architecture work.
- Produce execution evidence that the reopened gap is closed.

## Working Memory

### Phase Goal

Provide end-to-end operational evidence that `.beep` is the working source of truth for managed targets (including agent skill sync paths) and that cutover/rollback are safe.

### Deliverables

- `specs/completed/unified-ai-tooling/outputs/p6-final-verification.md`
- Updated `specs/completed/unified-ai-tooling/outputs/manifest.json` (P6 status)

### Success Criteria

1. Pre-cutover, cutover, and post-cutover checklists are executed with evidence.
2. Deterministic no-churn behavior is validated via repeated apply/check cycles.
3. Managed ownership boundaries are proven, including no unintended deletion of unmanaged files.
4. Skill synchronization from canonical `.beep/skills/*` to agent-consumed targets is verified end-to-end.
5. Rollback runbook is rehearsed and executable in one session.
6. Temporary local enforcement gates are verified and deferred CI/hook rollout is explicitly acknowledged.
7. P6 output includes `## Quality Gate Evidence` with required subsection schema and required signoff rows.

### Blocking Issues

- Any unresolved mismatch between documented managed targets and actual generated targets blocks completion.

### Key Constraints

- Preserve team velocity and minimize disruption.
- Keep rollback simple and fast.
- Do not declare completion while scaffold-only behavior remains anywhere in command path.
- Keep `revert` scoped to managed targets only.

### Implementation Order

1. Execute pre-cutover checklist against current branch state.
2. Run full command sequence to verify deterministic behavior and no churn.
3. Rehearse rollback (backup restore and `revert`) in one session.
4. Validate local enforcement gates and capture command output summary.
5. Compile unresolved risks and required follow-up items (if any).
6. Record final signoff matrix and update manifest.

## Verification Steps

```bash
# Deterministic behavior and no-churn checks
bun tooling/beep-sync/bin/beep-sync apply
bun tooling/beep-sync/bin/beep-sync check
bun tooling/beep-sync/bin/beep-sync apply
bun tooling/beep-sync/bin/beep-sync check
git diff --exit-code

# Rollback rehearsal
bun tooling/beep-sync/bin/beep-sync revert --dry-run

# Verify quality-gate structure
rg -n "^## Quality Gate Evidence" specs/completed/unified-ai-tooling/outputs/p6-final-verification.md
rg -n "^### (Test Suites Executed|Fixture Sets Used|TDD Evidence|Pass/Fail Summary|Unresolved Risks|Review Signoff)$" specs/completed/unified-ai-tooling/outputs/p6-final-verification.md
rg -n "^\\| Design/Architecture \\|" specs/completed/unified-ai-tooling/outputs/p6-final-verification.md
rg -n "^\\| Security/Secrets \\|" specs/completed/unified-ai-tooling/outputs/p6-final-verification.md
rg -n "^\\| Migration/Operations \\|" specs/completed/unified-ai-tooling/outputs/p6-final-verification.md
! rg -n "\\|[^|]*\\|[^|]*\\|[^|]*\\| rejected \\|" specs/completed/unified-ai-tooling/outputs/p6-final-verification.md
```

## Known Issues and Gotchas

- Local environment differences can hide determinism gaps; run checks in a clean branch state.
- If local enforcement gates are skipped, completion evidence is incomplete even if runtime commands pass.
- Any CI/hook assumptions must stay explicitly deferred until rollout phase lands.
