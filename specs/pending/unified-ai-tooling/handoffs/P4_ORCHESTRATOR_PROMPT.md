# P4 ORCHESTRATOR PROMPT: Migration and Cutover

## Context

Execute P4 for `specs/pending/unified-ai-tooling`.

Read in order:
1. `README.md`
2. `handoffs/HANDOFF_P4.md`
3. `outputs/p1-schema-and-contract.md`
4. `outputs/p2-adapter-design.md`
5. `outputs/p3-runtime-integration.md`
6. `outputs/comprehensive-review.md`
7. `outputs/subtree-synthesis.md`
8. `outputs/quality-gates-and-test-strategy.md`

## Your Mission

1. Define migration plan from current config sprawl to `.beep`-managed generation.
2. Define `.codex/` and `.mcp.json` unignore/commit transition steps.
3. Define AGENTS freshness rollout and rollback playbooks.
4. Define orphan-cleanup rollout safeguards and dry-run checkpoints.
5. Define backup/revert operational runbook for cutover and rollback.
6. Add `## Quality Gate Evidence` section using the required subsection schema and signoff table.
7. Write `outputs/p4-cutover-playbook.md`.
8. Update `outputs/manifest.json` for P4.

## Critical Constraints

- Preserve team velocity during migration.
- Keep rollback path simple and fast.
- Explicitly acknowledge deferred CI/hook rollout.
- `revert` is mandatory in v1 and scoped to managed targets only.

## Verification

- Checklist exists for pre-cutover, cutover, post-cutover.
- Rollback steps are executable in one session.
- Managed ownership boundaries are explicit.
- Cleanup and backup checkpoints are explicit.
- Quality gate evidence includes all required subsections and required signoff rows.

## Success Criteria

- Migration playbook is implementation-ready.
