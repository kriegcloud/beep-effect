# Command Hooks Implementation Plan

**Date**: 2026-02-28
**Depends on**: [`2026-02-28-command-hooks-architecture-design.md`](/Users/pooks/Dev/personal-agent/docs/plans/2026-02-28-command-hooks-architecture-design.md)
**Status**: Implemented
**Goal**: Effect-native command hook system with minimal surface changes and strong core safety guarantees.

---

## 0. Delivery Strategy

Implemented in 3 phases:
1. **Foundation**: Runtime abstractions — types, errors, service contracts, local backend.
2. **Integration**: Wire through `ToolExecution`, `ToolRegistry`, and `server.ts`.
3. **Hardening**: Security guards, policy hook, property tests, default hook layer.

---

## 1. Phase A — Foundation

### A1. Command data contracts

**Files**: `packages/server/src/tools/command/CommandTypes.ts`

- `CommandInvocationSource` — `"tool" | "checkpoint_replay" | "schedule" | "integration" | "cli"`
- `CommandInvocationContext` — source + optional `agentId`, `sessionId`, `turnId`, `channelId`, `checkpointId`, `toolName`
- `CommandRequest` — user-facing: `command`, optional `cwd`, `timeoutMs`, `outputLimitBytes`, `envOverrides`
- `CommandPlan` — fully-resolved: all fields required, includes merged `env` and SHA-256 `fingerprint`
- `CommandPlanPatch` — delta for hooks: optional `cwd`, `timeoutMs`, `outputLimitBytes`, `envAdditions`
- `CommandResult` — `exitCode`, `stdout`, `stderr`, truncation flags, `startedAt`/`completedAt` (Instant)
- Constants: `DEFAULT_COMMAND_TIMEOUT_MS` (15s), `DEFAULT_COMMAND_OUTPUT_LIMIT_BYTES` (16KB), `TRUNCATED_OUTPUT_MARKER`

### A2. Tagged error model

**Files**: `packages/server/src/tools/command/CommandErrors.ts`

All errors use `Schema.ErrorClass` (Effect v4 pattern):

| Error | Fields | Role |
|-------|--------|------|
| `CommandValidationError` | `reason` | Bad request shape |
| `CommandWorkspaceViolation` | `reason`, `requestedPath`, `resolvedPath` | Path escapes workspace |
| `CommandHookError` | `reason` | Internal hook failure (not in public union) |
| `CommandHookRejected` | `hookId`, `reason` | Hook explicitly blocked command |
| `CommandBackendUnavailable` | `reason` | No backend configured |
| `CommandSpawnFailed` | `reason` | Process spawn syscall failed |
| `CommandTimeout` | `timeoutMs` | Exceeded time limit |
| `CommandExecutionFailed` | `reason` | Post-spawn failure |

Public union `CommandExecutionError` includes all except `CommandHookError` (caught internally).

Helper: `toCommandHookReason(error: unknown): string` — normalizes hook errors for wrapping.

### A3. Service contracts

**Files**:
- `packages/server/src/tools/command/CommandHooks.ts`
- `packages/server/src/tools/command/CommandBackend.ts`

**CommandHooks** (`ServiceMap.Service`):
- Holds `hooks: ReadonlyArray<CommandHook>`
- Default make: empty array
- Static `layer` and `fromHooks(hooks)` factory
- `makeCommandHook` identity helper for type inference

**CommandHook** interface — three optional lifecycle callbacks:
- `beforeExecute({ context, request, plan })` → `Effect<CommandPlanPatch | void, CommandHookError>`
- `afterExecute({ context, request, plan, result })` → `Effect<void>`
- `onError({ context, request, plan | null, error })` → `Effect<void>`

**CommandBackend** (`ServiceMap.Service`):
- Single method: `executePlan(plan: CommandPlan)` → `Effect<CommandResult, CommandExecutionError>`
- Default make: stub returning `CommandBackendUnavailable`
- Static `layer` and `fromExecution(executePlan)` factory

### A4. Local backend

**Files**: `packages/server/src/tools/command/CommandBackendLocal.ts`

