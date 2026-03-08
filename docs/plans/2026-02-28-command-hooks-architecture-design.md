# Command Hooks Architecture Design

**Date**: 2026-02-28
**Status**: Implemented
**Goal**: Effect-native hook system for command execution — simple to plug in, security-critical behavior in core runtime.

---

## 1. Architecture Fit

### Execution path

1. `ToolRegistry.runGovernedTool` handles policy, checkpoints, quota, audit, idempotency.
2. `ToolRegistry` calls `ToolExecution.executeShell` for `shell_execute`, passing `CommandInvocationContext`.
3. `ToolExecution` delegates to `CommandRuntime.execute`.
4. `CommandRuntime` validates, runs hooks, delegates to `CommandBackend`, runs post-hooks.
5. `CommandBackendLocal` spawns shell, collects bounded output, enforces timeout.

References:
- [`ToolRegistry.ts`](/Users/pooks/Dev/personal-agent/packages/server/src/ai/ToolRegistry.ts)
- [`ToolExecution.ts`](/Users/pooks/Dev/personal-agent/packages/server/src/tools/ToolExecution.ts)
- [`CommandRuntime.ts`](/Users/pooks/Dev/personal-agent/packages/server/src/tools/command/CommandRuntime.ts)
- [`CommandBackendLocal.ts`](/Users/pooks/Dev/personal-agent/packages/server/src/tools/command/CommandBackendLocal.ts)
- [`server.ts`](/Users/pooks/Dev/personal-agent/packages/server/src/server.ts)

### Preserved constraints
- Governance/checkpoint flow stays in `ToolRegistry` and `ChannelCore`.
- Layer wiring remains `ServiceMap.Service` + `Layer.provide(...)` style.
- CLI and HTTP routes have no direct hook awareness.

---

## 2. Design Principles

1. **Security in core, not hooks**: canonicalization, workspace/symlink guard, timeout ceilings, output limits, env blocking — all enforced in `CommandRuntime` before and after hook influence.
2. **Simple hook API**: object-based optional callbacks (`beforeExecute`, `afterExecute`, `onError`).
3. **Composable backend seam**: `CommandBackend` service so local/remote/container runtimes swap cleanly.
4. **Typed contracts**: request/context/plan/result as plain interfaces; errors as `Schema.ErrorClass` tagged types.
5. **Plug-in at layer boundary**: hooks provided via `CommandHooks` service, composed in `server.ts`.

---

## 3. Abstractions

### 3.1 Data contracts

```ts
type CommandInvocationSource = "tool" | "checkpoint_replay" | "schedule" | "integration" | "cli"

interface CommandInvocationContext {
  readonly source: CommandInvocationSource
  readonly agentId?: AgentId
  readonly sessionId?: SessionId
  readonly turnId?: TurnId
  readonly channelId?: ChannelId
  readonly checkpointId?: CheckpointId
  readonly toolName?: ToolName
}

interface CommandRequest {
  readonly command: string
  readonly cwd?: string
  readonly timeoutMs?: number
  readonly outputLimitBytes?: number
  readonly envOverrides?: Readonly<Record<string, string>>
}

interface CommandPlan {
  readonly command: string
  readonly cwd: string
  readonly timeoutMs: number
  readonly outputLimitBytes: number
  readonly env: Readonly<Record<string, string | undefined>>
  readonly fingerprint: string   // SHA-256 of canonical JSON
}

interface CommandPlanPatch {
  readonly cwd?: string
  readonly timeoutMs?: number
  readonly outputLimitBytes?: number
  readonly envAdditions?: Readonly<Record<string, string>>
}

interface CommandResult {
  readonly exitCode: number
  readonly stdout: string
  readonly stderr: string
  readonly truncatedStdout: boolean
  readonly truncatedStderr: boolean
  readonly startedAt: Instant
  readonly completedAt: Instant
}
```

### 3.2 Hook contract

