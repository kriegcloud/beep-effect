# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1 implementation.

---

## Prompt

You are implementing Phase 1 of the `knowledge-repo-sqlschema-refactor` spec.

### Context

This spec refactors knowledge server repository methods to use `SqlSchema` from `@effect/sql/SqlSchema` for type-safe request/result validation.

Phase 0 (Discovery) identified:
- 8 repository files in `packages/knowledge/server/src/db/repos/`
- 3 repos use only base CRUD operations (no custom methods)
- The `DbRepo.make()` factory already uses SqlSchema correctly

### Your Mission

**Verify that base pattern repos work correctly.** These repos have no custom methods - only base CRUD from `DbRepo.make()`.

Target repos:
1. `packages/knowledge/server/src/db/repos/Ontology.repo.ts`
2. `packages/knowledge/server/src/db/repos/ClassDefinition.repo.ts`
3. `packages/knowledge/server/src/db/repos/PropertyDefinition.repo.ts`

### Tasks

1. **Read each repo file** and verify it uses `DbRepo.make()` correctly
2. **Run type check**: `bun run check --filter @beep/knowledge-server`
3. **Run tests**: `bun run test --filter @beep/knowledge-server`
4. **Document any issues** found in the REFLECTION_LOG.md

### Critical Patterns

**DO NOT modify the repos** - this phase is verification only. The base pattern is already correct.

If type check fails, investigate whether the issue is:
- In the repo file itself
- In the domain model (missing insert/update variants)
- In upstream dependencies

### Reference Files

- `packages/shared/domain/src/factories/db-repo.ts` - The factory that uses SqlSchema
- `packages/knowledge/domain/src/entities/` - Domain models used by repos

### Verification Commands

```bash
bun run check --filter @beep/knowledge-server
bun run test --filter @beep/knowledge-server
```

### Success Criteria

- [ ] All 3 repos verified as using correct pattern
- [ ] `bun run check` passes for @beep/knowledge-server
- [ ] Tests pass (or document pre-existing failures)
- [ ] REFLECTION_LOG.md updated with Phase 1 findings

### Handoff Document

Read full context in: `specs/knowledge-repo-sqlschema-refactor/handoffs/HANDOFF_P1.md`

### After Completion

Create:
1. `handoffs/HANDOFF_P2.md` with detailed context for Phase 2
2. `handoffs/P2_ORCHESTRATOR_PROMPT.md` with copy-paste prompt
3. Update `REFLECTION_LOG.md` with Phase 1 learnings