Extracted from `ToolExecution` — all process management logic:
- Spawns via `ChildProcessSpawner` with `shell: true`, `extendEnv: true`, piped stdout/stderr
- **Concurrent output collection**: stdout and stderr collected in parallel via `Deferred` + `Effect.forkScoped`
- **Byte-accurate truncation**: `TextEncoder`/`TextDecoder` for multi-byte UTF-8 correctness; partial chunks truncated at byte boundary; `TRUNCATED_OUTPUT_MARKER` appended when truncated
- **Timeout**: `Effect.timeoutOption` on `exitCode`, then `SIGTERM` + forced `SIGKILL` after 250ms
- **Stream error tolerance**: decode errors swallowed, partial output preserved
- Timestamps: `startedAt` after spawn, `completedAt` after output collected
- Layer requires `ChildProcessSpawner`

### A5. Command runtime (orchestrator)

**Files**: `packages/server/src/tools/command/CommandRuntime.ts`

`CommandRuntime` (`ServiceMap.Service`) — requires `FileSystem`, `Path`, `CommandHooks`, `CommandBackend`.

**Execution pipeline**:

1. **Build base plan** — validate command non-empty, validate timeout/output positive finite, validate env overrides against security rules, resolve cwd to workspace-safe path, merge env, compute SHA-256 fingerprint
2. **Run `beforeExecute` hooks** — sequential, deterministic order; each receives progressively patched plan; patch validated and fingerprint recomputed
3. **Execute via backend** — `backend.executePlan(finalPlan)`
4. **Run `afterExecute` hooks** — parallel, non-blocking (errors swallowed)
5. **On failure: run `onError` hooks** — parallel, non-blocking (errors swallowed)

**Security invariants enforced in core** (steps 1 and 2, cannot be bypassed):
- **Workspace confinement**: all cwd paths resolved via realpath + parent walk fallback; must land inside workspace root
- **Environment variable guard**: blocked keys (`PATH`, `SHELL`, `LD_PRELOAD`, `LD_LIBRARY_PATH`, `DYLD_INSERT_LIBRARIES`, `DYLD_LIBRARY_PATH`, `NODE_OPTIONS`, `BUN_OPTIONS`); blocked prefix `BASH_FUNC_`; null byte rejection in values; key pattern `^[A-Za-z_][A-Za-z0-9_]*$`
- **Hook constraint enforcement**: hooks cannot widen `timeoutMs` or `outputLimitBytes` beyond original; hook env additions cannot override existing keys; patched cwd must remain inside workspace
- **Deterministic fingerprinting**: canonical JSON + SHA-256

**Acceptance**: `ToolExecution` compiles, all new modules compile, existing tests green.

---

## 2. Phase B — Integration

### B1. Delegate `ToolExecution.executeShell` to `CommandRuntime`

**Files**: `packages/server/src/tools/ToolExecution.ts`

- Removed ~100 lines of direct `ChildProcess` spawning, bounded output collection, timeout handling
- `executeShell` now accepts optional `context?: CommandInvocationContext`
- Delegates to `commandRuntime.execute({ context, request })`
- New `mapCommandErrorToToolFailure()` translates all 7 `CommandExecutionError` variants to `ToolExecutionFailure` codes
- Public `ToolExecutionService` method shape preserved

### B2. Invocation context passthrough

**Files**: `packages/server/src/ai/ToolRegistry.ts`

`shell_execute` tool handler now builds `CommandInvocationContext`:
```ts
context: {
  source: context.checkpointId !== undefined ? "checkpoint_replay" : "tool",
  agentId, sessionId, turnId, channelId,
  ...(context.checkpointId !== undefined ? { checkpointId } : {}),
  toolName: TOOL_NAMES.shell_execute
}
```

### B3. Wire layers in server runtime

**Files**: `packages/server/src/server.ts`

Three new layers:
1. `commandHooksLayer` → `CommandHooksDefaultLayer`
2. `commandBackendLayer` → `CommandBackendLocalLayer` ← `BunServices.layer`
3. `commandRuntimeLayer` → `CommandRuntime.layer` ← hooks + backend + `BunServices.layer`

`toolExecutionLayer` now depends on `commandRuntimeLayer`.

**Dependency graph**:
```
ToolExecution
  └─ CommandRuntime
      ├─ CommandHooks (default = [CommandPolicyHook])
      ├─ CommandBackendLocal
      │   └─ ChildProcessSpawner (from BunServices)
      └─ FileSystem, Path (from BunServices)
```

### B4. Update test layer factories

**Files**:
- `packages/server/test/ToolRegistry.test.ts` — `makeToolRegistryLayer()` now accepts optional `commandHooks` and wires command layers
- `packages/server/test/ChatFlow.e2e.test.ts` — `makeChatFlowLayer()` wires command layers
- `packages/server/test/TurnProcessingWorkflow.e2e.test.ts` — `makeTurnProcessingLayer()` wires command layers

