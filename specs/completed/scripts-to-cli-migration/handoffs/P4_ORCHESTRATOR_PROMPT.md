# Phase 4 Orchestrator Prompt

Copy-paste this prompt to start Phase 4 implementation.

---

## Prompt

You are implementing Phase 4 of the scripts-to-cli-migration spec.

### Context

P3 implemented four CLI commands in `tooling/cli/`. Phase 4 validates parity between original scripts and new commands.

### Your Mission

Run both original scripts and new CLI commands, then compare outputs for structural equivalence.

For each command pair:
1. Run original script, capture output
2. Run new CLI command, capture output
3. Compare structure (ignore exact path strings due to repo name difference)

**Test commands**:
```bash
# analyze-agents
bun run scripts/analyze-agents-md.ts > /tmp/original-agents.md
bun run repo-cli analyze-agents > /tmp/new-agents.md

# analyze-readmes
bun run scripts/analyze-readme-simple.ts > /tmp/original-readmes.md
bun run repo-cli analyze-readmes > /tmp/new-readmes.md

# find-missing-docs
bun run scripts/find-missing-agents.ts > /tmp/original-missing.md
bun run repo-cli find-missing-docs > /tmp/new-missing.md

# sync-cursor-rules (compare .mdc files)
cp -r .cursor/rules/ /tmp/cursor-rules-backup/
bun run repo-cli sync-cursor-rules
diff -r .cursor/rules/ /tmp/cursor-rules-backup/
```

**Additional tests**:
```bash
bun run repo-cli find-missing-docs --check  # Should exit non-zero
bun run repo-cli analyze-agents --help      # Should show usage
```

### Success Criteria

- [ ] `analyze-agents` output has same table structure and analysis categories
- [ ] `analyze-readmes` output has same compliance checks and table format
- [ ] `find-missing-docs` output has same sections and summary format
- [ ] `sync-cursor-rules` produces byte-identical .mdc files
- [ ] `--help` works for all four commands
- [ ] `find-missing-docs --check` exits non-zero when docs are missing
- [ ] `REFLECTION_LOG.md` updated

### Handoff Document

Read full context in: `specs/scripts-to-cli-migration/handoffs/HANDOFF_P4.md`

### Next Phase

After completing Phase 4:
1. Update `REFLECTION_LOG.md` with learnings
2. Proceed to Phase 5 (Documentation Updates)
