# CLI Runtime Implementation Plan

**Date**: 2026-02-28  
**Depends on**: [`2026-02-28-cli-runtime-architecture-design.md`](/Users/pooks/Dev/personal-agent/docs/plans/2026-02-28-cli-runtime-architecture-design.md)  
**Status**: Proposed  
**Goal**: Deliver a reusable, Effect-native `CliRuntime` service with minimal disruption to existing command/tool behavior.

---

## 0. Delivery Strategy

Implement in 4 slices:
1. **Foundation**: `CliRuntime` contracts + local implementation + tests.
2. **Adapter migration**: make `CommandBackendLocal` delegate to `CliRuntime`.
3. **Reuse enablement**: wire scheduler command path through command runtime.
4. **Tool expansion**: build CLI-backed file-discovery/search tools on top of shared runtime.

---

## 1. Slice A — Foundation

### A1. Add contracts and errors

**Files**
1. Create `packages/server/src/tools/cli/CliTypes.ts`
2. Create `packages/server/src/tools/cli/CliErrors.ts`
3. Create `packages/server/src/tools/cli/CliRuntime.ts`

**Work**
1. Define `CliRunRequest`, `CliRunResult`, `CliInvocationMode`.
2. Define tagged errors:
   - `CliValidationError`
   - `CliRuntimeUnavailable`
   - `CliSpawnFailed`
   - `CliTimeout`
   - `CliIdleTimeout` (optional initially)
   - `CliExecutionFailed`
3. Provide `CliRuntime` service with default unavailable layer and `fromExecution` helper.

**Acceptance**
1. `bun run check` passes.

### A2. Implement local runtime

**Files**
1. Create `packages/server/src/tools/cli/CliRuntimeLocal.ts`
2. Create `packages/server/test/CliRuntime.test.ts`

**Work**
1. Implement spawn via `ChildProcessSpawner`.
2. Implement bounded stdout/stderr collection (byte caps + truncation flags).
3. Implement timeout + graceful kill.
4. Return deterministic timestamps and exit metadata.
5. Add unit tests:
   - success path
   - truncation behavior
   - timeout behavior
   - spawn failure mapping
   - interruption cleanup

**Acceptance**
1. `CliRuntime.test.ts` passes.

---

## 2. Slice B — Command Adapter Migration

### B1. Refactor backend to adapter

**Files**
1. Modify `packages/server/src/tools/command/CommandBackendLocal.ts`
2. Modify `packages/server/src/tools/command/CommandErrors.ts` (if mapping requires additions)
3. Modify `packages/server/src/server.ts`
4. Modify command-related layer setup in tests.

**Work**
1. Replace process lifecycle internals in `CommandBackendLocal` with `CliRuntime.run`.
2. Keep `CommandBackendLocal` as translation adapter `CommandPlan -> CliRunRequest`.
3. Map `CliRuntimeError -> CommandExecutionError`.
4. Wire `CliRuntimeLocal` in server and test layer graphs.

**Acceptance**
1. Existing command runtime tests continue to pass unchanged.
2. Existing `shell_execute` integration tests remain green.

### B2. Regression protection

**Files**
1. Modify `packages/server/test/CommandRuntime.test.ts`
2. Modify `packages/server/test/CommandRuntime.property.test.ts`
3. Modify `packages/server/test/ToolRegistry.test.ts`

**Work**
1. Add invariance tests proving behavior parity before/after migration:
   - truncation marker limits
   - timeout mapping
   - context forwarding unchanged
   - policy hook rejection unchanged

**Acceptance**
1. Targeted suites pass:
   - `CommandRuntime.test.ts`
   - `CommandRuntime.property.test.ts`
   - `ToolRegistry.test.ts`

---

## 3. Slice C — Scheduler Reuse

### C1. Route schedule command actions through command runtime

