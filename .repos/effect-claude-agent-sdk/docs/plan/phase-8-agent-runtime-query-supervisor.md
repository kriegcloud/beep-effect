# Phase 8: Agent Runtime + Query Supervisor

## Goals

- Provide a single, composable `AgentRuntime` layer that wires `AgentSdk`, policies, tooling, and observability.
- Add a `QuerySupervisor` service to manage query lifecycles, concurrency, and cleanup.
- Make running queries safe-by-default (scoped, bounded, observable).

## Non-Goals

- No new SDK features beyond orchestration.
- No breaking changes to existing `AgentSdk.query` surface.

## Effect Modules to Leverage

- `Context`, `Layer`, `Scope`: service wiring and lifecycles.
- `Fiber`, `FiberMap`, `Supervisor`: managing running queries and tracking child fibers.
- `Pool` or `Semaphore`: concurrency limits and resource gating.
- `Queue`, `PubSub`, `Deferred`: pending query queue and lifecycle events.
- `Schedule`, `Effect.retry`, `Effect.timeout`, `Stream.timeout`: policy controls.
- `Metric`, `Logger`, `Effect.withSpan`: observability and tracing.
- `Config`, `Schema`: runtime configuration.

## Runtime Utilities & Patterns (Effect Reference Notes)

- `FiberMap.makeRuntime`: create a keyed run function backed by a FiberMap; use `onlyIfMissing` to dedupe.
- `FiberMap.awaitEmpty`: graceful shutdown (wait for all running queries).
- `Supervisor.track`: capture live fibers for debugging/inspection.
- `Pool.make`: fixed-size pool with `targetUtilization` for dynamic acquisition behavior.
- `Queue.bounded`: backpressure with power-of-two capacities for best performance.
- `PubSub.bounded|dropping|sliding`: broadcast lifecycle events to multiple subscribers.
- `Effect.withSpan`: trace query lifecycle phases with tags.
- `Metric.counter`, `Metric.histogram`: counts and latency tracking for queries.

## Phase 8.1 — Service Design + Config

Deliverables:
- `src/AgentRuntime.ts` (service tag + layer).
- `src/QuerySupervisor.ts` (service tag + layer).
- `src/AgentRuntimeConfig.ts` and `src/QuerySupervisorConfig.ts`.
- Schemas for configs, defaults, and env-loading layers.

Design notes:
- `QuerySupervisor` should accept `AgentSdk` as a dependency and expose `submit` and `submitStream`.
- `AgentRuntime` should compose `AgentSdk`, `QuerySupervisor`, policy layers, and optional caches.
- Use `Schema.Struct` for config types, `Config` for env binding.
- Config fields to define:
  - `concurrencyLimit` (default e.g. 4).
  - `pendingQueueCapacity` (power-of-two recommended).
  - `pendingQueueStrategy` (`suspend` | `dropping` | `sliding`).
  - `maxPendingTime` (timeout for enqueued submissions).
  - `queryTimeout` (overall timeout).
  - `firstMessageTimeout` (TTFB timeout).
  - `retryPolicy` (schedule configuration).
  - `emitEvents` (enable lifecycle event bus).
  - `metricsEnabled` / `tracingEnabled`.

Acceptance criteria:
- Service tags compile, layers compose, config defaults are documented.
- No behavior change until Phase 8.2.

## Phase 8.2 — Query Supervisor (Core)

Core API sketch:
- `submit(prompt, options?) => Effect<Scoped<QueryHandle>>`
- `submitStream(prompt, options?) => Stream<SDKMessage, AgentSdkError>`
- `stats => Effect<QuerySupervisorStats>`
- `interruptAll => Effect<void>`

Implementation details:
- Track active queries in `FiberMap` and expose `stats` from `FiberMap.size`.
- Use `Pool.make` (or `Semaphore`) to gate concurrent query starts.
- Model pending queue with `Queue.bounded` + `Deferred` for request/response pairing.
- Use `FiberMap.makeRuntime` to run per-query fibers with stable keys (queryId).
- Ensure cleanup with `Effect.addFinalizer` (always call `closeInput` + `interrupt`).
- Provide structured errors for: queue overflow, pending timeout, query timeout.

Acceptance criteria:
- Limits enforced deterministically; queries cleaned on scope exit.
- Tests cover: max concurrency, pending queue, cancel/interrupt, cleanup.

Lifecycle details:
- `submit` returns a scoped handle and registers finalizers in the same scope.
- `submitStream` uses `Stream.unwrapScoped` to guarantee query cleanup when the stream scope closes.
- When pending queue is enabled, a worker fiber drains the queue and starts queries.
- Use `Supervisor.track` to expose debug endpoints (`listRunning`, `dump`).

## Phase 8.3 — Agent Runtime (Composition + Policies)

Core API sketch:
- `query(prompt, options?) => Effect<Scoped<QueryHandle>>`
- `stream(prompt, options?) => Stream<SDKMessage, AgentSdkError>`
- Optional helpers: `queryCached`, `queryWithTools`, `queryWithAudit`.

Composition:
- `AgentSdk.layerDefaultFromEnv` + `QuerySupervisor.layerDefault`.
- Policy layer for: retries, timeouts, budgets.
- Optional integrations: `PersistedCache`, `EventLog`, `RateLimiter`.

Policy details:
- Use `Effect.timeout` for overall query timeout.
- Use `Stream.timeout` (or `Effect.timeout` on `Stream.runHead`) for time-to-first-message.
- Use `Effect.retry` with `Schedule.exponential` + `Schedule.recurs` for retry policy.

Acceptance criteria:
- AgentRuntime offers a single dependency for typical usage.
- Default policies are safe but configurable.

## Phase 8.4 — Observability + Event Hooks

Add metrics and tracing:
- `Metric.counter` for queries started/completed/failed.
- `Metric.histogram` for latency and time-to-first-message.
- `Effect.withSpan` for query lifecycles with tags (queryId, model, mode).

Optional event bus:
- `PubSub` for query lifecycle events (started, streaming, completed, failed).
- Define `QueryEvent` Schema for serialization and testing.

Acceptance criteria:
- Metrics available via service; logs annotate query IDs.
- Tests verify events/metrics increments.

## Phase 8.5 — Docs + Examples

- Add `examples/agent-runtime-basic.ts`.
- Add `examples/query-supervisor-concurrency.ts`.
- Document config options and recommended policies in `README.md`.

## Testing Notes

- Use `TestClock` to simulate timeout and backoff behavior.
- Use `TestServices.provideLive` for runtime-sensitive tests.
- Add concurrency tests around queue backpressure and `Pool`/`Semaphore` gating.

## Open Questions

- Default concurrency limit: fixed (e.g., 4) or CPU-based?
- Pending queue strategy: suspend vs dropping (backpressure policy)?
- Should `QuerySupervisor` expose `Stream` for lifecycle events by default?
- Do we want a lightweight `AgentRuntime.queryScoped` helper to encourage scoped usage explicitly?
