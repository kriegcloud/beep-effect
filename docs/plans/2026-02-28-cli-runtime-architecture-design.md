# CLI Runtime Architecture Design

**Date**: 2026-02-28  
**Status**: Proposed (multi-agent panel synthesis)  
**Goal**: Introduce a reusable, Effect-native `CliRuntime` infrastructure service for process execution semantics that can be reused by tooling, scheduler actions, and future integrations.

---

## 1. Panel Summary

Multi-agent review covered:
1. Current codebase integration seams and migration risk.
2. Reference harness behavior (`openclaw`, `opencode`, `pi`).
3. Effect-native service/layer design constraints.

Key conclusions:
1. Keep `CommandRuntime` as policy/validation orchestrator; move process lifecycle mechanics into `CliRuntime`.
2. Prefer argv-first execution (`command + args`) in low-level runtime; treat shell execution as explicit and constrained.
3. Reuse Effect process primitives (`ChildProcess`, `ChildProcessSpawner`) with scoped collection, deterministic timeout/kill semantics, and bounded output.
4. Preserve existing call chain so external behavior stays stable while internals become reusable.

References:
- [`CommandRuntime.ts`](/Users/pooks/Dev/personal-agent/packages/server/src/tools/command/CommandRuntime.ts)
- [`CommandBackendLocal.ts`](/Users/pooks/Dev/personal-agent/packages/server/src/tools/command/CommandBackendLocal.ts)
- [`ToolExecution.ts`](/Users/pooks/Dev/personal-agent/packages/server/src/tools/ToolExecution.ts)
- [`ToolRegistry.ts`](/Users/pooks/Dev/personal-agent/packages/server/src/ai/ToolRegistry.ts)
- [`SchedulerActionExecutor.ts`](/Users/pooks/Dev/personal-agent/packages/server/src/scheduler/SchedulerActionExecutor.ts)

---

## 2. Architecture Fit

### Current execution path (unchanged externally)
1. `ToolRegistry.runGovernedTool` handles governance + idempotency + audit.
2. `ToolExecution.executeShell` delegates to `CommandRuntime`.
3. `CommandRuntime` validates + hooks + backend delegation.
4. `CommandBackendLocal` executes process.

### Target execution path
1. `ToolRegistry` and `ToolExecution` remain unchanged at boundary.
2. `CommandRuntime` remains unchanged as policy/planning envelope.
3. `CommandBackendLocal` becomes a thin adapter over `CliRuntime`.
4. `CliRuntime` owns spawn/stream/truncate/timeout/kill/cancel lifecycle.

This preserves contracts while centralizing execution mechanics for reuse.

---

## 3. Design Principles

1. **Reusable Infrastructure, Minimal API**  
   Runtime API should be small and context-agnostic.
2. **Effect-native Semantics**  
   Scoped resources, typed errors, layer-provided dependencies, deterministic interruption.
3. **Argv-first Core**  
   Low-level runtime executes structured commands; shell mode stays explicit.
4. **Policy Outside Mechanical Runtime**  
   Governance/policy stays in orchestrators (`CommandRuntime`, `ToolRegistry`, scheduler policy checks).
5. **Deterministic Bounded Output**  
   Byte-limited stdout/stderr with explicit truncation flags and marker.

---

## 4. Proposed Service Model

### 4.1 Contracts

```ts
type CliInvocationMode = "Argv" | "Shell"

interface CliRunRequest {
  readonly mode: CliInvocationMode
  readonly command: string
  readonly args?: ReadonlyArray<string> // required when mode = "Argv"
  readonly cwd: string
  readonly env: Readonly<Record<string, string | undefined>>
  readonly timeoutMs: number
  readonly idleTimeoutMs?: number
  readonly outputLimitBytes: number
}

interface CliRunResult {
  readonly pid: number | null
  readonly exitCode: number
  readonly stdout: string
  readonly stderr: string
  readonly truncatedStdout: boolean
  readonly truncatedStderr: boolean
  readonly startedAt: Instant
  readonly completedAt: Instant
}

interface CliRuntimeService {
  readonly run: (request: CliRunRequest) => Effect.Effect<CliRunResult, CliRuntimeError>
}
```

### 4.2 Service Tag