**Files**
1. Modify `packages/server/src/scheduler/SchedulerActionExecutor.ts`
2. Modify `packages/server/src/server.ts`
3. Modify `packages/server/test/SchedulerActionExecutor.test.ts`
4. Modify scheduler e2e tests if needed.

**Work**
1. Add command action handling in `dispatchAction`.
2. Invoke `CommandRuntime.execute` with `source: "schedule"`.
3. Define outcome mapping:
   - exit code `0` -> `ExecutionSucceeded`
   - non-zero / execution errors -> `ExecutionFailed`
4. Remove/replace current “unknown action success” fallback with explicit skip/failure semantics.

**Acceptance**
1. Scheduler tests cover command success/failure and unknown action behavior.

### C2. Governance alignment (follow-up)

**Files**
1. Modify policy evaluation path related to schedule actions.
2. Modify migration seeds if needed.

**Work**
1. Decide explicit behavior for `RequireApproval` in scheduler flows:
   - skip with reason
   - checkpoint request
2. Add test coverage for `Allow`, `Deny`, `RequireApproval`.

**Acceptance**
1. No silent success for approval-required schedule commands.

---

## 4. Slice D — CLI-backed Tool Expansion

### D1. Add reusable CLI adapters in ToolExecution

**Files**
1. Modify `packages/server/src/tools/ToolExecution.ts`
2. Add helper module `packages/server/src/tools/cli/CliAdapters.ts` (optional)
3. Modify `packages/server/src/ai/ToolRegistry.ts`
4. Modify governance migration/definitions for new tools.

**Work**
1. Implement tools as thin adapters over `CliRuntime` with structured argv:
   - `file_ls`
   - `file_find`
   - `file_grep`
2. Validate inputs and generate typed argv (no raw shell concatenation).
3. Parse outputs into typed JSON responses.
4. Provide binary fallback behavior (`fd` -> `find`; typed unavailable error).

**Acceptance**
1. Tool tests cover happy path, missing binary, invalid inputs, and truncation.

### D2. Hardening pass

**Files**
1. `CliRuntime` and adapter tests.
2. `CommandPolicyHook` tests for source-aware policy behavior.

**Work**
1. Add optional idle timeout.
2. Add explicit shell-mode allow/deny checks in caller layer.
3. Ensure schedule/tool sources exercise policy paths (`tool`, `checkpoint_replay`, `schedule`, `integration`, `cli`).

**Acceptance**
1. Property and integration tests confirm stable semantics across all invocation sources.

---

## 5. File Inventory (Expected)

### New
1. `packages/server/src/tools/cli/CliTypes.ts`
2. `packages/server/src/tools/cli/CliErrors.ts`
3. `packages/server/src/tools/cli/CliRuntime.ts`
4. `packages/server/src/tools/cli/CliRuntimeLocal.ts`
5. `packages/server/test/CliRuntime.test.ts`

### Modified
1. `packages/server/src/tools/command/CommandBackendLocal.ts`
2. `packages/server/src/server.ts`
3. `packages/server/src/scheduler/SchedulerActionExecutor.ts`
4. `packages/server/src/tools/ToolExecution.ts`
5. `packages/server/src/ai/ToolRegistry.ts`
6. Related test files and policy migration files.

---

## 6. Verification Commands

```bash
cd packages/server && bun run check
cd packages/server && bun run test -- CliRuntime.test.ts
cd packages/server && bun run test -- CommandRuntime.test.ts CommandRuntime.property.test.ts
cd packages/server && bun run test -- ToolRegistry.test.ts
cd packages/server && bun run test -- SchedulerActionExecutor.test.ts
cd packages/server && bun run test
```

---

## 7. Recommended First Execution Slice

Implement **Slice A + B1** first:
1. Add `CliRuntime` + `CliRuntimeLocal`.
2. Refactor `CommandBackendLocal` into adapter mode.
3. Keep external behavior unchanged.

This yields immediate reuse value with very low product-surface risk, and it prepares the base for `file_ls` / `file_find` / `file_grep`.
