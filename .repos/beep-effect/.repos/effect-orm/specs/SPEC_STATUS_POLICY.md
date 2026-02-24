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

## Moving Specs

To move a spec between status folders, relocate its directory and update `specs/README.md`:

```bash
# Move from pending to completed
mv specs/pending/<spec-name> specs/completed/<spec-name>

# Move from pending to archived
mv specs/pending/<spec-name> specs/archived/<spec-name>
```

After moving, update the tables in `specs/README.md` to reflect the new location.
