# Phase 2 Orchestrator Prompt: db-repo-standardization

Copy-paste this prompt to start Phase 2 (Design).

---

## Prompt

You are implementing Phase 2 of the `db-repo-standardization` spec. This phase produces a design document — NO code changes.

### Context

Phase 1 completed inventory (66 files, 17 needing manual changes) and research (Effect.map wrapping, no schema transforms needed).

Key findings:
- 38/46 server repos auto-update (expose base CRUD via spread)
- `Effect.map(data => ({ data }) as const)` for wrapping non-void returns
- `Effect.map(O.map(data => ({ data }) as const))` for findById Option wrapping
- `DbRepo.Method` does NOT need changes
- `S.Struct.Context<{ readonly data: Model["Type"] }>` is a TYPE ERROR — use schema, not plain type
- `flow(baseRepo.insert, ...)` in CommentRepo silently changes return type

### Your Mission

**Task: Design Type Changes** — Delegate to `effect-expert` agent.

Using inventory and research outputs, produce a design document with:

1. **Finalized `BaseRepo` interface** — exact TypeScript
2. **`Method` type analysis** — confirm no changes needed (returns `S.Schema.Type<Spec["success"]>` which auto-adapts)
3. **Runtime `makeBaseRepo` changes** — implementation approach for each method
4. **Context propagation verification** — confirm types resolve correctly
5. **Migration order** — ordered list to minimize intermediate breakage

### Reference Files

- Current domain types: `packages/shared/domain/src/factories/db-repo.ts`
- Current runtime: `packages/shared/server/src/factories/db-repo.ts`
- Inventory: `specs/pending/db-repo-standardization/outputs/inventory.md`
- Research: `specs/pending/db-repo-standardization/outputs/effect-research.md`
- Target signatures: `specs/pending/db-repo-standardization/README.md` (Target Signatures section)
- Agent prompts: `specs/pending/db-repo-standardization/AGENT_PROMPTS.md` (Prompt 2.1)

### Design Constraints (from README)

- `insert`/`update`/`insertVoid`/`updateVoid`: parameter renamed to `payload`, same type
- `findById`: input becomes `payload: { readonly id: ScalarType }`
- `delete`: input becomes `payload: { readonly id: ScalarType }`
- `insertManyVoid`: input becomes `payload: { readonly items: NonEmptyArray<InsertType> }`
- Non-void returns wrap in `{ readonly data: T }`
- `findById` returns `Option<{ readonly data: T }>`, NOT `{ data: Option<T> }`

### Design Decisions Already Made (from Phase 1 Research)

- Use `Effect.map` for wrapping (NOT schema transform)
- Use `as const` assertion for readonly typing
- `DbRepo.Method` is unchanged
- Contract schemas are NOT being modified (out of scope)

### Gotchas to Address in Design

1. `flow(baseRepo.insert, ...)` pattern in CommentRepo — how should consumers handle the new `{ data }` wrapper?
2. Span attributes in `makeBaseRepo` — verify `summarizeWritePayload` handles renamed params
3. Test migration patterns — how should `AccountRepo.test.ts` (100+ calls) be updated?

### Success Criteria

- [ ] `outputs/design.md` — finalized interface, implementation strategy, migration order
- [ ] `REFLECTION_LOG.md` updated with Phase 2 learnings
- [ ] `handoffs/HANDOFF_P3.md` created (full context for Phase 3)
- [ ] `handoffs/P3_ORCHESTRATOR_PROMPT.md` created (copy-paste prompt for Phase 3)

### CRITICAL: Phase Completion

Phase 2 is NOT complete until BOTH Phase 3 handoff files exist:
- `handoffs/HANDOFF_P3.md` — include finalized design decisions, rationale, and gotchas
- `handoffs/P3_ORCHESTRATOR_PROMPT.md` — include design summary and patterns from REFLECTION_LOG

### Handoff Document

Read full context in: `specs/pending/db-repo-standardization/handoffs/HANDOFF_P2.md`
