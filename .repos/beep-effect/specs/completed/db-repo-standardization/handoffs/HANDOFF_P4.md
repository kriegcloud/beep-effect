# Phase 4 Handoff: Core Refactor

**Date**: 2026-02-10
**From**: Phase 3 (Implementation Planning)
**To**: Phase 4 (Core Refactor)
**Status**: Ready for execution

---

## Phase 3 Summary

Phase 3 produced `outputs/implementation-plan.md` with 9 ordered work units across Phases 4-6. Total scope: 20 files, ~193 change sites.

### Work Unit Overview

| WU | Phase | Files | Scope | Agent |
|----|-------|-------|-------|-------|
| 1 | 4 (atomic) | 1 | 7 signatures | `effect-code-writer` |
| 2 | 4 (atomic) | 1 | 7 implementations | `effect-code-writer` |
| 3-8 | 5 (parallel) | 18 | ~179 sites | `effect-code-writer` |
| 9 | 6 (gate) | 0 | Verification | `package-error-fixer` |

---

## Context for Phase 4

### Working Context

- **Current task**: Execute WU-1 (domain types) and WU-2 (runtime implementation) atomically
- **Success criteria**: Both files updated, `bun run check --filter @beep/shared-server` passes (downstream failures expected — consumer migration not yet done)
- **Blocking issues**: None

### Episodic Context

- Phase 2 design at `outputs/design.md` contains exact before/after code for all 7 methods
- Design Section 1 = finalized `BaseRepo` interface (copy-paste target for WU-1)
- Design Section 3 = all 7 `makeBaseRepo` method implementations (copy-paste target for WU-2)
- Decisions D-01 (Effect.map over schema), D-02 (as const), D-03 (flow propagation) are finalized

### Semantic Context

- Bun + Effect monorepo, strict `check`/`test`/`lint` gates
- `bun run check --filter @beep/shared-server` cascades through `@beep/shared-domain`
- After WU-1+2, downstream packages will fail type-checks until Phase 5 migration

### Procedural Context

- Design: `specs/pending/db-repo-standardization/outputs/design.md`
- Implementation plan: `specs/pending/db-repo-standardization/outputs/implementation-plan.md`
- Reflection log: `specs/pending/db-repo-standardization/REFLECTION_LOG.md`

---

## WU-1: Update Domain Types

**File**: `packages/shared/domain/src/factories/db-repo.ts`

Replace the `BaseRepo` interface (lines 32-57) with:

```typescript
export interface BaseRepo<
  Model extends M.Any,
  Id extends keyof Model["Type"] & keyof Model["update"]["Type"] & keyof Model["fields"],
> {
  readonly insert: (
    payload: Model["insert"]["Type"]
  ) => Effect.Effect<
    { readonly data: Model["Type"] },
    DatabaseError,
    Model["Context"] | Model["insert"]["Context"]
  >;

  readonly insertVoid: (
    payload: Model["insert"]["Type"]
  ) => Effect.Effect<void, DatabaseError, Model["Context"] | Model["insert"]["Context"]>;

  readonly update: (
    payload: Model["update"]["Type"]
  ) => Effect.Effect<
    { readonly data: Model["Type"] },
    DatabaseError,
    Model["Context"] | Model["update"]["Context"]
  >;

  readonly updateVoid: (
    payload: Model["update"]["Type"]
  ) => Effect.Effect<void, DatabaseError, Model["Context"] | Model["update"]["Context"]>;

  readonly findById: (
    payload: { readonly id: S.Schema.Type<Model["fields"][Id]> }
  ) => Effect.Effect<
    O.Option<{ readonly data: Model["Type"] }>,
    DatabaseError,
    Model["Context"] | S.Schema.Context<Model["fields"][Id]>
  >;

  readonly delete: (
    payload: { readonly id: S.Schema.Type<Model["fields"][Id]> }
  ) => Effect.Effect<void, DatabaseError, S.Schema.Context<Model["fields"][Id]>>;

  readonly insertManyVoid: (
    payload: { readonly items: A.NonEmptyReadonlyArray<Model["insert"]["Type"]> }
  ) => Effect.Effect<void, DatabaseError, Model["Context"] | Model["insert"]["Context"]>;
}
```

**DO NOT change**: `Method`, `MethodSpec`, `MethodError`, `MethodContext`, `DbRepoSuccess`, `DbRepo` types.

---

## WU-2: Update Runtime Implementation

**File**: `packages/shared/server/src/factories/db-repo.ts`

Update `makeBaseRepo` function. For each method:

### insert (§3.1)
- Rename param `insert` → `payload`
- Add `Effect.map((data) => ({ data }) as const)` between `insertSchema()` and `Effect.mapError()`
- Update return type annotation

### insertVoid (§3.2)
- Rename param `insert` → `payload`

### update (§3.3)
- Rename param `update` → `payload`
- Add `Effect.map((data) => ({ data }) as const)` between `updateSchema()` and `Effect.mapError()`
- Update return type annotation

### updateVoid (§3.4)
- Rename param `update` → `payload`

### findById (§3.5)
- Param: `payload: { readonly id: S.Schema.Type<Model["fields"][Id]> }`
- Pass `payload.id` to `findByIdSchema`
- Add `Effect.map(O.map((data) => ({ data }) as const))`
- Span attributes: `{ id: payload.id }`

### delete (§3.6)
- Param: `payload: { readonly id: S.Schema.Type<Model["fields"][Id]> }`
- Pass `payload.id` to `deleteSchema`
- Span attributes: `{ id: payload.id }`

### insertManyVoid (§3.7)
- Param: `payload: { readonly items: A.NonEmptyReadonlyArray<Model["insert"]["Type"]> }`
- Pass `payload.items` to `insertManyVoidSchema`
- Pass `payload.items` to `summarizeWritePayload`

**Pipe chain order**: `SqlSchema.call → Effect.map (wrap) → Effect.mapError → Effect.withSpan`

---

## Phase Completion Requirements

Phase 4 is complete when:
- [ ] `packages/shared/domain/src/factories/db-repo.ts` has new `BaseRepo` interface
- [ ] `packages/shared/server/src/factories/db-repo.ts` has updated `makeBaseRepo`
- [ ] `bun run check --filter @beep/shared-server` passes for the shared packages themselves
- [ ] `REFLECTION_LOG.md` updated with Phase 4 learnings
- [ ] `handoffs/HANDOFF_P5.md` created
- [ ] `handoffs/P5_ORCHESTRATOR_PROMPT.md` created
