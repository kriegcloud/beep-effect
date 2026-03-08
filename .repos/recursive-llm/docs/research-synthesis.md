# RLM Research Synthesis for Effect TypeScript Implementation (Evented Runtime)

*Compiled: 2026-02-07*

---

## 1. Core Concept: What is an RLM?

A Recursive Language Model (RLM) is an inference-time strategy that separates context into two spaces:

- Variable space: large external state (sandbox/REPL memory).
- Token space: bounded model context (prompt + selected observations).

The model writes code to navigate variable space and only brings minimal evidence into token space. This is the key mechanism behind long-context robustness.

## 2. Why the architecture must be evented

For long or sequential workloads, the key constraints are not just model quality but runtime predictability:

1. Control-flow determinism under recursive sub-calls.
2. Explicit backpressure under bursty bridge calls.
3. Bounded memory for events, outputs, and pending work.
4. Clean shutdown behavior for child processes and in-flight requests.

A loop-only design is easy to start with but degrades under concurrent `llm_query` usage. An evented scheduler (queue + mailbox + stream) gives predictable behavior.

---

## 3. Reference algorithm vs runtime realization

Canonical RLM algorithm:

1. Load `context` and `query` into sandbox variables.
2. Iterate: generate -> execute code -> observe output.
3. If code calls `llm_query`, run recursive sub-call.
4. Stop on `FINAL(...)`.

Evented runtime realization:

1. Keep algorithm semantics, but route all work through typed commands.
2. Use a single scheduler fiber to mutate state deterministically.
3. Execute external effects (LLM, sandbox IO) in child fibers that return results back as commands.
4. Expose progress as a stream of runtime events.

This preserves RLM behavior while making concurrency and failure handling tractable.

---

## 4. Effect-native architecture mapping

### 4.1 Request-scoped runtime

Each root completion builds a request-local runtime:

```ts
interface RlmRuntime {
  readonly completionId: string
  readonly commands: Queue.Queue<RlmCommand>
  readonly events: PubSub.PubSub<RlmEvent>
  readonly budgetRef: Ref.Ref<BudgetState>
  readonly llmSemaphore: Effect.Semaphore
  readonly callStates: Ref.Ref<Map<CallId, CallState>>
  readonly bridgePending: Ref.Ref<Map<BridgeRequestId, Deferred.Deferred<BridgeResult>>>
}
```

This avoids cross-request state leakage and makes recursion share one consistent budget/concurrency domain.

### 4.2 Command scheduler (deterministic state machine)

All state transitions happen via `RlmCommand` handlers, for example:

- `StartCall`
- `GenerateStep`
- `ExecuteCode`
- `HandleBridgeCall`
- `BridgeResolved`
- `BridgeFailed`
- `Finalize`
- `FailCall`

Scheduler invariant: only one fiber mutates call state.

### 4.3 Primitive roles

- `Queue.bounded`: control-plane ingress with backpressure (suspend strategy).
- `Mailbox.make`: worker IO boundary with explicit end/fail semantics.
- `PubSub.bounded`: fanout for observability consumers.
- `Stream`: primary API for external consumers.

Note: `Mailbox` is currently experimental in Effect; use it at clear stream boundaries and keep core scheduler on `Queue` for stability.

---

## 5. Budget and concurrency invariants

Budget state should be atomic and monotonic:

```ts
interface BudgetState {
  readonly iterationsRemaining: number
  readonly llmCallsRemaining: number
  readonly tokenBudgetRemaining: number | null
}
```

Required invariants:

1. Reserve LLM call budget before every model invocation (root + recursive).
2. Wrap every model invocation with one shared in-request semaphore permit.
3. Record token usage immediately after response.
4. Reject work immediately on budget exhaustion.
5. Perform transitions via `Ref.modify` to avoid race windows.

---

## 6. Sandbox + IPC design requirements

### 6.1 Service boundary

Prefer factory + instance split:

- `SandboxFactory.create(...)` returns a scoped `SandboxInstance`.
- One sandbox instance per call scope.

### 6.2 IPC contract

Use typed message schemas for every frame with correlation IDs.

Host -> worker examples:

