# File Tools Implementation Plan (Revised)

**Date**: 2026-02-28
**Depends on**: [`2026-02-28-file-tools-design.md`](/Users/pooks/Dev/personal-agent/docs/plans/2026-02-28-file-tools-design.md)
**Goal**: Implement `file_read` and `file_edit`, and refactor `file_write` onto a hardened `FileRuntime` with Effect-native abstractions that match/exceed reference behavior.

**Architecture summary**:
- `ToolExecution` delegates file operations to `FileRuntime`.
- `FileRuntime` orchestrates path policy, stale checks, hooks, and atomic commit.
- `FilePathPolicy` encapsulates workspace/alias safety.
- `FileReadTracker` is state-only and keyed by invocation scope.

**Tech stack**: Effect (`ServiceMap`, `Layer`, `Ref`, `HashMap`, `Schema`, `Effect.acquireUseRelease`), `@effect/platform` (`FileSystem`, `Path`), Vitest, fast-check.

---

## Task 1: Add file contracts and typed tagged errors

**Files**:
- Create: `packages/server/src/tools/file/FileTypes.ts`
- Create: `packages/server/src/tools/file/FileErrors.ts`

**Work**:
1. Define contracts:
- `FileRequest`
- `FileEditRequest`
- `FileVersionStamp`
- `FileReadState`
- `FilePlan`
- `FileResult`
- constants (`DEFAULT_FILE_MAX_BYTES`)
2. Define tagged errors using `Schema.ErrorClass` with typed reasons:
- `FileValidationError`
- `FileWorkspaceViolation`
- `FileNotFound`
- `FileStaleRead`
- `FileEditNotFound`
- `FileEditAmbiguous`
- `FileTooLarge`
- `FileWriteFailed`
- `FileHookError` (internal)
- `FileHookRejected`
3. Add helpers:
- `toFileHookReason(error: unknown): string`
- `mapFileErrorToToolFailureCode(...)` input helper for `ToolExecution`

**Acceptance**:
- `bun run check` passes.

---

## Task 2: Implement `FilePathPolicy` with alias-safe workspace confinement

**Files**:
- Create: `packages/server/src/tools/file/FilePathPolicy.ts`
- Create: `packages/server/test/FilePathPolicy.test.ts`

**Work**:
1. Build a dedicated path policy service with:
- lexical containment check
- canonical containment check
- existing-ancestor realpath fallback for missing leaf paths
- per-segment symlink hop validation
- hardlink policy checks for read/write/edit
2. Return structured resolved result (`requested`, `lexical`, `canonical`, `workspaceRoot`).
3. Add tests for:
- traversal (`../`)
- canonical alias escape
- broken final symlink in/outside workspace
- in-workspace symlink hop to outside

**Acceptance**:
- `FilePathPolicy.test.ts` passes.

---

## Task 3: Implement state-only `FileReadTracker`

**Files**:
- Create: `packages/server/src/tools/file/FileReadTracker.ts`
- Create: `packages/server/test/FileReadTracker.test.ts`

**Work**:
1. Store state as `Ref<HashMap<string, HashMap<string, FileReadState>>>`.
- outer key: `scopeKey`
- inner key: `canonicalPath`
2. API:
- `recordRead(scopeKey, state)`
- `getLastRead(scopeKey, canonicalPath)`
- `clearScope(scopeKey)`
3. Keep this service pure state (no `FileSystem` dependency).
4. Add tests for scope isolation and overwrite semantics.

**Acceptance**:
- tracker tests pass and do not require filesystem mocks.

---

## Task 4: Add `FileHooks` contract and default hooks

**Files**:
- Create: `packages/server/src/tools/file/FileHooks.ts`
- Create: `packages/server/src/tools/file/hooks/FileAuditHook.ts`
- Create: `packages/server/src/tools/file/hooks/FileHooksDefault.ts`

