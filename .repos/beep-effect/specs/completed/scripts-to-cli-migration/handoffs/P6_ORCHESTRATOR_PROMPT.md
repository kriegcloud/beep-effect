# Phase 6 Orchestrator Prompt

Copy-paste this prompt to start Phase 6 implementation.

---

## Prompt

You are implementing Phase 6 (final phase) of the scripts-to-cli-migration spec.

### Context

P1-P5 are complete. Four CLI commands are implemented, tested for parity, and documentation is updated. Phase 6 deletes the original scripts.

### Your Mission

Delete the four original scripts and verify CLI commands still work.

**This is a small task -- execute directly (no agent delegation needed).**

### Steps

1. Verify pre-deletion checklist:
```bash
bun run check --filter @beep/repo-cli
bun run repo-cli analyze-agents --help
bun run repo-cli analyze-readmes --help
bun run repo-cli find-missing-docs --help
bun run repo-cli sync-cursor-rules --help
```

2. Delete scripts:
```bash
rm scripts/analyze-agents-md.ts
rm scripts/analyze-readme-simple.ts
rm scripts/find-missing-agents.ts
rm scripts/sync-cursor-rules.ts
```

3. Verify post-deletion:
```bash
ls scripts/
# Should only contain install-gitleaks.sh

bun run repo-cli analyze-agents --help
bun run repo-cli analyze-readmes --help
bun run repo-cli find-missing-docs --help
bun run repo-cli sync-cursor-rules --help
```

### Success Criteria

- [ ] Pre-deletion checklist passes
- [ ] Four scripts deleted
- [ ] `scripts/` only contains `install-gitleaks.sh`
- [ ] All four CLI commands still work
- [ ] `REFLECTION_LOG.md` updated with final learnings
- [ ] Spec status updated to Complete

### Handoff Document

Read full context in: `specs/scripts-to-cli-migration/handoffs/HANDOFF_P6.md`

### Completion

This is the final phase. After completion:
1. Update `REFLECTION_LOG.md` with final learnings
2. Update spec README status to **Complete**
3. Update `specs/README.md` status entry
