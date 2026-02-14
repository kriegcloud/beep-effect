# Phase 11 Persistence - Remediation Plan

Status: Implemented
Last updated: 2026-02-02

## Summary
This document enumerates the follow-up fixes identified during the PR #10 review
and proposes concrete remediation steps, tests, and sequencing. The goal is to
remove regressions, align docs with the implemented APIs, and tighten pagination,
logging, and persistence behavior.

## Priority Fixes

### P0 - Default storage directory should be relative (Done)
**Issue**
- Default filesystem directory should be relative (`storage`) to avoid permission
  failures in local/dev environments.

**Remediation**
- Set default directory to `"storage"`.
- Keep README/examples consistent with the default and note absolute paths
  for containerized deployments when needed.

**Files**
- `src/Storage/defaults.ts`
- `README.md`
- `examples/agent-sdk-filesystem-persistence.ts`
- `docs/plan/phase-11-persistence-engineering-spec.md`

**Tests**
- No new tests required; existing storage filesystem tests should continue to pass.

---

### P1 - Pagination correctness and limits (Done)
**Issues**
- `SessionIndexStore.listPage()` always sets `nextCursor` when any items are returned,
  even when there are no additional items.
- Default limit is only applied when `StorageConfig` is provided; without it, list
  calls can return unbounded results.

**Remediation**
- Compute `nextCursor` only when there is more data.
  - Option A: Fetch `limit + 1` and emit `nextCursor` only when more results exist.
  - Option B: Track total and compare offset/limit.
- Apply a consistent default limit when no `StorageConfig` layer is present.
  - Use `defaultIndexPageSize` as the fallback for list/listPage limits.

**Files**
- `src/Storage/SessionIndexStore.ts`
- `test/storage-session-index.test.ts`

**Tests to add**
- `createdAt` + `asc` ordering pagination
- `nextCursor` absent when on the final page
- fallback limit in absence of `StorageConfig`

---

### P1 - Audit logging correlation and decision coverage (Mostly done)
**Issues**
- `hook_event` entries can drop correlation if `context.toolUseID` is unset.
- Permission decision logging only wraps when user supplies `PermissionRequest`
  hooks, leading to missing allow/deny events for default flows.
- `logHookOutcomes: false` still logs failures in catch-all path.

**Remediation**
- Use `context.toolUseID ?? input.tool_use_id` for `hook_event` records.
- Record allow/deny decisions when available, including `PreToolUse` hook outputs.
- Note: default flows without hooks still cannot surface allow/deny decisions.
- Honor `logHookOutcomes` in error handling as well.

**Files**
- `src/Hooks/Audit.ts`
- `src/AgentRuntime.ts`
- `test/hooks-audit-logging.test.ts`

**Tests to add**
- toolUseId correlation in `hook_event`
- allow/deny decision logging with no `PermissionRequest` hooks
- `logHookOutcomes: false` suppresses failure entries

---

### P1 - Persistence behavior when streams are not consumed (Done)
**Issue**
- `AgentRuntime.layerWithPersistence` records chat history and artifacts only if
  the user drains the stream, since recording is implemented via `Stream.tap`.

**Remediation**
- Decide on one of:
  - A background drain (like `SessionService.layerWithHistory`) to guarantee recording.
  - Explicitly document that recording requires stream consumption.
  - Add a `recordingMode` option (`"tap" | "background"`) with a default.

**Files**
- `src/AgentRuntime.ts`
- `README.md`
- `examples/agent-sdk-full-persistence.ts`

**Tests to add**
- Recording behavior with `handle.stream` unconsumed, if background mode is chosen.

---

### P2 - SessionService recording/backpressure semantics (Done)
**Issues**
- `SessionService.layerWithHistory` uses `Stream.broadcast` with a small buffer;
  a slow store can backpressure the user stream.
- `recordInput` ignores string messages (`send(\"hi\")`).

**Remediation**
- Consider switching to `Stream.tap` for output recording (consistent with runtime),
  or increase buffer/decouple recording.
- Record string input messages by converting to `SDKUserMessage` or documenting
  that only structured inputs are recorded.

**Files**
- `src/SessionService.ts`
- `README.md`
- `test/session-service.test.ts` (add test if behavior changes)

---

### P2 - Documentation alignment (Done)
**Issues**
- README hooks example uses `input.type` and incorrect `yield*` context.
- Engineering spec doc does not match current API shapes or options.
- Examples/README should default to relative `storage`.

**Remediation**
- Fix README hooks example to use `hook_event_name` and `Effect.gen`.
- Update spec doc to reflect implemented interfaces and options.
- Use relative paths in docs/examples; mention absolute `/storage` only for container mounts.

**Files**
- `README.md`
- `docs/plan/phase-11-persistence-engineering-spec.md`
- `examples/*.ts`

---

## Rollout Plan
1) Apply P0 (default directory) + docs note. ✅
2) Fix pagination correctness + add tests. ✅
3) Address audit logging correlation + decision coverage + tests. ✅ (with noted limitation)
4) Decide persistence recording semantics for unconsumed streams. ✅
5) Fix SessionService backpressure/input recording. ✅
6) Align docs/spec/examples. ✅

## Test Plan
- `bun run typecheck`
- `bun test`
- Targeted tests for new pagination and audit behaviors.

## Risks
- Changing default storage directory could affect existing deployments that expect
  `/storage` (mitigate via changelog and release notes).
- Audit log behavior changes could introduce extra events in production.
- Background recording could increase resource usage; ensure bounded buffers.