**Work**:
1. Define `FileHook` callbacks:
- `beforeRead` / `afterRead`
- `beforeWrite` / `afterWrite`
- `beforeEdit` / `afterEdit`
- `onError`
2. Match command hook semantics:
- before-hooks sequential fail-closed
- after/onError sequential best-effort
3. Provide default layer with audit hook only.

**Acceptance**:
- compile clean; default hook layer injectable from server and tests.

---

## Task 5: Implement `FileRuntime.read`

**Files**:
- Create: `packages/server/src/tools/file/FileRuntime.ts`
- Create: `packages/server/test/FileRuntime.test.ts`

**Work**:
1. Inject dependencies:
- `FilePathPolicy`
- `FileReadTracker`
- `FileHooks`
- `FileSystem` / `Path`
2. Add `resolveFileScopeKey(context)` helper:
- use `sessionId` when present
- fallback to deterministic source-based key for non-session sources
3. Read pipeline:
- resolve path via policy
- run `beforeRead`
- stat + read string
- record read stamp in tracker
- run `afterRead`
- return content result

**Acceptance**:
- tests for success, not-found, outside-workspace rejection, hook invocation.

---

## Task 6: Implement stale-check helper and `FileRuntime.write`

**Files**:
- Modify: `packages/server/src/tools/file/FileRuntime.ts`
- Modify: `packages/server/test/FileRuntime.test.ts`

**Work**:
1. Add runtime stale-check helper:
- load tracked stamp by `(scopeKey, canonicalPath)`
- stat current file
- compare `modTimeMs` and `sizeBytes`
- fail `FileStaleRead` on mismatch
2. Write pipeline:
- validate request and size
- resolve path via policy
- stale-check
- run `beforeWrite`
- atomic commit via `Effect.acquireUseRelease`:
  - acquire temp path/handle
  - use: write + rename commit
  - release: cleanup temp only
- stat target and record fresh read state
- run `afterWrite`

**Acceptance**:
- tests cover stale rejection, untracked write allow, hook rejection, interruption cleanup.

---

## Task 7: Implement `FileRuntime.edit` with safe fuzzy-locate and exact-span apply

**Files**:
- Modify: `packages/server/src/tools/file/FileRuntime.ts`
- Create: `packages/server/src/tools/file/FileEditMatcher.ts`
- Modify: `packages/server/test/FileRuntime.test.ts`
- Create: `packages/server/test/FileEditMatcher.test.ts`

**Work**:
1. Validate `oldString` non-empty.
2. Implement matcher module:
- exact match first
- normalized fallback for candidate search only
- maintain index map back to original content
- return all candidate ranges
3. Enforce uniqueness:
- 0 matches => `FileEditNotFound`
- >1 => `FileEditAmbiguous` with count + line numbers
4. Apply replacement on original content span.
5. Generate unified diff.
6. Persist via shared atomic write helper from Task 6.

**Acceptance**:
- tests cover exact/fuzzy unique matches, ambiguity, not-found, unchanged-bytes invariant.

---

## Task 8: Wire `FileRuntime` into `ToolExecution` with full context propagation

**Files**:
- Modify: `packages/server/src/tools/ToolExecution.ts`

**Work**:
1. Add service methods:
- `readFile({ path, context? })`
- `editFile({ path, oldString, newString, context? })`
2. Refactor `writeFile` to delegate to `fileRuntime.write`.
3. Ensure all three file methods pass invocation context (never hardcode source only).
4. Add `mapFileErrorToToolFailure` with complete tagged error switch.

**Acceptance**:
- `ToolExecution` compiles and legacy behavior remains for existing callers.

---

## Task 9: Add `file_read` and `file_edit` in `ToolRegistry`

**Files**:
- Modify: `packages/server/src/ai/ToolRegistry.ts`

**Work**:
1. Add tool names.
2. Add schemas:
- `file_edit.old_string` as non-empty string.
3. Delegate handlers to `ToolExecution` methods inside `runGovernedTool`.
4. Pass `CommandInvocationContext` from governed context for all file operations.

