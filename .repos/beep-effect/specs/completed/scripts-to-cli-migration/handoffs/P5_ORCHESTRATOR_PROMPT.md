# Phase 5 Orchestrator Prompt

Copy-paste this prompt to start Phase 5 implementation.

---

## Prompt

You are implementing Phase 5 of the scripts-to-cli-migration spec.

### Context

P1-P4 are complete. Four CLI commands are implemented and tested. Phase 5 updates documentation references.

### Your Mission

Update operational docs to reference new CLI commands. Delegate to `doc-writer` agent.

**Tier 1 updates (MUST)**:
- `CLAUDE.md:88` -- Change Cursor IDE sync from `bun run scripts/sync-cursor-rules.ts` to `bun run repo-cli sync-cursor-rules`
- `.claude/standards/documentation.md:122` -- Change `find-missing-agents.ts` to `bun run repo-cli find-missing-docs`
- `.claude/standards/documentation.md:125` -- Change `analyze-agents-md.ts` to `bun run repo-cli analyze-agents`

**Tier 2 updates (SHOULD)**:
- `specs/_guide/PATTERN_REGISTRY.md:798` -- Update example

**Tier 3 (LEAVE as historical)**:
- All references in `specs/agent-config-optimization/`, `specs/agent-infrastructure-rationalization/`, `specs/artifact-file-cleanup/`

### Verification

After updates:
```bash
# Verify no operational docs still reference old scripts
grep -r "scripts/sync-cursor-rules\|scripts/analyze-agents\|scripts/find-missing\|scripts/analyze-readme" CLAUDE.md .claude/standards/
# Should return 0 results
```

### Success Criteria

- [ ] `CLAUDE.md` updated
- [ ] `.claude/standards/documentation.md` updated
- [ ] `specs/_guide/PATTERN_REGISTRY.md` updated
- [ ] No operational docs reference `scripts/<name>.ts`
- [ ] `REFLECTION_LOG.md` updated

### Handoff Document

Read full context in: `specs/scripts-to-cli-migration/handoffs/HANDOFF_P5.md`

### Next Phase

After completing Phase 5:
1. Update `REFLECTION_LOG.md` with learnings
2. Proceed to Phase 6 (Cleanup)
