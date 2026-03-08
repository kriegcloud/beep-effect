# Recursive RLM Parallelization + Agentic Reactivation Spec

Date: 2026-02-08
Author: Codex
Workspace: `/Users/pooks/Dev/recursive-llm`

## 1. Scope

This spec translates `docs/parallelization-research.md` into a concrete, phased implementation plan for this codebase, with two added refinements:

1. first-class Google provider support in runtime wiring and CLI;
2. configurable delegation of sub-LLM bridge calls to lower-tier models.

Migration posture: this is a hard migration plan. We do not preserve legacy compatibility paths.

Assumption on wording: no "genetic" subsystem exists in this repository. I interpret "reactivate genetic stuff" as reactivating agentic recursive behavior (`llm_query` usage, chunk decomposition, and parallel sub-call patterns).

## 1.1 Implementation Snapshot (2026-02-08)

Completed in runtime code:

- `SUBMIT` finalization now uses schema-first mode validation with strict parse options (exact + excess-property rejection).
- Structured `SUBMIT({ value })` payloads are preserved as raw values through scheduler finalization.
- Typed `Rlm.complete({ outputSchema })` now decodes structured values directly (no JSON stringify/parse churn).

Still pending for full migration target:

- delegation policy by bridge method/source (currently depth-threshold-only),
- full config-driven cross-provider primary/sub routing (including mixed-provider sub-target selection),
- schema-derived submit toolkit parameters from per-run output schema (instead of static `Schema.Unknown` for `value`),
- richer prompt rendering of tool schema annotations/descriptions/examples.

## 2. Inputs Reviewed

- Research notes:
  - `docs/parallelization-research.md`
  - `docs/rlm-prompting-research.md`
  - `docs/research-synthesis.md`
- Runtime implementation:
  - `src/Scheduler.ts`
  - `src/SandboxBun.ts`
  - `src/sandbox-worker.ts`
  - `src/BridgeHandler.ts`
  - `src/Runtime.ts`
  - `src/Budget.ts`
  - `src/SystemPrompt.ts`
  - `src/RlmModel.ts`
  - `src/RlmConfig.ts`
  - `src/cli.ts`
- Test surface:
  - `test/Scheduler.test.ts`
  - `test/sandbox-worker.test.ts`
  - `test/SystemPrompt.test.ts`
  - `test/helpers/FakeRlmModel.ts`
- Effect guidance and source:
  - `effect-solutions list`
  - `effect-solutions show config services-and-layers basics`
  - `.reference/effect/packages/ai/ai/src/LanguageModel.ts`
  - `.reference/effect/packages/ai/google/src/GoogleLanguageModel.ts`
  - `.reference/effect/packages/ai/google/src/GoogleClient.ts`
  - `.reference/effect/packages/ai/openai/src/OpenAiLanguageModel.ts`
  - `.reference/effect/packages/effect/src/Stream.ts`
  - `.reference/effect/packages/effect/src/internal/groupBy.ts`
  - `.reference/effect/packages/effect/src/Pool.ts`
  - `.reference/effect/packages/effect/src/FiberSet.ts`

## 3. Current-State Findings (Validated)

### 3.1 What already works well

- Budget updates are atomic via `Ref.modify` (`src/Budget.ts`).
- Global LLM concurrency limiting exists (`src/Runtime.ts` + `withLlmPermit` in `src/Budget.ts`).
- Worker-side bridge calls already support multiple in-flight requests (`pendingBridge` in `src/sandbox-worker.ts`).
- Host-side bridge dispatch is already fiber-scoped and bounded per sandbox (`FiberSet.run` + `bridgeSemaphore` in `src/SandboxBun.ts`).

### 3.2 Primary bottlenecks

- Scheduler command loop is globally sequential (`Stream.runForEach` in `src/Scheduler.ts`).
- Prompt few-shot still demonstrates sequential chunk processing (`for ... await llm_query`) in `src/SystemPrompt.ts`.
- `llm_query` below max depth always creates full recursive sub-calls via `StartCall`, even when the child cannot recurse further (`src/Scheduler.ts`).

### 3.3 Provider and delegation gaps

