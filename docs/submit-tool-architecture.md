# SUBMIT Tool Architecture v2: Effect-Native Runtime Tightening

## Purpose

This revision deepens the original plan against the current runtime implementation and Effect primitives.

The goals are:
1. Preserve the existing queue-driven RLM event loop semantics.
2. Move call state and variable introspection to Effect-native data structures and services.
3. Replace fragile text finalization with first-class SUBMIT tool usage.
4. Make failure modes explicit: backpressure, retries, stale variable snapshots, and tool-call fallback behavior.

---

## Runtime Baseline (Current Code)

This is the architecture already present in code and must remain intact:

1. `src/Runtime.ts`
- `RlmRuntimeLive` constructs per-run state in a scoped layer.
- Central shared state includes command queue, event pubsub, budget refs, semaphores, call-state map, and bridge deferred map.

2. `src/Scheduler.ts`
- `runScheduler` enqueues `StartCall` then consumes `Stream.fromQueue(runtime.commands)`.
- `processCommand` dispatches a serialized state machine: `StartCall`, `GenerateStep`, `ExecuteCode`, `CodeExecuted`, `HandleBridgeCall`, `Finalize`, `FailCall`.
- Cleanup is done through explicit scope closure + deferred failure + queue shutdown paths.

3. `src/BridgeHandler.ts`
- Bridge calls from sandbox are converted to scheduler commands and resolved through deferreds.

4. `src/SandboxBun.ts` + `src/sandbox-worker.ts`
- Bun IPC boundary is imperative.
- Host side wraps IPC with Effect (`Queue`, `Deferred`, `Scope`) and enforces timeouts/frame checks.

5. `src/Rlm.ts`
- Each public run (`stream` / `complete`) composes a fresh runtime layer and executes the scheduler.

### Event Loop Invariants To Keep

1. Command processing remains serialized through one scheduler queue consumer.
2. Every bridge request must complete exactly once (resolve or fail).
3. Every call scope must close on finalize/fail/interruption.
4. Runtime resources must be scoped per top-level request.
5. Budget and concurrency gates must remain centralized.

---

## Deep-Dive Findings

The initial architecture draft was directionally correct but under-specified in critical runtime behavior:

1. Variable sync lifecycle was ambiguous.
- It specified `VariablesUpdated` events but not a complete publication contract.
- Failures in `listVariables` had no retry/backoff policy.

2. SUBMIT fallback matrix was unclear.
- Priority ordering existed, but provider capability and mixed-response behavior were not concretely defined.

3. Backpressure semantics were not explicit.
- Command queue strategy was not tied to Effect queue behavior (`bounded` vs `unbounded`).

4. Event-loop cleanup guarantees were not reflected in the plan.
- Existing `Finalize` / `FailCall` lifecycle guarantees need to remain first-class in the architecture.

5. Data structures were not fully Effect-native.
- The draft still relied on JS arrays/maps where `Chunk`/`HashMap` provide better persistence and modeling.

---

## Effect Primitive Guidance (Grounded in `.reference/effect` Source)

From `.reference/effect/packages/effect/src` and `.reference/effect/packages/ai/ai/src`:

1. `Queue`
- `Queue.bounded(capacity)` uses backpressure strategy and can suspend producers when full.
- `Queue.dropping(capacity)` returns `false` when full.
- `Queue.sliding(capacity)` drops older items and returns `true`.
- `Queue.unbounded()` uses an unbounded mutable queue (no practical saturation).

2. `Stream.fromQueue`
- Implemented with `Queue.takeBetween(queue, 1, maxChunkSize)`.
- Shutdown completion happens when `takeBetween` is interrupted and `Queue.isShutdown(queue)` is `true`, then converted to `pull.end()`.
- `shutdown: true` ensures queue shutdown in stream finalization.

3. `PubSub`
- `PubSub.bounded` uses backpressure and retains messages until all subscribers consume.
- Slow subscribers can throttle publishers under bounded/backpressure.
- `PubSub.subscribe` returns `Effect<Queue.Dequeue<A>, never, Scope.Scope>` and must be scoped/closed for cleanup.

4. `Scope` + `Effect.acquireRelease`
- Resource safety depends on proper scope closure (`Scope.close`) or scoped combinators.
- `acquireRelease` is the canonical primitive for sandbox/process and subscription lifecycles.