```ts
interface CommandHook {
  readonly id: string

  readonly beforeExecute?: (args: {
    readonly context: CommandInvocationContext
    readonly request: CommandRequest
    readonly plan: CommandPlan
  }) => Effect.Effect<CommandPlanPatch | void, CommandHookError>

  readonly afterExecute?: (args: {
    readonly context: CommandInvocationContext
    readonly request: CommandRequest
    readonly plan: CommandPlan
    readonly result: CommandResult
  }) => Effect.Effect<void>

  readonly onError?: (args: {
    readonly context: CommandInvocationContext
    readonly request: CommandRequest
    readonly plan: CommandPlan | null
    readonly error: CommandExecutionError
  }) => Effect.Effect<void>
}
```

`CommandPlanPatch` is intentionally narrow:
- May adjust `timeoutMs` and `outputLimitBytes` — **only tighter** than core max.
- May add env keys — **cannot override existing** keys.
- May adjust `cwd` — **only if still inside workspace** after realpath resolution.
- **Cannot mutate `command`** in v1.

### 3.3 Services

1. **`CommandHooks`** — returns ordered hook list. Default: `[CommandPolicyHook]`.
2. **`CommandBackend`** — executes a validated `CommandPlan`. Default stub returns `CommandBackendUnavailable`.
3. **`CommandRuntime`** — orchestrates validation → hooks → backend → post-hooks.

```ts
interface CommandRuntimeService {
  readonly execute: (params: {
    readonly context: CommandInvocationContext
    readonly request: CommandRequest
  }) => Effect.Effect<CommandResult, CommandExecutionError>
}
```

---

## 4. Execution Pipeline

1. **Build base plan** from request (defaults + bounds + fingerprint).
2. **Core validation**:
   - Non-empty command
   - cwd resolved with realpath + parent walk fallback + workspace check
   - Timeout/output limits clamped to positive finite values
   - Env overrides validated against blocked keys/prefixes/patterns
3. **Run `beforeExecute` hooks** in deterministic (array) order.
   - Each hook receives the progressively patched plan from prior hooks.
   - After each patch: re-validate constraints, reject if widened, recompute fingerprint.
4. **Execute via `CommandBackend`**.
5. **Run `afterExecute` hooks** in parallel (non-blocking, errors swallowed).
6. On failure, **run `onError` hooks** in parallel (non-blocking, errors swallowed).

**Security invariant**: steps 2 and 3 are mandatory. Hooks cannot bypass core guards.

---

## 5. Integration

### 5.1 ToolExecution

- `ToolExecutionService` is a facade; `executeShell` delegates to `CommandRuntime.execute`.
- `mapCommandErrorToToolFailure()` translates all 7 error variants to `ToolExecutionFailure` codes.
- No direct process spawning in `ToolExecution`.

### 5.2 ToolRegistry

- `shell_execute` tool handler builds `CommandInvocationContext` from governed execution context:
  - `source`: `"checkpoint_replay"` when replaying approved checkpoints, otherwise `"tool"`
  - Populates `agentId`, `sessionId`, `turnId`, `channelId`, `checkpointId`, `toolName`

### 5.3 Layer wiring (server.ts)

```
ToolExecution
  └─ CommandRuntime
      ├─ CommandHooks (default = [CommandPolicyHook])
      ├─ CommandBackendLocal
      │   └─ ChildProcessSpawner
      └─ FileSystem, Path
```

Test layer factories mirror this wiring with `NodeServices.layer` instead of `BunServices.layer`.

---

## 6. Plugin API

```ts
import { makeCommandHook } from "./command/CommandHooks.js"
import { withAdditionalCommandHooks } from "./command/hooks/CommandHooksDefault.js"

const hook = makeCommandHook({
  id: "audit-command",
  afterExecute: ({ context, plan, result }) =>
    Effect.logInfo("command.executed", {
      source: context.source,
      toolName: context.toolName,
      cwd: plan.cwd,
      exitCode: result.exitCode
    })
})

// Extend defaults (keeps CommandPolicyHook + adds yours):
export const MyCommandHooksLayer = withAdditionalCommandHooks([hook])
```