- Google is now wired in CLI and model constructors, but routing still assumes the sub-model uses the same provider selected at CLI root.
- Sub-model routing remains depth-threshold-only (`depth >= threshold`), not policy-based by bridge method (`llm_query` vs `llm_query_batched`) or call source metadata.
- `RlmConfig` exposes `primaryTarget` / `subTarget`, but runtime provider construction is still largely CLI-branch-driven rather than target-driven service composition.
- Submit structured validation remains late in the pipeline for tool-level enforcement; the tool contract is still static (`value: Schema.Unknown`) instead of deriving from per-run output schema.

### 3.4 Effect-AI constraints relevant to the plan

- `LanguageModel.GenerateTextOptions.concurrency` in Effect AI controls tool-call resolver concurrency, not bridge-level fanout. Bridge batching still requires explicit host orchestration.
- Anthropic/OpenAI/Google model constructors all produce `LanguageModel.Service` instances, so cross-provider primary/sub routing is feasible by composing the required client layers.

### 3.5 Explorer-Agent Deep Review Addenda

Validated with end-to-end code inspection and local Effect reference sources:

- Delegation policy should be method-aware; depth-only gating is too coarse once batched bridge calls are introduced.
- Finalization should stay schema-first end-to-end: tool contract, extraction contract, scheduler payload, and `Rlm.complete` decoding should share one model.
- Prompt construction should expose schema annotations in readable form (field-level descriptions/examples), not only raw JSON dumps.
- Provider selection should be a config/layer concern (from `RlmConfig` targets), not a duplicated CLI switch concern.

## 4. Design Goals

1. Improve wall-clock latency for chunked semantic tasks.
2. Reactivate agentic decomposition patterns so the model chooses parallel semantic delegation more often.
3. Support provider matrix parity at runtime and CLI (Anthropic, OpenAI, Google).
4. Add configurable lower-tier delegation for sub-LLM calls (cost/performance control).
5. Preserve RLM invariants:
   - reserve budget before every LLM call,
   - one semaphore permit per LLM call,
   - one terminal outcome per bridge request,
   - deterministic per-call ordering even if cross-call concurrency increases.
6. Keep rollback simple via config flags for risky phases.

## 5. Effect-Native Architecture Plan

### 5.1 Routing model and config contract

Introduce an explicit routing contract instead of implicit depth-only selection.

```ts
type RlmProvider = "anthropic" | "openai" | "google"

interface ModelTarget {
  readonly provider: RlmProvider
  readonly model: string
}

interface SubLlmDelegationConfig {
  readonly enabled: boolean
  readonly depthThreshold: number
  readonly methods: ReadonlyArray<"llm_query" | "llm_query_batched">
  readonly target?: ModelTarget // default: primary target
}

type ModelCallSource = "root" | "bridge/llm_query" | "bridge/llm_query_batched"
```

Behavioral contract:

- root generation always uses `primary` target;
- bridge sub-calls use `sub` target only when delegation is enabled and source/method/depth match policy;
- when delegation is disabled, all calls use primary target by explicit policy (not compatibility fallback).
- scheduler propagates `ModelCallSource` metadata into `RlmModel.generateText` so policy can be evaluated deterministically and tested.

---

### Phase 0: Baseline Instrumentation (no behavior change)

Add observability so each later phase has measurable impact.

Changes:

- Add runtime metrics/events for:
  - bridge call count by method (`llm_query`, `llm_query_batched`),
  - in-flight bridge requests,
  - scheduler queue depth snapshots,
  - LLM permit wait time.
- Add fixture benchmark harness for 2k/5k/10k corpora.
- Add provider-route tags in model call metrics (`primary` vs `sub` target).

Exit criteria:

- Baseline report generated for at least 3 fixture workloads.

---

### Phase 1: Agentic Pattern Reactivation (prompt-level, low risk)

Goal: make parallel semantic decomposition the default model behavior.

Changes:

- Update `src/SystemPrompt.ts` recursive example from sequential loop to `Promise.all(...)`.
- Add explicit guidance:
  - use `Promise.all` for independent `llm_query` calls,
  - use sequential calls only when order dependency exists,
  - avoid heuristic string matching for semantic tasks.
