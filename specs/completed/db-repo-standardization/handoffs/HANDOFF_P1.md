# Phase 1 Handoff: Inventory & Research

**Date**: 2026-02-10
**From**: Phase 0 (Scaffolding)
**To**: Phase 1 (Inventory & Research)
**Status**: Ready for execution

---

## Phase 0 Summary

Spec structure created with comprehensive README, MASTER_ORCHESTRATION, AGENT_PROMPTS, RUBRICS, and handoff documents. Problem statement, target signatures, and success criteria are fully defined.

### Key Findings from Scaffolding

- `BaseRepo` interface has 7 methods; 2 need input wrapping (`findById`, `delete`), 1 needs array wrapping (`insertManyVoid`), 4 non-void methods need output wrapping
- `DbRepo.Method` type returns `S.Schema.Type<Spec["success"]>` — this should auto-adapt when contract Success schemas include `{ data }`
- `CommentRepo` is the only entity using `DbRepo.Method` for custom methods — key test case
- `flow(baseRepo.insert, ...)` pattern in `CommentRepo.create` will need special attention
- Prior research (observation #199-#207) found ~63 files importing DbRepo types, ~49 server-side implementations

---

## Context for Phase 1

### Working Context

- **Current task**: Build complete dependency inventory AND research Effect APIs for wrapping patterns
- **Success criteria**:
  - `outputs/inventory.md` exists with every file categorized
  - `outputs/effect-research.md` exists with SqlSchema/Model/Schema API analysis
- **Blocking issues**: None

### Episodic Context

- Phase 0 identified `packages/shared/domain/src/factories/db-repo.ts` and `packages/shared/server/src/factories/db-repo.ts` as the two core files
- `CommentRepo` (documents slice) is the most complex consumer — uses base CRUD + custom methods via `DbRepo.Method`

### Semantic Context

- Bun + Effect monorepo, strict lint/check/test gates
- Effect source code available at `.repos/effect/` for direct inspection
- `effect_docs` MCP tool available for documentation search

### Procedural Context

- Agent prompts: `specs/pending/db-repo-standardization/AGENT_PROMPTS.md` (Prompts 1.1 and 1.2)
- Master orchestration: `specs/pending/db-repo-standardization/MASTER_ORCHESTRATION.md`
- Effect patterns: `.claude/rules/effect-patterns.md`

---

## Execution Instructions

### Task 1: Inventory (codebase-researcher)

Use the prompt from `AGENT_PROMPTS.md` Prompt 1.1. Key search patterns:

```
# Imports
@beep/shared-domain/factories/db-repo
@beep/shared-domain/factories
@beep/shared-server/factories/db-repo
@beep/shared-server/factories
DbRepo

# Method calls
.findById(
.delete(
.insert(
.update(
.insertVoid(
.updateVoid(
.insertManyVoid(

# Type references
DbRepo.Method
DbRepoSuccess
BaseRepo
```

### Task 2: Effect Research (mcp-researcher)

Use the prompt from `AGENT_PROMPTS.md` Prompt 1.2. Key files to explore:

- `.repos/effect/packages/sql/src/SqlSchema.ts`
- `.repos/effect/packages/sql/src/Model.ts`
- `.repos/effect/packages/effect/src/Schema.ts`
- Use `effect_docs` MCP: search for `SqlSchema`, `Schema.Struct.Context`, `S.Class`

---

## Phase Completion Requirements

Phase 1 is complete when ALL of:
- [ ] `outputs/inventory.md` exists with categorized file list and summary statistics
- [ ] `outputs/effect-research.md` exists with API analysis and code examples
- [ ] `REFLECTION_LOG.md` updated with Phase 1 learnings
- [ ] `handoffs/HANDOFF_P2.md` created with Phase 1 findings for Phase 2
- [ ] `handoffs/P2_ORCHESTRATOR_PROMPT.md` created as copy-paste prompt for Phase 2

**CRITICAL**: Phase is NOT complete until BOTH P2 handoff files exist. Include valuable findings from the reflection log in the handoff to increase Phase 2 success odds.

### Token Budget Verification

| Section | Est. Tokens | Budget | Status |
|---------|-------------|--------|--------|
| Working | ~400 | <=2,000 | OK |
| Episodic | ~200 | <=1,000 | OK |
| Semantic | ~100 | <=500 | OK |
| Procedural | Links only | Links only | OK |
| **Total** | **~700** | **<=4,000** | **OK** |

- [x] Working context <=2,000 tokens
- [x] Episodic context <=1,000 tokens
- [x] Semantic context <=500 tokens (or links)
- [x] Procedural context uses links, not inline content
- [x] Total context <=4,000 tokens

### Context Compression Strategy for P2 Handoff

When creating HANDOFF_P2.md, compress Phase 1 findings as follows:
- **Inventory**: Summarize as table (slice | file count | methods used) rather than listing every file. Link to `outputs/inventory.md` for full list.
- **Research**: Extract only the answers to the 3 key questions (wrapping approach, Context resolution, existing patterns). Link to `outputs/effect-research.md` for full analysis.
- **Reflection insights**: Include only insights that directly inform design decisions. Omit process observations.
