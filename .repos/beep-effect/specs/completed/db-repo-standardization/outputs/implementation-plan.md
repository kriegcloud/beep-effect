# DbRepo Standardization: Implementation Plan

> Ordered work units for Phases 4-6 with file-level granularity, agent assignments, and verification commands.

---

## Dependency Graph

```
WU-1 ──→ WU-2 ──→ ┬── WU-3 ──→ WU-4
                   ├── WU-5
                   ├── WU-6          ──→ WU-9 (gate)
                   ├── WU-7
                   └── WU-8
```

- WU-1 and WU-2 are **atomic** (must complete before any consumer migration)
- WU-3 through WU-8 are **parallelizable** (no cross-slice dependencies)
- WU-4 depends on WU-3 (handlers depend on repo method return types)
- WU-9 depends on ALL prior work units

---

## Phase 4: Core Refactor (Atomic)

### WU-1: Update Domain Types

| Field | Value |
|-------|-------|
| **Files** | `packages/shared/domain/src/factories/db-repo.ts` |
| **Agent** | `effect-code-writer` |
| **Patterns** | N/A (interface definition) |
| **Complexity** | 1 interface, 7 method signatures |
| **Verify** | `tsc --noEmit -p packages/shared/domain/tsconfig.json` (will fail — expected, types don't match runtime yet) |

**Changes:**

Replace `BaseRepo` interface (lines 32-57) with the finalized interface from design Section 1:

1. `insert` — rename param `insert` → `payload`, return type `Model["Type"]` → `{ readonly data: Model["Type"] }`
2. `insertVoid` — rename param `insert` → `payload`
3. `update` — rename param `update` → `payload`, return type `Model["Type"]` → `{ readonly data: Model["Type"] }`
4. `updateVoid` — rename param `update` → `payload`
5. `findById` — input `id: scalar` → `payload: { readonly id: scalar }`, return `Option<T>` → `Option<{ readonly data: T }>`
6. `delete` — input `id: scalar` → `payload: { readonly id: scalar }`
7. `insertManyVoid` — input `items: array` → `payload: { readonly items: array }`

**DO NOT change:** `Method`, `MethodSpec`, `MethodError`, `MethodContext`, `DbRepoSuccess`, `DbRepo` types.

**Gotchas:**
- Preserve all JSDoc comments and module-level documentation
- `DbRepoSuccess` and `DbRepo` types reference `BaseRepo` and will auto-update

---

### WU-2: Update Runtime Implementation

| Field | Value |
|-------|-------|
| **Files** | `packages/shared/server/src/factories/db-repo.ts` |
| **Agent** | `effect-code-writer` |
| **Patterns** | N/A (factory implementation) |
| **Complexity** | 7 method implementations |
| **Verify** | `bun run check --filter @beep/shared-server` (may have downstream failures — expected) |

**Changes per method** (see design Section 3 for exact before/after code):

1. **insert** (§3.1): Rename param → `payload`, add `Effect.map((data) => ({ data }) as const)` between `insertSchema()` and `Effect.mapError()`
2. **insertVoid** (§3.2): Rename param → `payload`
3. **update** (§3.3): Rename param → `payload`, add `Effect.map((data) => ({ data }) as const)`
4. **updateVoid** (§3.4): Rename param → `payload`
5. **findById** (§3.5): Param becomes `payload: { readonly id: ... }`, pass `payload.id` to `findByIdSchema`, add `Effect.map(O.map((data) => ({ data }) as const))`, span attributes → `{ id: payload.id }`
6. **delete** (§3.6): Param becomes `payload: { readonly id: ... }`, pass `payload.id` to `deleteSchema`, span attributes → `{ id: payload.id }`
7. **insertManyVoid** (§3.7): Param becomes `payload: { readonly items: ... }`, pass `payload.items` to `insertManyVoidSchema` and `summarizeWritePayload`

**Pipe chain ordering:** `SqlSchema.call(payload) → Effect.map (wrap) → Effect.mapError → Effect.withSpan`

**Gotchas:**
- `MakeBaseRepoEffect` type alias does NOT need changes (resolves through `DbRepoTypes.BaseRepo`)
- `summarizeWritePayload("insertMany", payload.items)` — must pass `.items`, not `payload` directly
- `isRecord(payload)` in update span attributes — same value, renamed reference
- Preserve all error mapping via `DatabaseError.$match`

---

## Phase 5: Consumer Migration (Parallelizable)

### WU-3: Documents Server Repos (5 files)

| Field | Value |
|-------|-------|
| **Files** | 5 files (see table below) |
| **Agent** | `effect-code-writer` |
| **Patterns** | A, B, D, E |
| **Complexity** | ~25 change sites |
| **Verify** | `bun run check --filter @beep/documents-server` |

| File | Change Sites | Patterns |
|------|-------------|----------|
| `packages/documents/server/src/db/repos/Comment.repo.ts` | `findById(id)` → `findById({ id })`, `onSome: Effect.succeed` → `onSome: ({ data }) => Effect.succeed(data)`, `delete(id)` → `delete({ id })`, `create` via `flow` (return type shifts — no code change) | A, B, E |
| `packages/documents/server/src/db/repos/Document.repo.ts` | `findById(id)` → `findById({ id })`, unwrap `onSome`, `delete(id)` → `delete({ id })`, 6× `baseRepo.update({...})` → destructure `{ data }` in each | A, D (×6), E |
| `packages/documents/server/src/db/repos/Discussion.repo.ts` | `findById(id)` → `findById({ id })`, unwrap `onSome`, `delete(id)` → `delete({ id })`, 2× `baseRepo.update({...})` → destructure, `create` via `flow` (return type shifts) | A, B, D (×2), E |
| `packages/documents/server/src/db/repos/DocumentFile.repo.ts` | `findById(id)` → `findById({ id })`, unwrap `onSome`, `delete(id)` → `delete({ id })`, `create` propagates `{ data }` wrapper per D-06 | A, E |
| `packages/documents/server/src/db/repos/DocumentVersion.repo.ts` | `findById(id)` → `findById({ id })`, unwrap `onSome`, `delete(id)` → `delete({ id })`, `createSnapshot` propagates `{ data }` wrapper per D-06 | A, E |

**Pattern A (findById + O.match):**
```typescript
// BEFORE
baseRepo.findById(id).pipe(
  Effect.flatMap(O.match({
    onNone: () => Effect.fail(new NotFoundError({ id })),
    onSome: Effect.succeed,
  }))
)

// AFTER
baseRepo.findById({ id }).pipe(
  Effect.flatMap(O.match({
    onNone: () => Effect.fail(new NotFoundError({ id })),
    onSome: ({ data }) => Effect.succeed(data),
  }))
)
```

**Pattern B (flow propagation — NO code change):** `create = flow(baseRepo.insert, Effect.withSpan(...))` — return type silently shifts to `{ readonly data: Model["Type"] }`. Callers (handlers) must unwrap.

**Pattern D (update unwrap):**
```typescript
// BEFORE
return yield* baseRepo.update({ ...doc, isArchived: true });

// AFTER
const { data } = yield* baseRepo.update({ ...doc, isArchived: true });
return data;
```

**Pattern E (delete object input):**
```typescript
// BEFORE: baseRepo.delete(id)
// AFTER: baseRepo.delete({ id })
```

**Gotchas:**
- `Comment.repo.ts` `updateContent` uses `flow` with `baseRepo.update` — return type shifts; handler must unwrap (WU-4)
- `Document.repo.ts` has 6 `baseRepo.update` calls (archive, restore, publish, unpublish, lock, unlock) — each needs individual destructuring
- `DocumentFile.repo.ts:create` and `DocumentVersion.repo.ts:createSnapshot` propagate `{ data }` wrapper per D-06 — handlers unwrap

---

### WU-4: Documents Handlers (3 files, depends on WU-3)

| Field | Value |
|-------|-------|
| **Files** | 3 files (see table below) |
| **Agent** | `effect-code-writer` |
| **Patterns** | C, J |
| **Complexity** | ~10 change sites |
| **Verify** | `bun run check --filter @beep/documents-server` |

| File | Change Sites |
|------|-------------|
| `packages/documents/server/src/handlers/Comment.handlers.ts` | Unwrap `repo.create(insertData)` → `const { data } = yield* repo.create(insertData); return data;`, unwrap `repo.updateContent(...)` result |
| `packages/documents/server/src/handlers/Document.handlers.ts` | Unwrap `repo.insert(insertData)` result, unwrap `repo.update(payload)` result via `Effect.map(({ data }) => data)`, `archive/restore/publish/unpublish/lock/unlock` already unwrap internally (WU-3) |
| `packages/documents/server/src/handlers/Discussion.handlers.ts` | Unwrap `discussionRepo.create(insertData)` → destructure for `.id` access: `const { data: result } = yield*; return { id: result.id }`, unwrap `commentRepo.create(...)` if return value is used |

**Pattern C (insert unwrap at handler boundary):**
```typescript
// BEFORE
return yield* repo.insert(insertData);

// AFTER
const { data } = yield* repo.insert(insertData);
return data;
```

**Pattern J (handler return value unwrapping):**
```typescript
// BEFORE (handler returns repo result directly to RPC layer)
const result = yield* discussionRepo.create(insertData);
return { id: result.id };

// AFTER
const { data: result } = yield* discussionRepo.create(insertData);
return { id: result.id };
```

**Gotchas:**
- Contract Success schemas are NOT being changed — handlers must unwrap `{ data }` before returning to RPC layer (D-04)
- `Document.handlers.ts` archive/restore/publish/unpublish/lock/unlock — these call custom repo methods (e.g., `repo.archive(id)`) which now unwrap internally in WU-3 (Pattern D). Handler code for these may not need changes if repo methods return raw `Model["Type"]` after internal unwrap.
- Verify by checking whether each handler's return matches the contract Success schema

---

### WU-5: Knowledge Service Call Sites (5 files)

| Field | Value |
|-------|-------|
| **Files** | 5 files (see table below) |
| **Agent** | `effect-code-writer` |
| **Patterns** | A, C, F, H |
| **Complexity** | ~12 change sites |
| **Verify** | `bun run check --filter @beep/knowledge-server` |

| File | Change Sites | Patterns |
|------|-------------|----------|
| `packages/knowledge/server/src/EntityResolution/SplitService.ts` | 3× `findById(id)` → `findById({ id })` with data unwrapping; 1× `insert({...})` → destructure `{ data: newEntity }`; 1× `insert({...})` return unused (no change); `O.match` patterns update | A, C, H |
| `packages/knowledge/server/src/EntityResolution/MergeHistoryLive.ts` | `repo.insert({...})` → destructure `{ data }` before return | C |
| `packages/knowledge/server/src/Service/CrossBatchEntityResolver.ts` | `entityRepo.insert({...})` — return value unused, no unwrap needed | (none — auto-compatible) |
| `packages/knowledge/server/src/Embedding/EmbeddingService.ts` | `repo.insertVoid({...})` — void, no change needed | F |
| `packages/knowledge/server/src/rpc/v1/meetingprep/generate.ts` | `bulletRepo.insert(bulletInsert)` → destructure `{ data: bullet }`; `evidenceRepo.insertVoid(...)` — void, no change | C, F |

**Pattern H (SplitService — most complex single file):**

Three distinct `findById` call patterns in SplitService.ts:

**H.1** (line ~50-58): Option-as-Effect yield pattern
```typescript
// BEFORE
const maybeEntity = yield* entityRepo.findById(params.entityId);
const originalEntity = yield* maybeEntity.pipe(
  Effect.mapError(() => new SplitError({ ... }))
);

// AFTER
const maybeEntity = yield* entityRepo.findById({ id: params.entityId });
const originalEntity = yield* maybeEntity.pipe(
  O.map(({ data }) => data),
  Effect.mapError(() => new SplitError({ ... }))
);
```

**H.2** (line ~171): O.isSome check — no unwrap needed
```typescript
// BEFORE
const sourceEntityExists = yield* entityRepo.findById(historyRecord.sourceEntityId).pipe(Effect.map(O.isSome));

// AFTER
const sourceEntityExists = yield* entityRepo.findById({ id: historyRecord.sourceEntityId }).pipe(Effect.map(O.isSome));
```

**H.3** (line ~182-189): Explicit O.match
```typescript
// BEFORE
const maybeTargetEntity = yield* entityRepo.findById(historyRecord.targetEntityId);
const targetEntity = yield* O.match(maybeTargetEntity, {
  onNone: () => new SplitError({ ... }),
  onSome: Effect.succeed,
});

// AFTER
const maybeTargetEntity = yield* entityRepo.findById({ id: historyRecord.targetEntityId });
const targetEntity = yield* O.match(maybeTargetEntity, {
  onNone: () => new SplitError({ ... }),
  onSome: ({ data }) => Effect.succeed(data),
});
```

**Gotchas:**
- SplitService uses implicit Option-as-Effect yield pattern (H.1) — most fragile migration point (D-05)
- `CrossBatchEntityResolver.ts:106` — return value of `entityRepo.insert` is unused; no destructuring needed
- `EmbeddingService.ts` uses `insertVoid` — void return, no change needed
- `MergeHistoryLive.ts` — result feeds into `Effect.mapError` chain; destructure before the `.pipe` chain

---

### WU-6: Shared Server Handler (1 file)

| Field | Value |
|-------|-------|
| **Files** | `packages/shared/server/src/rpc/v1/files/create-folder.ts` |
| **Agent** | `effect-code-writer` |
| **Patterns** | C |
| **Complexity** | 1 change site |
| **Verify** | `bun run check --filter @beep/shared-server` |

**Change:**
```typescript
// BEFORE
return yield* folderRepo.insert({...});

// AFTER
const { data } = yield* folderRepo.insert({...});
return data;
```

**Gotchas:** None — straightforward single-site change.

---

### WU-7: Test Files (3 files)

| Field | Value |
|-------|-------|
| **Files** | 3 files (see table below) |
| **Agent** | `effect-code-writer` |
| **Patterns** | A, C, E, G, I |
| **Complexity** | ~130 change sites total |
| **Verify** | `bun run test --filter @beep/db-admin && bun run test --filter @beep/knowledge-server` |

| File | Scope | Strategy |
|------|-------|----------|
| `packages/_internal/db-admin/test/AccountRepo.test.ts` | 100+ direct CRUD calls | Bulk mechanical: `findById(id)` → `findById({ id })`, `delete(id)` → `delete({ id })`, all `insert`/`update` result access needs `{ data }` destructuring, `insertManyVoid(items)` → `insertManyVoid({ items })` |
| `packages/knowledge/server/test/Service/CrossBatchEntityResolver.test.ts` | Mock stubs implementing `BaseRepo` | Update all mock method signatures per Pattern I |
| `packages/_internal/db-admin/test/DatabaseError.test.ts` | ~15 `insert` calls testing constraint violations | `insert` result access needs `{ data }` destructuring |

**Pattern I (mock stubs):**
```typescript
// Mock stub template (AFTER)
const mockBaseRepo = {
  insert: (payload) => Effect.succeed({ data: { id: "mock", ...payload } } as const),
  insertVoid: (payload) => Effect.void,
  update: (payload) => Effect.succeed({ data: { id: "mock", ...payload } } as const),
  updateVoid: (payload) => Effect.void,
  findById: (payload) => Effect.succeed(O.some({ data: mockEntity } as const)),
  delete: (payload) => Effect.void,
  insertManyVoid: (payload) => Effect.void,
};
```

**Gotchas:**
- `AccountRepo.test.ts` is the largest change — 100+ call sites. Use search-and-replace for mechanical patterns. Run test file in isolation after changes: `bun test packages/_internal/db-admin/test/AccountRepo.test.ts`
- `CrossBatchEntityResolver.test.ts` mock stubs must match new `BaseRepo` interface exactly — check all 7 methods
- `DatabaseError.test.ts` tests constraint violations — the insert calls that intentionally fail still need `{ data }` destructuring on the SUCCESSFUL calls used for test setup
- Pre-existing test failures (32 PromptTemplates, 2 type errors) are unrelated — document if they appear

---

### WU-8: Tooling Template (1 file)

| Field | Value |
|-------|-------|
| **Files** | `tooling/cli/src/commands/create-slice/utils/file-generator.ts` |
| **Agent** | `effect-code-writer` |
| **Patterns** | Template update |
| **Complexity** | 1 template string |
| **Verify** | `bun run check --filter @beep/cli` |

**Change:** Update the template string containing `DbRepo.make` boilerplate to reflect new patterns:
- `findById({ id })` instead of `findById(id)` in template examples
- `delete({ id })` instead of `delete(id)`
- `{ data }` destructuring in template insert/update examples
- `onSome: ({ data }) => Effect.succeed(data)` in template findByIdOrFail

**Gotchas:** Template is a string literal — verify the generated output makes sense by reading the template carefully.

---

## Phase 6: Verification Gate

### WU-9: Full Verification

| Field | Value |
|-------|-------|
| **Files** | N/A (verification only) |
| **Agent** | `package-error-fixer` (for any remaining issues) |
| **Patterns** | N/A |
| **Complexity** | Gate only |
| **Verify** | See below |

**Gate commands (run sequentially):**

```bash
bun run lint:fix        # Auto-fix formatting
bun run check           # TypeScript compilation across all packages
bun run test            # All test suites
bun run lint            # Final lint pass
```

**If `check` fails:** Errors indicate missed consumer migrations. Fix in dependency order (upstream packages first). Use `bun run check --filter @beep/[slice]-server` to isolate the failing slice.

**If `test` fails:** Compare with pre-existing failures in `outputs/pre-existing-failures.md`. Only NEW failures are blockers.

**Known pre-existing issues (NOT caused by this refactor):**
- 32 failures in PromptTemplates tests (knowledge-server)
- 2 type errors in TestLayers.ts:110 and GmailExtractionAdapter.test.ts:460

---

## Execution Summary

| WU | Phase | Files | Change Sites | Agent | Parallelizable |
|----|-------|-------|-------------|-------|----------------|
| 1 | 4 | 1 | 7 signatures | `effect-code-writer` | No (atomic with WU-2) |
| 2 | 4 | 1 | 7 implementations | `effect-code-writer` | No (atomic with WU-1) |
| 3 | 5 | 5 | ~25 | `effect-code-writer` | Yes |
| 4 | 5 | 3 | ~10 | `effect-code-writer` | Yes (after WU-3) |
| 5 | 5 | 5 | ~12 | `effect-code-writer` | Yes |
| 6 | 5 | 1 | 1 | `effect-code-writer` | Yes |
| 7 | 5 | 3 | ~130 | `effect-code-writer` | Yes |
| 8 | 5 | 1 | 1 | `effect-code-writer` | Yes |
| 9 | 6 | 0 | Gate | `package-error-fixer` | No (final) |
| **Total** | | **20** | **~193** | | |

### Recommended Execution Strategy

1. **Phase 4** — Single `effect-code-writer` agent handles WU-1 + WU-2 atomically
2. **Phase 5** — Spawn up to 5 parallel `effect-code-writer` agents:
   - Agent A: WU-3, then WU-4 (sequential — handler depends on repo)
   - Agent B: WU-5 (knowledge services — highest complexity)
   - Agent C: WU-6 + WU-8 (small units, combine for efficiency)
   - Agent D: WU-7 (test files — highest volume)
3. **Phase 6** — Single `package-error-fixer` agent runs WU-9