5. `Ref`
- Use `Ref.modify` / `Ref.updateAndGet` for atomic in-effect state transitions.

6. `Schedule`
- Use explicit schedule combinators for retry geometry (exponential/fixed/spaced + recurrence bounds).

7. `FiberSet` / `FiberMap`
- `FiberSet` is correct for group interruption at scope close.
- `FiberMap` is appropriate only when keyed replacement/cancellation semantics are required.

8. `@effect/ai` tool resolution
- In `LanguageModel.generateText`, `disableToolCallResolution: true` skips handler execution (`resolveToolCalls`) but still decodes tool-call parts against the toolkit response schema.
- Parse failures on tool-call payloads are still surfaced as errors and must be handled by scheduler fallback logic.

---

## Target Architecture (Effect-Native)

## 1. Call State Model

Replace immutable `CallState` snapshots with `CallContext` + Effect-native collections.

```ts
import { Chunk, HashMap, Option, Ref, Scope } from "effect"

export interface VariableSnapshot {
  readonly variables: Chunk.Chunk<VariableMetadata>
  readonly snapshotIteration: number
  readonly syncedAtMs: number
  readonly freshness: "fresh" | "stale"
}

export interface CallContext {
  readonly callId: CallId
  readonly depth: number
  readonly query: string
  readonly context: string
  readonly callScope: Scope.CloseableScope
  readonly sandbox: SandboxInstance
  readonly parentBridgeRequestId: Option.Option<BridgeRequestId>
  readonly tools: Chunk.Chunk<RlmToolAny>
  readonly outputSchema: Option.Option<Schema.Schema.Any>
  readonly outputJsonSchema: Option.Option<object>

  readonly iteration: Ref.Ref<number>
  readonly transcript: Ref.Ref<Chunk.Chunk<TranscriptEntry>>
  readonly variableSnapshot: Ref.Ref<VariableSnapshot>
}

export type CallContextStore = Ref.Ref<HashMap.HashMap<CallId, CallContext>>
```

Why:
1. `Chunk` gives persistent append/update semantics for transcript history.
2. `HashMap` avoids ad-hoc JS map copies in state update code paths.
3. `Option` removes nullable/undefined branching in scheduler logic.

## 2. CallContext Operations

Define ref updates as first-class Effect functions:

1. `appendTranscript(ctx, entry)` uses `Ref.update` + `Chunk.append`.
2. `attachExecutionOutput(ctx, output)` updates only the tail entry.
3. `incrementIteration(ctx)` uses `Ref.updateAndGet`.
4. `readSnapshot(ctx)` and `readTranscript(ctx)` are pure access helpers.

These operations should live in `src/CallContext.ts` and be the only mutation surface used by the scheduler.

## 3. VariableSpace Contract

Create `VariableSpace` as the single host-side API over sandbox variables:

```ts
export interface VariableSpace {
  readonly inject: (name: string, value: unknown) => Effect.Effect<void, SandboxError>
  readonly injectAll: (input: Record<string, unknown>) => Effect.Effect<void, SandboxError>
  readonly read: (name: string) => Effect.Effect<unknown, SandboxError>
  readonly cached: Effect.Effect<VariableSnapshot>
  readonly sync: (reason: "start" | "code-executed" | "extract") => Effect.Effect<VariableSnapshot>
}
```

`sync(reason)` requirements:
1. Call `sandbox.listVariables`.
2. Apply timeout.
3. Retry with explicit schedule.
4. On total failure, mark snapshot `freshness: "stale"` and keep previous values.
5. Publish either `VariablesUpdated` or `VariableSyncFailed` event (see event model below).

Recommended retry policy shape:

```ts
const variableSyncPolicy = Schedule.exponential("50 millis").pipe(
  Schedule.compose(Schedule.recurs(3))
)
```

## 4. Runtime Queue and Backpressure

Current runtime uses an unbounded commands queue. For architecture hardening:

1. Keep scheduler as a single serialized consumer.
2. Do **not** switch blindly to `Queue.bounded` backpressure for `runtime.commands`:
- backpressure suspends `offer`, which can stall the scheduler if it enqueues while full.
3. Choose one explicit overload policy:
- `Queue.unbounded` + soft cap telemetry (`Queue.size` threshold + warning/fail strategy), or
- `Queue.dropping(maxPendingCommands)` / `Queue.sliding(maxPendingCommands)` + explicit handling when offers are dropped.
4. If backpressure is still desired, use timeout/abort policy around producer-side enqueue effects so queue pressure cannot block the event loop indefinitely.

Rationale:
1. Protect against memory growth under stalled model calls or bridge spikes.
2. Align overload behavior with actual Effect queue semantics.

Config addition:
- `maxPendingCommands` (default 1024).
- `commandQueueStrategy` (`"unbounded"` | `"dropping"` | `"sliding"`; default `"unbounded"`).

If migration risk is high, ship as feature flag:
- `commandQueueHardening: boolean` default `false`, then flip after validation.

## 5. Event Model Extensions

Extend `RlmEvent` with explicit variable sync lifecycle.

1. `VariablesUpdated`
- `reason`, `callId`, `depth`, `variables`, `snapshotIteration`, `freshness`.

2. `VariableSyncFailed`
- `reason`, `callId`, `depth`, `message`, `retryCount`, `timedOut`.

Publication contract:
1. Emit after successful `sync("start")` in `handleStartCall`.
2. Emit after `sync("code-executed")` in `handleCodeExecuted`.
3. Emit after `sync("extract")` before forced extract prompt.
4. Emit `VariableSyncFailed` whenever sync path degrades.

This gives renderer/telemetry deterministic visibility.

Emission safety:
1. `runtime.events` currently uses `PubSub.bounded` with backpressure semantics.
2. High-frequency variable events must be best-effort so slow subscribers cannot stall scheduler progress.
3. Apply one of:
- publish with timeout and drop-on-timeout for non-critical telemetry events, or
- route variable telemetry to a dedicated dropping/sliding pubsub channel.

## 6. SUBMIT Tool as Primary Finalization Path

Use native tool calling (`@effect/ai` tool + toolkit) with schema-validated params.

Important `@effect/ai` semantics:
1. `disableToolCallResolution: true` prevents handler execution, but response parts are still schema-decoded against the toolkit tool schemas.
2. Invalid tool-call payloads are decode failures and must be mapped to fallback/fail paths explicitly.

Scheduler response priority remains strict:
1. `SUBMIT` tool call.
2. Code block.
3. Legacy `FINAL(...)` text fallback.
4. Continue loop.

Clarify behavior when both tool call and code are present:
- Always finalize on SUBMIT and ignore code.
- Emit warning event for mixed response for observability.

## 7. Tool Capability Fallback Matrix

Define explicit behavior by provider capability:

1. Provider supports tools + model returns SUBMIT
- Finalize using tool params.

2. Provider supports tools but model ignores SUBMIT instruction
- Continue loop until budget exhaustion, then force SUBMIT on extract.

3. Provider/tooling path returns capability error
- Emit warning and degrade to text `FINAL(...)` mode.
- Keep this fallback in REPL only, with extract still attempting structured path first.

4. Forced extract SUBMIT still absent
- Fail call with `NoFinalAnswerError` and include diagnostic cause.

5. Tool-call payload decode failure (`disableToolCallResolution` still decodes schema)
- Emit warning with parse error context.
- Degrade using the same compatibility path as provider capability failure.

This removes ambiguity in operational behavior.

## 8. Extract Path (Budget Exhaustion)

When `BudgetExhaustedError` occurs:
1. `sync("extract")` variable metadata.
2. Read transcript from `Ref<Chunk<TranscriptEntry>>`.
3. Build extract prompt including variable metadata + freshness.
4. Call model with forced tool choice `{ tool: "SUBMIT" }`.
5. Finalize from SUBMIT params.
6. If no SUBMIT, execute fallback matrix above.

Important:
- Include variable snapshot freshness in prompt (`fresh` or `stale`) so the model understands confidence.

## 9. Sandbox Protocol Extension

Keep protocol extension from v1 with one tightening:

1. `ListVarsRequest` / `ListVarsResult` remains the mechanism.
2. Add stable sorting of returned variable metadata by variable name to improve deterministic tests and output diffs.
3. Keep preview truncation and size metadata.

## 10. Lifecycle and Resource Boundaries

