# File Tools Architecture Design

**Date**: 2026-02-28
**Status**: Revised after multi-reference review
**Goal**: Effect-native file tools (`file_read`, `file_edit`, `file_write`) that match or exceed OpenCode/Pi/OpenClaw safety and ergonomics while fitting current server architecture.

---

## 1. Design Targets

1. Preserve current layering style (`ServiceMap.Service` + `Layer`) used by `ToolExecution` and `CommandRuntime`.
2. Keep security-critical checks in core runtime, never in optional hooks.
3. Enforce deterministic, typed behavior for read/write/edit and stale-read protection.
4. Keep APIs simple enough to become the reference pattern for future hookable tool families.

---

## 2. Hard Invariants

1. No path escapes: both lexical and canonical checks must pass.
2. No alias escapes: symlink and hardlink edge cases must be blocked for read/write/edit.
3. No stale blind writes: tracked read stamp must match current file stamp before mutation.
4. No lossy fuzzy edits: fuzzy matching may locate candidates, but replacement must apply to original text spans only.
5. No hidden side effects on interruption: atomic write must commit only in the main use path.

---

## 3. Core Services

### 3.1 `FileRuntime`

```ts
interface FileRuntimeService {
  readonly read: (params: {
    readonly context: CommandInvocationContext
    readonly path: string
  }) => Effect.Effect<FileResult, FileExecutionError>

  readonly write: (params: {
    readonly context: CommandInvocationContext
    readonly request: FileRequest
  }) => Effect.Effect<FileResult, FileExecutionError>

  readonly edit: (params: {
    readonly context: CommandInvocationContext
    readonly request: FileEditRequest
  }) => Effect.Effect<FileResult, FileExecutionError>
}
```

### 3.2 `FilePathPolicy`

A dedicated service for path confinement and alias safety. Runtime uses this before any I/O.

```ts
interface FilePathPolicyService {
  readonly resolveForRead: (inputPath: string) => Effect.Effect<ResolvedFilePath, FileWorkspaceViolation>
  readonly resolveForWrite: (inputPath: string) => Effect.Effect<ResolvedFilePath, FileWorkspaceViolation>
}
```

`ResolvedFilePath` includes:
- `requestedPath`
- `lexicalPath`
- `canonicalPath`
- `workspaceRoot`

### 3.3 `FileReadTracker`

State-only service. No filesystem dependency.

```ts
interface FileReadTrackerService {
  readonly recordRead: (scopeKey: string, state: FileReadState) => Effect.Effect<void>
  readonly getLastRead: (scopeKey: string, canonicalPath: string) => Effect.Effect<FileReadState | null>
  readonly clearScope: (scopeKey: string) => Effect.Effect<void>
}
```

`scopeKey` comes from `CommandInvocationContext` (usually `sessionId`, else source-derived fallback).

### 3.4 `FileHooks`

```ts
interface FileHook {
  readonly id: string
  readonly beforeRead?: (args: { context, path, resolvedPath }) => Effect.Effect<void, FileHookError>
  readonly afterRead?: (args: { context, result }) => Effect.Effect<void>
  readonly beforeWrite?: (args: { context, request, plan }) => Effect.Effect<void, FileHookError>
  readonly afterWrite?: (args: { context, request, plan, result }) => Effect.Effect<void>
  readonly beforeEdit?: (args: { context, request, plan }) => Effect.Effect<void, FileHookError>
  readonly afterEdit?: (args: { context, request, plan, result }) => Effect.Effect<void>
  readonly onError?: (args: { context, operation, plan: FilePlan | null, error }) => Effect.Effect<void>
}
```

Execution semantics intentionally mirror `CommandRuntime`:
- `before*` hooks: sequential, fail-closed.
- `after*` and `onError`: sequential, best-effort (`Effect.catchAll(() => Effect.void)`).

---

## 4. Data Contracts

```ts
interface FileVersionStamp {
  readonly modTimeMs: number
  readonly sizeBytes: number
}

interface FileRequest {
  readonly path: string
  readonly content: string
  readonly maxBytes?: number
}

interface FileEditRequest {
  readonly path: string
  readonly oldString: string
  readonly newString: string
  readonly maxBytes?: number
}

interface FileReadState {
  readonly canonicalPath: string
  readonly stamp: FileVersionStamp
  readonly readAt: Instant
}

interface FilePlan {
  readonly operation: "read" | "write" | "edit"
  readonly canonicalPath: string
  readonly contentBytes?: number
  readonly fingerprint: string
}
```

`file_edit` requires non-empty `oldString` at schema boundary.

---

