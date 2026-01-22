# Phase 4 Orchestrator Prompt

Copy-paste this prompt to start Phase 4 implementation.

---

## Pre-requisites

**Verify all prior phases complete**:
```bash
bun run build --filter @beep/web
bun run build --filter @beep/todox
bun run repo-cli tsconfig-sync --check
bun run test --filter @beep/repo-cli
```

All must pass before starting P4.

---

## Prompt

You are implementing Phase 4 of the `tsconfig-sync-completion` spec: **Documentation & Cleanup**.

### Your Mission

1. Update `tooling/cli/AGENTS.md` with `tsconfig-sync` command documentation
2. Update `CLAUDE.md` Commands Reference table
3. Remove TODO comment from `handler.ts` (line 535-536)
4. Create `VERIFICATION_REPORT_FINAL.md` documenting completion
5. Archive parent spec `specs/tsconfig-sync-command/README.md`

### Reference Files

- `specs/tsconfig-sync-completion/handoffs/HANDOFF_P4.md` - Full task details

### Verification

```bash
# Ensure nothing broke
bun run lint --filter @beep/repo-cli
bun run test --filter @beep/repo-cli
bun run repo-cli tsconfig-sync --check
```

### Success Criteria

- [ ] `tooling/cli/AGENTS.md` has tsconfig-sync documentation
- [ ] `CLAUDE.md` Commands Reference includes tsconfig-sync
- [ ] No TODO comments remain in handler.ts
- [ ] `VERIFICATION_REPORT_FINAL.md` created
- [ ] Parent spec marked as archived
- [ ] All tests pass

### Handoff Document

Read full task details in: `specs/tsconfig-sync-completion/handoffs/HANDOFF_P4.md`
