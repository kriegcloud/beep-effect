# Quick Start - Deprecated Code Cleanup

> 5-minute guide to executing this spec.

---

## TL;DR

1. Copy `handoffs/P1_ORCHESTRATOR_PROMPT.md` into a new Claude session
2. Let the agent produce `outputs/usage-analysis.md`
3. Continue with Phase 2 using the generated handoff prompts

---

## What This Spec Does

Removes all `@deprecated` JSDoc-tagged code from the repo:

- **11 deprecated items** across 4 packages
- **Migrates** usages to recommended alternatives
- **Deletes** deprecated code after migration
- **Verifies** no broken imports remain

---

## Phases

| Phase | Purpose | Output |
|-------|---------|--------|
| 1. Discovery | Find all usages | `outputs/usage-analysis.md` |
| 2. Migration | Update usages to alternatives | Modified source files |
| 3. Deletion | Remove deprecated code | Deleted files/exports |
| 4. Verification | Ensure nothing broke | Passing checks |

---

## Starting the Work

### Option A: Start from Phase 1

Open a new Claude session and paste:

```
I'm implementing the deprecated-code-cleanup spec.
Read: specs/deprecated-code-cleanup/handoffs/P1_ORCHESTRATOR_PROMPT.md
Execute the tasks described.
```

### Option B: Resume from a later phase

If `outputs/usage-analysis.md` exists:

```
I'm resuming the deprecated-code-cleanup spec at Phase 2.
Read: specs/deprecated-code-cleanup/README.md
Read: specs/deprecated-code-cleanup/outputs/usage-analysis.md
Execute migrations per the usage analysis.
```

---

## Verification Commands

```bash
# Final verification (run after all phases)
bun run check && bun run lint && bun run test

# Confirm no deprecated code remains
rg "@deprecated" --type ts
# Expected: 0 results (excluding node_modules)
```

---

## Key Files

| File | Purpose |
|------|---------|
| `README.md` | Full spec with inventory |
| `QUICK_START.md` | This file |
| `handoffs/P1_ORCHESTRATOR_PROMPT.md` | Start Phase 1 |
| `outputs/usage-analysis.md` | Phase 1 output |
| `REFLECTION_LOG.md` | Learnings per phase |
