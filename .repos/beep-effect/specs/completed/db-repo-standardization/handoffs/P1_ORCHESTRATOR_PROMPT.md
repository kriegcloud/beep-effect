# Phase 1 Orchestrator Prompt: db-repo-standardization

Copy-paste this prompt to start Phase 1 (Inventory & Research).

---

## Prompt

You are implementing Phase 1 of the `db-repo-standardization` spec. This phase is research-only — NO code changes.

### Context

Phase 0 (Scaffolding) created the spec structure. The goal of this refactor is to standardize the `BaseRepo` interface in `@beep/shared-domain/factories/db-repo` so that:
1. All method inputs are objects (e.g., `findById({ id })` instead of `findById(id)`)
2. All non-void outputs wrap results in `{ readonly data: T }` (e.g., `{ data: Model["Type"] }`)
3. This enables `S.Class` schemas for Payload/Success in entity contracts

Two core files will be modified:
- `packages/shared/domain/src/factories/db-repo.ts` — domain types
- `packages/shared/server/src/factories/db-repo.ts` — runtime implementation

### Your Mission

**Task 1: Build Dependency Inventory** — Delegate to `codebase-researcher` agent.

Find ALL files affected by this change. Categorize into:
1. Core Factory Files (2 files being modified)
2. Domain Repo Contracts (`*.repo.ts` in domain packages)
3. Server Repo Implementations (`*.repo.ts` in server packages)
4. Service/Handler Call Sites (files calling repo methods)
5. Test Files
6. Summary Statistics

Search for imports of `@beep/shared-domain/factories`, `@beep/shared-server/factories`, `DbRepo`, and all base repo method calls (`.findById(`, `.delete(`, `.insert(`, `.update(`, `.insertVoid(`, `.updateVoid(`, `.insertManyVoid(`).

Write output to: `specs/pending/db-repo-standardization/outputs/inventory.md`

**Task 2: Effect API Research** — Delegate to `mcp-researcher` or `codebase-explorer` agent.

Research:
1. `@effect/sql/SqlSchema` — `single`, `findOne`, `void` return types (explore `.repos/effect/packages/sql/src/SqlSchema.ts`)
2. `@effect/sql/Model` — `M.Any` type accessors (explore `.repos/effect/packages/sql/src/Model.ts`)
3. `effect/Schema` — `S.Struct.Context` behavior when wrapping in `{ data: T }`
4. `S.Class` patterns — opaque types for Payload/Success
5. Use `effect_docs` MCP tool for additional documentation

Write output to: `specs/pending/db-repo-standardization/outputs/effect-research.md`

### Reference Files

- Current domain types: `packages/shared/domain/src/factories/db-repo.ts`
- Current runtime: `packages/shared/server/src/factories/db-repo.ts`
- Example consumer: `packages/documents/server/src/db/repos/Comment.repo.ts`
- Example contract: `packages/documents/domain/src/entities/Comment/contracts/ListByDiscussion.contract.ts`
- Agent prompts: `specs/pending/db-repo-standardization/AGENT_PROMPTS.md`
- Effect source: `.repos/effect/packages/sql/src/SqlSchema.ts`, `.repos/effect/packages/sql/src/Model.ts`

### Success Criteria

- [ ] `outputs/inventory.md` — every file importing/using DbRepo cataloged with method usage and slice
- [ ] `outputs/effect-research.md` — SqlSchema APIs documented, S.Struct.Context analyzed, wrapping approach recommended
- [ ] `REFLECTION_LOG.md` updated with Phase 1 learnings
- [ ] `handoffs/HANDOFF_P2.md` created (full context for Phase 2)
- [ ] `handoffs/P2_ORCHESTRATOR_PROMPT.md` created (copy-paste prompt for Phase 2)

### CRITICAL: Phase Completion

Phase 1 is NOT complete until BOTH Phase 2 handoff files exist:
- `handoffs/HANDOFF_P2.md` — include key findings from inventory and research that will inform the design phase
- `handoffs/P2_ORCHESTRATOR_PROMPT.md` — include relevant patterns/insights from REFLECTION_LOG that increase Phase 2 success

### Handoff Document

Read full context in: `specs/pending/db-repo-standardization/handoffs/HANDOFF_P1.md`
