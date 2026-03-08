# Parallelization Research: RLM Performance Optimization

## Current Architecture Analysis

### Command Processing: Sequential Scheduler Loop

The scheduler processes commands via `Stream.runForEach` (Scheduler.ts:864-874):

```ts
yield* Stream.fromQueue(runtime.commands).pipe(
  Stream.runForEach((command) =>
    processCommand(command).pipe(...)
  )
)
```

This processes **one command at a time**. While this simplifies state management, it serializes all work across all active calls. A `CodeExecuted` event for call A must wait until a `GenerateStep` for call B finishes before being processed.

### LLM Concurrency: Global Semaphore

The LLM semaphore (Runtime.ts:42) allows up to `config.concurrency` (default 4) concurrent LLM API calls:

```ts
const llmSemaphore = yield* Effect.makeSemaphore(config.concurrency)
```

Used via `withLlmPermit` in Budget.ts. This is the only point where true concurrency exists for LLM calls. However, since the scheduler loop is sequential, concurrent LLM calls can only happen when multiple bridge calls are in flight simultaneously (because `handleExecuteCode` forks sandbox execution and `handleHandleBridgeCall` forks bridge calls into the call scope).

### Bridge Call Concurrency: Per-Sandbox Semaphore

Each sandbox instance has a `bridgeSemaphore` (SandboxBun.ts:262):

```ts
const bridgeSemaphore = yield* Effect.makeSemaphore(config.maxBridgeConcurrency) // default 4
```

Bridge calls are forked into a `FiberSet` (SandboxBun.ts:192):

```ts
return FiberSet.run(bridgeFibers)(
  bridgeSemaphore.withPermits(1)(
    bridgeHandler.handle({ method, args, callerCallId })
  )
)
```

This means the sandbox worker CAN have multiple bridge calls in flight simultaneously. The worker side uses a `pendingBridge` map to track them. **However**, the LLM-generated code typically uses sequential `for...of` with `await`, never `Promise.all`.

### Sandbox: One Process Per Call

Each `StartCall` creates a fresh `Bun.spawn` subprocess. There is no sandbox reuse or pooling.

### The Primary Bottleneck

The biggest performance issue is **not** in our infrastructure -- it's in the model-generated code. When the LLM writes:

```js
for (const chunk of __vars.chunks) {
  const out = await llm_query("...", chunk)  // Sequential!
  analyses.push(out)
}
```

Each `llm_query` call goes through:
1. Sandbox worker sends `BridgeCall` IPC frame
2. SandboxBun dispatches to `BridgeHandler`
3. BridgeHandler enqueues `HandleBridgeCall` command
4. Scheduler processes it (sequentially)
5. Scheduler forks a one-shot LLM call
6. LLM API call completes
7. Result returns through bridge deferred
8. **Only then** does the `for` loop advance to the next iteration

With 8 chunks, this means 8 sequential LLM API calls, each waiting for the previous to complete.

---

## Reference RLM: How Zhang et al. Handle Parallelism

The reference RLM implementation (Zhang et al.) provides `llm_query_batched` alongside `llm_query`:

```python
# Sequential (like our current llm_query)
result = llm_query(query, context)

# Parallel (uses asyncio.gather under the hood)
results = llm_query_batched(
  [query1, query2, query3],
  [context1, context2, context3]
)
```

Implementation uses `asyncio.gather` + `ThreadingTCPServer`:
- The sandbox communicates with the host via a TCP socket server
- `llm_query_batched` sends all queries at once, the host processes them concurrently
- `asyncio.Semaphore` limits concurrent API calls
- Results are gathered and returned as an array

This is the **highest-impact** parallelization opportunity.

---

## Proposed Improvements (Prioritized)

### 1. Add `llm_query_batched` / `Promise.all` Pattern (HIGH IMPACT)

**What**: Expose `llm_query_batched(queries, contexts)` in the sandbox that fires all sub-calls concurrently.

**Why**: This is the single biggest win. 8 sequential llm_query calls taking ~5s each = 40s. With batching at concurrency 4, that drops to ~10s (2 batches of 4).

**How it maps to Effect**:

