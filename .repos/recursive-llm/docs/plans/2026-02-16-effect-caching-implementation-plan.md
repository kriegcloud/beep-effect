# Effect-Native Caching Implementation Plan (Rev 13)

Date: 2026-02-16
Base spec: `docs/plans/2026-02-07-rlm-effect-caching-refactor-spec.md`
Branch: `codex/effect-caching-implementation`
Revision: 13 — readiness-gate update (branch naming, checkpoint baseline, test-path clarification)

## Review Findings Addressed

### Rev 1 → Rev 2

| # | Severity | Finding | Resolution |
|---|----------|---------|------------|
| 1 | HIGH | Structured `llm_query` results corrupted by `Cache<string, string>` | Cache value type is `unknown`, preserving typed objects |
| 2 | HIGH | `getOption + set` does not dedupe concurrent sub-calls | Deferred-based in-flight map provides single-flight semantics |
| 3 | HIGH | Cache key missing `responseFormat` schema/options | Key now includes schema hash and model override |
| 4 | MEDIUM | Tier A under-delivers on system prompt hotspot | Split `buildReplSystemPrompt` into static prefix + dynamic suffix |
| 5 | MEDIUM | CLI integration point references wrong file | Fixed: flags in `src/cli/Command.ts`, mapping in `src/cli/Normalize.ts` |
| 6 | MEDIUM | `contextPreview` and `toolDescriptorsForPrompt` redundant | Dropped both; tool descriptors embedded in `staticSystemPromptArgs` |
| 7 | LOW | `lookup: Effect.die(...)` is a latent defect | Replaced `Cache` with `Ref<Map<string, Deferred>>` — no `Cache` API |

### Rev 2 → Rev 3

| # | Severity | Finding | Resolution |
|---|----------|---------|------------|
| 1 | HIGH | Cache-hit `Deferred.await` blocks scheduler loop → deadlock | Fork await into separate fiber via `Effect.forkIn` |
| 2 | HIGH | `hashSchema` shallow sort — nested schema diffs can collide | Recursive deep-canonicalization before hashing |
| 3 | HIGH | Recursive cache write-back before schema validation → invalid results cached | Move write-back after validation; fail deferred on validation failure |
| 4 | MEDIUM | TOCTOU inconsistency: Step 5c uses `Ref.get`+`Ref.update`, Risks uses `Ref.modify` | Unified to `Ref.modify` throughout Step 5c |
| 5 | MEDIUM | Deferred timeout documented but not in implementation steps | Added `Effect.timeoutFail` wrapper on `Deferred.await` in cache-hit fork |
| 6 | MEDIUM | Missing test cases: deadlock, schema canonicalization, over-capacity | Added to test plan |
| 7 | LOW | Cache key policy partial divergence from base spec | Acknowledged; `parentCallId` + discriminators sufficient for current runtime |

### Rev 3 → Rev 4

| # | Severity | Finding | Resolution |
|---|----------|---------|------------|
| 1 | HIGH | `StartCall` pre-state failure leaves cache deferred unresolved (poisoned key) | Fail cache deferred in `handleStartCall` error handler; evict key from map |
| 2 | MEDIUM | Cache-hit timeout (30s) shorter than bridge timeout (300s) → split outcomes | Derive cache timeout from `bridgeTimeoutMs` (default 300s) instead of independent config |
| 3 | MEDIUM | Timeout path doesn't evict stale inflight entry → poisoned key for completion | On timeout, check `Deferred.isDone`; if still pending, evict key from map |
| 4 | MEDIUM | `canonicalizeJson` undefined handling incorrect (`Object.keys` includes undefined keys) | Filter out `undefined` values explicitly to match `JSON.stringify` semantics |
| 5 | LOW | Missing test cases for StartCall-pre-state failure and timeout eviction | Added to test plan |

### Rev 4 → Rev 5

| # | Severity | Finding | Resolution |
|---|----------|---------|------------|
| 1 | HIGH | ABA race: timeout eviction + key-based write-back can resolve wrong deferred | Bind write-back to captured deferred identity; `evictCacheKey` checks `map.get(key) === expectedDeferred` before evicting |
| 2 | HIGH | `modelRoute` namespace collision with named model names (`"recursive"`, `"oneshot"`) | Namespace discriminators: `route:recursive`, `route:oneshot`, `named:<name>` |
| 3 | HIGH | StartCall error handler snippet regresses cleanup safety (`Scope.close` without `Effect.exit`) | Use existing defensive `Effect.exit(Scope.close(callScope, Exit.fail(error)))` pattern |
| 4 | MEDIUM | CLI wiring inconsistent: `cache: { enabled }` vs `cliArgs.noCache`, wrong function name | Unified pipeline: `noCache` on `CliArgs` → `makeCliConfig` maps to config |
| 5 | MEDIUM | Timeout default contradictory: Step 3 says 300s, Step 5c says 30s | Removed all 30s references; consistently derived from `bridgeTimeoutMs` |
| 6 | MEDIUM | Prompt split omits compatibility guidance for `buildReplSystemPrompt` | Keep as compatibility wrapper; migrate scheduler first |

### Rev 5 → Rev 6

| # | Severity | Finding | Resolution |
|---|----------|---------|------------|
| 1 | HIGH | Failed cache entries not evicted outside StartCall/timeout paths (poisoned failed keys consume capacity) | Add identity-checked `evictCacheKey` after `failCacheDeferred` on all producer failure paths |
| 2 | MEDIUM | StartCall error snippet wrong `FailCall` shape (includes `completionId`) | Aligned with actual `FailCall` type: `{ callId, error }` only |
| 3 | MEDIUM | `cacheResult` scope inconsistent: `const` inside block, referenced outside | Use `let cacheResult: ... \| undefined` in outer scope, assign inside cache block |
| 4 | MEDIUM | Step 2 ordering contradiction: compute after `makeCallContext` vs pass into it | Compute static args BEFORE `makeCallContext`, then pass in |
| 5 | LOW | "contextMetadata always set" claim overstated (undefined for empty context) | Reworded to "derived for non-empty context" |

### Rev 6 → Rev 7

| # | Severity | Finding | Resolution |
|---|----------|---------|------------|
| 1 | MEDIUM | StartCall error handler passes raw `error` to `failCacheDeferred` — `catchAll` error may not be `RlmError` | Normalize error: `const rlmError = error instanceof RlmError ? error : new SchedulerInternalError(...)` before passing to `failCacheDeferred` and `FailCall` |
| 2 | MEDIUM | Recursive enqueue snippet uses `cacheResult._tag` without optional chaining | Changed to `cacheResult?._tag === "miss"` for safe narrowing when `cacheResult` is `undefined` |
| 3 | MEDIUM | Prompt-split test plan misses explicit parity coverage | Added parity assertion: `buildReplSystemPrompt(opts) === buildReplSystemPromptStatic(...) + "\n" + buildReplSystemPromptDynamic(...)` |
| 4 | LOW | "Verbose mode" wording doesn't match actual renderer API | Changed to "render when `quiet !== true`" to match `RlmRenderer` options |

### Rev 7 → Rev 8

| # | Severity | Finding | Resolution |
|---|----------|---------|------------|
| 1 | HIGH | StartCall error snippet uses non-existent `SchedulerInternalError` and `instanceof RlmError` (type alias, not runtime class) | Use existing `UnknownRlmError` class; wrap raw `error` with `new UnknownRlmError({ message: "StartCall failed", cause: error })` to match existing handler pattern |
| 2 | HIGH | Cache-hit fork closures read outer `let` variables — TS strict mode loses narrowing across closure boundaries | Capture narrowed values into `const` before fork: `const hitDeferred = cacheResult.deferred`, `const hitKey = cacheKey!`; similarly for miss path |
| 3 | MEDIUM | BridgeStore converts all errors to `SandboxError`, so waiters won't receive `OutputValidationError` directly | Adjusted test expectations: assert `SandboxError` with message content, not typed `OutputValidationError` |
| 4 | MEDIUM | `StartCall` command shape changes (`cacheKey`/`cacheDeferred`) not called out in Step 4 (which edits `RlmTypes.ts`) | Added explicit `StartCall` shape extension to Step 4 |
| 5 | MEDIUM | `noCache` as required field in `CliArgs` breaks existing callers | Changed to `noCache?: boolean` with default `false` in `makeCliConfig` |