- Keep existing budget warnings and chunking guidance.

Tests:

- Update `test/SystemPrompt.test.ts` assertions for new example text.
- Add assertion that prompt includes both sequential and parallel decision rules.

Exit criteria:

- Prompt snapshots updated.
- No scheduler/runtime behavior changes.

---

### Phase 2: Provider Matrix + Delegation Policy Foundation

Goal: wire Google provider and establish explicit sub-tier delegation configuration without changing scheduler parallelism yet.

#### 2.1 CLI and config surface

- Extend CLI provider enum to include `google`.
- Add env wiring/help text for `GOOGLE_API_KEY`.
- Add optional `--sub-provider` and `--sub-model`.
- Add optional delegation toggles:
  - `--sub-delegation-enabled`,
  - `--sub-delegation-depth-threshold`,
  - `--sub-delegation-methods llm_query,llm_query_batched`.

#### 2.2 `RlmConfig` schema updates

Add typed routing config:

- `primaryTarget: ModelTarget`
- `subDelegation: SubLlmDelegationConfig`

Default policy:

- delegation enabled when `subModel` is set;
- depth threshold default `1`;
- methods default `["llm_query", "llm_query_batched"]`;
- sub target provider defaults to primary provider.

#### 2.3 `RlmModel` route selection updates

- Replace raw `depthThreshold` check with a policy function:
  - inputs: `depth`, `bridgeMethod | "root"`;
  - output: selected target (`primary` or `sub`).
- Keep existing `generateText` API shape with minimal extension for call source metadata.
- Compose required provider client layers for cross-provider primary/sub setups.

Tests:

- Add route-selection unit tests for:
  - primary-only mode,
  - same-provider sub delegation,
  - cross-provider delegation (for example OpenAI primary + Google sub).
- Add CLI parse tests for provider/delegation flags.

Exit criteria:

- CLI can run with `--provider google`.
- Sub-tier delegation policy is configurable and enabled by explicit migration defaults.

---

### Phase 3: `llm_query_batched` + Leaf Fast Path (high impact)

Goal: make host-managed parallel sub-calls explicit and cheap while honoring phase-2 routing policy.

#### 3.1 Add bridge method `llm_query_batched`

API (worker-side):

```ts
async function llm_query_batched(
  queries: ReadonlyArray<string>,
  contexts?: ReadonlyArray<string>
): Promise<ReadonlyArray<string>>
```

Behavior (host-side):

- Validate payload shape and lengths.
- Execute one-shot calls with:
  - `reserveLlmCall` per item,
  - `withLlmPermit` per item,
  - `Effect.forEach(..., { concurrency: config.concurrency })`.
- Resolve per-item route via phase-2 delegation policy.
- Preserve output order to match input order.
- V1 semantics: fail-fast (`Promise.all`-like).

#### 3.2 Add leaf-depth fast path for `llm_query`

- If `callState.depth + 1 >= maxDepth`, skip recursive `StartCall` and execute one-shot directly in bridge handling.
- Keep full recursive path only when child still has recursion budget.
- Route one-shot leaf execution through the same policy function (so lower-tier delegation remains consistent).

Files:

- `src/sandbox-worker.ts`
- `src/Scheduler.ts`
- `src/SystemPrompt.ts`
- `src/RlmTool.ts`
- `src/RlmTypes.ts` (optional event extensions)

Tests:

- `test/sandbox-worker.test.ts`:
  - batched bridge call request/response flow,
  - strict mode blocks batched bridge calls.
- `test/Scheduler.test.ts`:
  - batched calls preserve order,
  - budget exhaustion in batch returns expected failure,
  - leaf fast path uses one-shot route when child depth hits cap,
  - delegated sub-tier routing is applied for batch and leaf paths.

Exit criteria:

- Chunked workloads show significant latency reduction without budget invariant regressions.

---

### Phase 4: SUBMIT-Only Finalization + Structured-Output Alignment

Goal: remove legacy text finalization paths and make final output handling deterministic, tool-driven, and schema-aligned.

Changes:

- Remove `FINAL(...)` finalization behavior from scheduler runtime paths.
- Require exactly one `SUBMIT` tool call to finalize both:
  - normal REPL loop terminal responses,
  - extract pass responses after iteration exhaustion.