```ts
// In bridge handler, a new method "llm_query_batched"
const results = yield* Effect.forEach(
  queries.map((q, i) => ({ query: q, context: contexts[i] })),
  ({ query, context }) =>
    withLlmPermit(rlmModel.generateText({ prompt: buildOneShotPrompt(...), depth })),
  { concurrency: config.concurrency }
)
```

**Implementation approach**:
1. Add `llm_query_batched` as a new bridge method in `sandbox-worker.ts`
2. Worker sends a single `BridgeCall` with method `"llm_query_batched"` and array args
3. Scheduler handler uses `Effect.forEach` with `{ concurrency }` to parallelize
4. All sub-calls share the existing LLM semaphore for rate limiting
5. Update system prompt to document `llm_query_batched` and encourage its use

**Sandbox worker side**:
```js
// Exposed to LLM-generated code
async function llm_query_batched(queries, contexts) {
  // Send single bridge call, host parallelizes internally
  return await __bridge("llm_query_batched", [queries, contexts])
}
```

**Alternative**: Expose `Promise.all` pattern directly:
```js
const results = await Promise.all(
  chunks.map(chunk => llm_query("analyze this", chunk))
)
```

This already works with our bridge architecture! Multiple concurrent bridge calls are supported. But the model rarely generates this pattern unprompted. We should:
- a) Document `Promise.all` with `llm_query` in the system prompt
- b) Add `llm_query_batched` as a convenience function
- c) Update the few-shot example to use batched calls

### 2. Prompt-Level Encouragement of Parallel Patterns (HIGH IMPACT, LOW EFFORT)

**What**: Update `SystemPrompt.ts` to show `Promise.all` / `llm_query_batched` patterns.

**Current example** (SystemPrompt.ts ~155-165):
```js
// Sequential pattern shown in example
for (const chunk of __vars.chunks) {
  const out = await llm_query("...", chunk)
  analyses.push(out)
}
```

**Proposed example**:
```js
// Parallel pattern — fires all queries concurrently
const analyses = await Promise.all(
  __vars.chunks.map(chunk =>
    llm_query("Identify main political themes. Return short bullet points.", chunk)
  )
)
__vars.analyses = analyses
print(analyses.join('\n---\n'))
```

### 3. Parallel Command Processing in Scheduler (MEDIUM IMPACT)

**What**: Process independent commands concurrently instead of sequentially.

**Current**: `Stream.runForEach` — strictly sequential.

**Proposed**: Use key-based concurrency where commands for the same `callId` are sequential but different `callId`s can be parallel:

```ts
yield* Stream.fromQueue(runtime.commands).pipe(
  Stream.mapEffect(
    (command) => processCommand(command).pipe(...),
    { key: (command) => command.callId, concurrency: "unbounded" }
  ),
  Stream.runDrain
)
```

**Risk**: State mutations (callStates map, budget ref) are already atomic via `Ref`, so concurrent processing should be safe. But need to verify:
- Budget operations are atomic (`Ref.modify`)
- Call state operations are per-callId (no cross-call dependencies)
- Event ordering may change (cosmetic, not functional)

**Effect pattern**: `Stream.mapEffect` with `key` parameter partitions by key and runs partitions concurrently while maintaining order within each partition. This is exactly what we need.

### 4. Sandbox Pool / Reuse (LOW IMPACT for single-call, HIGH for multi-call)

**What**: Pool sandbox processes instead of spawning a new one per call.

**Current**: `SandboxFactory.create()` spawns a fresh `Bun.spawn` for every call.

**Effect pattern**:
```ts
const sandboxPool = yield* Pool.make({
  acquire: () => createSandboxInstance(...),
  size: 4
})
```

**Why this is lower priority**: For single-query workloads, there's only one root call and sub-calls at max_depth are one-shot (no sandbox). The pool would only matter for:
- Multi-call scenarios (batch mode)
- Deep recursion (max_depth >= 2 where sub-calls get their own sandboxes)

**When to revisit**: If we add a batch API or commonly use max_depth >= 2.

### 5. Tiered LLM Semaphore (LOW IMPACT)

**What**: Different concurrency limits for root vs sub-call LLM requests.

**Rationale**: Root-level LLM calls (the main REPL loop) should have priority over sub-call LLM requests, since root calls drive the pipeline forward while sub-calls are speculative work.

