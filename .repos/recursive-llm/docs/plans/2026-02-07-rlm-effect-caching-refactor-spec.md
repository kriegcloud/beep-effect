# Recursive LLM Effect-Native Caching Refactor Spec

Date: 2026-02-07
Author: Codex multi-agent review

## 1. Problem Statement

The current recursive LLM runtime has no explicit caching layer. It repeatedly recomputes deterministic work in the scheduler loop and reissues semantically identical recursive calls.

Primary hot paths:

- Prompt reconstruction on every iteration in `src/Scheduler.ts` (`handleGenerateStep`).
- Recursive bridge calls (`llm_query`) always becoming new sub-calls when below depth cap.
- Per-call sandbox and call-state work with no reuse for repeated request shapes.

This increases token spend, latency, and queue pressure for recursive workloads.

## 2. Current Architecture Baseline

Current runtime shape:

- `Rlm.complete/stream` provisions fresh per-run runtime state via `Layer.fresh(RlmRuntimeLive)` in `src/Rlm.ts`.
- `runScheduler` in `src/Scheduler.ts` drives a command queue and recursive sub-calls.
- `RlmModel.generateText` in `src/RlmModel.ts` selects primary/sub model by depth, but does no memoization.
- Budget and concurrency are enforced (`src/Budget.ts`) but cache hits are not possible.

Observed repeated work:

- Repeated `buildReplSystemPrompt` + `buildReplPrompt` in the loop.
- Repeated context preview slicing and tool descriptor mapping.
- Repeated `llm_query` sub-calls for duplicate `(query, context)` pairs.

## 3. Effect Cache Semantics Deep Dive (Source-backed)

### 3.1 `Cache`

`Cache` is concurrent-safe, TTL + capacity bounded, and single-flight per key.

- Contract and behavior: `.reference/effect/packages/effect/src/Cache.ts`
  - LRU eviction and TTL: lines 45-49
  - Concurrent dedupe (single lookup per key): lines 51-53
  - `refresh` semantics (recompute while serving existing): lines 76-84
  - Stats APIs (`hits`, `misses`, `size`): lines 233-237
- Internal behavior:
  - pending/refreshing states and single-flight: `.reference/effect/packages/effect/src/internal/cache.ts:32-58`
  - expiration and refresh state transitions: `.reference/effect/packages/effect/src/internal/cache.ts:565-599`
  - LRU/access tracking and capacity trimming: `.reference/effect/packages/effect/src/internal/cache.ts:611-639`

### 3.2 `ScopedCache`

For resourceful values that require scoped finalization.

- API and semantics: `.reference/effect/packages/effect/src/ScopedCache.ts`
  - `get` returns scoped value: lines 63-67
  - `refresh` keeps old value while recomputing new: lines 80-87
- Internal ownership/finalizer behavior:
  - owner counting and release: `.reference/effect/packages/effect/src/internal/scopedCache.ts:146-169`
  - refresh and old/new coexistence: `.reference/effect/packages/effect/src/internal/scopedCache.ts:338-387`

### 3.3 Request-level Caching (`Effect.request`)

Effect has request cache and toggles via FiberRefs.

- Public APIs:
  - `Effect.withRequestCaching`: `.reference/effect/packages/effect/src/Effect.ts:12873-12876`
  - `Effect.withRequestCache`: `.reference/effect/packages/effect/src/Effect.ts:12882-12885`
- Internal request cache defaults:
  - global request cache capacity 65536 and TTL 60s: `.reference/effect/packages/effect/src/internal/query.ts:21-31`
  - cache-enabled FiberRef gating: `.reference/effect/packages/effect/src/internal/query.ts:35-38`
  - request path with cache lookup and single-flight join: `.reference/effect/packages/effect/src/internal/query.ts:61-115`

### 3.4 Layer Memoization

- `Layer.memoize` and memo map APIs: `.reference/effect/packages/effect/src/Layer.ts:551-559` and `:1169-1194`
- Internal `MemoMap.getOrElseMemoize` dedupes layer construction in scope:
  `.reference/effect/packages/effect/src/internal/layer.ts:207-315`
- `Layer.fresh` intentionally bypasses memoization:
  `.reference/effect/packages/effect/src/internal/layer.ts:585-590`

## 4. Refactor Goals

