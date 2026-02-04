# Effect Ecosystem Extensions for Claude Agent SDK Wrapper

This document surveys the Effect packages already present in this repo and outlines high-leverage abstractions that can build on the current wrapper to make it feel like a native Effect subsystem.

## Survey of Effect Packages in This Repo

Core `effect` modules to leverage:
- `Stream`, `Channel`, `Sink`: model agent output as typed event streams with backpressure.
- `Queue`, `Hub`, `PubSub`: coordinate fan-out, prompt injection, and event buses.
- `Fiber`, `FiberMap`, `Supervisor`: manage running queries and background tasks.
- `Scope`, `Pool`: deterministic lifecycle and session pooling.
- `Schedule`, `Effect.retry`, `Effect.timeout`: policy-driven retries/timeouts.
- `Metric`, `Logger`, `Effect.withSpan`: structured observability.
- `Config`, `Redacted`, `Secret`: environment and secrets management.

Effect packages already installed:
- `@effect/platform` and `@effect/platform-bun`: `HttpApi`, `HttpClient`, `FileSystem`, `KeyValueStore`, Bun runtime + server modules.
- `@effect/experimental`: `RateLimiter`, `PersistedQueue`, `PersistedCache`, `EventLog`/`EventJournal`.
- `@effect/workflow`: durable workflows, activities, durable clock/queue/deferred.
- `@effect/rpc`: typed RPC requests with streaming responses.
- `@effect/sql`: `SqlClient`, `SqlPersistedQueue`, `SqlEventJournal`, `SqlEventLogServer`.
- `@effect/cluster`: distributed workflow engines and cluster-based execution.
- `@effect/cli`, `@effect/printer`: user-facing CLI/console integration.

## High-Leverage Abstractions to Build Next

0) Ergonomics + DX Polish (priority)
- Goal: make the wrapper feel "one-call" for common use cases.
- Focus: small helpers over new subsystems.
- Examples:
  - `AgentRuntime.runText(prompt, options?)` -> final result string.
  - `QueryHandle` helpers: `collectResult`, `collectMessages`, `tapConsole`.
  - `Message` builders: `Prompt.text(...)`, `Prompt.user(...)`.
  - Stream filters: `MessageStream.assistant`, `MessageStream.results`.
  - `AgentRuntime.withDefaults(options)` to bind default options.

1) AgentRuntime (composed service)
- Goal: one Layer that wires `AgentSdk`, tooling, policies, caches, and observability.
- Use: `Layer.mergeAll`, `Context.Tag`, `Logger`, `Metric`, `Config`.
- Benefits: single entrypoint for apps, consistent defaults, predictable lifecycle.

2) QuerySupervisor + QueryPool
- Goal: manage many concurrent queries safely with limits and cleanup.
- Use: `FiberMap` for running queries, `Pool` for concurrency control, `Scope` for lifecycle.
- Benefits: prevents runaway queries, central policy control, easy cancel/interrupt.

3) SessionPool + SessionManager
- Goal: reuse or lease sessions (if supported) with TTL and safe shutdown.
- Use: `Pool`, `SynchronizedRef`, `Scope`, `Schedule`.
- Benefits: faster reuse, bounded resource usage, clear concurrency semantics.

4) AgentWorkflow (durable flows)
- Goal: long-lived, resumable multi-step agents (human-in-the-loop, approvals).
- Use: `@effect/workflow` `Workflow.make`, `Activity`, `DurableQueue`, `DurableDeferred`, `DurableClock`.
- Benefits: durable execution, replayable state, easier orchestration of user input.

5) AgentService (RPC + HTTP)
- Goal: expose `query`/`stream` as a network service with typed clients.
- Use: `@effect/rpc` for request/stream APIs; `@effect/platform` `HttpApi` for HTTP.
- Benefits: service boundary, streaming clients, generated docs/clients.

6) ToolRegistry + ToolPolicies
- Goal: consolidate tool definitions, metadata, and policies (limits, auth, scopes).
- Use: existing `Tools.Toolkit`, plus `Config`, `RateLimiter`, `Context` for dependencies.
- Benefits: consistent tool validation, custom policies per tool/session.

7) AgentEventBus + Audit
- Goal: first-class event stream for tool use, permissions, hooks, and messages.
- Use: `EventLog` + `EventJournal`, `Stream`, `Hub`, `SubscriptionRef`.
- Benefits: observability, analytics, replay, compliance logging.

8) Persisted Memory and Metadata
- Goal: persistent caches for models, commands, account info, and transcripts.
- Use: `PersistedCache`, `PersistedQueue`, `SqlPersistedQueue`, `SqlClient`.
- Benefits: durability, shared cache across processes, lower SDK cost.

9) Policy Layer (timeouts, retries, budgets)
- Goal: codify query/tool policies as a composable Layer.
- Use: `Schedule`, `Effect.retry`, `Effect.timeout`, `Metric` for budget tracking.
- Benefits: centralized governance, easier ops tuning.

10) Sandbox + Isolation Utilities
- Goal: isolate tool execution and side effects.
- Use: `@effect/platform-bun` `BunWorker`, `BunCommandExecutor`, `FileSystem`.
- Benefits: safer tool execution, better resource isolation.

## Supporting Utilities Worth Adding

- Agent message parsing helpers: transform `SDKMessage` into typed views (result, assistant, tool).
- Result helpers: extract `SDKResultSuccess` and final text from a stream or handle.
- Prompt builders: concise constructors for `SDKUserMessage` payloads.
- Typed `AgentEvent` model + `Stream` combinators for filtering and fold-based state.
- `QueryReplay` utilities: persist stream events for deterministic replays/tests.
- "Replayable" prompts via `PersistedQueue` and `SqlPersistedQueue`.
- Metrics package: counters for tool calls, tokens, time-to-first-byte, failures.
- Tracing spans around query phases with `Effect.withSpan`.

## Testing and Hardening

- Introduce a dedicated `TestHarness` module that provides:
  - Deterministic clock control (`TestClock`) for timeouts/retries.
  - Test rate limiter and cache layers.
  - Mocked tool registry and hook handlers.
- Build conformance tests for:
  - Query lifecycle: scope closure, interrupt propagation, stream termination.
  - Tool policies: rate limits, failure modes, validation errors.
  - Event log correctness and ordering.

## Suggested Implementation Order

1) Ergonomics + DX polish (helpers and stream utilities).
2) AgentRuntime service + Policy Layer (foundation for user experience).
3) QuerySupervisor/Pool + SessionPool (resource control and safety).
4) AgentWorkflow (high-value durable orchestration).
5) AgentService (RPC/HTTP surface area).
6) EventBus/Audit + Persistence expansions.

## Notes on Optional Additions

- If `@effect/ai` is added later, it can slot into the same Layer stack for
  embeddings, chunking, and retrieval, but it is not currently installed.