**Effect pattern**:
```ts
const rootSemaphore = yield* Effect.makeSemaphore(2)
const subCallSemaphore = yield* Effect.makeSemaphore(config.concurrency)

const withLlmPermit = (effect, depth) =>
  depth === 0
    ? rootSemaphore.withPermits(1)(effect)
    : subCallSemaphore.withPermits(1)(effect)
```

**Why lower priority**: The current global semaphore works fine. Root calls are infrequent (one per iteration), while sub-calls happen in bursts during code execution. The global semaphore naturally handles this.

### 6. Streaming LLM Responses (LOW IMPACT on throughput)

**What**: Stream LLM responses so code extraction can start before the full response arrives.

**Current**: `rlmModel.generateText()` returns the complete response.

**Why lower priority**: The bottleneck is sub-call latency, not generation latency. Streaming would improve perceived responsiveness (useful for CLI UX) but not throughput.

---

## Implementation Roadmap

### Phase 1: Prompt + `Promise.all` (Lowest effort, highest impact)

1. Update the few-shot example in `SystemPrompt.ts` to use `Promise.all` pattern
2. Add documentation of `Promise.all` with `llm_query` in the system prompt
3. Verify that concurrent bridge calls work correctly with existing infrastructure

**Expected improvement**: 3-5x speedup on chunk-based semantic analysis (the most common pattern)

### Phase 2: `llm_query_batched` Convenience Function

1. Add `llm_query_batched` function to `sandbox-worker.ts`
2. Add bridge handler support for batched calls
3. Use `Effect.forEach({ concurrency })` for parallel dispatch
4. Update system prompt to document the new function

**Expected improvement**: Further encourages parallel patterns; slightly faster than Promise.all since it's a single bridge roundtrip

### Phase 3: Parallel Scheduler (requires careful testing)

1. Replace `Stream.runForEach` with `Stream.mapEffect` + key-based concurrency
2. Verify atomicity of all shared state operations
3. Add integration tests for concurrent command processing

**Expected improvement**: Meaningful only when multiple calls are active (recursive sub-calls, batch mode)

### Phase 4: Advanced Optimizations (future)

- Sandbox pooling via `Pool`
- Tiered semaphores
- Streaming responses
- Speculative execution (start code extraction before response completes)

---

## Effect Patterns Reference

| Pattern | API | Use Case |
|---------|-----|----------|
| Parallel forEach | `Effect.forEach(items, fn, { concurrency: N })` | Batched llm_query calls |
| Key-partitioned stream | `Stream.mapEffect(fn, { key, concurrency })` | Parallel scheduler by callId |
| Semaphore | `Effect.makeSemaphore(N)` | Rate-limiting LLM API calls |
| Pool | `Pool.make({ acquire, size })` | Sandbox process reuse |
| FiberSet | `FiberSet.make()` + `FiberSet.run(set)(effect)` | Track concurrent bridge fibers |
| Deferred | `Deferred.make()` | Bridge call request/response pairing |
| Ref (atomic) | `Ref.modify(ref, fn)` | Thread-safe budget counters |
| Fork with scope | `Effect.forkIn(effect, scope)` | Bridge calls tied to call lifecycle |

---

## Key Architectural Insight

The existing infrastructure already supports concurrent bridge calls:
- `pendingRequests` map in SandboxBun tracks multiple in-flight requests
- `bridgeSemaphore` limits concurrent bridge calls per sandbox
- `FiberSet` manages bridge call fibers
- `BridgeHandler` creates independent `Deferred` per request

The gap is at the **prompt level**: the model generates sequential code. The highest-leverage fix is teaching the model to use `Promise.all` (zero infrastructure changes needed) and adding `llm_query_batched` as a convenience.

---

## Verification Plan

1. **Baseline**: Run semantic query with 2k clean fixture, record time and call pattern
2. **After prompt change**: Same query, verify `Promise.all` is used, measure speedup
3. **After batched API**: Same query with `llm_query_batched`, measure speedup
4. **Stress test**: 10k fixture with many chunks, verify no race conditions
5. **Budget enforcement**: Verify batched calls still respect `maxLlmCalls` budget