1. Reduce repeated LLM calls for duplicate recursive work.
2. Reduce scheduler CPU/GC overhead from deterministic prompt rebuilding.
3. Keep strict request isolation where required (no accidental cross-run bleed).
4. Surface cache behavior in events/metrics for correctness and tuning.
5. Maintain current budget/concurrency invariants.

## 5. Proposed Caching Architecture

### 5.0 Stack-aware Cache Identity Rules

To avoid false cache hits across different recursive frames, all cache keys must be
frame-aware, not just `(query, context)` aware.

Required identity fields for recursive calls:

- `completionId` (always)
- `framePathHash` (hash of ancestry chain from root to current frame)
- `depth`
- `method` (`llm_query` or tool name)
- normalized payload hash (`query`, `context`, args)
- model/prompt policy discriminator (model route, system-prompt revision, toolset hash, schema hash)

Key policy:

- Default mode is `frame` scope (must include `framePathHash`).
- Optional `completion` scope may omit `framePathHash` for aggressive dedupe within one completion.
- Optional `global` scope is opt-in and must include full model/prompt policy discriminators.

This makes identical text payloads in different recursion branches distinct by default.

### 5.1 Tier A: Deterministic In-call Memoization (No external API changes)

Scope: single call lifecycle (`CallState`).

Changes:

- Extend `CallState` with precomputed immutable fields:
  - `contextPreview`
  - `toolDescriptors`
  - `systemPromptStatic`
- Compute once in `StartCall`; reuse in every `GenerateStep`.

Integration points:

- `src/Scheduler.ts` in `handleStartCall` and `handleGenerateStep`.

Expected impact:

- Lower per-iteration CPU and allocations.
- No behavior change risk.

### 5.2 Tier B: Request-local Recursive `llm_query` Cache

Scope: one root completion (`RlmRuntime`).

Mechanism:

- Add `subcallCache: Cache.Cache<SubcallKey, string, RlmError>` to runtime.
- Key = hash of:
  - `completionId`
  - `framePathHash` (default mode)
  - method (`llm_query`)
  - normalized `query`
  - normalized `context`
  - depth/model routing discriminator
  - system prompt/tool/schema discriminator
- In `handleHandleBridgeCall`, check cache before enqueuing a new sub-call.
- Use `Cache.get` so concurrent duplicate bridge calls coalesce.

Integration points:

- `src/Runtime.ts` create cache during runtime init.
- `src/Scheduler.ts` bridge-call handler path (`HandleBridgeCall`).

Expected impact:

- Significant drop in redundant sub-calls for iterative sandbox code.

### 5.3 Tier C: Request-local Model Response Cache

Scope: one root completion (`RlmRuntime`).

Mechanism:

- Add `modelCache: Cache.Cache<ModelKey, LanguageModel.GenerateTextResponse<{}>, RlmError>`.
- Key includes:
  - prompt fingerprint
  - effective model selector (primary/sub by depth threshold)
  - settings fingerprint (temperature/topP/maxTokens/tool-choice if present)
  - output schema hash (if used in prompt)
- Wrap `rlmModel.generateText` calls in scheduler through cache lookup.

Guardrails:

- Default cache-on only for deterministic configs (temperature 0 / equivalent) unless explicitly forced.
- Short TTL (request-local lifetime).

Integration points:

- `src/Scheduler.ts` calls at:
  - main generate path
  - extract fallback path
  - one-shot max-depth path

### 5.4 Tier D: Optional Process-level Cache Service (Cross-run)

Scope: process lifetime, opt-in.

Mechanism:

- New service `RlmCacheService` provided once per process (outside `Layer.fresh(RlmRuntimeLive)`).
- Backed by `Cache.make` with explicit capacity + TTL.
- Used as second-level cache after request-local cache miss.

Rationale:

- Keep default behavior isolated; allow production deployments to trade memory for cost/latency.

### 5.5 Tier E: RequestResolver Pattern for Batchable Tools (Optional)

For tools/providers that can batch (embedding/search/vector operations):

- Define `Request` types + `RequestResolver.makeBatched`.
- Use `Effect.request(...).pipe(Effect.withRequestCaching(true), Effect.withRequestCache(cache))`.
- Follow pattern from `.reference/effect/packages/ai/ai/src/EmbeddingModel.ts:199-263`.

## 6. Config Surface

Extend `RlmConfigService` (`src/RlmConfig.ts`) with:

