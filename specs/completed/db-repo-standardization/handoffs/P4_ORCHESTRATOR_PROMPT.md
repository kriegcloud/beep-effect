# Phase 4 Orchestrator Prompt

> Copy-paste this prompt to launch Phase 4 (Core Refactor) of the db-repo-standardization spec.

---

You are executing Phase 4 of the `db-repo-standardization` spec. This phase makes the core type and runtime changes — exactly 2 files.

## Context

Phase 3 produced an implementation plan at `outputs/implementation-plan.md`. Phase 2 produced a design at `outputs/design.md`. Both are finalized and should be treated as authoritative.

Key design decisions (already finalized — do NOT re-litigate):
- D-01: `Effect.map((data) => ({ data }) as const)` for wrapping non-void returns
- D-02: `as const` assertion for readonly data
- D-03: Let `flow` patterns propagate `{ data }` wrapper to callers
- D-05: SplitService uses explicit `O.match` with destructuring
- D-06: DocumentFile.create / DocumentVersion.createSnapshot propagate wrapper

## Your Mission

Execute WU-1 and WU-2 atomically using a single `effect-code-writer` agent.

### WU-1: Update Domain Types

**File**: `packages/shared/domain/src/factories/db-repo.ts`

Replace the `BaseRepo` interface (lines 32-57) with the finalized interface from `outputs/design.md` Section 1. The exact interface is:

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

**DO NOT change**: `Method`, `MethodSpec`, `MethodError`, `MethodContext`, `DbRepoSuccess`, `DbRepo` types. These auto-update through `BaseRepo`.

### WU-2: Update Runtime Implementation

**File**: `packages/shared/server/src/factories/db-repo.ts`

Update `makeBaseRepo` function per `outputs/design.md` Section 3. Changes per method:

1. **insert**: Rename param → `payload`, add `Effect.map((data) => ({ data }) as const)` between `insertSchema()` and `Effect.mapError()`
2. **insertVoid**: Rename param → `payload`
3. **update**: Rename param → `payload`, add `Effect.map((data) => ({ data }) as const)` between `updateSchema()` and `Effect.mapError()`
4. **updateVoid**: Rename param → `payload`
5. **findById**: Param becomes `payload: { readonly id: ... }`, pass `payload.id` to `findByIdSchema`, add `Effect.map(O.map((data) => ({ data }) as const))`, span attributes → `{ id: payload.id }`
6. **delete**: Param becomes `payload: { readonly id: ... }`, pass `payload.id` to `deleteSchema`, span attributes → `{ id: payload.id }`
7. **insertManyVoid**: Param becomes `payload: { readonly items: ... }`, pass `payload.items` to `insertManyVoidSchema` and `summarizeWritePayload`

**Pipe chain order**: `SqlSchema.call → Effect.map (wrap) → Effect.mapError → Effect.withSpan`

### Verification

After both files are updated:

```bash
# Verify shared packages compile (downstream may fail — expected)
tsc --noEmit -p packages/shared/domain/tsconfig.json
tsc --noEmit -p packages/shared/server/tsconfig.json
```

If shared-server fails, check whether the issue is in the 2 modified files vs downstream dependencies. Use `bun run check --filter @beep/shared-server` for the full cascading check.

### After Verification

1. Update `REFLECTION_LOG.md` with Phase 4 learnings
2. Create `handoffs/HANDOFF_P5.md` with:
   - Summary of what was changed in Phase 4
   - Work unit list for Phase 5 (WU-3 through WU-8 from `outputs/implementation-plan.md`)
   - Per-file pattern assignments
3. Create `handoffs/P5_ORCHESTRATOR_PROMPT.md` with:
   - Copy-paste prompt for Phase 5 orchestrator
   - Parallelization strategy (4 agents recommended)
   - Per-agent WU assignments

### Reference Files

- Design: `specs/pending/db-repo-standardization/outputs/design.md` (Sections 1 and 3 are critical)
- Implementation plan: `specs/pending/db-repo-standardization/outputs/implementation-plan.md`
- Reflection log: `specs/pending/db-repo-standardization/REFLECTION_LOG.md`
- Current domain types: `packages/shared/domain/src/factories/db-repo.ts`
- Current runtime: `packages/shared/server/src/factories/db-repo.ts`

### Critical Constraints

- Phase 4 is NOT complete until BOTH P5 handoff files exist
- Do NOT modify any consumer files — only the 2 factory files
- Downstream type failures after this phase are EXPECTED and will be fixed in Phase 5
