# Phase 2 Orchestrator Prompt

Copy-paste this prompt to start Phase 2 implementation.

---

## Prompt

You are implementing Phase 2 of the scripts-to-cli-migration spec.

### Context

Phase 0 created seed research at `outputs/cli-pattern-research.md` with directory structure and patterns. This needs verification against current source and expansion with exact references.

### Your Mission

Research and document CLI command patterns in `tooling/cli/` to establish the implementation blueprint.

Delegate to `codebase-researcher` agent:
1. Read `tooling/cli/src/index.ts` -- how commands are registered, runtime layers
2. Read single-file examples: `tooling/cli/src/commands/topo-sort.ts` or `agents-validate.ts`
3. Read multi-file example: `tooling/cli/src/commands/tsconfig-sync/` (all files)
4. Read `tooling/cli/src/commands/errors.ts` -- shared error pattern
5. Read `tooling/utils/src/FsUtils.ts` and `tooling/utils/src/RepoUtils.ts` -- available utilities
6. Document the `$RepoCliId` identity composer pattern
7. Document Layer composition chain

### Reference Files

- Seed research: `specs/scripts-to-cli-migration/outputs/cli-pattern-research.md`
- CLI entry: `tooling/cli/src/index.ts`
- Multi-file example: `tooling/cli/src/commands/tsconfig-sync/`

### Verification

Confirm the documented patterns match actual source:
```bash
# Verify CLI package exists and builds
bun run check --filter @beep/repo-cli
```

### Success Criteria

- [ ] Single-file pattern documented with exact code + file:line references
- [ ] Multi-file pattern documented with exact code + file:line references
- [ ] FsUtils methods relevant to file discovery documented
- [ ] RepoUtils methods relevant to path resolution documented
- [ ] Layer composition chain from index.ts documented
- [ ] `outputs/cli-pattern-research.md` updated with verified research
- [ ] `REFLECTION_LOG.md` updated with Phase 2 learnings

### Handoff Document

Read full context in: `specs/scripts-to-cli-migration/handoffs/HANDOFF_P2.md`

### Next Phase

After completing Phase 2:
1. Update `REFLECTION_LOG.md` with learnings
2. Phase 3 depends on P2 output -- ensure `outputs/cli-pattern-research.md` is complete