- `exec_request`
- `bridge_result`
- `set_var`
- `get_var_request`
- `shutdown`

Worker -> host examples:

- `exec_result`
- `exec_error`
- `bridge_call`
- `get_var_result`
- `worker_log`

### 6.3 Failure handling requirements

1. Per-request timeouts for execute and bridge operations.
2. Frame size limits to avoid memory blowups.
3. Malformed/unknown frame => protocol error + controlled teardown.
4. Exactly one terminal outcome per bridge request.
5. On shutdown/interruption, all pending bridge deferreds are completed/fail-fast.

### 6.4 Execution model caution

Do not assume lexical persistence from repeated `Function` constructor evaluation. Maintain explicit persistent environment state.

---

## 7. Stream-first public API

Prefer:

```ts
interface Rlm {
  readonly stream: (options: CompleteOptions) => Stream.Stream<RlmEvent, RlmError>
  readonly complete: (options: CompleteOptions) => Effect.Effect<string, RlmError>
}
```

`complete` should be implemented as a fold over terminal events from `stream`.

Benefits:

1. Natural fit for long-running sequential work.
2. Better UI/ops observability.
3. No hidden side channels for intermediate progress.

---

## 8. Recommended module layout

```
src/
  RlmError.ts
  RlmConfig.ts
  RlmTypes.ts
  Budget.ts
  Runtime.ts

  CodeExtractor.ts
  SystemPrompt.ts

  Sandbox.ts
  SandboxProtocol.ts
  SandboxBun.ts
  sandbox-worker.ts

  BridgeHandler.ts
  Scheduler.ts
  Rlm.ts
  index.ts
```

---

## 9. Implementation phases

1. Foundation:
   - Errors, config, command/event types, extractors, prompt builder.

2. Runtime primitives:
   - Request runtime constructor, atomic budget transitions.

3. Sandbox/IPC:
   - Protocol schemas, worker, Bun subprocess lifecycle.

4. Scheduler:
   - Command loop and deterministic handlers.

5. RLM semantics:
   - Generation/execution cycle on top of scheduler.
   - Bridge recursion via commands.

6. Observability:
   - Event publication, spans, logs.

7. Hardening/tests:
   - Fault injection, stress, load, lifecycle cleanup.

---

## 10. Verification matrix (required)

1. Unit tests:
   - code extraction + FINAL parsing
   - prompt generation
   - budget transition invariants

2. Scheduler determinism:
   - same command trace => same final state

3. Concurrency stress:
   - parallel bridge calls (`Promise.all`) under bounded semaphore

4. IPC fault injection:
   - malformed/truncated/out-of-order frames
   - worker hangs and timeout enforcement

5. Lifecycle tests:
   - no orphan workers after interruption/failure
   - pending bridge requests always resolve/fail

6. Integration tests:
   - real provider smoke tests (feature-gated)

7. Load tests:
   - sustained long/sequential contexts with bounded memory checks

---

## 11. Security posture

Subprocess-based Bun sandboxing should be treated as best-effort unless hardened isolation is explicitly implemented.

The implementation must document:

1. What capabilities are blocked.
2. What capabilities remain available.
3. Which threat model is supported.

For strict untrusted execution, a stronger backend (container/microVM/wasm isolation) should be offered.

---

## 12. Current dependencies (already installed)

From `/Users/pooks/Dev/recursive-llm/package.json`:

- `@effect/ai`
- `@effect/ai-anthropic`
- `@effect/ai-openai`
- `@effect/ai-google`
- `@effect/platform`
- `effect`

---

## 13. Key sources

- Zhang et al. (2025), Recursive Language Models.
- Isaac Miller, DSPy RLM writeup.
- Local notes:
  - `/Users/pooks/Dev/recursive-llm/docs/rlm_research.md`
  - `/Users/pooks/Dev/recursive-llm/docs/bookmarks-rlm.md`
  - `/Users/pooks/Dev/recursive-llm/isaac-miller-dspy-rlm.md`
- Effect source snapshots:
  - `/Users/pooks/Dev/recursive-llm/.reference/effect/packages/ai/ai/src/`
  - `/Users/pooks/Dev/recursive-llm/.reference/effect/packages/effect/src/`