All test factories mirror the server wiring: `commandHooksLayer` → `commandBackendLayer` → `commandRuntimeLayer` → `toolExecutionLayer`.

**Acceptance**: All existing `shell_execute`, ChatFlow, and TurnProcessingWorkflow tests green. No route contract changes.

---

## 3. Phase C — Hardening

### C1. Core guard revalidation after hook patch

**Files**: `packages/server/src/tools/command/CommandRuntime.ts` (built into A5 pipeline)

After each `beforeExecute` hook returns a patch:
- Timeout: rejects if patched value exceeds original
- Output limit: rejects if patched value exceeds original
- Environment: rejects if hook tries to override existing keys; re-validates against blocked keys
- Workspace: rejects if patched cwd resolves outside workspace
- Fingerprint: recomputed after every successful patch

### C2. Realpath/symlink guard

**Files**: `packages/server/src/tools/command/CommandRuntime.ts` (built into A5 pipeline)

- Workspace root resolved at service init (with symlink fallback)
- All cwd paths resolved via `realPath`; non-existent paths handled by walking parent directory tree
- Both lexical and resolved paths must be inside workspace root

### C3. First-party hooks

**Files**:
- `packages/server/src/tools/command/hooks/CommandPolicyHook.ts`
- `packages/server/src/tools/command/hooks/AuditCommandHook.ts`
- `packages/server/src/tools/command/hooks/CommandHooksDefault.ts`

**CommandPolicyHook** (`id: "command-policy"`) — `beforeExecute` only:
- Source-aware enforcement: default enforced for `"tool"`, `"checkpoint_replay"`, `"schedule"`, `"integration"`; `"cli"` exempt by default
- **Denied executables** (16): `sudo`, `su`, `doas`, `pkexec`, `shutdown`, `reboot`, `halt`, `poweroff`, `launchctl`, `systemctl`, `service`, `init`, `telinit`, `mkfs`, `fdisk`, `sfdisk`, `diskutil`, `parted`
- **Denied patterns** (5 regexes): fork bombs, `rm -rf /`, raw disk `dd`, `curl|sh`, `wget|sh`
- Null byte rejection in commands
- Shell-aware parsing: handles quoting, escapes, pipes, `&&`/`||`/`;`, env assignments, `env` prefix
- Fully configurable via `makeCommandPolicyHook({ hookId, enforcedSources, deniedExecutables, deniedPatterns })`

**AuditCommandHook** (`id: "audit-command"`) — `afterExecute` + `onError`:
- Logs successful executions with source, tool name, cwd, exit code, truncation flags
- Logs failures with source, tool name, cwd (or null), error tag

**CommandHooksDefault**:
- `DefaultCommandHooks` — frozen array: `[CommandPolicyHook]`
- `CommandHooksDefaultLayer` — Layer providing defaults
- `withAdditionalCommandHooks(hooks)` — factory to extend defaults with custom hooks

**Acceptance**: Hook chain deterministic and fail-closed. Security invariants enforced with hooks enabled.

---

## 4. Tests

### T1. Unit tests — CommandRuntime

**Files**: `packages/server/test/CommandRuntime.test.ts` (7 tests)

| Test | Covers |
|------|--------|
| Hook order: before → backend → after | Pipeline sequencing, hook receives patched plan |
| Hook failure → `CommandHookRejected` + `onError` once | Error path, onError idempotency, backend never called |
| Reject hook patch widening `timeoutMs` | Constraint enforcement |
| Reject hook patch widening `outputLimitBytes` | Constraint enforcement |
| Reject blocked env overrides in requests | Env security at request level |
| Reject blocked env additions in hooks | Env security at hook level |
| Deny cwd symlink escapes | Workspace confinement (real filesystem symlink) |

**Infrastructure**: `@effect/vitest`, composable `makeRuntimeLayer({ hooks?, executePlan? })`, `NodeServices.layer`.

### T2. Integration tests — ToolRegistry

**Files**: `packages/server/test/ToolRegistry.test.ts` (2 new tests added to existing suite)

| Test | Covers |
|------|--------|
| `shell_execute` denies commands blocked by policy hook | End-to-end: tool call → policy rejection → `CommandHookRejected` error code |
| `shell_execute` forwards invocation context to hooks | Context propagation: agentId, sessionId, turnId, channelId, toolName all correct |

**Infrastructure**: `makeToolRegistryLayer({ commandHooks? })` accepts optional custom hooks; uses `withAdditionalCommandHooks` for context-capturing test hook.

