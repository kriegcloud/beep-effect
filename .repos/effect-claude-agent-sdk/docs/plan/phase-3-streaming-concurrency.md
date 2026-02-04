# Phase 3 - Streaming and Concurrency

Status: Source Dive Updated (Effect Stream)

## Objectives
- Provide streaming output as `Stream<SDKMessage, AgentSdkError>`.
- Implement streaming input with backpressure using `Queue`.
- Add proper lifecycle handling and interruption semantics.

## Scope
- `QueryHandle` wrapper over SDK `Query` async generator.
- Input stream adapter for multi-turn `streamInput`.
- Clean shutdown semantics (interrupt, close input, finalizers).

## SDK Surface Covered
- `Query` async generator
- `Query.interrupt`, `setPermissionMode`, `setModel`, `setMaxThinkingTokens`
- `streamInput` for multi-turn input streaming

## Effect Modules to Apply
- `Stream.fromAsyncIterable`, `Stream.asyncScoped`
- `Queue` for bounded input
- `Deferred` for session readiness and control request ack
- `Scope`, `Effect.acquireUseRelease`, `Effect.ensuring`
- `Fiber` for background readers and hook execution
- `PubSub` for fan-out of stream events (optional)
- `Stream.toAsyncIterableEffect` / `Stream.toAsyncIterableRuntime` for feeding SDK `streamInput`
- `Stream.fromQueue` / `Stream.toQueueOfElements` for bridging between Queue and Stream
- `Effect.forkScoped` for background streaming tasks tied to scope

## Effect Source Review Targets (Refine After Source Dive)
- `.reference/effect/packages/effect/src/Stream.ts`
- `.reference/effect/packages/effect/src/StreamEmit.ts`
- `.reference/effect/packages/effect/src/Queue.ts`
- `.reference/effect/packages/effect/src/Deferred.ts`
- `.reference/effect/packages/effect/src/Scope.ts`
- `.reference/effect/packages/effect/src/Fiber.ts`
- `.reference/effect/packages/effect/src/Effect.ts`
- `.reference/effect/packages/effect/src/internal/stream.ts`

## Source Dive Findings (Phase 3 Refinements)
- `Stream.fromAsyncIterable` acquires the iterator in a scope and calls `iterator.return()` on finalization when available. This is appropriate for wrapping the SDK `Query` async generator and ensures proper cleanup.
- `Stream.toAsyncIterableRuntime` runs the stream on a runtime and interrupts the fiber when the consumer calls `return()`. Use `Stream.toAsyncIterableEffect` to capture dependencies and feed SDK `streamInput`.
- `Stream.asyncScoped` registers an `emit` callback that uses `Runtime.runPromiseExit`; non-interrupt failures throw, so registration effects should be wrapped to avoid unhandled errors.
- `Stream.fromQueue` and `Stream.toQueueOfElements` provide safe queue bridging with optional shutdown behavior. Prefer `toQueueOfElements` when you need explicit end-of-stream signaling with `Exit`.
- `Queue.Dequeue` extends `Effect` and has `shutdown` / `isShutdown` semantics; `Queue.offer` can suspend under backpressure, so `send` should be `Effect`-based and optionally `forkScoped` for non-blocking sends.
- `Effect.forkScoped` ties background fibers to the local scope, matching the desired lifecycle of streaming readers and input writers.

## API Conventions (Phase 3 Output)
- `QueryHandle.stream` returns `Stream<SDKMessage, AgentSdkError, never>` created via `Stream.fromAsyncIterable` with SDK error mapping.
- `QueryHandle.stream` is single-consumer by default; re-running the stream requires an explicit broadcast layer.
- `QueryHandle.send` and `QueryHandle.sendAll` are `Effect` methods that offer to a bounded queue; `QueryHandle.closeInput` shuts down the queue.
- `QueryHandle.sendForked` uses `Effect.forkScoped` to enqueue without blocking the caller.
- `QueryHandle.share` and `QueryHandle.broadcast` are scoped effects for multi-subscriber output.
- Use `Scope.addFinalizer` or `Effect.ensuring` to interrupt the SDK query and shutdown input queues on scope close.

## Concurrency and Backpressure Policy
- Default input queue capacity: small bounded (e.g., 16) with `Queue.bounded` to exert backpressure.
- For fire-and-forget input, provide an optional `sendForked` helper using `Effect.forkScoped`.
- For multi-subscriber output, optionally expose `Stream.share` or `Stream.broadcast` with configurable `maximumLag` and an internal queue to preserve ordering.

## Deliverables
- `src/Query.ts` with `QueryHandle` API
- Input queue adapter and `send` helpers
- Stream adapters and optional multi-subscriber support
- `src/internal/streaming.ts` for queue/stream/async-iterable bridge helpers
- `src/internal/queryHandle.ts` for wrapping SDK queries into `QueryHandle`

## Exit Criteria
- Streaming queries emit `SDKMessage` as `Stream`.
- Input queue supports backpressure and clean shutdown.
- Interrupt and finalize behavior is deterministic.
- AsyncIterable input is correctly closed on scope exit.

## Risks and Open Questions
- Handling SDK partial messages and keep-alive events consistently.
- Multi-subscriber behavior for long-running streams.
- Decide if `asyncScoped` is needed for custom emit pipelines, or if `fromAsyncIterable` is sufficient.
