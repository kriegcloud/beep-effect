# Phase 8 Orchestrator Prompt

> Copy-paste this prompt to start Phase 8 (final phase) of the knowledge completion spec.

---

## Prompt

```markdown
# Knowledge Completion Spec - Phase 8: Finalization

You are orchestrating Phase 8 of the knowledge completion spec located at `specs/knowledge-completion/`.

## Your Objective

Finalize the knowledge packages:
1. Update documentation
2. Create AGENTS.md files
3. Final architecture review
4. Cleanup and verification

## Prerequisites Check

Verify all previous phases complete:
```bash
# Phase 4: Refactoring complete
ls packages/knowledge/server/src/Ai/AiService.ts 2>/dev/null
# Should NOT exist

# Phase 5: Tests pass
bun run test --filter @beep/knowledge-server

# Phase 6: GraphRAG exists
ls packages/knowledge/server/src/GraphRAG/

# Phase 7: Integration exists
ls packages/knowledge/server/src/Client/
```

## Required Reading

1. `specs/knowledge-completion/handoffs/HANDOFF_P8.md` - Phase context
2. `specs/knowledge-completion/RUBRICS.md` - Final criteria
3. `specs/knowledge-completion/REFLECTION_LOG.md` - Learnings to date

## Tasks

### Task 1: Update READMEs

Use `doc-writer` agent to update:
- `packages/knowledge/server/README.md`
- `packages/knowledge/domain/README.md`

Include: overview, usage examples, configuration, testing.

### Task 2: Create AGENTS.md Files

Use `readme-updater` agent to create:
- `packages/knowledge/server/AGENTS.md`
- `packages/knowledge/domain/AGENTS.md`

### Task 3: Final Architecture Review

Use `architecture-pattern-enforcer` agent to verify:
- No remaining `Context.GenericTag`
- All services use `Effect.Service`
- No cross-slice violations

### Task 4: Cleanup and Lint

```bash
bun run lint:fix --filter @beep/knowledge-*
bun run check --filter @beep/knowledge-*
```

### Task 5: Finalize REFLECTION_LOG

Add Phase 8 entry with:
- What worked
- What didn't work
- Patterns discovered
- Recommendations

### Task 6: Mark Spec Complete

Update `specs/knowledge-completion/README.md`:
- Status: COMPLETE
- Completion date
- Final metrics

## Exit Criteria

Phase 8 (and spec) is complete when:
- [ ] READMEs updated
- [ ] AGENTS.md files created
- [ ] `bun run check --filter @beep/knowledge-*` passes
- [ ] `bun run lint --filter @beep/knowledge-*` passes
- [ ] `bun run test --filter @beep/knowledge-server` passes
- [ ] No P0/P1 architecture violations
- [ ] `REFLECTION_LOG.md` finalized
- [ ] Spec README marked COMPLETE

## Celebration

You've completed an 8-phase spec! Take a moment to appreciate the work:
- Custom AiService replaced with @effect/ai
- Full test coverage added
- GraphRAG implemented
- Todox integration complete
- Documentation updated

This knowledge graph system is now production-ready.
```
