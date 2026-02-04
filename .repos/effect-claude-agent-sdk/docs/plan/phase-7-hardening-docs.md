# Phase 7 - Hardening, Docs, Examples

Status: Source Dive Updated (Effect Test + Vitest Reference)

## Objectives
- Expand tests for schema correctness and streaming lifecycle.
- Provide README and example usage with Bun.
- Add integration tests and CI hooks.
- Add a Bun-native Effect test harness with TestContext defaults.

## Scope
- Unit tests for Schema roundtrip and error mapping.
- Integration tests for streaming queries, interrupts, and MCP tools.
- Documentation and example programs.
- Cross-phase test hardening for earlier modules (streaming, hooks, sessions, config).

## Effect Modules to Apply
- `TestClock`, `TestContext`, `TestServices`
- `Effect.gen`, `Effect.exit`, `Effect.timeout`
- Optional `@effect/vitest` adapters (if needed)
- `TestLive` for real-time sections (when needed)
- `Layer` and `Scope` for test runtime setup
- `Cause.prettyErrors`, `Fiber.interrupt` (failures + cleanup)

## Effect Source Review Targets (Refine After Source Dive)
- `.reference/effect/packages/effect/src/TestClock.ts`
- `.reference/effect/packages/effect/src/TestContext.ts`
- `.reference/effect/packages/effect/src/TestServices.ts`
- `.reference/effect/packages/vitest/src/index.ts`
- `.reference/effect/packages/vitest/src/internal/internal.ts`
- `.reference/effect/packages/effect/src/TestLive.ts`

## Source Dive Findings
### TestClock + TestContext
- `TestClock` provides `adjust`, `setTime`, and `sleep`; deterministic time tests require forking fibers before `adjust`.
- `TestContext` is a `Layer` that merges `TestServices` with live default services.
- Test warnings are emitted when time-based effects run without advancing the TestClock.

### TestServices + Live
- `TestServices` exposes `provideLive` for segments that need real services.
- `TestServices` layers are scoped; use them in test runtime creation.
- Use `provideLive` for real-time waits or console output; keep default tests in TestContext.

### @effect/vitest Reference (Not Required for Bun)
- `@effect/vitest` builds a runtime by `Effect.provide(TestContext)` and uses `Effect.runPromise` with interrupt-on-test-finish.
- It runs effects inside a forked fiber, joins the exit, and surfaces failures via `Cause.prettyErrors`.

## Refined Plan
### 7.1 Test Harness (Bun)
- Build a local helper to run `Effect` tests under Bun:
  - Provide `TestContext` layer by default.
  - Fork the effect and join its `Exit` to surface failures and defects.
  - Ensure cleanup by interrupting the fiber on test completion or timeout.
  - Use `Cause.prettyErrors` to surface primary failure and log the rest.
  - Provide a `runLive` helper that uses `TestServices.provideLive` for real-time sections.
- Use `bun:test` (`test`, `expect`) and keep assertions minimal and explicit.

### 7.2 Unit Tests
- Schema roundtrip tests: `Schema.decodeUnknown` + `Schema.encodeUnknown` for every exported schema.
- JSON Schema generation tests: compare against known shapes (no `$defs` ordering dependence).
- Error mapping tests: ensure malformed input/output map to typed error classes.

### 7.3 Integration Tests (No External CLI)
- Use a stub `spawnClaudeCodeProcess` that returns a fake `SpawnedProcess`:
  - `stdin`/`stdout` are `Writable`/`Readable` streams to simulate the CLI protocol.
  - deterministic message scripts for `SDKMessage` output and control responses.
  - simulate hook callback control requests and cancels.
- Validate streaming lifecycles:
  - `streamInput` wait-for-first-result behavior.
  - interrupt handling and proper scope cleanup.
- MCP behavior tests via mock control requests (no real MCP server required).

### 7.4 Cross-Phase Test Hardening
- Phase 2: `AgentSdkConfig` config provider tests (env and parse errors).
- Phase 3: `QueryHandle` timeouts and broadcast/share lifetimes via `TestClock`.
- Phase 4: hook cancellation and error mapping under `AbortSignal`.
- Phase 5: session stream single-consumer semantics and close behavior.
- Phase 6: rate limiting delay/fail, queue retry, cache TTL, event log writes (all with TestClock).

### 7.4 Examples + Docs
- README sections: quick start, streaming, hooks, tools, MCP, sessions, and testing.
- `examples/` scripts that run under Bun with minimal configuration.
- Add a "Testing" section that explains TestClock usage and provides a sample.

## Deliverables
- `docs/README.md` usage guide
- `examples/*` (basic query, streaming query, tool handler)
- Test suite using `bun test`

## Exit Criteria
- Core flows tested and documented.
- Examples run under Bun with minimal config.

## Risks and Open Questions
- Decide whether to add `@effect/vitest` or keep tests in Bun only.
- Bun test runner lacks built-in Effect helpers; we must maintain a small local harness.
- Fake `SpawnedProcess` must implement Node `Readable`/`Writable` interfaces to satisfy the SDK.