- `cache` object:
  - `enabled: boolean`
  - `requestLocal`:
    - `modelCacheCapacity`
    - `subcallCacheCapacity`
  - `global`:
    - `enabled`
    - `capacity`
    - `timeToLiveMs`
  - `policy`:
    - `deterministicOnly`
    - `allowStaleOnRefresh` (maps to `Cache.refresh` use)

Defaults:

- Request-local enabled.
- Global disabled.
- Conservative capacities.

## 7. Eventing and Metrics

Add new events in `src/RlmTypes.ts`:

- `CacheHit`:
  - kind (`model` | `subcall`)
  - keyHash
  - callId/depth
- `CacheMiss`:
  - kind
  - keyHash
- `CacheRefreshStarted` / `CacheRefreshCompleted` (optional)

Metrics:

- cache hit ratio by kind
- avoided LLM calls count
- avoided tokens estimate:
  - use prior `usage.inputTokens`
  - correlate provider `cachedInputTokens` already surfaced in `ModelResponse`
- prompt-build time before/after Tier A

## 8. Data Model and File-level Changes

1. `src/RlmConfig.ts`
- Add cache config schema/defaults.

2. `src/Runtime.ts`
- Add request-local caches to runtime state.
- Initialize with `Cache.make`.

3. `src/RlmTypes.ts`
- Extend `CallState` for static prompt artifacts.
- Add cache event variants.

4. `src/Scheduler.ts`
- Precompute static call prompt fragments in `StartCall`.
- Replace direct `rlmModel.generateText` invocation with cache-backed helper.
- Cache/short-circuit duplicate `llm_query` bridge calls.
- Emit cache events.

5. `src/RlmModel.ts`
- Add model/cache discriminator helper (string key) so cache keys are stable across depth routing.

6. `src/RlmRenderer.ts`
- Render cache events in verbose mode.

7. `test/Scheduler.test.ts` and `test/Rlm.test.ts`
- Add deterministic tests for cache hit/miss, duplicate bridge dedupe, and cache-disabled path.

## 9. Rollout Plan

### Phase 0: Instrumentation Only

- Add prompt-build timers/counters.
- Add model-call key logging (hash only).
- No behavior changes.

Exit criteria:

- Baseline metrics captured for representative workloads.

### Phase 1: Tier A Memoization

- Implement static prompt/context/tool memoization in `CallState`.

Exit criteria:

- No behavioral diffs in existing tests.
- Lower prompt-build CPU/alloc in benchmark.

### Phase 2: Tier B Sub-call Cache

- Add request-local bridge cache and duplicate `llm_query` coalescing.

Exit criteria:

- Duplicate recursive queries produce fewer model calls.
- Budget usage drops for duplicated sub-call workloads.

### Phase 3: Tier C Model Cache

- Add request-local model response cache for deterministic paths.
- Add config gating.

Exit criteria:

- Cache hit ratio visible.
- No regression in correctness tests.

### Phase 4: Tier D Global Cache + Tier E RequestResolver (optional)

- Add process-level cache layer.
- Batch/dedupe batchable tool operations with `RequestResolver`.

Exit criteria:

- Cross-run hit ratio measurable.
- Documented operational playbook for TTL/capacity tuning.

## 10. Risks and Mitigations

Risk: stale responses from over-broad keys or long TTL.

- Mitigation: strict key design including model/settings/schema; conservative TTL; deterministic-only default.

Risk: memory growth from unbounded caches.

- Mitigation: mandatory capacity + stats + alerting.

Risk: cross-request leakage.

- Mitigation: keep request-local caches in `RlmRuntime`; global cache opt-in only.

Risk: semantic drift with non-deterministic sampling.

- Mitigation: disable cache unless deterministic or explicitly opted in.

## 11. Validation Strategy

Functional:

- Existing scheduler + RLM tests unchanged.
- New tests:
  - duplicate `llm_query` calls coalesce
  - prompt hash duplicates hit cache
  - cache disabled path preserves behavior
  - TTL expiry recomputes

Performance:

- Add benchmark workload with repeated recursive decomposition.
- Track:
  - total model calls
  - total/average latency
  - token usage and cached-input tokens
  - scheduler loop throughput

Acceptance target (initial):

- 20-40% model-call reduction on duplicate-heavy workloads.
- 15-30% scheduler CPU reduction in long-iteration loops.
