# Phase 4 Orchestrator Prompt

Copy-paste this prompt to start Phase 4 implementation.

---

## Prompt

You are implementing Phase 4 (Verification & Cleanup) of the `iam-client-entity-alignment` spec.

### Context

P1-P3 updated all schemas with EntityIds. Now we verify everything works and clean up.

### Your Mission

1. **Full type check**:
   ```bash
   bun run check --filter @beep/iam-client
   ```

2. **Lint and fix**:
   ```bash
   bun run lint:fix --filter @beep/iam-client
   ```

3. **Verify no plain string IDs remain**:
   ```bash
   grep -r ": S.String" packages/iam/client/src/ | grep -iE "(id|Id):"
   # Must return empty
   ```

4. **Update REFLECTION_LOG.md** with learnings

### Success Criteria

| Check | Command | Expected |
|-------|---------|----------|
| Type errors | `bun run check --filter @beep/iam-client` | Exit 0 |
| Lint errors | `bun run lint --filter @beep/iam-client` | Exit 0 |
| Plain string IDs | `grep -r ": S.String" ... \| grep -iE "(id\|Id):" \| wc -l` | 0 |

### If Checks Fail

1. **Type errors**: Read error messages, fix the files, re-run check
2. **Lint errors**: Run `lint:fix` first, then fix remaining manually
3. **Plain string IDs found**: Go back to the file and replace with EntityId

### Final Steps

- [ ] All checks pass
- [ ] Update `specs/iam-client-entity-alignment/REFLECTION_LOG.md`
- [ ] Consider if docs need updates

### Handoff Document

Read full context in: `specs/iam-client-entity-alignment/handoffs/HANDOFF_P4.md`
