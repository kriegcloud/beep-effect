# P6 ORCHESTRATOR PROMPT: Final Verification + Completion

## Context

Execute P6 for `specs/pending/unified-ai-tooling`.

Read in order:
1. `README.md`
2. `handoffs/HANDOFF_P6.md`
3. `outputs/p1-schema-and-contract.md`
4. `outputs/p2-adapter-design.md`
5. `outputs/p3-runtime-integration.md`
6. `outputs/p4-cutover-playbook.md`
7. `outputs/p5-runtime-implementation.md`
8. `outputs/quality-gates-and-test-strategy.md`
9. `outputs/residual-risk-closure.md`
10. `outputs/poc-06-end-to-end-dry-run-results.md`

## Your Mission

1. Execute final pre-cutover, cutover, and post-cutover validation checklists with evidence.
2. Prove deterministic no-churn behavior with repeated apply/check sequences.
3. Validate managed ownership boundaries and managed-target-only `revert` behavior.
4. Verify cross-agent skill synchronization from `.beep/skills/*` to required managed targets.
5. Rehearse rollback in one session and record command-level evidence.
6. Validate temporary local enforcement gates and explicitly acknowledge deferred CI/hook rollout.
7. Add `## Quality Gate Evidence` section using required subsection schema and signoff table.
8. Write `outputs/p6-final-verification.md`.
9. Update `outputs/manifest.json` for P6 and overall completion state.

## Critical Constraints

- Keep rollback path simple, fast, and reproducible.
- Do not mark complete while unresolved high-risk gaps remain.
- Preserve POC-06 deterministic and no-churn invariants.
- `revert` remains mandatory and scoped to managed targets only.

## Verification

- Checklists exist and are completed with clear outcomes.
- Repeated apply/check runs produce zero unexpected churn.
- Rollback rehearsal is executable in one session.
- Skill sync and ownership boundaries are explicitly proven.
- Quality gate evidence includes all required subsections and required signoff rows.

## Success Criteria

- Reopened gaps are closed with reproducible evidence.
- Spec package is ready for true completion handoff.