All per-call resources must remain inside call scope:

1. Sandbox instance lifetime (`acquireRelease`).
2. Bridge fibers tracked in scoped container (`FiberSet` now; optionally `FiberMap` later if keyed cancellation is needed).
3. Variable snapshot refs and transcript refs.
4. PubSub subscriptions created by renderer consumers.

On finalize/fail/root interruption:
1. close call scope,
2. resolve/fail pending bridge deferreds,
3. remove call from store,
4. shutdown queue when root call terminal.

---

## Implementation Plan

### Phase 1: State + VariableSpace Foundations

1. Add `src/CallContext.ts` with Effect-native data structures and operations.
2. Add `src/VariableSpace.ts` with `sync(reason)` and retry policy.
3. Replace runtime `callStates` map value type with `CallContext`.
4. Add variable sync lifecycle events.

### Phase 2: SUBMIT Integration

1. Add `src/SubmitTool.ts` (structured/unstructured tool factories).
2. Extend `src/RlmModel.ts` to pass toolkit/toolChoice.
3. Integrate priority ordering and fallback matrix in scheduler.

### Phase 3: Extract Tightening + Prompt Updates

1. Use forced SUBMIT extract path with synced variable metadata.
2. Update REPL and extract system prompts to remove `FINAL(...)` as primary path.
3. Keep legacy fallback only as explicit degraded compatibility mode.

### Phase 4: Backpressure Hardening

1. Introduce explicit command queue strategy option.
2. Add overload warning event + diagnostics.
3. Validate no starvation/regression under concurrent bridge calls.

### Phase 5: Cleanup

1. Remove dead fallback heuristics once structured path proves stable.
2. Remove `CallState` class and remaining copy-on-update transcript logic.

---

## Testing Strategy

## Unit

1. `CallContext` operations over `Chunk` transcript.
2. `VariableSpace.sync` success/retry/timeout/stale cases.
3. `SubmitTool` scanner and schema paths.

## Scheduler Integration

1. SUBMIT finalization path (string and structured output).
2. SUBMIT + code mixed response prioritizes finalize.
3. Code execution path still loops and appends transcript.
4. Budget exhaustion forced extract path.
5. Variable sync events emitted on all required hooks.
6. Degraded capability fallback paths.

## IPC

1. `listVariables` metadata correctness.
2. Deterministic ordering.
3. Preview truncation and size typing.

## Reliability

1. Queue overload behavior (for selected command queue strategy).
2. Root interruption cleans all scopes/bridge deferreds.
3. No call-state leaks after finalize/fail.

---

## Open Decisions

1. Which command queue strategy should be default after hardening (`unbounded`, `dropping`, or `sliding`)?
2. Should degraded text fallback be permanently supported or removed after provider maturity?
3. Do we need `FiberMap` now for keyed bridge tracking, or keep `FiberSet` until concrete keyed-cancel requirements appear?

---

## Source References (This Review Pass)

Primary implementation references used for semantic validation:
1. `.reference/effect/packages/effect/src/internal/queue.ts`
2. `.reference/effect/packages/effect/src/Queue.ts`
3. `.reference/effect/packages/effect/src/internal/pubsub.ts`
4. `.reference/effect/packages/effect/src/PubSub.ts`
5. `.reference/effect/packages/effect/src/internal/stream.ts`
6. `.reference/effect/packages/effect/src/Stream.ts`
7. `.reference/effect/packages/effect/src/Scope.ts`
8. `.reference/effect/packages/effect/src/Effect.ts`
9. `.reference/effect/packages/effect/src/Schedule.ts`
10. `.reference/effect/packages/effect/src/FiberSet.ts`
11. `.reference/effect/packages/effect/src/FiberMap.ts`
12. `.reference/effect/packages/ai/ai/src/LanguageModel.ts`

---

## Summary

The architecture remains queue-driven and scheduler-centric, but becomes materially more Effect-native by:
1. using `CallContext` + `Ref` + `Chunk` + `HashMap` + `Option` as primary state model,
2. treating variable sync as a first-class, evented lifecycle with retry/freshness semantics,
3. making SUBMIT tool flow the canonical finalization path with explicit degraded-mode behavior,
4. aligning backpressure and lifecycle semantics with Effect queue/scope guarantees.
