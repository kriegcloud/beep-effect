# P5 ORCHESTRATOR PROMPT: Runtime Implementation + Skill Sync

## Context

Execute P5 for `specs/completed/unified-ai-tooling`.

Read in order:
1. `README.md`
2. `handoffs/HANDOFF_P5.md`
3. `outputs/p1-schema-and-contract.md`
4. `outputs/p2-adapter-design.md`
5. `outputs/p3-runtime-integration.md`
6. `outputs/p4-cutover-playbook.md`
7. `outputs/quality-gates-and-test-strategy.md`
8. `outputs/residual-risk-closure.md`
9. `outputs/poc-04-managed-ownership-revert-results.md`
10. `outputs/poc-05-secret-resolution-results.md`
11. `outputs/poc-06-end-to-end-dry-run-results.md`
12. `../../../../tooling/beep-sync/README.md`
13. `../../../../tooling/beep-sync/src/bin.ts`

## Your Mission

1. Replace scaffold behavior in `tooling/beep-sync` with production runtime behavior for v1 command surface.
2. Implement deterministic `validate`, `apply`, `check`, `doctor`, and managed-target-scoped `revert`.
3. Implement skill synchronization from `.beep/skills/*` to managed agent-consumed targets required by this repo.
4. Preserve POC-06 no-churn and deterministic command invariants in runtime behavior and tests.
5. Preserve required-secret fail-hard and redaction invariants from POC-05.
6. Implement orphan cleanup safeguards and backup/revert safety consistent with P4.
7. Add temporary local enforcement gates and document deferred CI/hook rollout.
8. Add `## Quality Gate Evidence` section using required subsection schema and signoff table.
9. Write `outputs/p5-runtime-implementation.md`.
10. Update `outputs/manifest.json` for P5.

## Critical Constraints

- Keep rollback one-session executable.
- `revert` is mandatory in v1 and scoped to managed targets only.
- Do not weaken any ADR or POC baseline invariant without explicit decision update.
- Preserve team velocity; avoid invasive migration side effects in this phase.

## Verification

- Runtime commands return real behavior (not scaffold placeholder output).
- Skill sync is deterministic and test-covered for managed targets.
- Managed ownership boundaries are explicit and enforced.
- Required secret behavior remains fail-hard with no secret-value exposure.
- Quality gate evidence includes all required subsections and required signoff rows.

## Success Criteria

- Runtime implementation is operational for v1 managed scope.
- `.beep` is functionally authoritative for implemented config and skill targets.