**Acceptance**:
- tool compile/type checks pass.

---

## Task 10: Add migration entries for file tools and policies

**Files**:
- Modify: `packages/server/src/persistence/DomainMigrator.ts`

**Work**:
1. Add tool definitions:
- `file_read` (safe standard)
- `file_edit` (requires approval in standard)
2. Add policy rows:
- Standard: `file_read` allow, `file_edit` require approval
- Permissive: both allow
3. Add policy-tool junction rows.

**Acceptance**:
- migrations run clean.

---

## Task 11: Layer wiring in server and test factories

**Files**:
- Modify: `packages/server/src/server.ts`
- Modify test layer factories (`ToolRegistry.test.ts`, `ChatFlow.e2e.test.ts`, `TurnProcessingWorkflow.e2e.test.ts`)

**Work**:
1. Add layers:
- `FilePathPolicy.layer`
- `FileReadTracker.layer`
- `FileHooksDefaultLayer`
- `FileRuntime.layer`
2. Provide to `ToolExecution.layer`.
3. Mirror same wiring in tests.

**Acceptance**:
- existing e2e tests remain green with new layer graph.

---

## Task 12: Integration tests for file tools

**Files**:
- Modify: `packages/server/test/ToolRegistry.test.ts`

**Work**:
Add integration tests:
1. `file_read` returns file content.
2. `file_edit` unique replacement returns diff.
3. `file_edit` ambiguous replacement fails with expected code.
4. `file_write` rejects stale state after read + external mutation.
5. Context is forwarded to read/write/edit hooks.

**Acceptance**:
- `ToolRegistry.test.ts` passes.

---

## Task 13: Property and hardening tests

**Files**:
- Create: `packages/server/test/FileRuntime.property.test.ts`

**Work**:
Add properties:
1. Traversal and canonical alias escape are always rejected.
2. Unique edit always yields exactly one changed span.
3. Non-unique edit always fails ambiguous.
4. Fuzzy locate never mutates unmatched bytes.
5. Write/read roundtrip preserves bytes.
6. Interrupted atomic write does not leave temp artifacts or partial target writes.

**Acceptance**:
- property suite passes with stable run counts.

---

## Task 14: Final verification and cleanup

**Work**:
1. `bun run check`
2. targeted tests:
- `FilePathPolicy.test.ts`
- `FileReadTracker.test.ts`
- `FileRuntime.test.ts`
- `FileEditMatcher.test.ts`
- `FileRuntime.property.test.ts`
- `ToolRegistry.test.ts`
3. full suite: `bun run test`

---

## Dependency Graph

1. Task 1 (contracts/errors)
2. Task 2 (path policy) depends on 1
3. Task 3 (read tracker) depends on 1
4. Task 4 (hooks) depends on 1
5. Task 5 (read runtime) depends on 1-4
6. Task 6 (write runtime) depends on 5
7. Task 7 (edit runtime) depends on 6
8. Task 8 (ToolExecution delegation) depends on 7
9. Task 9 (ToolRegistry tools) depends on 8
10. Task 10 (migration) depends on 9
11. Task 11 (layer wiring) depends on 5-10
12. Task 12 (integration tests) depends on 11
13. Task 13 (property tests) depends on 7
14. Task 14 (final verification) depends on all

---

## Verification Commands

```bash
cd packages/server && bun run check
cd packages/server && bun run test -- FilePathPolicy.test.ts
cd packages/server && bun run test -- FileReadTracker.test.ts
cd packages/server && bun run test -- FileEditMatcher.test.ts
cd packages/server && bun run test -- FileRuntime.test.ts
cd packages/server && bun run test -- FileRuntime.property.test.ts
cd packages/server && bun run test -- ToolRegistry.test.ts
cd packages/server && bun run test -- ChatFlow.e2e.test.ts
cd packages/server && bun run test -- TurnProcessingWorkflow.e2e.test.ts
cd packages/server && bun run test
```
