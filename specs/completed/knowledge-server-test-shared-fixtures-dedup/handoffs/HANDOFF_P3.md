# HANDOFF_P3: Knowledge Server Test Shared Fixtures Dedup

## Phase Context

This handoff starts **Phase 3 (Implementation + Migration)** for deduplicating shared test mocks/layers in `@beep/knowledge-server` tests.

## Current Status

| Item | Status |
|---|---|
| Spec scaffold | Complete |
| Phase 1 duplication inventory | Complete |
| Phase 2 design + migration plan | Complete |
| Shared helper implementation | Not started |
| Test-file migration | Not started |

## Inputs to Read First

- `specs/completed/knowledge-server-test-shared-fixtures-dedup/README.md`
- `specs/completed/knowledge-server-test-shared-fixtures-dedup/MASTER_ORCHESTRATION.md`
- `specs/completed/knowledge-server-test-shared-fixtures-dedup/outputs/codebase-context.md`
- `specs/completed/knowledge-server-test-shared-fixtures-dedup/outputs/evaluation.md`
- `specs/completed/knowledge-server-test-shared-fixtures-dedup/outputs/remediation-plan.md`

## Objective for This Phase

Implement the approved shared-module design and migrate test call sites in risk-ordered batches while preserving test semantics.

## Required Outputs

1. Code changes under `packages/knowledge/server/test/**`:
- create/update `_shared` modules planned in Phase 2
- migrate call sites batch-by-batch
- remove dead local helper duplication where replaced

2. Update:
- `specs/completed/knowledge-server-test-shared-fixtures-dedup/REFLECTION_LOG.md` with a Phase 3 entry

3. Optional (if Phase 3 cannot finish in one session):
- `specs/completed/knowledge-server-test-shared-fixtures-dedup/handoffs/HANDOFF_P4.md`
- `specs/completed/knowledge-server-test-shared-fixtures-dedup/handoffs/P4_ORCHESTRATOR_PROMPT.md`

## Implementation Rules

- Follow batch order from `outputs/remediation-plan.md` (low -> high risk).
- Keep helpers focused; do not collapse into a mega utility module.
- Preserve intentional non-dedup exceptions unless a new explicit justification is written.
- No production runtime behavior changes; scope is test code and test-shared modules.
- Respect repo guardrails: no `any`, no unchecked casts, Effect-style layer/service composition.

## Verification Requirements

At minimum per migrated batch:
1. Run targeted tests for touched files.
2. Run `bun run check`.
3. Run `bun run lint` (or `bun run lint:fix` then `bun run lint`).

At end of Phase 3:
- Run a broader knowledge-server test sweep (or full `bun run test` if package scoping is unavailable) and record what was run.

## Completion Checklist

- [ ] `_shared` modules implemented according to `outputs/evaluation.md`
- [ ] Migration batches executed in the planned order (or documented deviation)
- [ ] Medium/high-risk batch rollback guidance applied if regressions occurred
- [ ] Intentional non-dedup exceptions preserved
- [ ] Touched tests pass and no semantic drift observed
- [ ] `REFLECTION_LOG.md` updated with Phase 3 learnings

## Next Handoff Artifacts

When Phase 3 ends, generate both (for stabilization phase):

- `handoffs/HANDOFF_P4.md`
- `handoffs/P4_ORCHESTRATOR_PROMPT.md`