## 5. Path Policy (OpenClaw-level, Effect-native)

`FilePathPolicy` should implement these steps:

1. Resolve workspace root canonical path.
2. Resolve candidate lexical path from workspace + request.
3. Perform lexical containment check.
4. Canonicalize using existing-ancestor fallback for missing leaves.
5. Walk path segments and validate symlink hops remain inside boundary.
6. Reject disallowed final aliases/hardlinks for read/write/edit.
7. For file open/write operations, verify file identity around open (lstat/fstat/realpath parity).

This exceeds OpenCode/Pi default behavior and aligns with hardened OpenClaw patterns.

---

## 6. Stale-Read Model

Staleness is runtime logic, not tracker logic:

1. Read tracker provides last stamp (if any) for `scopeKey + canonicalPath`.
2. Runtime stats current file stamp.
3. If tracked and current differs (`modTimeMs` or `sizeBytes`), fail with `FileStaleRead`.
4. If untracked, write/edit may proceed.

Note: this is still optimistic concurrency; absolute TOCTOU elimination is handled by path/open safeguards and atomic commit.

---

## 7. Write/Edit Atomicity

Use `Effect.acquireUseRelease` semantics:

1. Acquire temp file path/handle resource.
2. Use phase:
   - write full content to temp
   - flush as supported
   - rename temp -> target (commit)
3. Release phase:
   - best-effort temp cleanup only
   - no rename/commit logic in finalizer

This keeps commit explicit and interruption behavior understandable.

---

## 8. Edit Matching Model

1. Normalize only for candidate location (`CRLF/LF`, BOM, whitespace fallback).
2. Track index mapping from normalized search space to original content.
3. Apply replacement to original content span.
4. Enforce uniqueness before replacement.
5. Diff generated from original old/new content.

This avoids Pi's global normalization side effects.

---

## 9. Error Model

Use tagged `Schema.ErrorClass` with typed reason enums (not free-form strings only):

- `FileValidationError { reason: FileValidationReason, ... }`
- `FileWorkspaceViolation { requestedPath, lexicalPath, canonicalPath }`
- `FileNotFound { path }`
- `FileStaleRead { path, trackedStamp, currentStamp }`
- `FileEditNotFound { path }`
- `FileEditAmbiguous { path, matchCount, lineNumbers }`
- `FileTooLarge { sizeBytes, limitBytes }`
- `FileWriteFailed { operation, causeType }`
- `FileHookRejected { hookId, reason }`

Map one-to-one to `ToolExecutionFailure` codes in `ToolExecution`.

---

## 10. Integration Plan

1. Add `readFile` and `editFile` to `ToolExecutionService`.
2. Refactor `writeFile` to delegate to `FileRuntime.write`.
3. Pass `CommandInvocationContext` through all three file operations.
4. Add `file_read` and `file_edit` tools in `ToolRegistry` with governed execution.
5. Add migration entries for new tools/policies.

---

## 11. Test Strategy

1. Unit tests for `FilePathPolicy`:
- lexical traversal rejection
- canonical alias escape rejection
- missing-leaf existing-ancestor behavior
- symlink hop escape rejection
- hardlink rejection rules

2. Unit tests for `FileRuntime`:
- before/after/onError ordering
- stale-read rejection on stamp mismatch
- interruption-safe atomic write cleanup
- edit uniqueness and line-number diagnostics

3. Property tests:
- path confinement invariants
- edit uniqueness invariant
- fuzzy locator does not alter unmatched bytes
- write/read byte roundtrip

4. Integration tests (`ToolRegistry`):
- context propagation for read/write/edit hooks
- governance behavior for new tools

---

## 12. Reference Alignment Summary

| Area | OpenCode | Pi | OpenClaw | Revised Design |
|------|----------|----|----------|----------------|
| Read tracking | Global map | N/A | N/A | Scope-keyed tracker service, no global leakage by default semantics |
| Edit matching | Exact only | Fuzzy but normalizes output | N/A | Fuzzy locate + original-span apply |
| Path safety | Basic lexical/cwd joins | Permissive abs path | Canonical + alias guards + open verification | Match OpenClaw safety model in dedicated `FilePathPolicy` |
| Atomic write | Manual | direct write/edit | safe open helpers | `acquireUseRelease` commit-in-use pattern |
| Hooking | limited | extension wrapper | policy/approval layers | `FileHooks` mirroring `CommandHooks` semantics |

---

## 13. Out of Scope (v1)

- Multi-file transactional patching.
- File history/version browsing.
- Binary mutation tools.
- LSP-triggered diagnostics on write.