- Harden `SUBMIT` payload parsing (implemented):
  - plain mode requires `SUBMIT({ answer })`,
  - structured mode requires `SUBMIT({ value })`,
  - reject ambiguous payloads (`answer` + `value`) with explicit validation errors,
  - enforce strict schema parse options (`exact: true`, `onExcessProperty: "error"`).
- Preserve structured payloads as raw values through scheduler finalization (implemented) and decode typed outputs directly from those values (no stringify/parse roundtrip).
- Remaining work in this phase:
  - derive Submit tool `value` parameter schema from per-run `outputJsonSchema` so tool contract and final decoder share one schema source.
- Update prompt construction:
  - remove all fallback references to `FINAL(...)`,
  - provide per-run `SUBMIT` invocation schema in prompt text,
  - tighten extract prompt to `SUBMIT`-only instructions.
- Update tests:
  - migrate scripted fixtures from text `FINAL(...)` to `SUBMIT` tool calls,
  - add regression coverage that textual `FINAL(...)` no longer finalizes.

Exit criteria:

- All finalization paths are `SUBMIT`-only.
- Structured-output runs reject plain-answer submits and accept only schema-aligned `value` submits.

---

### Phase 5: Robustness Hardening for Batch + Delegation

Goal: prevent high-concurrency + multi-provider routing from degrading reliability.

Changes:

- Add config hard limits:
  - `maxBatchQueries`,
  - `enableLlmQueryBatched`,
  - `llmQueryLeafFastPath`.
- Add payload/frame safeguards:
  - reject oversized batch args before enqueueing model work.
- Improve error framing:
  - include method + item index + selected route in failure messages.
- Add warning events for:
  - disabled batch calls,
  - invalid sub delegation config fallback,
  - provider key missing for selected route.

Exit criteria:

- Stress tests show no leaked deferreds/fibers and no hung bridge calls.

---

### Phase 6: Scheduler Keyed Parallelism (experimental, feature-gated)

Goal: parallelize independent calls while preserving per-call ordering.

Proposed mode:

```ts
Stream.fromQueue(runtime.commands).pipe(
  Stream.mapEffect(
    (command) =>
      schedulerDispatchSemaphore.withPermits(1)(
        processCommand(command).pipe(/* existing error mapping */)
      ),
    { key: (command) => command.callId, bufferSize: config.schedulerKeyBufferSize }
  ),
  Stream.runDrain
)
```

Important Effect source note:

- `Stream.mapEffect` keyed mode internally fans out by key (`groupByKey`); cap global active command handling with an explicit semaphore.

Config:

- `schedulerMode: "sequential" | "keyed"` (default `"sequential"`).
- `schedulerParallelCalls`.
- `schedulerKeyBufferSize`.

Exit criteria:

- Multi-call throughput gain with no ordering regressions within a single `callId`.

---

### Phase 7: Optional Sandbox Pooling (future)

Goal: reduce `Bun.spawn` overhead in multi-call/high-depth workloads.

Approach:

- Introduce pool-backed sandbox acquisition (`Pool.make` with scoped acquisition).
- Keep per-call variable isolation by resetting worker state on checkout.
- Keep disabled by default unless benchmark data justifies enabling.

## 6. File-by-File Change Plan

1. `src/SystemPrompt.ts`
- Replace sequential chunk example with parallel example.
- Remove `FINAL(...)` fallback guidance and add run-specific `SUBMIT` invocation schemas.
- Document when to use `Promise.all` vs sequential `await`.
- Render tool/output schema information in human-readable summaries derived from schema annotations (descriptions/examples), not only raw JSON dumps.

2. `src/SubmitTool.ts`
- Add strict extraction semantics for plain vs structured finalization modes (done).
- Provide run-specific invocation schema helper for prompt construction.
- Preserve structured `value` as raw payload through extraction/finalization (done).
- Replace static structured parameter (`Schema.Unknown`) with per-run schema-derived tool definition (pending).

3. `src/RlmConfig.ts`
- Add routing/delegation config schema and defaults.
- Extend delegation config with method/source-aware policy fields.

