# Phase 2 Handoff: Design

**Date**: 2026-02-10
**From**: Phase 1 (Inventory & Research)
**To**: Phase 2 (Design)
**Status**: Ready for execution

---

## Phase 1 Summary

Phase 1 completed inventory of all 66 affected source files and researched Effect APIs for the wrapping approach.

### Key Findings from Inventory

| Slice | Repos | Call Sites | Tests | Manual Changes? |
|-------|-------|------------|-------|-----------------|
| shared | 3 | 1 | 0 | 3 repos have internal baseRepo calls |
| iam | 20 | 0 | 0 | None — all auto-update |
| documents | 6 | 3 | 0 | 5 repos + 3 handlers need manual update |
| knowledge | 14 | 5 | 2 | 0 repos internal calls, but 5 service call sites |
| calendar | 1 | 0 | 0 | None — auto-update |
| customization | 1 | 0 | 0 | None — auto-update |
| comms | 1 | 0 | 0 | None — auto-update |
| _internal | 0 | 0 | 3 | 2 test files with 115+ calls + 1 mock stub file |

**38 of 46 repos auto-update** (expose base CRUD unmodified via spread). Only **17 files need manual code changes**.

### Key Findings from Research

1. **Wrapping approach**: Use `Effect.map(data => ({ data }) as const)` — no schema transforms needed. SqlSchema already decodes results fully.
2. **Option wrapping**: `Effect.map(O.map(data => ({ data }) as const))` correctly wraps findById results.
3. **Context preservation**: `S.Struct.Context<{ readonly data: Model["Type"] }>` is a TYPE ERROR. Use `typeof Model` (the schema) as struct field, not `Model["Type"]` (the plain type). Context resolves correctly when using schemas.
4. **DbRepo.Method**: Does NOT need changes. Returns `S.Schema.Type<Spec["success"]>` which auto-adapts.
5. **Contract schemas**: NOT being modified (out of scope). Services bridge repo `{ data }` wrapper to contract Success.

### Reflection Insights for Design

- `flow(baseRepo.insert, ...)` pattern in CommentRepo silently changes return type — design must address this
- `AccountRepo.test.ts` has 100+ direct CRUD calls — design should include test migration patterns
- Impact classification (auto-update vs manual) should carry through to implementation plan

---

## Context for Phase 2

### Working Context

- **Current task**: Design exact type signatures and implementation approach
- **Success criteria**: `outputs/design.md` exists with finalized BaseRepo interface, makeBaseRepo implementation strategy, and migration order
- **Blocking issues**: None

### Episodic Context

- Phase 1 confirmed the target signatures from README are correct and implementable
- `Effect.map` is sufficient for wrapping — no need for schema transforms or S.Class construction
- 38/46 repos auto-update; only 17 files need manual changes

### Semantic Context

- Bun + Effect monorepo, strict lint/check/test gates
- Effect source available at `.repos/effect/` for inspection
- `effect_docs` MCP tool available

### Procedural Context

- Agent prompts: `specs/pending/db-repo-standardization/AGENT_PROMPTS.md` (Prompt 2.1)
- Design output: `specs/pending/db-repo-standardization/outputs/design.md`
- Full inventory: `specs/pending/db-repo-standardization/outputs/inventory.md`
- Full research: `specs/pending/db-repo-standardization/outputs/effect-research.md`

---

## Execution Instructions

### Task 2.1: Design Type Changes (effect-expert)

Use Prompt 2.1 from `AGENT_PROMPTS.md`. The agent should:

1. Read the current domain types and runtime implementation
2. Read the inventory and research outputs
3. Produce finalized TypeScript for:
   - Updated `BaseRepo` interface
   - Updated `makeBaseRepo` implementation approach
   - `Method` type analysis (confirm no changes needed)
   - Context propagation verification
   - Migration order

Key design decisions already made by research:
- Use `Effect.map(data => ({ data }) as const)` for wrapping (NOT schema transform)
- Use `Effect.map(O.map(data => ({ data }) as const))` for findById
- Destructure `payload.id` for findById/delete
- Destructure `payload.items` for insertManyVoid
- Parameter naming: all renamed to `payload`

### Gotchas from Phase 1

1. **`flow(baseRepo.insert, ...)` pattern**: Design must address how `CommentRepo.create` handles the new `{ data }` wrapper. Options: (a) adjust the flow chain, (b) unwrap in CommentRepo, (c) propagate wrapper to callers.
2. **Span attributes**: `summarizeWritePayload` helper receives the payload — verify it handles renamed params correctly.
3. **`as const` assertion**: Ensures `{ data }` is typed as `{ readonly data: ... }` matching the interface.

---

## Phase Completion Requirements

Phase 2 is complete when ALL of:
- [ ] `outputs/design.md` exists with finalized type signatures
- [ ] Design reviewed and approved
- [ ] `REFLECTION_LOG.md` updated with Phase 2 learnings
- [ ] `handoffs/HANDOFF_P3.md` created
- [ ] `handoffs/P3_ORCHESTRATOR_PROMPT.md` created

### Token Budget Verification

| Section | Est. Tokens | Budget | Status |
|---------|-------------|--------|--------|
| Working | ~300 | <=2,000 | OK |
| Episodic | ~200 | <=1,000 | OK |
| Semantic | ~100 | <=500 | OK |
| Procedural | Links only | Links only | OK |
| **Total** | **~600** | **<=4,000** | **OK** |

### Context Compression Strategy for P3 Handoff

When creating HANDOFF_P3.md, compress Phase 2 findings:
- **Design**: Include final BaseRepo interface and key implementation patterns only
- **Migration order**: Summarize as numbered list with file counts per step
- Link to `outputs/design.md` for full analysis