Use existing project pattern:
1. `ServiceMap.Service<...>()("server/tools/cli/CliRuntime", { make })`
2. `static layer = Layer.effect(this, this.make)`
3. Optional `fromExecution(...)` helper for tests/mocks.

---

## 5. Error Model

Add a dedicated error algebra (Schema-tagged):

1. `CliValidationError { reason }`
2. `CliRuntimeUnavailable { reason }`
3. `CliSpawnFailed { reason }`
4. `CliTimeout { timeoutMs }`
5. `CliIdleTimeout { idleTimeoutMs }`
6. `CliExecutionFailed { reason }`

Mapping into command-domain stays in adapter layer:
1. `CliSpawnFailed -> CommandSpawnFailed`
2. `CliTimeout|CliIdleTimeout -> CommandTimeout`
3. `CliExecutionFailed -> CommandExecutionFailed`

---

## 6. Runtime Semantics

### 6.1 Spawn
1. Use `ChildProcess.make(command, args, options)` for argv mode.
2. Use `ChildProcess.make(command, options with shell: true)` only for explicit shell mode.
3. Always provide explicit `cwd`, `env`, `stdout: "pipe"`, `stderr: "pipe"`.

### 6.2 Output collection
1. Collect stdout/stderr concurrently with `Deferred` + `forkScoped`.
2. Byte-accurate truncation via `TextEncoder`/`TextDecoder`.
3. Return truncation flags and marker-appended output.

### 6.3 Timeouts and cancellation
1. Overall timeout via `Effect.timeoutOption`.
2. Optional idle/no-output timeout (phase 2 hardening).
3. On timeout/interruption: send `SIGTERM`, then forced kill after grace interval.
4. Keep all collectors/process handles scoped.

### 6.4 Determinism
1. Include `startedAt` and `completedAt` in result.
2. Preserve partial output on timeout/error when possible.

---

## 7. Integration Points

### 7.1 Command stack
1. Keep `CommandRuntime` unchanged.
2. Replace internals of `CommandBackendLocal` with `CliRuntime.run`.

### 7.2 Tool stack
1. Keep `ToolExecution.executeShell` unchanged contract-wise.
2. Continue context propagation from `ToolRegistry`.

### 7.3 Scheduler/integration reuse
1. Add schedule command action path in `SchedulerActionExecutor` through `CommandRuntime` with `source: "schedule"`.
2. Use same runtime for integration/CLI contexts when those paths are introduced.

---

## 8. Layer Graph (Target)

```text
ToolRegistry
  -> ToolExecution
      -> CommandRuntime
          -> CommandHooks
          -> CommandBackendLocal (adapter)
              -> CliRuntimeLocal
                  -> ChildProcessSpawner
```

`CliRuntimeLocal` becomes reusable by non-command services without duplicating process logic.

---

## 9. Security and Governance Boundaries

1. `CliRuntime` handles mechanical safety (timeouts, bounded outputs, termination behavior).
2. `CommandRuntime` remains source-aware policy boundary for command requests.
3. `ToolRegistry` remains governance boundary for tool invocations.
4. Scheduler should explicitly define approval behavior for `ExecuteSchedule` outcomes (`Allow`, `Deny`, `RequireApproval`) instead of silently treating unknown/approval-required states as success.

---

## 10. Reference Alignment

Adopt:
1. `openclaw`-style argv-first process discipline and robust kill semantics.
2. `openclaw`/`pi`-style bounded output ergonomics.
3. Existing Effect scoped runtime pattern already present in `CommandBackendLocal`.

Avoid:
1. Global persistent shell singleton state.
2. Shell-first execution for all operations.
3. Prefix-based allowlist heuristics as sole security mechanism.

---

## 11. Non-goals (v1)

1. PTY/session multiplexing.
2. Background job orchestration API.
3. Full approval checkpoint generation at `CliRuntime` layer.
4. Rich live streaming protocol beyond bounded final outputs.

---

## 12. Decision

Proceed with:
1. Introducing `CliRuntime` as a first-class infrastructure service.
2. Refactoring `CommandBackendLocal` into adapter-only logic.
3. Keeping orchestration/policy in existing layers.
4. Using this runtime as the foundation for upcoming CLI-backed tools (`file_ls`, `file_find`, `file_grep`) with structured argv execution.