4. `src/RlmModel.ts`
- Refactor depth-threshold model selection into policy-based route selection using call-source metadata.
- Support cross-provider primary/sub target wiring.

5. `src/cli.ts`
- Keep provider argument parsing thin; move provider/sub-provider target resolution into config/layer wiring.
- Add sub-provider/delegation CLI flags and env-key validation messaging for mixed-provider routes.

6. `src/sandbox-worker.ts`
- Expose `llm_query_batched`.
- Reserve binding names in strict-scope and tool-name checks.

7. `src/Scheduler.ts`
- Handle `llm_query_batched` bridge method.
- Implement `llm_query` leaf fast path.
- Resolve route selection metadata per model call (`ModelCallSource` propagation).
- Enforce `SUBMIT`-only finalization in both normal and extract flows (done).
- Carry finalized payload as typed union (`answer` vs `value`) rather than string-only final state (done).
- (Phase 6) add keyed scheduler mode with feature flag.

8. `src/RlmTypes.ts`
- Add typed finalization payload model and optional route/delegation warning events.

9. `test/sandbox-worker.test.ts`
- Add batched bridge protocol tests.

10. `test/Scheduler.test.ts`
- Add batch + fast-path + delegation policy tests.
- Add strict `SUBMIT`-only finalization tests.

11. `test/SystemPrompt.test.ts`
- Add/adjust prompt guidance assertions.

12. `test/helpers/FakeRlmModel.ts`
- Add route/method capture hooks for deterministic routing assertions.

## 7. Verification Plan

### Functional

- Existing tests remain green.
- New tests:
  - batched order preservation,
  - batched fail-fast behavior,
  - strict-mode bridge disablement for batched call,
  - leaf fast-path correctness,
  - provider/delegation route selection correctness,
  - `SUBMIT` strict parse behavior (exact + excess-property rejection),
  - structured payload passthrough without stringify/parse roundtrip.

### Provider matrix

Verify CLI and layer wiring for:

- Anthropic primary only,
- OpenAI primary only,
- Google primary only,
- OpenAI primary + Google sub delegation,
- Anthropic primary + OpenAI sub delegation.

### Concurrency + lifecycle

- Soak test with many concurrent batched bridge calls.
- Verify:
  - no leaked `bridgePending`,
  - no leaked sandbox fibers/processes,
  - queue shutdown still unblocks all waiters.

### Performance + cost

Run benchmark suite on fixture workloads:

- `test/fixtures/chicago-politics-2k-clean.ndjson`
- `test/fixtures/chicago-politics-5k-clean.ndjson`
- `test/fixtures/chicago-politics-10k-clean.ndjson`

Track:

- total completion latency,
- total LLM calls,
- route split (`primary` vs `sub` call counts),
- p95 bridge round-trip latency,
- queue depth over time,
- max in-flight bridge requests.

Target improvements:

- Phase 1: increased model tendency to generate parallel sub-call code.
- Phase 3: 2x-4x latency reduction on independent chunk-analysis workloads at concurrency 4.
- Delegation mode: reduced expensive-tier call share without correctness regressions on benchmark prompts.
- Phase 5 (optional): measurable throughput gain in concurrent multi-call scenarios.

## 8. Rollout Strategy

1. Ship Phase 1 first (safe prompt changes).
2. Ship Phase 2 (provider + delegation config) as a breaking migration.
3. Ship Phase 3 behind `enableLlmQueryBatched` and `llmQueryLeafFastPath`.
4. Enable phase-3 features by default after benchmark + soak validation.
5. Keep Phase 5 disabled by default until dedicated concurrency soak suite passes.

Rollback:

- Rollback is code-level revert; no legacy runtime compatibility mode is maintained.

## 9. Open Decisions

1. `llm_query_batched` error mode:
- keep fail-fast only, or add `allSettled` variant for partial results.

2. Delegation default:
- enable whenever `subModel` exists, or require explicit opt-in flag.

3. Missing provider credentials policy:
- hard-fail immediately for selected route (decided; no automatic fallback).

4. Scheduler keyed mode scope:
- adopt only for server/batch use cases, keep CLI default sequential.
