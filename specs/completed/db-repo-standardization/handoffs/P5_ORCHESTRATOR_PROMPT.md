# Phase 5 Orchestrator Prompt

> Copy-paste this prompt to execute Phase 5 of the db-repo-standardization spec.

---

You are executing Phase 5 of the `db-repo-standardization` spec. Phase 4 updated the core `BaseRepo` interface and `makeBaseRepo` runtime. Downstream consumers now have type errors. Your job is to fix all consumers.

## Context

Phase 4 changed these 2 files (already done — do NOT modify):
- `packages/shared/domain/src/factories/db-repo.ts` — `BaseRepo` interface
- `packages/shared/server/src/factories/db-repo.ts` — `makeBaseRepo` function

Key changes:
- `insert`/`update` now return `{ readonly data: Model["Type"] }` instead of bare `Model["Type"]`
- `findById` now takes `{ id }` object and returns `Option<{ readonly data: Model["Type"] }>`
- `delete` now takes `{ id }` object
- `insertManyVoid` now takes `{ items }` object

Design decisions (DO NOT re-litigate): See `specs/pending/db-repo-standardization/handoffs/HANDOFF_P5.md`

## Execution Strategy

Spawn 4 parallel `effect-code-writer` agents:

### Agent A: WU-3 + WU-4 (Documents repos then handlers)

**WU-3 files** (do these FIRST):
1. `packages/documents/server/src/db/repos/Comment.repo.ts` — Patterns A, B, E
2. `packages/documents/server/src/db/repos/Document.repo.ts` — Patterns A, D (×6), E
3. `packages/documents/server/src/db/repos/Discussion.repo.ts` — Patterns A, B, D (×2), E
4. `packages/documents/server/src/db/repos/DocumentFile.repo.ts` — Patterns A, E
5. `packages/documents/server/src/db/repos/DocumentVersion.repo.ts` — Patterns A, E

**WU-4 files** (do these AFTER WU-3):
1. `packages/documents/server/src/handlers/Comment.handlers.ts` — Unwrap `repo.create()`, `repo.updateContent()` results
2. `packages/documents/server/src/handlers/Document.handlers.ts` — Unwrap `repo.insert()`, `repo.update()` results
3. `packages/documents/server/src/handlers/Discussion.handlers.ts` — Unwrap `discussionRepo.create()` for `.id` access

**Verify**: `bun run check --filter @beep/documents-server`

**Pattern reference:**
- **A**: `findById(id)` → `findById({ id })`, `onSome: Effect.succeed` → `onSome: ({ data }) => Effect.succeed(data)`
- **B**: `flow(baseRepo.insert, ...)` — NO code change in repo, return type shifts. Handlers must unwrap.
- **D**: `return yield* baseRepo.update({...})` → `const { data } = yield* baseRepo.update({...}); return data;`
- **E**: `baseRepo.delete(id)` → `baseRepo.delete({ id })`
- **C/J (handlers)**: `return yield* repo.insert(data)` → `const { data } = yield* repo.insert(data); return data;`

### Agent B: WU-5 (Knowledge services — highest complexity)

**Files:**
1. `packages/knowledge/server/src/EntityResolution/SplitService.ts` — 3 distinct findById patterns (H.1, H.2, H.3), 1 insert unwrap
2. `packages/knowledge/server/src/EntityResolution/MergeHistoryLive.ts` — insert unwrap
3. `packages/knowledge/server/src/Service/CrossBatchEntityResolver.ts` — insert return unused (verify no change needed)
4. `packages/knowledge/server/src/Embedding/EmbeddingService.ts` — insertVoid (verify no change needed)
5. `packages/knowledge/server/src/rpc/v1/meetingprep/generate.ts` — insert unwrap, insertVoid no change

**Verify**: `bun run check --filter @beep/knowledge-server`

**SplitService patterns:**
- **H.1** (~line 50): Option-as-Effect yield → add `O.map(({ data }) => data)` before `.pipe(Effect.mapError(...))`
- **H.2** (~line 171): `findById(id).pipe(Effect.map(O.isSome))` → `findById({ id: ... }).pipe(Effect.map(O.isSome))` — no unwrap needed
- **H.3** (~line 182): `O.match` with `onSome: Effect.succeed` → `onSome: ({ data }) => Effect.succeed(data)`

### Agent C: WU-6 + WU-8 (Small units)

**WU-6:**
- `packages/shared/server/src/rpc/v1/files/create-folder.ts` — `return yield* folderRepo.insert({...})` → `const { data } = yield* folderRepo.insert({...}); return data;`
- **Verify**: `bun run check --filter @beep/shared-server`

**WU-8:**
- `tooling/cli/src/commands/create-slice/utils/file-generator.ts` — Update template string with new patterns
- **Verify**: `bun run check --filter @beep/cli`

### Agent D: WU-7 (Test files — highest volume)

**Files:**
1. `packages/_internal/db-admin/test/AccountRepo.test.ts` — 100+ calls, bulk mechanical:
   - `findById(id)` → `findById({ id })` + unwrap `{ data }` from Option
   - `delete(id)` → `delete({ id })`
   - `insert(data)` → unwrap `{ data }` from result
   - `update(data)` → unwrap `{ data }` from result
   - `insertManyVoid(items)` → `insertManyVoid({ items })`

2. `packages/knowledge/server/test/Service/CrossBatchEntityResolver.test.ts` — Mock stubs:
   ```typescript
   // All mock BaseRepo methods must match new signatures:
   insert: (payload) => Effect.succeed({ data: mockEntity } as const),
   findById: (payload) => Effect.succeed(O.some({ data: mockEntity } as const)),
   delete: (payload) => Effect.void,
   // etc.
   ```

3. `packages/_internal/db-admin/test/DatabaseError.test.ts` — ~15 insert calls:
   - Successful inserts used for test setup need `{ data }` destructuring
   - Failed inserts (constraint violations) don't return data — no change needed

**Verify**: `bun test packages/_internal/db-admin/test/AccountRepo.test.ts && bun test packages/_internal/db-admin/test/DatabaseError.test.ts && bun run check --filter @beep/knowledge-server`

## After All Agents Complete

1. Run full verification gate:
   ```bash
   bun run lint:fix
   bun run check
   bun run test
   bun run lint
   ```

2. Compare test results against pre-existing failures in `specs/pending/db-repo-standardization/outputs/pre-existing-failures.md`:
   - 32 PromptTemplates test failures (knowledge-server) — pre-existing
   - 2 type errors in TestLayers.ts and GmailExtractionAdapter.test.ts — pre-existing

3. Update `specs/pending/db-repo-standardization/REFLECTION_LOG.md` with Phase 5 learnings

4. If all gates pass, Phase 6 is the final verification — spec moves to `specs/completed/`

## Critical Constraints

- Do NOT modify the 2 core factory files (already done in Phase 4)
- Do NOT modify contract/RPC schemas — they are out of scope
- Handlers are the unwrap boundary between repo `{ data }` wrappers and RPC expectations
- 38 repos auto-update via type propagation — do NOT touch them
- Only the 17 files listed in WU-3 through WU-8 need changes