### Rev 8 → Rev 9

| # | Severity | Finding | Resolution |
|---|----------|---------|------------|
| 1 | HIGH | Cache-hit waiter uses `Effect.catchAll` which misses interruption causes from scope closure — bridge deferred left unresolved | Changed to `Effect.catchAllCause` with `Cause.failureOrCause` to handle both failures and interruptions/defects |
| 2 | MEDIUM | `failCacheDeferred` then `evictCacheKey` creates race window where concurrent caller can observe failed deferred | Reordered: evict (identity-checked) BEFORE failing deferred on all producer failure paths |
| 3 | MEDIUM | Budget-policy claim (cache hit ≠ LLM call) not explicitly tested | Added budget accounting test: two identical calls, assert `llmCallsRemaining` decrements once |
| 4 | LOW | File change summary missing planned test file edits for prompt, renderer, CLI | Updated summary to include all test files |

### Rev 9 → Rev 10

| # | Severity | Finding | Resolution |
|---|----------|---------|------------|
| 1 | HIGH | `Scope.close` in `handleFinalize` and `handleFailCall` is not wrapped with `Effect.exit` — if finalizer fails, cache/bridge cleanup is skipped | Harden both handlers: `yield* Effect.exit(Scope.close(...))` to match the existing StartCall error handler pattern |
| 2 | MEDIUM | Cache-hit fork evicts on any non-success exit including scope interruption — a canceled waiter fiber can evict a still-healthy in-flight entry, breaking single-flight semantics | Move eviction into `Effect.tapError` on the `Deferred.await` pipe (runs only on failures like timeout, not on interruption/defect causes); remove eviction from `catchAllCause` |
| 3 | MEDIUM | `cacheKey?` and `cacheDeferred?` are independent optionals permitting partial invalid states | Model as single optional object `cacheBinding?: { key; deferred }` — both-or-none enforced by type |
| 4 | LOW | Test plan misses: (a) cleanup after `Scope.close` failure in Finalize/FailCall, (b) hit-waiter interruption does NOT evict live producer entry | Added targeted tests for both scenarios |

### Rev 10 → Rev 11

| # | Severity | Finding | Resolution |
|---|----------|---------|------------|
| 1 | HIGH | `contextMetadata` spread uses `\|\| callState.context.length > 0` which can produce `{ contextMetadata: undefined }` — breaks `exactOptionalPropertyTypes` | Changed to only spread when `callState.contextMetadata !== undefined` |
| 2 | MEDIUM | Step 2 references `command.cacheBinding` before Step 4 adds it to `StartCall`; Step 1 new fields break tests until Step 2 lands | Reordered: Step 4 (types/events/commands) first, then Step 1+2 together |
| 3 | MEDIUM | Timeout test expectations flaky — BridgeHandler timeout fires before cache-hit waiter timeout | Revised test guidance: use asymmetric timeouts (short cache, long bridge) or test waiter fork in isolation |
| 4 | LOW | `deterministicOnly` config field introduced but unused in Tier A/B | Deferred to Tier C — not added to config schema |
| 5 | LOW | `canonicalizeJson(undefined)` returns `"null"` which is inconsistent with `JSON.stringify(undefined)` | Changed to throw an error for top-level `undefined` |

### Rev 11 → Rev 12

| # | Severity | Finding | Resolution |
|---|----------|---------|------------|
| 1 | HIGH | `Effect.catchAllCause` does NOT catch scope interruption — `Deferred.await` fiber interrupted via scope close exits without running `catchAllCause` handler, leaving bridge deferred unresolved | Added `Effect.onInterrupt` to guarantee `failBridgeDeferred` on interruption; `catchAllCause` still handles failures/defects |
| 2 | HIGH | `canonicalizeJson`/`hashSchema` can throw inline during bridge handling, aborting scheduler with a defect | Wrapped hash generation in `try/catch`; on failure, skip caching and proceed with normal sub-call execution |
| 3 | MEDIUM | `--no-cache` wiring not fully tested — flag parsing passes but `makeCliConfig` mapping untested | Added `test/CliLayer.test.ts` assertion for `makeCliConfig({ noCache: true })` |
| 4 | LOW | Scheduler snippet uses `Either.match` but `src/Scheduler.ts` doesn't import `Either` | Added explicit import note |

---

## Overview

This plan covers Tier A (deterministic in-call memoization) and Tier B
(request-local sub-call cache with concurrent deduplication) as the initial
deliverable, with Tier C (model response cache) staged behind a review
checkpoint.

The multi-agent caching review (2026-02-16) confirmed:
- All existing caching/layer wiring is correct — no bugs to fix first.
- No Effect caching primitives (`Cache`, `Effect.cached`, etc.) are used today.
- The AI packages themselves use no Effect-level caching for model calls.
- The main optimization targets are prompt rebuild per iteration and duplicate
  sub-call deduplication.

---

## Step 1: Extend `CallContext` with Precomputed Fields

**File:** `src/CallContext.ts`

Add fields to the `CallContext` interface:

```ts
// New fields on CallContext
readonly staticSystemPromptArgs: Omit<ReplSystemPromptOptions, "iteration" | "budget">
readonly staticSystemPromptPrefix: string
readonly cacheBinding?: {
  readonly key: string
  readonly deferred: Deferred.Deferred<unknown, RlmError>
}  // set for recursive sub-calls with caching enabled — paired type prevents partial invalid state
```

**Dropped from Rev 1:**
- `contextPreview` — unused by current metadata flow (`Scheduler.ts:405`
  always derives metadata; `RlmPrompt.ts:65` prefers metadata over raw preview).
- `toolDescriptorsForPrompt` — redundant; tool descriptors are already
  included inside `staticSystemPromptArgs.tools`.

**Changes to `makeCallContext`:**

Add `staticSystemPromptArgs`, `staticSystemPromptPrefix`, and optional
`cacheBinding` to `MakeCallContextOptions` and propagate into the
returned `CallContext`.

**Tests:** Unit test `makeCallContext` to verify the new fields are stored and
accessible.

---

## Step 2: Precompute Static Prompt Fragments in `handleStartCall`

**File:** `src/Scheduler.ts` — `handleStartCall` (line ~382)

Compute the static portions of the system prompt arguments **before** the
`makeCallContext` call, then pass them in. The tool descriptor mapping and
system prompt option assembly currently live inside `handleGenerateStep`
(lines 557-604). The *static* portions (everything except `iteration` and
`budget.*`) are computed once in `handleStartCall` and stored on `CallContext`.

**Concretely:**

```ts
// In handleStartCall, BEFORE makeCallContext:
const toolDescriptors = command.tools?.map((t) => ({
  name: t.name,
  description: t.description,
  parameterNames: t.parameterNames,
  parametersJsonSchema: t.parametersJsonSchema,
  returnsJsonSchema: t.returnsJsonSchema,
  ...(t.usageExamples !== undefined && t.usageExamples.length > 0
    ? { usageExamples: t.usageExamples }
    : {})
}))

const staticSystemPromptArgs = {
  depth: command.depth,
  maxIterations: config.maxIterations,
  maxDepth: config.maxDepth,
  ...(config.namedModels !== undefined
    ? { namedModelNames: Object.keys(config.namedModels) }
    : {}),
  ...(command.mediaAttachments !== undefined && command.mediaAttachments.length > 0
    ? { mediaNames: command.mediaAttachments.map((a) => a.name) }
    : {}),
  ...(toolDescriptors !== undefined && toolDescriptors.length > 0
    ? { tools: toolDescriptors }
    : {}),
  ...(command.outputJsonSchema !== undefined
    ? { outputJsonSchema: command.outputJsonSchema }
    : {}),
  ...(contextMetadata !== undefined
    ? { contextMetadata }
    : {}),
  maxFrameBytes: sandboxConfig.maxFrameBytes,
  sandboxMode: sandboxConfig.sandboxMode,
  ...(config.subModelContextChars !== undefined
    ? { subModelContextChars: config.subModelContextChars }
    : {})
}
```

