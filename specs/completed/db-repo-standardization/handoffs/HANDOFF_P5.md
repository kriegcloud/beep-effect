# Phase 5 Handoff: Consumer Migration

**Date**: 2026-02-10
**From**: Phase 4 (Core Refactor)
**To**: Phase 5 (Consumer Migration)
**Status**: Ready for execution

---

## Phase 4 Summary

Phase 4 updated exactly 2 files atomically:

1. **Domain types** (`packages/shared/domain/src/factories/db-repo.ts`): `BaseRepo` interface updated — all 7 method signatures changed (param renames, object inputs, `{ readonly data }` wrapping)
2. **Runtime implementation** (`packages/shared/server/src/factories/db-repo.ts`): `makeBaseRepo` function updated — all 7 method implementations aligned with new interface

Both packages compile cleanly. Downstream consumers now have type errors — this is expected and Phase 5 fixes them.

### What Changed in BaseRepo

| Method | Input Change | Output Change |
|--------|-------------|---------------|
| `insert` | param `insert` → `payload` | `Model["Type"]` → `{ readonly data: Model["Type"] }` |
| `insertVoid` | param `insert` → `payload` | no change (void) |
| `update` | param `update` → `payload` | `Model["Type"]` → `{ readonly data: Model["Type"] }` |
| `updateVoid` | param `update` → `payload` | no change (void) |
| `findById` | `id: scalar` → `payload: { readonly id: scalar }` | `Option<T>` → `Option<{ readonly data: T }>` |
| `delete` | `id: scalar` → `payload: { readonly id: scalar }` | no change (void) |
| `insertManyVoid` | `items: array` → `payload: { readonly items: array }` | no change (void) |

### Design Decisions (DO NOT re-litigate)

| ID | Decision |
|----|----------|
| D-01 | `Effect.map((data) => ({ data }) as const)` for wrapping |
| D-02 | `as const` assertion for readonly data |
| D-03 | Let `flow` patterns propagate `{ data }` wrapper to callers |
| D-04 | Handlers unwrap before returning to RPC layer |
| D-05 | SplitService uses explicit `O.match` with destructuring |
| D-06 | DocumentFile.create / DocumentVersion.createSnapshot propagate wrapper |

---

## Phase 5 Work Units

### WU-3: Documents Server Repos (5 files, ~25 changes)

| File | Patterns |
|------|----------|
| `packages/documents/server/src/db/repos/Comment.repo.ts` | A, B, E |
| `packages/documents/server/src/db/repos/Document.repo.ts` | A, D (×6), E |
| `packages/documents/server/src/db/repos/Discussion.repo.ts` | A, B, D (×2), E |
| `packages/documents/server/src/db/repos/DocumentFile.repo.ts` | A, E |
| `packages/documents/server/src/db/repos/DocumentVersion.repo.ts` | A, E |

**Verify**: `bun run check --filter @beep/documents-server`

### WU-4: Documents Handlers (3 files, ~10 changes, depends on WU-3)

| File | Changes |
|------|---------|
| `packages/documents/server/src/handlers/Comment.handlers.ts` | Unwrap `repo.create()` and `repo.updateContent()` results |
| `packages/documents/server/src/handlers/Document.handlers.ts` | Unwrap `repo.insert()`, `repo.update()` results |
| `packages/documents/server/src/handlers/Discussion.handlers.ts` | Unwrap `discussionRepo.create()` for `.id` access |

**Verify**: `bun run check --filter @beep/documents-server`

### WU-5: Knowledge Service Call Sites (5 files, ~12 changes)

| File | Patterns |
|------|----------|
| `packages/knowledge/server/src/EntityResolution/SplitService.ts` | A, C, H (3 distinct findById patterns) |
| `packages/knowledge/server/src/EntityResolution/MergeHistoryLive.ts` | C |
| `packages/knowledge/server/src/Service/CrossBatchEntityResolver.ts` | (none — return unused) |
| `packages/knowledge/server/src/Embedding/EmbeddingService.ts` | F (void — no change) |
| `packages/knowledge/server/src/rpc/v1/meetingprep/generate.ts` | C, F |

**Verify**: `bun run check --filter @beep/knowledge-server`

### WU-6: Shared Server Handler (1 file, 1 change)

| File | Change |
|------|--------|
| `packages/shared/server/src/rpc/v1/files/create-folder.ts` | Unwrap `folderRepo.insert()` result |

**Verify**: `bun run check --filter @beep/shared-server`

### WU-7: Test Files (3 files, ~130 changes)

| File | Scope |
|------|-------|
| `packages/_internal/db-admin/test/AccountRepo.test.ts` | 100+ CRUD calls — bulk mechanical |
| `packages/knowledge/server/test/Service/CrossBatchEntityResolver.test.ts` | Mock stubs — Pattern I |
| `packages/_internal/db-admin/test/DatabaseError.test.ts` | ~15 insert calls |

**Verify**: `bun run test --filter @beep/db-admin && bun run test --filter @beep/knowledge-server`

### WU-8: Tooling Template (1 file, template string)

| File | Change |
|------|--------|
| `tooling/cli/src/commands/create-slice/utils/file-generator.ts` | Update DbRepo.make template |

**Verify**: `bun run check --filter @beep/cli`

---

## Migration Patterns Quick Reference

**Pattern A** (findById + O.match):
```typescript
// BEFORE: baseRepo.findById(id) ... onSome: Effect.succeed
// AFTER:  baseRepo.findById({ id }) ... onSome: ({ data }) => Effect.succeed(data)
```

**Pattern B** (flow propagation — NO code change in repo):
```typescript
// create = flow(baseRepo.insert, ...) — return type shifts silently
// Callers (handlers) must unwrap
```

**Pattern C** (insert unwrap):
```typescript
// BEFORE: return yield* repo.insert(data)
// AFTER:  const { data } = yield* repo.insert(data); return data;
```

**Pattern D** (update unwrap):
```typescript
// BEFORE: return yield* baseRepo.update({ ...doc, field: value })
// AFTER:  const { data } = yield* baseRepo.update({ ...doc, field: value }); return data;
```

**Pattern E** (delete object input):
```typescript
// BEFORE: baseRepo.delete(id)
// AFTER:  baseRepo.delete({ id })
```

**Pattern H** (SplitService — 3 sub-patterns): See `outputs/implementation-plan.md` WU-5 section

**Pattern I** (mock stubs): All 7 methods must match new BaseRepo interface

**Pattern J** (handler unwrap):
```typescript
// BEFORE: const result = yield* repo.create(data); return { id: result.id }
// AFTER:  const { data: result } = yield* repo.create(data); return { id: result.id }
```

---

## Reference Files

- Design: `specs/pending/db-repo-standardization/outputs/design.md`
- Implementation plan: `specs/pending/db-repo-standardization/outputs/implementation-plan.md`
- Inventory: `specs/pending/db-repo-standardization/outputs/inventory.md`
- Pre-existing failures: `specs/pending/db-repo-standardization/outputs/pre-existing-failures.md`

---

## Phase Completion Requirements

Phase 5 is complete when ALL of:
- [ ] All 6 work units (WU-3 through WU-8) completed
- [ ] Each work unit's isolated verification passes
- [ ] `REFLECTION_LOG.md` updated with Phase 5 learnings
- [ ] Ready for Phase 6 verification gate
