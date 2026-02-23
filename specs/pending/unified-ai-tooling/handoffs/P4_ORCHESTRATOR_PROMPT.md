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

## Your Mission

1. Define migration plan from current config sprawl to `.beep`-managed generation.
2. Define `.codex/` and `.mcp.json` unignore/commit transition steps.
3. Define AGENTS freshness rollout and rollback playbooks.
4. Write `outputs/p4-cutover-playbook.md`.
5. Update `outputs/manifest.json` for P4.

## Critical Constraints

- Preserve team velocity during migration.
- Keep rollback path simple and fast.
- Explicitly acknowledge deferred CI/hook rollout.

## Verification

- Checklist exists for pre-cutover, cutover, post-cutover.
- Rollback steps are executable in one session.
- Managed ownership boundaries are explicit.

## Success Criteria

- Migration playbook is implementation-ready.
