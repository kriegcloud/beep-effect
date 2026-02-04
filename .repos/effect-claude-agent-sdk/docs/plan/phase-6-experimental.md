# Phase 6 - Experimental Enhancements

Status: Source Dive Updated (Effect Experimental)

## Objectives
- Integrate optional experimental modules for rate limiting and persistence.
- Provide opt-in layers that do not affect core APIs.
- Add deterministic tests that use Effect testing services (TestClock/TestContext).

## Scope
- Rate limiting for tool calls and query budgets.
- Persisted queues for durable input streams and background tasks.
- Caching for metadata (supported commands/models).
- Optional event log or journal for audit trails.
- Deterministic tests for experimental wrappers (no real-time sleeps).

## Effect Modules to Apply
- `@effect/experimental/RateLimiter`
- `@effect/experimental/PersistedQueue`
- `@effect/experimental/PersistedCache`
- `@effect/experimental/EventLog` and `EventJournal`
- `@effect/experimental/Persistence` (for Backing/Result persistence)
- `@effect/platform/KeyValueStore` (for persistence backends)
- `effect/Cache` and `effect/Duration` (cache behavior)
- `effect/TestClock`, `effect/TestContext`, `effect/TestServices` (deterministic testing)

## Effect Source Review Targets (Refine After Source Dive)
- `.reference/effect/packages/experimental/src/RateLimiter.ts`
- `.reference/effect/packages/experimental/src/PersistedQueue.ts`
- `.reference/effect/packages/experimental/src/PersistedCache.ts`
- `.reference/effect/packages/experimental/src/EventLog.ts`
- `.reference/effect/packages/experimental/src/EventJournal.ts`
- `.reference/effect/packages/experimental/src/Persistence.ts`

## Source Dive Findings
### RateLimiter
- `RateLimiter.consume` supports `fixed-window` and `token-bucket` algorithms with `onExceeded: "delay" | "fail"`.
- `RateLimitExceeded` and `RateLimitStoreError` are tagged errors; unioned as `RateLimiterError`.
- `makeWithRateLimiter` wraps any Effect and sleeps for the computed delay when `onExceeded: "delay"`.
- Requires a `RateLimiterStore` service; a memory store layer is provided (`layerStoreMemory`).

### PersistedQueue
- `PersistedQueue` encodes/decodes values via `Schema.encodeUnknown` and `Schema.decodeUnknown`.
- `take` is `uninterruptibleMask` with a scoped finalizer to requeue on failure (non-interrupt) until `maxAttempts`.
- The memory store uses a latch + set; duplicate IDs are ignored.
- Requires `PersistedQueueStore`; memory store is available but not durable across restarts.

### PersistedCache + Persistence
- `PersistedCache` combines an in-memory `Cache` with a persistent `ResultPersistence` store.
- Misses load via `lookup`, then persist the `Exit` in the backing store.
- Requires `ResultPersistence`, which itself requires `BackingPersistence`.
- `Persistence` provides memory and `KeyValueStore`-backed layers for `BackingPersistence`.

### EventLog + EventJournal
- `EventLog` is built on `EventJournal`, `Identity` (stored in `KeyValueStore`), `Registry`, and `Reactivity`.
- `EventLog.write` serializes payloads with MsgPack schemas and runs handlers under a semaphore.
- `EventJournal` provides `entries`, `write`, `changes`, and `destroy`.
- `EventJournal` ships with memory and IndexedDB backends; IndexedDB is browser-only.

## Refined Plan
### 6.1 Rate Limiting Layer
- Provide optional `RateLimiter` layer with memory store by default.
- Expose helpers to rate limit per-session, per-tool, and per-endpoint (keys: sessionId/toolName).
- Support `fail` and `delay` strategies; default to `delay` for tool calls.
- Tests: use `TestClock.adjust` to validate `delay` behavior and `fail` errors.

### 6.2 PersistedQueue for Input Streams
- Add an opt-in queue-backed input adapter for `Query`/`Session` message sending.
- Default to memory store; document that durable stores require a custom `PersistedQueueStore`.
- Ensure decode failures surface as typed errors (ParseError).
- Tests: requeue on failure, `maxAttempts` exhaustion, no real-time sleeps.

### 6.3 PersistedCache for Metadata
- Cache `supportedCommands`, `supportedModels`, and `accountInfo`.
- Provide `ResultPersistence` layer choices: memory or KeyValueStore-backed.
- Keep TTLs conservative (short default) to avoid stale metadata.
- Tests: TTL expiry and invalidation using `TestClock` + memory persistence.

### 6.4 EventLog / EventJournal for Audit Trails
- Offer an optional `EventLog` layer with a minimal `EventGroup` for tool usage, permission decisions, and hook events.
- Default to memory `EventJournal` in Bun; document IndexedDB as browser-only.
- Keep audit logging in a separate module to avoid coupling core SDK usage.
- Tests: write + entries roundtrip with memory journal and deterministic clock.

### 6.5 Integration Guardrails
- Experimental modules live under `src/experimental/*` and are never required by core APIs.
- Expose a single feature toggle or layer bundle for easy adoption.
- Document dependency expectations (e.g., `@effect/experimental` peer dep, KeyValueStore backend).
- Testing harness is defined in Phase 7; Phase 6 tests should target it.

## Deliverables
- `src/experimental/RateLimiter.ts` (optional layer)
- `src/experimental/PersistedQueue.ts` (optional layer)
- `src/experimental/PersistedCache.ts` (optional layer)
- `src/experimental/EventLog.ts` (optional layer)
- Tests for experimental wrappers using TestClock/TestContext

## Exit Criteria
- Optional layers compile and can be provided without touching core APIs.
- Basic examples demonstrate rate limiting and persistence with Bun.

## Risks and Open Questions
- Experimental APIs may change, so keep adapters minimal and isolated.
- Durable persistence requires custom backends; memory defaults are not restart-safe.
- EventJournal IndexedDB backend is not usable in Bun; consider additional backends later.