Then pass `staticSystemPromptArgs` and `staticSystemPromptPrefix` into `makeCallContext`:

```ts
const callContext = yield* makeCallContext({
  // ... existing fields ...
  staticSystemPromptArgs,
  staticSystemPromptPrefix,
  ...(command.cacheBinding !== undefined ? { cacheBinding: command.cacheBinding } : {})
})
```

### Tier A enhancement: split `buildReplSystemPrompt`

**File:** `src/SystemPrompt.ts`

**Problem (Rev 1 Finding #4):** Even with precomputed args, the full system
prompt string (~750 lines of template) is rebuilt every iteration. Most of
this is static — only the iteration counter, budget snapshot, and phase label
change.

**Feasibility confirmed:** Rev 2 codex review verified that iteration/budget-
dependent logic is localized near `src/SystemPrompt.ts:747`. The split is
clean.

**Solution:** Split `buildReplSystemPrompt` into two functions, keeping the
original as a compatibility wrapper:

```ts
// Returns the static prefix (everything that doesn't depend on iteration/budget)
export const buildReplSystemPromptStatic = (
  options: Omit<ReplSystemPromptOptions, "iteration" | "budget">
): string => { ... }

// Returns the dynamic suffix (iteration counter, budget, phase)
export const buildReplSystemPromptDynamic = (
  options: Pick<ReplSystemPromptOptions, "iteration" | "budget"> & { maxIterations: number }
): string => { ... }

// Compatibility wrapper — existing tests and non-scheduler callers continue using this
export const buildReplSystemPrompt = (options: ReplSystemPromptOptions): string => {
  const { iteration, budget, ...staticOpts } = options
  return buildReplSystemPromptStatic(staticOpts) + "\n" + buildReplSystemPromptDynamic({
    iteration,
    budget,
    maxIterations: options.maxIterations
  })
}
```

**Why keep the wrapper (Rev 4 Finding #6):** Existing tests (`SystemPrompt.test.ts`,
`SystemPrompt.prop.test.ts`) and the `Scheduler.ts` import all reference
`buildReplSystemPrompt`. The wrapper preserves backward compatibility and avoids
unnecessary test churn. Only the scheduler's `handleGenerateStep` is migrated to
use the split functions directly.

In `handleStartCall`, precompute and store the static prefix:

```ts
const staticSystemPromptPrefix = buildReplSystemPromptStatic(staticSystemPromptArgs)
```

Store `staticSystemPromptPrefix` on the `CallContext`.

**Changes to `handleGenerateStep`:**

Replace the inline computation (lines 557-604) with concatenation:

```ts
const dynamicSuffix = buildReplSystemPromptDynamic({
  iteration: iteration + 1,
  budget: {
    iterationsRemaining: config.maxIterations - (iteration + 1),
    llmCallsRemaining: budget.llmCallsRemaining,
    ...(Option.isSome(budget.tokenBudgetRemaining)
      ? { tokenBudgetRemaining: budget.tokenBudgetRemaining.value }
      : {}),
    totalTokensUsed: budget.totalTokensUsed,
    elapsedMs: Date.now() - runtime.completionStartedAtMs,
    ...(config.maxTimeMs !== undefined ? { maxTimeMs: config.maxTimeMs } : {})
  },
  maxIterations: config.maxIterations
})

const prompt = buildReplPrompt({
  systemPrompt: callState.staticSystemPromptPrefix + "\n" + dynamicSuffix,
  query: callState.query,
  ...(callState.contextMetadata !== undefined
    ? { contextMetadata: callState.contextMetadata }
    : {}),
  transcript,
  enablePromptCaching: config.enablePromptCaching
})
```

**Remove the `analyzeContext` fallback** at line 607. `contextMetadata` is
derived in `handleStartCall` (line 405) for all non-empty context inputs
(via `deriveContextMetadata`). For empty context without provided metadata,
it is `undefined` — but in that case `analyzeContext("")` also returns
trivial metadata, so the fallback adds no value. Removing it simplifies the
code and aligns with the precomputed field on `CallContext`.

**Tests:** Existing `Scheduler.test.ts` tests must continue passing (no
behavioral change). Add a focused test that verifies `callState` contains the
precomputed fields and prefix string after `StartCall`.

**Prompt split parity test** (`test/SystemPrompt.test.ts`): Assert that the
compatibility wrapper produces identical output to the split functions:

```ts
test("buildReplSystemPrompt equals static + dynamic", () => {
  const opts: ReplSystemPromptOptions = { /* representative options */ }
  const { iteration, budget, ...staticOpts } = opts
  const combined = buildReplSystemPrompt(opts)
  const split = buildReplSystemPromptStatic(staticOpts) + "\n" + buildReplSystemPromptDynamic({
    iteration,
    budget,
    maxIterations: opts.maxIterations
  })
  expect(combined).toBe(split)
})
```

This ensures the wrapper and split functions remain in sync as the template
evolves.

---

## Step 3: Add Cache Config to `RlmConfigService`

**File:** `src/RlmConfig.ts`

Extend `RlmConfigService` with:

```ts
readonly cache?: {
  readonly enabled?: boolean                   // default true
  readonly subcallCacheCapacity?: number        // default 256
}
```

The `cache` field is optional with all sub-fields optional, preserving
backward compatibility. Defaults are applied in the consumer code.

**Deferred to Tier C:** `deterministicOnly` (temperature gating) is not
added in Tier A/B since sub-call caching operates on exact input match
regardless of model temperature. It will be introduced with the model
response cache (Step 7) where temperature sensitivity matters.

**No separate cache timeout config.** The cache-hit timeout is derived from
the existing `bridgeTimeoutMs` config (default 300s, see `BridgeHandler.ts:72`)
to ensure cache-hit waiters never time out before the original sub-call would.

Removed from Rev 1: `subcallCacheTtlMs`, `modelCacheCapacity`, `modelCacheTtlMs`
— TTL is unnecessary for request-local lifetime (map lives in `RlmRuntime`
which is `Layer.fresh` per completion). Model cache config deferred to Tier C.

**CLI integration:**

**Flag definition** (`src/cli/Command.ts`):
```ts
const noCache = Options.boolean("no-cache").pipe(
  Options.withDescription("Disable sub-call caching and deduplication")
)
```

Add `noCache` to `commandConfig`.

**Flag mapping** (`src/cli/Normalize.ts`):

Add `noCache` to `ParsedCliConfig` and propagate as optional into `CliArgs`:
```ts
// In ParsedCliConfig:
readonly noCache: boolean

// In CliArgs (optional to avoid breaking existing callers):
readonly noCache?: boolean

// In normalizeCliArgs return:
...(parsed.noCache ? { noCache: true } : {})
```

**Downstream consumption** (`src/CliLayer.ts` — `makeCliConfig`):
```ts
// In makeCliConfig (defaults to false when omitted):
...(cliArgs.noCache === true ? { cache: { enabled: false } } : {})
```

Making `noCache` optional on `CliArgs` avoids breaking existing test and
internal callers that construct `CliArgs` object literals without this field.

**Tests:** Config parsing test with and without cache field. CLI flag test
for `--no-cache`.

---

## Step 4: Add Cache Events and Extend `StartCall` Command

**File:** `src/RlmTypes.ts`

### 4a: New event variants

Add two new event variants to the `RlmEvent` tagged enum:

```ts
CacheHit: {
  readonly completionId: string
  readonly callId: CallId
  readonly depth: number
  readonly kind: "subcall" | "model"
  readonly cacheKey: string
}
CacheMiss: {
  readonly completionId: string
  readonly callId: CallId
  readonly depth: number
  readonly kind: "subcall" | "model"
  readonly cacheKey: string
}
```

### 4b: Extend `StartCall` command shape

Add an optional `cacheBinding` field (paired key + deferred) to the `StartCall`
variant of the `RlmCommand` tagged enum (needed by Step 5c/5d for threading
cache state into sub-call paths):

```ts
StartCall: {
  // ... existing fields ...
  readonly cacheBinding?: {
    readonly key: string
    readonly deferred: Deferred.Deferred<unknown, RlmError>
  }
}
```

This requires adding `Deferred` and `RlmError` imports to `src/RlmTypes.ts`.

**File:** `src/RlmRenderer.ts`

Render these events when `quiet !== true` (a log line with hit/miss, kind,
and abbreviated cache key). Handle in `Match.tagsExhaustive` to maintain
exhaustiveness.

**Tests:** Renderer test for new event types.

---

## Step 5: Implement Sub-call Cache (Tier B)

This is the highest-value change: deduplicating identical `llm_query` bridge
calls within a single completion, with proper concurrent single-flight
semantics and typed value preservation.

### Architecture: Deferred-based In-flight Map

**Why not `Cache`:** The Rev 1 codex review identified three problems with the
`Cache.Cache<string, string>` approach:

1. `Cache` value type was `string`, corrupting structured `responseFormat`
   results that are `object | unknown`.
2. `getOption + set` doesn't dedupe concurrent in-flight sub-calls — two
   identical bridge calls arriving before the first completes would both miss.
3. The `lookup: Effect.die(...)` pattern creates a latent defect if anyone
   later calls `Cache.get` or `Cache.refresh`.

**Solution:** Use a `Ref<Map<string, Deferred<unknown, RlmError>>>` instead:

- **First caller** for a given key: creates a `Deferred`, stores it in the
  map, and proceeds with the actual sub-call. On completion, resolves the
  deferred with the result (preserving the original type — `string` or parsed
  `object`).
- **Concurrent callers** with the same key: find the existing `Deferred`,
  **fork** a fiber to await it and resolve the bridge (so the scheduler loop
  continues processing commands).
- **Later callers** after completion: find the already-resolved `Deferred`,
  fork completes immediately.

This gives us concurrent dedup, completed-entry reuse, typed values, and
no `Effect.die` hazards — all without the `Cache` API.

### 5a: Add `SubcallCache` to `RlmRuntimeShape`

**File:** `src/Runtime.ts`

```ts
import { Deferred, Ref } from "effect"
import type { RlmError } from "./RlmError"

export interface SubcallCache {
  readonly inflight: Ref.Ref<Map<string, Deferred.Deferred<unknown, RlmError>>>
  readonly capacity: number
  readonly timeoutMs: number  // derived from bridgeTimeoutMs
}

export interface RlmRuntimeShape {
  // ... existing fields ...
  readonly subcallCache: SubcallCache | null
}
```

In `RlmRuntimeLive`, create the cache based on config:

```ts
const cacheEnabled = config.cache?.enabled !== false
const subcallCache: SubcallCache | null = cacheEnabled
  ? {
      inflight: yield* Ref.make(new Map<string, Deferred.Deferred<unknown, RlmError>>()),
      capacity: config.cache?.subcallCacheCapacity ?? 256,
      timeoutMs: config.bridgeTimeoutMs ?? 300_000  // match bridge timeout
    }
  : null
```

No `Cache.make`, no `Effect.die`, no TTL. The map lives in `RlmRuntime` which
is `Layer.fresh` per completion, so it's automatically scoped to a single run.

### 5b: Define the Cache Key

**File:** `src/scheduler/CacheKey.ts` (new file)

```ts
export interface SubcallCacheKeyParts {
  readonly completionId: string
  readonly parentCallId: string
  readonly method: string       // "llm_query"
  readonly query: string
  readonly context: string
  readonly depth: number
  readonly modelRoute: string   // "route:oneshot" | "route:recursive" | "named:<name>"
  readonly responseFormatHash?: string  // hash of schema object, if present
}

export const makeSubcallCacheKey = (parts: SubcallCacheKeyParts): string => {
  const raw = JSON.stringify([
    parts.completionId,
    parts.parentCallId,
    parts.method,
    parts.query,
    parts.context,
    parts.depth,
    parts.modelRoute,
    parts.responseFormatHash ?? ""
  ])
  return `subcall:${Bun.hash(raw).toString(36)}`
}

/**
 * Deep-canonicalize a JSON-serializable value for deterministic hashing.
 * Recursively sorts object keys at all nesting levels. Arrays preserve order.
 * Drops keys with `undefined` values to match `JSON.stringify` semantics.
 */
export const canonicalizeJson = (value: unknown): string => {
  if (value === undefined) throw new Error("canonicalizeJson: top-level undefined is not valid JSON")
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value)
  }
  if (Array.isArray(value)) {
    return "[" + value.map(canonicalizeJson).join(",") + "]"
  }
  const obj = value as Record<string, unknown>
  const keys = Object.keys(obj).sort().filter((k) => obj[k] !== undefined)
  return "{" + keys.map((k) =>
    JSON.stringify(k) + ":" + canonicalizeJson(obj[k])
  ).join(",") + "}"
}

/**
 * Produce a stable hash for a responseFormat schema object.
 * Uses deep canonicalization to ensure nested key ordering is deterministic.
 */
export const hashSchema = (schema: object): string => {
  return Bun.hash(canonicalizeJson(schema)).toString(36)
}
```

**Changes from Rev 1 (Finding #3) and Rev 2 (Finding #2):**
- `hashSchema` now uses `canonicalizeJson` which recursively sorts keys at
  all nesting levels, preventing collisions from nested schema differences.
- Added `responseFormatHash` to key parts — same `(query, context)` with
  different schemas now produce different cache keys.
- `modelRoute` uses namespaced discriminators (`route:oneshot`, `route:recursive`,
  `named:<name>`) to prevent collisions between routing literals and named
  model names (Rev 4 Finding #2).
- `parentCallId` provides frame-scoping (sibling branches are distinct).

**Key policy note (Rev 2 Finding #7):** The base spec
(`docs/plans/2026-02-07-rlm-effect-caching-refactor-spec.md:96-108`)
recommends additional discriminators like `framePathHash` and
`systemPromptRevision`. For the current runtime, `parentCallId` + `depth`
achieves the same frame isolation because the call tree is deterministic from
the root. The `systemPromptRevision` discriminator is unnecessary because the
prompt is fixed within a completion. If Tier D (cross-run) caching is added
later, these additional discriminators would be needed.

### 5c: Integrate into `handleHandleBridgeCall`

**File:** `src/Scheduler.ts` — `handleHandleBridgeCall`

For the `llm_query` path (line ~1195), after argument validation but before
the depth check and sub-call dispatch:

```ts
// --- Cache check for llm_query sub-calls ---
let cacheKey: string | undefined
// Declared in outer scope so one-shot/recursive write-back paths can reference it
let cacheResult: { _tag: "hit"; deferred: Deferred.Deferred<unknown, RlmError> }
  | { _tag: "miss"; deferred: Deferred.Deferred<unknown, RlmError> }
  | { _tag: "over-capacity" }
  | undefined

if (subcallCache !== null && command.method === "llm_query") {
  // CRITICAL (Rev 4 Finding #2): Namespace route discriminators to prevent
  // collision with named model names like "recursive" or "oneshot".
  const modelRoute = namedModel !== undefined
    ? `named:${namedModel}`
    : (callState.depth + 1 >= config.maxDepth ? "route:oneshot" : "route:recursive")
  // CRITICAL (Rev 11 Finding #2): Wrap hash generation in try/catch.
  // canonicalizeJson/hashSchema can throw on malformed schema objects.
  // On failure, skip caching and proceed with normal sub-call execution.
  let responseFormatHash: string | undefined
  if (responseFormat !== undefined) {
    try {
      responseFormatHash = hashSchema(responseFormat.schema)
    } catch {
      // Hash failure → skip caching for this call
    }
  }
  if (responseFormat !== undefined && responseFormatHash === undefined) {
    // hashSchema failed — fall through to normal sub-call without caching
  } else {
    cacheKey = makeSubcallCacheKey({
      completionId: runtime.completionId,
      parentCallId: command.callId,
      method: "llm_query",
      query: llmQueryArg,
      context: llmContextArg ?? "",
      depth: callState.depth + 1,
      modelRoute,
      ...(responseFormatHash !== undefined
        ? { responseFormatHash }
        : {})
    })
  }

  // Atomic check-and-insert using Ref.modify to eliminate TOCTOU races
  // Only attempt cache if key was successfully computed (hashSchema may have failed)
  if (cacheKey !== undefined) {
  const freshDeferred = yield* Deferred.make<unknown, RlmError>()
  cacheResult = yield* Ref.modify(subcallCache.inflight, (m) => {
    const existing = m.get(cacheKey!)
    if (existing !== undefined) {
      return [{ _tag: "hit" as const, deferred: existing }, m] as const
    }
    if (m.size >= subcallCache.capacity) {
      return [{ _tag: "over-capacity" as const }, m] as const
    }
    const next = new Map(m)
    next.set(cacheKey!, freshDeferred)
    return [{ _tag: "miss" as const, deferred: freshDeferred }, next] as const
  })

  if (cacheResult._tag === "hit") {
    // CRITICAL (Rev 7 Finding #2): Capture narrowed values into const before
    // fork closure. TypeScript strict mode does not preserve narrowing of outer
    // `let` variables across closure boundaries. Without this, the compiler
    // reports "possibly undefined" / missing property errors inside the fork.
    const hitDeferred = cacheResult.deferred
    const hitKey = cacheKey!

    yield* publishEvent(RlmEvent.CacheHit({
      completionId: runtime.completionId,
      callId: command.callId,
      depth: callState.depth,
      kind: "subcall",
      cacheKey: hitKey
    }))

    // CRITICAL (Rev 2 Finding #1): Fork the await into a separate fiber.
    // The scheduler loop MUST NOT block on Deferred.await — otherwise the
    // command queue stalls and the sub-call that would resolve this deferred
    // can never be processed.
    yield* Effect.forkIn(
      Effect.gen(function*() {
        const cachedResult = yield* Deferred.await(hitDeferred).pipe(
          Effect.timeoutFail({
            duration: Duration.millis(subcallCache.timeoutMs),
            onTimeout: () => new SandboxError({
              message: `Sub-call cache await timed out after ${subcallCache.timeoutMs}ms`
            })
          }),
          // CRITICAL (Rev 9 Finding #2): Evict on FAILURE only (includes
          // timeout). tapError runs for failures but NOT for interruption or
          // defect causes. This ensures scope-closure interruption of a waiter
          // does not evict a still-healthy producer entry, preserving
          // single-flight semantics for other waiters.
          Effect.tapError(() =>
            Effect.gen(function*() {
              const isDone = yield* Deferred.isDone(hitDeferred)
              if (!isDone) {
                yield* evictCacheKey(subcallCache, hitKey, hitDeferred)
              }
            })
          )
        )
        yield* resolveBridgeDeferred(command.bridgeRequestId, cachedResult)
      }).pipe(
        // Handles failures (timeout, producer error) and defects.
        Effect.catchAllCause((cause) =>
          Effect.gen(function*() {
            const error = Cause.failureOrCause(cause).pipe(
              Either.match({
                onLeft: (e) => e,
                onRight: (defect) =>
                  new SandboxError({ message: `Cache-hit fiber defect: ${Cause.pretty(defect)}` })
              })
            )
            // No eviction here — timeout eviction handled by tapError above.
            yield* failBridgeDeferred(command.bridgeRequestId, error)
          })
        ),
        // CRITICAL (Rev 11 Finding #1): Effect.catchAllCause does NOT fire
        // on interruption (verified experimentally). Scope closure interrupts
        // forked fibers without entering the catch chain. Use onInterrupt to
        // guarantee bridge deferred cleanup on scope-initiated interruption.
        // No eviction — producer may still be alive serving other waiters.
        Effect.onInterrupt(() =>
          failBridgeDeferred(
            command.bridgeRequestId,
            new SandboxError({ message: "Cache-hit fiber interrupted (scope closed)" })
          )
        )
      ),
      callState.callScope
    )
    return
  }

  if (cacheResult._tag === "miss") {
    yield* publishEvent(RlmEvent.CacheMiss({
      completionId: runtime.completionId,
      callId: command.callId,
      depth: callState.depth,
      kind: "subcall",
      cacheKey
    }))
    // Deferred already inserted by Ref.modify above.
    // cacheKey is threaded into sub-call paths below for write-back.
  }
  // "over-capacity" → proceed without caching (no event, no deferred)
  } // end if (cacheKey !== undefined)
}
// ... existing one-shot / recursive dispatch continues below,
//     with cacheKey available for write-back ...
```

**Key changes from Rev 2:**
- **Fork on hit (Finding #1):** `Deferred.await` runs in a forked fiber via
  `Effect.forkIn(..., callState.callScope)`, so the scheduler loop immediately
  returns and continues processing commands. This prevents the deadlock where
  an awaiting hit blocks the scheduler from processing the `StartCall` that
  would resolve the deferred.
- **Timeout (Finding #5):** `Effect.timeoutFail` wraps `Deferred.await` with
  a timeout derived from `bridgeTimeoutMs` (default 300s). If a deferred is
  never resolved (e.g., a sub-call silently drops), the waiter fails with a
  clear error instead of hanging forever.
- **Atomic Ref.modify (Finding #4):** The check-and-insert is done in a single
  `Ref.modify` call. The `Deferred` is created before `Ref.modify`, and either
  inserted (miss) or discarded (hit/over-capacity). This eliminates the TOCTOU
  race between `Ref.get` and `Ref.update`.

**Threading cache key into sub-call paths:**

**CRITICAL (Rev 7 Finding #2):** Before entering fork closures, capture the
narrowed cache state into `const` values. TypeScript strict mode does not
preserve narrowing of outer `let` variables across closure boundaries.

```ts
// Capture narrowed miss state for use in fork closures (one-shot and recursive paths)
const missBinding = cacheResult?._tag === "miss"
  ? { key: cacheKey!, deferred: cacheResult.deferred }
  : undefined
```

For one-shot sub-calls: `missBinding` is a captured `const` used in the fork
closure.

For recursive sub-calls: pass `missBinding` as `cacheBinding` into the
`StartCall` command, then propagate to `makeCallContext` so it's available on
`callState.cacheBinding` in `handleFinalize`.

```ts
// In the recursive dispatch path:
// Thread cacheBinding so handleFinalize can resolve the originating deferred
// directly (prevents ABA race — Rev 4 Finding #1)
yield* enqueue(RlmCommand.StartCall({
  callId: subCallId,
  depth: callState.depth + 1,
  query: llmQueryArg,
  context: llmContextArg ?? "",
  parentBridgeRequestId: command.bridgeRequestId,
  ...(responseFormat !== undefined ? { outputJsonSchema: responseFormat.schema } : {}),
  ...(missBinding !== undefined ? { cacheBinding: missBinding } : {})
}))
```

### 5d: Cache Write-back Points

**One-shot path** (inside `handleHandleBridgeCall`, after `runOneShotSubCall`):

```ts
yield* Effect.forkIn(
  Effect.gen(function*() {
    const oneShotResult = yield* runOneShotSubCall({
      query: llmQueryArg,
      context: llmContextArg ?? "",
      depth: callState.depth + 1,
      ...(namedModel !== undefined ? { namedModel } : {}),
      ...(responseFormat !== undefined ? { responseFormat } : {})
    })
    // Cache write-back: resolve the captured deferred directly (not by key)
    if (missBinding !== undefined) {
      yield* succeedCacheDeferred(missBinding.deferred, oneShotResult)
    }
    yield* resolveBridgeDeferred(command.bridgeRequestId, oneShotResult)
  }).pipe(
    Effect.catchAllCause((cause) => {
      // On failure, fail the deferred so waiters don't hang
      const error = Cause.isFailType(cause)
        ? (cause.error as RlmError)
        : new SandboxError({ message: Cause.pretty(cause) })
      return Effect.gen(function*() {
        // CRITICAL (Rev 8 Finding #2): Evict BEFORE failing deferred to prevent
        // concurrent callers from observing a failed deferred still in the map.
        if (missBinding !== undefined && subcallCache !== null) {
          yield* evictCacheKey(subcallCache, missBinding.key, missBinding.deferred)
          yield* failCacheDeferred(missBinding.deferred, error)
        }
        const message = "message" in error ? error.message : String(error)
        yield* failBridgeDeferred(command.bridgeRequestId, message)
      })
    })
  ),
  callState.callScope
)
```

**Key property:** `oneShotResult` preserves its original type — `string` for
plain text responses, or the parsed JSON object/array for `responseFormat`
paths (from `parseAndValidateJson` at `Scheduler.ts:980`). The deferred stores
this typed value as `unknown`, and cache hit callers receive it unchanged.

**Helper functions** (defined once in `Scheduler.ts`):

**CRITICAL (Rev 4 Finding #1):** Helpers resolve/fail the captured deferred
directly, never looking up by key. This prevents ABA races where a key is
evicted, reinserted with a new deferred by a retry, and the old producer
resolves the *new* deferred with stale data.

```ts
/**
 * Resolve a cache deferred with a successful result.
 * Takes the deferred directly — never looks up by key.
 */
const succeedCacheDeferred = (
  deferred: Deferred.Deferred<unknown, RlmError>,
  value: unknown
) => Deferred.succeed(deferred, value)

/**
 * Fail a cache deferred with an error.
 * Takes the deferred directly — never looks up by key.
 */
const failCacheDeferred = (
  deferred: Deferred.Deferred<unknown, RlmError>,
  error: RlmError
) => Deferred.fail(deferred, error)

/**
 * Conditionally evict a cache key from the inflight map.
 * Only evicts if the current entry for the key is the expected deferred
 * (identity check). This prevents evicting a freshly-inserted entry
 * belonging to a different caller after an ABA sequence.
 */
const evictCacheKey = (
  cache: SubcallCache,
  key: string,
  expectedDeferred: Deferred.Deferred<unknown, RlmError>
) =>
  Ref.update(cache.inflight, (m) => {
    if (m.get(key) === expectedDeferred) {
      const next = new Map(m)
      next.delete(key)
      return next
    }
    return m  // different deferred for this key — leave it alone
  })
```

**Recursive path** (in `handleFinalize`, when resolving parent bridge deferred):

**CRITICAL (Rev 9 Finding #1):** The existing `Scope.close` in `handleFinalize`
(at `Scheduler.ts:1315`) is not wrapped with `Effect.exit`. If a scope finalizer
fails, the remaining handler code (cache write-back and bridge deferred
resolution) would be skipped. Change to:

```ts
// Harden Scope.close — make non-fatal so cache/bridge cleanup always executes
yield* Effect.exit(Scope.close(callState.callScope, Exit.void))
```

**CRITICAL (Rev 2 Finding #3):** Cache write-back MUST happen AFTER schema
validation, not before. If the structured output fails validation, the deferred
must be failed (not resolved with invalid data), so that cache-hit waiters
also receive the error.

```ts
if (callState.parentBridgeRequestId) {
  if (command.payload.source === "answer") {
    // Plain text answer — resolve captured deferred directly
    if (callState.cacheBinding !== undefined) {
      yield* succeedCacheDeferred(callState.cacheBinding.deferred, command.payload.answer)
    }
    yield* resolveBridgeDeferred(callState.parentBridgeRequestId, command.payload.answer)
    return
  }

  if (command.payload.source === "value") {
    // Structured output — validate FIRST, then cache
    if (callState.outputJsonSchema !== undefined) {
      const validationResult = validateJsonSchema(command.payload.value, callState.outputJsonSchema)
      if (!validationResult.valid) {
        const error = new OutputValidationError({
          message: `Sub-call structured output schema validation failed: ${validationResult.errors.join("; ")}`,
          raw: renderSubmitAnswer(command.payload)
        })
        // CRITICAL (Rev 8 Finding #2): Evict BEFORE failing deferred
        if (callState.cacheBinding !== undefined && subcallCache !== null) {
          yield* evictCacheKey(subcallCache, callState.cacheBinding.key, callState.cacheBinding.deferred)
          yield* failCacheDeferred(callState.cacheBinding.deferred, error)
        }
        yield* failBridgeDeferred(callState.parentBridgeRequestId, error)
        return
      }
    }
    // Validation passed (or no schema) — resolve captured deferred
    if (callState.cacheBinding !== undefined) {
      yield* succeedCacheDeferred(callState.cacheBinding.deferred, command.payload.value)
    }
    yield* resolveBridgeDeferred(callState.parentBridgeRequestId, command.payload.value)
    return
  }

  // Neither "answer" nor "value" — fail
  const error = new OutputValidationError({
    message: "Sub-call finalization must use `SUBMIT({ answer: ... })`.",
    raw: renderSubmitAnswer(command.payload)
  })
  // CRITICAL (Rev 8 Finding #2): Evict BEFORE failing deferred
  if (callState.cacheBinding !== undefined && subcallCache !== null) {
    yield* evictCacheKey(subcallCache, callState.cacheBinding.key, callState.cacheBinding.deferred)
    yield* failCacheDeferred(callState.cacheBinding.deferred, error)
  }
  yield* failBridgeDeferred(callState.parentBridgeRequestId, error)
}
```

**StartCall pre-state failure** (in `handleStartCall` error handler, `Scheduler.ts:494-508`):

**CRITICAL (Rev 3 Finding #1):** When `handleStartCall` fails before
`setCallState` (e.g., sandbox creation fails, budget exhausted), the cache
deferred — already inserted into the inflight map by the parent's
`handleHandleBridgeCall` — is never resolved. This poisons the key: any
concurrent or future cache hit for the same key will await a deferred that
will never complete (or timeout after `bridgeTimeoutMs`).

**Fix:** In the existing error handler at `Scheduler.ts:494-508`, after
closing the scope and failing the bridge deferred, also fail and evict the
cache deferred:

```ts
// In handleStartCall error handler (Scheduler.ts:494-508):
// CRITICAL (Rev 4 Finding #3): Use Effect.exit(Scope.close(...)) to prevent
// finalizer failures from aborting the handler and skipping deferred cleanup.
// CRITICAL (Rev 7 Finding #1): Normalize raw error to RlmError using the
// existing UnknownRlmError class. The catchAll error is `unknown` (after
// catchTag filters out SchedulerQueueError). This matches the existing
// handler pattern at Scheduler.ts:505.
Effect.gen(function*() {
  const rlmError = new UnknownRlmError({ message: "StartCall failed", cause: error })
  yield* Effect.exit(Scope.close(callScope, Exit.fail(rlmError)))
  if (command.parentBridgeRequestId) {
    yield* failBridgeDeferred(command.parentBridgeRequestId, rlmError)
  }
  // CRITICAL (Rev 3 Finding #1): Evict and fail cache deferred to prevent
  // poisoned key when StartCall fails before setCallState.
  // CRITICAL (Rev 8 Finding #2): Evict BEFORE failing deferred.
  // Uses captured deferred directly (Rev 4 Finding #1) and identity-checked
  // eviction to prevent ABA race.
  if (command.cacheBinding !== undefined && subcallCache !== null) {
    yield* evictCacheKey(subcallCache, command.cacheBinding.key, command.cacheBinding.deferred)
    yield* failCacheDeferred(command.cacheBinding.deferred, rlmError)
  }
  yield* enqueue(RlmCommand.FailCall({
    callId: command.callId,
    error: rlmError
  }))
})
```

**Why evict before fail?** Evicting first ensures that no concurrent caller
can observe the failed deferred still in the map and receive a stale error
hit. The eviction is identity-checked (`map.get(key) === expectedDeferred`),
so a freshly-inserted entry for the same key by a different caller is not
affected. After eviction, failing the deferred resolves any *current* waiters
(already holding a reference to the deferred) with the error. Subsequent
calls for the same key get a fresh miss instead, which may succeed if the
transient failure (e.g., budget) has been resolved.

**Recursive failure path** (in `handleFailCall`):

**CRITICAL (Rev 9 Finding #1):** The existing `Scope.close` in `handleFailCall`
(at `Scheduler.ts:1380`) is not wrapped with `Effect.exit`. Change to:

```ts
// Harden Scope.close — make non-fatal so cache/bridge cleanup always executes
if (callState) {
  yield* Effect.exit(Scope.close(callState.callScope, Exit.fail(command.error)))
}
```

Then add cache deferred cleanup:

```ts
// CRITICAL (Rev 8 Finding #2): Evict BEFORE failing deferred
if (callState?.parentBridgeRequestId && callState.cacheBinding !== undefined) {
  if (subcallCache !== null) {
    yield* evictCacheKey(subcallCache, callState.cacheBinding.key, callState.cacheBinding.deferred)
  }
  yield* failCacheDeferred(callState.cacheBinding.deferred, command.error)
}
```

### Concurrent Dedup Semantics

The deferred-based pattern provides exactly the semantics the base spec
requests (`docs/plans/2026-02-07-rlm-effect-caching-refactor-spec.md:149`):

| Scenario | Behavior |
|----------|----------|
| First call for key K | Miss → create deferred → run sub-call → resolve deferred |
| Concurrent call for key K (in flight) | Hit → **fork** fiber to await deferred → scheduler loop continues |
| Later call for key K (completed) | Hit → fork completes immediately (deferred already resolved) |
| Sub-call fails for key K | Key evicted (identity-checked) then deferred failed → waiters receive error; retries get fresh miss |
| Schema validation fails | Key evicted then deferred failed with `OutputValidationError` → cache-deferred waiters receive `OutputValidationError`; bridge waiters receive `SandboxError` (BridgeStore converts) |
| Deferred.await times out | Waiter fails with `SandboxError` → does not affect other waiters |
| Capacity exceeded | No deferred registered → sub-call runs normally (no caching) |

**Budget accounting:** A cache hit does NOT consume an LLM call from the
budget. The cache check happens before `runOneShotSubCall` or `StartCall`
dispatch, so `reserveLlmCall` is never called for cached responses.

**Tests:**
- Identical `llm_query` calls in the same completion produce a cache hit on
  the second call (fake model receives only one call).
- **Concurrent duplicate `llm_query`**: two bridge calls with the same key
  dispatched before either completes → only one model call, both resolve with
  same value.
- **No scheduler deadlock on concurrent hit**: a cache-hit await does NOT
  block the scheduler from processing subsequent commands (including the
  `StartCall` that would resolve the awaited deferred). Test by verifying that
  a recursive sub-call with a concurrent cache hit completes without timeout.
- Structured `responseFormat` cache hit returns typed object/array (not string).
- Same `(query, context)` with different `responseFormat.schema` → different
  cache keys → no false hit.
- Same `(query, context)` with different `options.model` → different cache
  keys → no false hit.
- **Nested schema canonicalization**: schemas `{ a: { x: 1, y: 2 } }` and
  `{ a: { y: 2, x: 1 } }` produce the same hash. Schemas with different
  nested values produce different hashes.
- Cache is not shared across completions (separate `Layer.fresh` runtimes).
- `--no-cache` disables the cache (two identical calls = two model calls).
- Recursive branch isolation: same query in sibling branches (different
  `parentCallId`) → different cache entries.
- `CacheHit`/`CacheMiss` event assertions for both hit/miss paths.
- Sub-call failure with waiters: deferred failed → all waiters receive error.
- **Schema validation failure with waiters**: recursive sub-call with invalid
  structured output → deferred fails with `OutputValidationError` → cache-hit
  waiters that await the deferred directly receive `OutputValidationError`.
  **Note:** Bridge waiters (via `failBridgeDeferred`) receive `SandboxError`
  because `BridgeStore.fail` converts unknown errors via `toSandboxError`.
  Assert on `SandboxError` message content containing the validation details.
- **Over-capacity behavior**: when inflight map exceeds capacity, new sub-calls
  proceed without caching (no deferred registered, no events emitted).
- **Timeout on never-resolved deferred**: cache-hit waiter times out. Note:
  BridgeHandler timeout starts earlier than the cache-hit waiter, so in
  end-to-end tests the bridge timeout may fire first. Test at scheduler level
  by setting a very short cache timeout (e.g., 50ms) and a much longer bridge
  timeout, or test the waiter fork in isolation without BridgeHandler. Assert
  eviction behavior (key removed from inflight map) rather than specific
  timeout error messages.
- **Timeout eviction**: when a cache-hit waiter times out and the deferred is
  still pending (`Deferred.isDone` returns false), the key is evicted from
  the inflight map. A subsequent call for the same key gets a fresh miss.
  Use asymmetric timeout values (short cache, long bridge) to isolate the
  cache timeout path.
- **StartCall pre-state failure**: a sub-call whose `StartCall` fails (e.g.,
  sandbox creation error) fails the cache deferred AND evicts the key.
  Concurrent waiters receive the error; subsequent callers get a fresh miss.
- **ABA race prevention**: eviction of key K followed by reinsertion of key K
  with a new deferred D2 → old producer resolving D1 does not affect D2.
  `evictCacheKey` with D1 does not evict D2's entry.
- **Named model route isolation**: a named model called `"recursive"` produces
  cache key with `named:recursive`, not `route:recursive` → no false hit with
  the implicit recursive routing path.
- **Producer failure eviction**: when a one-shot sub-call fails, the cache
  deferred is failed AND the key is evicted. A subsequent identical call gets
  a fresh miss (not the stale failed deferred). Verify capacity is freed.
- **Budget accounting on cache hit**: two identical `llm_query` calls in the
  same completion (miss then hit). Assert that `llmCallsRemaining` decrements
  by exactly 1 (not 2), confirming the cache hit does not consume budget.
- **Cache-hit fiber interruption**: cache-hit waiter fiber is interrupted via
  scope closure before deferred resolves → bridge deferred is failed (not left
  unresolved). Uses `Effect.onInterrupt` (not `catchAllCause`, which does not
  fire on interruption) to guarantee cleanup.
- **Scope.close failure does not skip cleanup**: In `handleFinalize`, inject a
  failing scope finalizer → verify cache deferred is still resolved/failed and
  bridge deferred is still resolved (i.e., `Effect.exit(Scope.close(...))` makes
  finalizer failure non-fatal). Same test for `handleFailCall`.
- **Waiter interruption does NOT evict live producer**: A cache-hit waiter
  whose scope is closed (interrupted) does NOT evict the inflight entry. Verify
  the producer's deferred is still in the map and can be resolved successfully
  for other waiters. Only timeout-triggered failures cause eviction.
- **Hash failure graceful degradation**: when `hashSchema` throws (e.g.,
  circular reference or unsupported value), the sub-call proceeds without
  caching (no deferred registered, no cache events). Verify normal sub-call
  execution completes successfully.

---

## Step 6: Review Checkpoint

At this point, pause and verify:

1. All existing repository tests pass via `bun test` (baseline at plan update time: 470 passing on 2026-02-17).
2. New cache tests pass (including concurrent dedup and deadlock tests).
3. `bun run typecheck` introduces no new errors in `src/**` or `test/**` versus baseline. Existing unrelated strict-null test errors under `effect-nlp/test/**` are unchanged.
4. `bun run rlm` works end-to-end with both default (cache on) and `--no-cache`.
5. Cache events render correctly in verbose output.
6. Run codex review with full context prompt.

---

## Step 7 (Deferred): Model Response Cache (Tier C)

Contingent on Step 6 review passing. Adds model-level caching wrapping all
`llmCall.generateText` invocations.

Key design decisions:
- Add `deterministicOnly?: boolean` (default true) to `cache` config — only
  cache when temperature is 0 or equivalent. This field is deferred from
  Tier A/B since sub-call caching doesn't depend on temperature.
- Cache key = hash of serialized prompt + model route + settings + schema.
- Same deferred-based pattern as Tier B for concurrent dedup.
- Budget policy: skip budget consumption on hit and log saved tokens.

This step is deferred because:
- It has higher correctness risk (prompt serialization must be stable).
- The sub-call cache (Tier B) captures the most impactful dedup.
- It requires deciding the budget-on-hit policy.

---

## File Change Summary

| File | Change |
|------|--------|
| `src/CallContext.ts` | Add `staticSystemPromptArgs`, `staticSystemPromptPrefix`, `cacheBinding` fields |
| `src/SystemPrompt.ts` | Split into `buildReplSystemPromptStatic` + `buildReplSystemPromptDynamic`; keep `buildReplSystemPrompt` as compatibility wrapper |
| `src/RlmConfig.ts` | Add optional `cache` config block (`enabled`, `subcallCacheCapacity`) |
| `src/RlmTypes.ts` | Add `CacheHit`, `CacheMiss` event variants; add `cacheBinding` to `StartCall` command |
| `src/Runtime.ts` | Add `SubcallCache` interface and `subcallCache` to `RlmRuntimeShape` |
| `src/Scheduler.ts` | Add `Either` import; precompute static args/prefix in `handleStartCall`; use cached prefix in `handleGenerateStep`; cache check/write in `handleHandleBridgeCall` (forked hit with `onInterrupt`), `handleFinalize` (post-validation write-back), `handleFailCall`, `handleStartCall` error handler (fail+evict cache deferred); harden `Scope.close` with `Effect.exit` in `handleFinalize`/`handleFailCall`; add `succeedCacheDeferred`/`failCacheDeferred`/`evictCacheKey` helpers |
| `src/scheduler/CacheKey.ts` | New: `makeSubcallCacheKey`, `canonicalizeJson`, `hashSchema` helpers |
| `src/RlmRenderer.ts` | Render `CacheHit`/`CacheMiss` events |
| `src/cli/Command.ts` | Add `--no-cache` flag definition |
| `src/cli/Normalize.ts` | Map `--no-cache` to config |
| `src/CliLayer.ts` | Consume `noCache` from normalized args |
| `test/Scheduler.test.ts` | New cache tests: hit/miss, concurrent-dedup, no-deadlock, typed values, key discrimination, validation failure, over-capacity, timeout, budget accounting, fiber interruption |
| `test/CallContext.test.ts` | Test precomputed field storage |
| `test/scheduler/CacheKey.test.ts` | New: canonicalizeJson determinism, hashSchema collision avoidance (create `test/scheduler/` directory if absent) |
| `test/SystemPrompt.test.ts` | Prompt-split parity test (`buildReplSystemPrompt === static + dynamic`) |
| `test/RlmRenderer.test.ts` | Render `CacheHit`/`CacheMiss` event formatting |
| `test/CliCommand.test.ts` | `--no-cache` flag parsing |
| `test/CliNormalize.test.ts` | `noCache` propagation into `CliArgs` |
| `test/CliLayer.test.ts` | `makeCliConfig({ noCache: true })` produces `cache.enabled === false`; default produces no cache override |

---

## Implementation Order

```
Step 4  ──► Step 1  ──► Step 2  ──► Step 3  ──► Step 5a ──► Step 5b ──► Step 5c ──► Step 5d ──► Step 6
(events+    (types)    (scheduler   (config)    (runtime)   (key)      (read)      (write)     (review)
 commands)              + prompt)
```

**Why Step 4 first (Rev 10 Finding #2):** Step 2 references `command.cacheBinding`
on `StartCall`, which is added in Step 4b. Step 4 must land before Step 2 to
avoid compile errors. Similarly, Step 1 adds new fields to `MakeCallContextOptions`
that are populated in Step 2's `handleStartCall` changes — Steps 1 and 2 should
be landed together (or Step 1 fields made temporarily optional with a tightening
pass in Step 2).

Steps 3 and 5a can be done in parallel (different files).
Steps 5a and 5b can be done in parallel.

---

## Risks and Constraints

**Deferred lifecycle:** A `Deferred` that is never resolved (e.g., if the
sub-call silently drops without hitting `handleFinalize` or `handleFailCall`)
would leave waiters hanging. Mitigated by six layers of defense:
1. `Effect.timeoutFail` on `Deferred.await` in the cache-hit fork (derived
   from `bridgeTimeoutMs`, default 300s). On timeout with pending deferred,
   the stale key is evicted via `Effect.tapError` (which runs only on
   failures, not on interruption — preserving single-flight semantics).
2. All producer failure paths (one-shot catch, handleFinalize validation
   failure, handleFailCall, handleStartCall error handler) evict the key
   (identity-checked) THEN fail the cache deferred. Evict-before-fail
   prevents concurrent callers from observing a failed deferred still in the
   map. This ensures failed entries don't consume capacity or cause stale
   error hits.
3. `Scope.close` in `handleFinalize` and `handleFailCall` wrapped with
   `Effect.exit()` to make finalizer failures non-fatal — ensures cache/bridge
   cleanup code always executes even if a finalizer throws.
4. The completion-level scope close in `Rlm.ts` which interrupts all fibers.
5. Cache-hit fork uses `Effect.catchAllCause` for failures/defects AND
   `Effect.onInterrupt` for scope-closure interruption (the two are separate
   — `catchAllCause` does NOT fire on interruption in Effect). Together they
   ensure the bridge deferred is always failed on any non-success exit.
6. Waiter interruption (scope close) does NOT evict the inflight entry — only
   timeout-triggered failures cause eviction. This prevents a canceled waiter
   from breaking single-flight semantics for other waiters of the same key.

**Deferred double-resolve:** `Deferred.succeed`/`Deferred.fail` on an
already-resolved deferred is a no-op in Effect (returns `false`). This is safe
— if a deferred is resolved by both the write-back path and a timeout/error
path, the second resolution is silently ignored.

**`Bun.hash` stability:** `Bun.hash` uses wyhash which is stable within a
process but not across Bun versions. This is fine for request-local caching
(lifetime = one completion). For Tier D (cross-run), we would need a stable
hash (SHA-256 or similar).

**Memory pressure:** With capacity 256 and `unknown` values (LLM responses can
be 1-10KB), worst case is ~2.5MB per completion. The `Deferred` objects add
negligible overhead. Acceptable.

**Map concurrency, TOCTOU, and ABA:** All cache check-and-insert operations
use `Ref.modify` for atomicity. The `Deferred` is created before `Ref.modify`
and either inserted (miss) or discarded (hit/over-capacity). If two fibers
race for the same key, only the first one's deferred is inserted; the second
sees the existing entry and awaits it. This eliminates the TOCTOU race.

To prevent ABA races (Rev 4 Finding #1): write-back helpers resolve/fail the
captured deferred directly, never looking up by key. `evictCacheKey` checks
`map.get(key) === expectedDeferred` before deleting. This ensures that if a
key is evicted on timeout, reinserted by a new caller, and the old producer
finishes late, it resolves its own (now-disconnected) deferred — not the new
caller's deferred.

```ts
// Atomic check-and-insert pattern
const freshDeferred = yield* Deferred.make<unknown, RlmError>()
const result = yield* Ref.modify(subcallCache.inflight, (m) => {
  const existing = m.get(cacheKey)
  if (existing !== undefined) {
    return [{ _tag: "hit" as const, deferred: existing }, m] as const
  }
  if (m.size >= subcallCache.capacity) {
    return [{ _tag: "over-capacity" as const }, m] as const
  }
  const next = new Map(m)
  next.set(cacheKey, freshDeferred)
  return [{ _tag: "miss" as const, deferred: freshDeferred }, next] as const
})

// Write-back uses captured deferred directly — no key lookup
yield* succeedCacheDeferred(result.deferred, value)  // not succeedCacheDeferred(cache, key, value)

// Eviction checks identity before deleting
yield* evictCacheKey(cache, key, result.deferred)  // only evicts if map.get(key) === result.deferred
```

**Budget accounting on cache hit:** A cache hit in the sub-call path should
NOT consume an LLM call from the budget (the call was already counted on the
original execution). The cache check happens before `runOneShotSubCall` or
`StartCall`, so no budget is consumed. This is correct by construction.

**Schema canonicalization correctness:** `canonicalizeJson` handles:
- Primitive values (null, boolean, number, string) via `JSON.stringify`
- Arrays (preserve order, recursively canonicalize elements)
- Objects (sort keys at every nesting level, recursively canonicalize values)
- Nested objects within arrays within objects (full recursion)

Edge cases: `undefined` values in objects are explicitly filtered out via
`.filter((k) => obj[k] !== undefined)` after `Object.keys(...).sort()`,
matching `JSON.stringify` behavior (which omits `undefined`-valued keys).
Circular references would cause infinite recursion, but JSON Schema objects
are acyclic by design.