### T3. Property tests — CommandRuntime

**Files**: `packages/server/test/CommandRuntime.property.test.ts` (3 properties)

| Property | Arbitrary | Runs |
|----------|-----------|------|
| Traversal cwd outside workspace rejected | depth 1-6, segment `[a-zA-Z0-9_-]{1,12}` | 75 |
| Fingerprint deterministic for equivalent env records | dict of safe env keys/values, forward vs reversed order | 60 |
| stdout length ≤ output cap + marker | limit 1-128 bytes, emitted 0-512 bytes | 30 |

Third property uses real `CommandBackendLocalLayer` (actual shell execution with `head -c N /dev/zero | tr '\0' 'a'`).

### T4. Policy hook tests

**Files**: `packages/server/test/CommandPolicyHook.test.ts` (7 tests)

| Test | Covers |
|------|--------|
| Denies blocked executables | `sudo ls -la` → violation with `blocked-executable:sudo` |
| Denies destructive root deletion | `rm -rf /` → violation with `rm-root` |
| Denies blocked executables behind env assignments | `FOO=1 BAR=2 sudo whoami` → parses past env vars |
| Allows benign commands | `echo hello world` → null |
| Hook rejects for tool source | Effect integration: `beforeExecute` → `CommandHookError` |
| Hook does not enforce for cli source | `"cli"` source bypasses default policy |
| Custom policy enforces cli + custom executables | `makeCommandPolicyHook` with custom config |

---

## 5. Plugin API

```ts
import { makeCommandHook } from "./command/CommandHooks.js"
import { withAdditionalCommandHooks } from "./command/hooks/CommandHooksDefault.js"

const MyHook = makeCommandHook({
  id: "my-hook",
  beforeExecute: ({ plan }) =>
    Effect.succeed({ timeoutMs: Math.min(plan.timeoutMs, 5_000) }),
  afterExecute: ({ result }) =>
    Effect.logInfo("exit", { code: result.exitCode })
})

// In server.ts or test layer:
const MyCommandHooksLayer = withAdditionalCommandHooks([MyHook])
```

---

## 6. Verification Commands

```bash
cd packages/server && bun run check
cd packages/server && bun run test -- CommandRuntime.test.ts
cd packages/server && bun run test -- CommandRuntime.property.test.ts
cd packages/server && bun run test -- CommandPolicyHook.test.ts
cd packages/server && bun run test -- ToolRegistry.test.ts
cd packages/server && bun run test -- ChatFlow.e2e.test.ts
cd packages/server && bun run test -- TurnProcessingWorkflow.e2e.test.ts
cd packages/server && bun run test
```

---

## 7. File Inventory

### Created
| File | Phase |
|------|-------|
| `packages/server/src/tools/command/CommandTypes.ts` | A1 |
| `packages/server/src/tools/command/CommandErrors.ts` | A2 |
| `packages/server/src/tools/command/CommandHooks.ts` | A3 |
| `packages/server/src/tools/command/CommandBackend.ts` | A3 |
| `packages/server/src/tools/command/CommandRuntime.ts` | A5 |
| `packages/server/src/tools/command/CommandBackendLocal.ts` | A4 |
| `packages/server/src/tools/command/hooks/CommandPolicyHook.ts` | C3 |
| `packages/server/src/tools/command/hooks/AuditCommandHook.ts` | C3 |
| `packages/server/src/tools/command/hooks/CommandHooksDefault.ts` | C3 |
| `packages/server/test/CommandRuntime.test.ts` | T1 |
| `packages/server/test/CommandRuntime.property.test.ts` | T3 |
| `packages/server/test/CommandPolicyHook.test.ts` | T4 |

### Modified
| File | Phase |
|------|-------|
| `packages/server/src/tools/ToolExecution.ts` | B1 |
| `packages/server/src/ai/ToolRegistry.ts` | B2 |
| `packages/server/src/server.ts` | B3 |
| `packages/server/test/ToolRegistry.test.ts` | T2 |
| `packages/server/test/ChatFlow.e2e.test.ts` | B4 |
| `packages/server/test/TurnProcessingWorkflow.e2e.test.ts` | B4 |

---

## 8. Out of Scope (v1)

- Command rewriting hooks (command field immutable in `CommandPlanPatch`).
- Hook-triggered checkpoint creation (`RequireApproval`) from runtime layer.
- PTY / background process manager.
- `OutputRedactionHook` (originally optional, deferred to v2).