---

## 7. Error Model

Tagged errors (`Schema.ErrorClass`, Effect v4) with explicit handling:

| Error | Surfaced | Role |
|-------|----------|------|
| `CommandValidationError` | Yes | Bad request |
| `CommandWorkspaceViolation` | Yes | Path escape (includes requested/resolved paths) |
| `CommandHookRejected` | Yes | Hook blocked command (includes hookId) |
| `CommandBackendUnavailable` | Yes | No backend |
| `CommandSpawnFailed` | Yes | Spawn syscall failed |
| `CommandTimeout` | Yes | Exceeded time limit (includes timeoutMs) |
| `CommandExecutionFailed` | Yes | Post-spawn failure |
| `CommandHookError` | No (internal) | Caught and wrapped into `CommandHookRejected` |

All surfaced errors are in the `CommandExecutionError` union and mapped to `ToolExecutionFailure` at the `ToolExecution` boundary.

---

## 8. Built-in Hooks

### CommandPolicyHook (`id: "command-policy"`)

`beforeExecute` — validates commands against configurable deny lists:
- **Source-aware**: enforced for `"tool"`, `"checkpoint_replay"`, `"schedule"`, `"integration"`; `"cli"` exempt by default
- **Denied executables** (16): `sudo`, `su`, `doas`, `pkexec`, `shutdown`, `reboot`, `halt`, `poweroff`, `launchctl`, `systemctl`, `service`, `init`, `telinit`, `mkfs`, `fdisk`, `sfdisk`, `diskutil`, `parted`
- **Denied patterns** (5): fork bomb, `rm -rf /`, raw disk `dd`, `curl|sh`, `wget|sh`
- **Shell parsing**: handles quoting, escapes, pipes, `&&`/`||`/`;`, env assignments, `env` prefix
- Null byte rejection
- Fully configurable via `makeCommandPolicyHook()`

### AuditCommandHook (`id: "audit-command"`)

`afterExecute` + `onError` — structured logging for observability. Not in default layer (available for opt-in).

### CommandHooksDefault

- `DefaultCommandHooks` — frozen array: `[CommandPolicyHook]`
- `CommandHooksDefaultLayer` — provides `CommandHooks` with defaults
- `withAdditionalCommandHooks(hooks)` — extends defaults with custom hooks

---

## 9. Testing Model

1. **Unit tests** (7): Pipeline ordering, error paths, constraint enforcement, workspace symlink escape.
2. **Policy hook tests** (7): Denied executables, regex patterns, env assignment parsing, source-aware enforcement, custom config.
3. **Integration tests** (2 new in ToolRegistry): End-to-end policy rejection, context propagation.
4. **Property tests** (3, `fast-check`): Path traversal rejection (75 runs), fingerprint determinism (60 runs), output truncation bounds (30 runs with real backend).
5. **E2e test layer updates**: ChatFlow and TurnProcessingWorkflow tests wire command layers.

---

## 10. Out of Scope (v1)

- Command rewriting hooks (`command` immutable in `CommandPlanPatch`).
- Hook-triggered checkpoint creation (`RequireApproval`) from runtime layer.
- PTY / background process manager.
- Output redaction hook (deferred to v2).

---

## 11. Reference Alignment

Combines strengths from three reference harnesses:

1. **From OpenClaw**: fail-closed core checks and binding-friendly execution plan model.
2. **From Pi**: pluggable backend seam and simple extension surface.
3. **From OpenCode**: deterministic serial execution ergonomics.

Explicitly avoids:
1. Prefix-only safe-command bypass logic.
2. Coarse path-scoped persistent approvals.
3. Hook paths that can bypass core runtime guards.

---

## 12. Decision Summary

1. Hooks are a **runtime extension layer**, not a governance replacement.
2. API is small and object-based (`makeCommandHook` + `withAdditionalCommandHooks`).
3. All critical safety checks live in core runtime, before and after hook influence.
4. External behavior stable — pluggable behavior is internal to the command subsystem.
