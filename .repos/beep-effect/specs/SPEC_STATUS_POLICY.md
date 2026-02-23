# Spec Status Policy

This policy defines where specs live and when to move them.

## Folder Meanings

- `specs/pending/<spec>/`
  - Default location for all new specs.
  - Includes planning, active implementation, and partially complete work.
- `specs/completed/<spec>/`
  - Work is fully complete.
  - Success criteria are satisfied.
  - Remaining checklist items are documentation-only or intentionally removed.
- `specs/archived/<spec>/`
  - Work is deferred/paused/cancelled.
  - Not complete, but intentionally not active.

## Status Transition Rules

1. Create new specs in `specs/pending/` only.
2. Move `pending -> completed` when the spec is actually finished.
3. Move `pending -> archived` when work is deferred or superseded.
4. If archived work resumes, move `archived -> pending`.

## Promotion Checklist (Pending -> Completed)

- `README.md` has an explicit complete status marker.
- Core success criteria and phase goals are done.
- Required verification is captured (commands/results or linked outputs).
- `REFLECTION_LOG.md` is updated with final learnings.
- Follow-up tasks that are still open are moved to a new pending spec.

## Commands

```bash
# Validate status hygiene for pending specs
bun run spec:status:check

# Move a spec between folders
bun run spec:move -- <spec-name> pending|completed|archived
```

## Pre-Commit Enforcement

`.husky/pre-commit` runs `bun run spec:status:check`.

If a pending spec declares `Status: Complete` or `Status: Archived`, commit will fail until the spec is moved to the correct folder.
