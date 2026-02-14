# Hook Utilities and Subagent Tracking - Spec

Status: Draft

## Summary
Add hook-focused utilities to the Effect wrapper that make it easier to build
observability and lifecycle helpers (tool use, subagents) without introducing a
mandatory service. The utilities should remain opt-in, purely functional by
default, and safe under scoped concurrency.

## Goals
- Provide composable, declarative helpers for building `Options.hooks`.
- Expose hook events as Effect `Stream`s with correct scoping and backpressure.
- Provide generalized tool use tracking from hook events.
- Provide subagent tracking and best-effort correlation with task notifications.
- Keep APIs small, stable, and non-invasive to core query/session services.

## Non-Goals
- No per-subagent process control (SDK does not expose it).
- No reimplementation of SDK hooks or transport.
- No global, mandatory hook registry service unless explicitly opted in.

## Current Surface Area (Baseline)
- Hook types + schemas: `src/Schema/Hooks.ts`.
- Hook adapters: `src/Hooks/Hook.ts` (`callback`, `matcher`).
- Subagent signals via hooks: `SubagentStart`, `SubagentStop`.
- Task tool inputs: `src/Schema/ToolInput.ts` (`AgentInput`).
- Task notification messages: `src/Schema/Message.ts` (`SDKTaskNotificationMessage`).
- Permission callback carries `agentID` in `src/Schema/Permission.ts`.

## Constraints and Observations
- `Options` merge is shallow (`src/internal/options.ts`), so hook maps can be
  overwritten when combining options.
- `QueryHandle.stream` is single-use; derived streams must be shared/broadcast.
- SDK exposes subagent lifecycle only via hooks and task notifications.
- Correlating `task_id` to `agent_id` is best-effort; Task tool responses are
  `unknown` in schemas today.

## Effect Patterns to Leverage (from source)
- `PubSub` + `Stream.fromPubSub` for event buses with backpressure
  (`node_modules/effect/src/PubSub.ts`, `node_modules/effect/src/Stream.ts`).
- `Stream.groupByKey` + `GroupBy.evaluate` for keyed substreams
  (`node_modules/effect/src/Stream.ts`, `node_modules/effect/src/GroupBy.ts`).
- `SubscriptionRef` for state with change streams
  (`node_modules/effect/src/SubscriptionRef.ts`).
- `SynchronizedRef` for safe concurrent Map state (already used in codebase).
- `FiberMap` for scoped keyed fibers when needed.

## Proposed Additions

### 1) Hook Map Composition Helpers (Pure)
Provide small helpers to build/merge `Options.hooks` without overwriting.

API sketch:
```ts
export type HookMap = Partial<Record<HookEvent, ReadonlyArray<HookCallbackMatcher>>>

export const mergeHookMaps: (...maps: ReadonlyArray<HookMap>) => HookMap
export const withHooks: (options: Options, hooks: HookMap) => Options
export const withHook: (event: HookEvent, matcher: HookCallbackMatcher) => HookMap
```

Notes:
- `mergeHookMaps` concatenates matchers per event.
- `withHooks` deep-merges `options.hooks` instead of replacing.
- Enables safe composition across modules.

### 2) Hook Registry Builder (Effectful, but not a service)
Let users register Effect hook handlers in a declarative builder, then emit
hook callbacks + hook map on `build`.

API sketch:
```ts
type HookRegistry = {
  add: (event: HookEvent, handler: HookHandler<any>, matcher?: string, timeout?: DurationInput) => Effect.Effect<void>
  build: Effect.Effect<HookMap>
}

export const makeRegistry: Effect.Effect<HookRegistry, never, Scope.Scope>
```

Notes:
- Internally uses `Hooks.callback` and `Hooks.matcher`.
- Keeps concurrency safe; only returns pure `HookMap` to pass to `Options`.

### 3) Hook Event Stream Adapter (Scope-bound)
Turn hook callbacks into a typed event stream using `PubSub`.

API sketch:
```ts
type HookStream = {
  hooks: HookMap
  events: Stream<HookInput>
}

export const withHookStream: (
  config?: { bufferSize?: number; strategy?: "suspend" | "dropping" | "sliding" }
) => Effect.Effect<HookStream, never, Scope.Scope>
```

Notes:
- `hooks` contains callbacks that publish to a `PubSub`.
- `events` is built from `Stream.fromPubSub` and is scoped.
- This is the core building block for tool/subagent tracking.

### 4) Generalized Tool Use Tracking
Model tool lifecycle as a typed event stream built from hook events.

Event model sketch:
```ts
type ToolUseEvent =
  | { _tag: "ToolStarted"; toolUseId: string; toolName: string; startedAt: number; input: unknown }
  | { _tag: "ToolSucceeded"; toolUseId: string; toolName: string; endedAt: number; output: unknown }
  | { _tag: "ToolFailed"; toolUseId: string; toolName: string; endedAt: number; error: string }
```

Implementation outline:
- Use `withHookStream` and filter to `PreToolUse`, `PostToolUse`, `PostToolUseFailure`.
- Track in-flight tool calls in a `SynchronizedRef<Map<string, ToolState>>`.
- Emit `ToolUseEvent` stream; optionally compute durations.

### 5) Subagent Tracking (Best-effort)
Provide a small helper that builds on `withHookStream` + message stream.

Event model sketch:
```ts
type SubagentEvent =
  | { _tag: "SubagentStarted"; agentId: string; agentType: string; startedAt: number }
  | { _tag: "SubagentStopped"; agentId: string; stoppedAt: number; transcriptPath: string }
  | { _tag: "TaskNotification"; taskId: string; status: "completed" | "failed" | "stopped"; summary: string }
```

Implementation outline:
- `SubagentStarted/Stopped` from hook inputs.
- `TaskNotification` from `handle.stream` filtering `SDKTaskNotificationMessage`.
- Expose `byAgentId` using `Stream.groupByKey`.
- Optional decode of Task tool responses (best-effort) to link task ids.

### 6) Optional Layer (If Needed)
If we need a shared process-wide hook bus for multiple queries, provide an
optional layer:

```ts
export class HookBus extends Context.Tag("...")<HookBus, {
  publish: (input: HookInput) => Effect.Effect<void>
  events: Stream<HookInput>
}>() { static layer: Layer.Layer<never, never, Scope.Scope> }
```

This would be opt-in and not required for core APIs.

## Concurrency and Scope Semantics
- All adapters that create streams or PubSub require `Scope.Scope`.
- Use `Stream.share` or `Stream.broadcastDynamic` to avoid consuming a
  `QueryHandle.stream` more than once.
- Ensure `PubSub.shutdown` and subscription cleanup on scope close.
- Avoid leaking fibers by tying all background work to the caller scope.

## Open Questions
- Should hook utilities be `experimental` or stable on first release?
- Do we expose `SubagentEvent` via hooks only, or require a handle stream too?
- How do we safely decode Task tool output for `task_id` correlation?
- Should `withHooks` also deep-merge `options.hooks` on the v2 session options?

## Proposed Path
1. Add `Hooks` helper functions (`mergeHookMaps`, `withHooks`, `withHook`).
2. Add `Hooks` registry builder (effectful, scope-bound).
3. Add `HookStream` adapter (PubSub-backed).
4. Add `ToolUseEvent` helper (hook-driven).
5. Add `SubagentEvent` helper (hook + stream).
6. Document usage in `docs` and add one example.
