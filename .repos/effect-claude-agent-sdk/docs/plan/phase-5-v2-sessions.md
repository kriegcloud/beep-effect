# Phase 5 - v2 Session Wrappers

Status: Source Dive Updated (SDK + Effect)

## Objectives
- Provide `SessionHandle` that wraps v2 session APIs with scoped lifecycle.
- Expose streaming output and message sending via Effect.

## Scope
- `unstable_v2_createSession`, `unstable_v2_prompt`, `unstable_v2_resumeSession`.
- Session close and cleanup on scope exit.

## SDK Surface Covered
- `SDKSession` interface
- `SDKSessionOptions`

## Effect Modules to Apply
- `Scope` and `Effect.acquireRelease` for lifecycle management
- `Stream.fromAsyncIterable` for session message streams
- `Deferred` for session ID readiness
- `Ref` or `SynchronizedRef` to manage session stream state
- `Semaphore` or `Mutex` to prevent concurrent stream consumption

## Effect Source Review Targets (Refine After Source Dive)
- `.reference/effect/packages/effect/src/Scope.ts`
- `.reference/effect/packages/effect/src/Stream.ts`
- `.reference/effect/packages/effect/src/Deferred.ts`

## Source Dive Findings
### SDK v2 Session Behavior
- `SessionImpl` uses a single `Query` and a shared async iterator; `stream()` reuses the same iterator and returns after the first `result` message.
- `sessionId` is only available after the first `system:init` message; resumed sessions set `_sessionId` immediately.
- `send()` enqueues a user message onto an internal input stream; when the input stream is done, the query ends.
- `close()` sets `closed`, completes the input stream, and aborts the controller.
- `unstable_v2_prompt` is a convenience wrapper that creates a session, sends once, drains until a `result`, and disposes.
- Session options are limited versus `query()` options: no MCP config, no sandbox options, no file checkpointing, and no `settingSources`.
- `permissionMode` defaults to `"default"` and only supports safe modes; `allowDangerouslySkipPermissions` is not exposed.
- `executable` supports `"bun"` or `"node"`; default is auto-detected in SDK.
- Internal `Stream` (SDK util) can only be iterated once; second iteration throws.

### Effect Resource Patterns
- `Scope.addFinalizer` and `Effect.acquireRelease` are the core patterns for session close safety.
- `Stream.fromAsyncIterable` should be used to wrap the session async generator; interruption should call iterator `return()` via scope finalizer.
- `Deferred` is appropriate for exposing `sessionId` once the init message arrives.

## Concurrency Policy Analysis
- The SDK output stream is single-consumer. The underlying async iterator throws if iterated twice, and `SessionImpl.stream()` reuses a cached iterator. This means we must enforce a single in-flight stream consumer.
- Backpressure is implicit in the SDK: if no one consumes the iterator, messages queue inside the SDK stream. Adding a background pump would change semantics and can cause unbounded buffering.
- `send()` is logically independent of `stream()` (it enqueues into the input stream). Concurrent `send()` calls can interleave, so ordering is only deterministic if we serialize.
- `close()` aborts the controller and ends the input stream. Any concurrent `send()` or `stream()` should fail fast or complete cleanly.
- `sessionId` becomes available only when the init message is observed; without a consumer, it should remain pending to match SDK behavior.

## Recommended Policy (Default)
- **Single stream consumer**: guard `stream()` with a `Semaphore(1)` or `SynchronizedRef` state; reject or block additional stream attempts.
- **No background pumping**: do not read messages unless the caller is consuming the stream; this preserves SDK backpressure and avoids extra buffering.
- **Serialized sends**: wrap `send()` in a `Semaphore(1)` to guarantee deterministic ordering; fail if the session is closed.
- **Close wins**: `close()` transitions state to closed; `send()` and `stream()` return a typed `SessionClosed` error thereafter.
- **Session ID semantics**: `sessionId` resolves only after the init message is consumed by the stream; document this and provide a helper that starts a stream if users need eager session ID.

## Refined Plan
### 5.1 SessionHandle API
- Provide `SessionHandle` with:
  - `send` (Effect) for `string | SDKUserMessage`.
  - `stream` (Stream) that yields until the next `result` message, mirroring SDK behavior.
  - `sessionId` (Effect) backed by `Deferred`, completed on first `system:init` message.
  - `close` (Effect) and `scoped` constructor using `Effect.acquireRelease`.

### 5.2 Concurrency and Ordering
- Guard `stream()` so only one consumer runs at a time; enforce with `Semaphore(1)` or fail fast if already streaming.
- Decide whether `send()` should be allowed while a stream is active; default to SDK-compatible permissive behavior, document the risk.
- Provide a `streamAll` or `messages` stream only if we can preserve correctness and backpressure.

### 5.3 Config and Defaults
- Define `SessionConfig` schema mirroring `SDKSessionOptions` (subset of `Options`), with required `model`.
- Default `executable` to `"bun"` to align with repo policy.
- Keep `permissionMode` to safe values (`default`, `acceptEdits`, `plan`, `dontAsk`) per SDK v2 options.
- Make `hooks` and `canUseTool` optional, using Phase 4 adapters.

### 5.4 Interop Helpers
- `prompt` helper wrapping `unstable_v2_prompt` as an Effect.
- `resumeSession` wrapper that yields a `SessionHandle` with pre-filled `sessionId`.

## Deliverables
- `src/Session.ts` with `SessionHandle`
- Session layer helpers for default configuration

## Exit Criteria
- v2 sessions can be created, streamed, and closed under `Scope`.
- Session lifecycle is deterministic with no resource leaks.

## Risks and Open Questions
- v2 APIs are unstable and may require API guards or feature flags.
- Unclear behavior for concurrent `send` and `stream` calls; document or enforce a policy.
- Session stream ends after `result`; confirm that consumers expect per-turn streaming semantics.
