# Effect Orchestration Patterns — Decisions

<!--
ALIGN seed (pre-drafted 2026-06-29 from RESEARCH.md + CAPTURE.md). Each entry is
a branch-closing fork with a RECOMMENDED answer and grounded rationale, left
OPEN for the user to resolve via `/grill-with-docs effect-orchestration-patterns`.
Do not treat Recommended as decided — it is the lead option to grill against.
Resolutions get rewritten here (newest last) and synced to ops/manifest.json.
-->

## Q1: Scope boundary — does this packet ship only the pure-`Schedule` layer now, or also the stateful resilience stack?

**Recommended:** Scope this packet to the **pure / stateless** orchestration layer only: (1) the centralized `Schedule` retry-policy module (`llmRetry` / `networkRetry` / `databaseRetry`), (2) the `Layer.unwrap` build-time provider selector, (3) the AI-free `decode→die` / `isDefect` / `getErrorMessage` helper, and (4) a generic tagged-status degraded-batch combinator. **Defer** the heavier *stateful* resilience stack — circuit breaker, `Ref`-backed retry-budget token bucket, bulkhead pool Layer, served-while-open cache, and the per-key rate-limiter wiring — to a sibling packet (provisional `resilience-stack-circuit-breaker-budget`), keeping pre-decisions Q5/Q7 on record so the split is clean.

**Rationale:** RESEARCH names net-new as "exactly two things" (the retry-policy module and the `Layer.unwrap` selector) plus adjacent glue (`RESEARCH.md:115`), and explicitly flags the stateful layer as "heavier than the pure `Schedule` policies — **home undecided** … an align-stage decision" (`RESEARCH.md:116`). The pure layer is a low-risk DRY extraction over code that already exists and typechecks (anthropic `ExecutionPlan` at `Anthropic.service.ts:103-107`); the stateful layer needs a new `Ref`-held state machine, a store-selection schema, and a license-hygiene clean-room (Q5) — different appetite, different review surface. A focused first packet ships value fast and de-risks the stateful one with a proven retry substrate underneath it.

**Status:** open (for /grill-with-docs)

## Q2: Package placement — where do the pure retry policies and selector live?

**Recommended:** Land the pure policies as a new `Retry.ts` concern-module inside **`@beep/utils`** (`packages/foundation/modeling/utils`), exported through its barrel, alongside the existing per-concern modules. Co-locate the AI-free `decode→die` / `isDefect` helper in **`@beep/schema`** (`packages/foundation/modeling/schema`) next to the existing `*TaggedError*` exports, and keep the `isRetryable`-over-`AiError` predicate out of foundation (re-export it from the LLM-scoped retry surface instead). Reserve a new `@beep/resilience` leaf package only for the deferred stateful stack (decided in Q7), not for these.

**Rationale:** `@beep/utils` already follows a one-module-per-concern shape (`Stream.ts`, `Random.ts`, `Function.ts`) so a `Retry.ts` slots in cleanly (`RESEARCH.md:86`), and a v4-idiomatic policy to generalize already lives there-adjacent (`SqlTest.ts:616` `PgConnectRetryPolicy = Schedule.both(Schedule.spaced(...), Schedule.recurs(20))`). `@beep/schema` already exports `CauseTaggedError`/`StatusCauseError`/`TaggedErrorClass` (`packages/foundation/modeling/schema/src/index.ts:49,326,331,341`) and depends on `effect` core only — no `effect/unstable/ai` — making it the correct AI-free home for `decodeOrDie`/`isDefect`, while the `AiError.isRetryable` predicate (`AiError.ts:100,388`) must stay LLM-scoped to avoid coupling foundation to the AI module (`RESEARCH.md:72`).

**Status:** open (for /grill-with-docs)

## Q3: First slice — which driver migrates first to prove the shared retry module?

**Recommended:** Extract from **`@beep/anthropic` first** (lift its `ExecutionPlan.make({ schedule: Schedule.exponential(...), while: isRetryable })` into the shared `llmRetry`, prove byte-for-byte parity against the existing tests, de-dupe the `Anthropic.repair.ts` copy). **Second, fold `@beep/m365`'s** hand-rolled `Retry-After`-honoring recursion into the shared `networkRetry` via `Schedule.modifyDelay`. **Third, close the `@beep/openai-compat` gap** (it has no retry today). Defer `xai` / `venice-ai` / `ai-provider-cli` until the shape is stable.

**Rationale:** anthropic is "the only driver with a real `Schedule`/`ExecutionPlan` retry policy" and is duplicated across two sites (`Anthropic.service.ts:103-107`, `Anthropic.repair.ts`) — extracting it is pure consolidation with an existing test net, the safest possible first migration. m365 is the second real prior-art but hand-rolled (`M365.service.ts:769,800`; budget `M365.config.ts:80`; test `M365.service.test.ts:519`), and its `retry-after` parsing is exactly the `Schedule.modifyDelay`-honors-`retry-after` shape the shared module needs (`RESEARCH.md:64`) — folding it second both DRYs the driver and stress-tests the policy's header path. openai-compat is a genuine resilience *gap* not a duplicate (its only "retry" token is `mapSseRetry`, `OpenAiCompatClient.service.ts:251`), so it validates the module on a from-scratch consumer.

**Status:** open (for /grill-with-docs)

## Q4: Vendor / auth — what is the provider-selector's scope and its secret boundary?

**Recommended:** This packet owns **only the build-time `Layer.unwrap` selector**: one provider-agnostic `Context.Service` tag, one `Config.literals([...], name)`-driven branch chooser that returns *only the chosen provider's* Layer. Keep it strictly distinct from **runtime** multi-provider fallback / `ExecutionPlan` dispatch, which stays in the separate `multi-provider-llm-dispatch-fallback` packet. Invariant: secrets stay `Config.redacted`, and the selector must **never initialize unused providers'** clients or credentials. Use the repo's existing provider-vocabulary precedent (`LiteralKit(["claude","codex"])` + `.$match`) as the shape for the unified LLM-provider literal feeding `Config.literals`.

**Rationale:** `Layer.unwrap` (the v4 name; `Layer.unwrapEffect` from the CAPTURE seed has **0 usages** and does not exist in v4) is already battle-tested in-repo with the exact "return only the chosen branch" property — `M365.service.ts:1176` is the typed-error-at-config-boundary precedent, and `SqlTest.ts:1340` is the switch-based lazy selector (`RESEARCH.md:69`). The "return only the chosen branch" property is what guarantees unused providers' `Config.redacted` API keys are never read (`RESEARCH.md:119`). Routing cautions explicitly say keep the build-time selector distinct from runtime fallback/dispatch (`RESEARCH.md:124`), and `ai-provider-cli` already models exhaustive provider dispatch via `LiteralKit` + `.$match` (`AiProviderCli.models.ts:27`, `AiProviderCli.service.ts:75`) — the repo-native pattern to mirror, with `Config.literals` (@since 4.0.0) for env-restricted-to-a-set selection.

**Status:** open (for /grill-with-docs)

## Q5: Build-vs-buy — circuit breaker: clean-room from behavioral spec, or adopt a dependency?

**Recommended:** **Clean-room** an ~80–150-line `closed → open → half-open` state machine as a `Ref`-held Effect `Layer`, implemented **from the documented behavioral spec/tests** of the reference libraries — *not* by adopting a dependency and *not* by line-translating their source. (This is a pre-decision for the deferred stateful packet per Q1, recorded now because it gates that packet's appetite and license posture.)

**Rationale:** Effect core has **no** circuit breaker in any version; the upstream request `effect#2843` has been **open since 2024-05-24** with no maintainer decision (`RESEARCH.md:42`), so there is nothing to reuse. The two references — Cockatiel (MIT) and opossum (Apache-2.0) — are both zero-dep but Promise/`AbortSignal`-based, so wrapping them costs an `Effect.tryPromise`+`AbortSignal` interop tax that erases typed-error/`Cause` fidelity and adds a runtime dep against the repo's no-new-runtime-dep posture. License gravity is explicit: "reference-only / no dep adopted" does **not** by itself shed the license — a close translation stays a derivative work obligating the upstream notice (`RESEARCH.md:108`), so the only clean path is implement-from-behavior. v4 already ships the breaker's neighbors (`Semaphore`/`PartitionedSemaphore` bulkhead primitives, `Cache`/`ScopedCache`) so only the breaker itself and the served-while-open glue are net-new (`RESEARCH.md:43-44`).

**Status:** open (for /grill-with-docs)

## Q6: Degraded fan-out — extract a generic tagged-status combinator, or leave it per-call?

**Recommended:** **Extract one generic, tagged-status degraded-batch combinator** (a `forEachSettled`-style helper returning `{ ok, failed }` per item over a bounded `Effect.forEach(..., { concurrency })`) by generalizing the already-production nlp Executor shape, and route the remaining first-failure short-circuit fan-outs through it where graceful degradation is wanted. Do not re-document EF-27 — reuse the law; this is just the missing shared helper.

**Rationale:** The repo already has a *bespoke* production degraded fan-out — `Executor.ts` wraps each leaf in `Effect.result` (`:236`), folds failures into an `errors` array instead of failing the batch (`:237`), runs the bounded `Effect.forEach(..., { concurrency })` (`:354`), and flattens per-leaf results (`:306`) — so the shape is proven, but it is a domain-specific `Result`-per-leaf fold, not a shared combinator (`RESEARCH.md:81,83`). The generic primitives (`Effect.partition` / `Effect.validate` / `Effect.all mode:"result"`) have **zero** production fan-out usages (`RESEARCH.md:83`), and genuine short-circuit sites remain (`BlockRepair.ts`, `ai-metrics/*`). Net-new is to *extract the proven shape*, not invent one — and the seed's v3 `Effect.forEach` `mode:"either"|"validate"` is **removed** in v4 (`RESEARCH.md:96`), so the combinator must be written against the beta.91 surface (per-item `Effect.result`/`option`/`exit`).

**Status:** open (for /grill-with-docs)

## Q7: Rate limiter & stateful-resilience home — reuse the v4 built-in, and where does the stateful stack live?

**Recommended:** **Reuse** v4's `effect/unstable/persistence/RateLimiter` (and `HttpClient.withRateLimiter` / `HttpClient.retryTransient`) rather than porting the Juris.AI quota-manager — net-new is only the **store-selection** (`layerStoreMemory` dev / `layerStoreRedis` prod) plus a per-provider tier-config schema. When the deferred stateful stack (Q1) graduates, home it in a **new `@beep/resilience` leaf package**, not as more `@beep/utils` modules, since it pulls in `effect/unstable/*`, a Redis store boundary, and the clean-room breaker (Q5). Pin and re-verify the `unstable/*` surface on every `effect` bump.

**Rationale:** RESEARCH finds the v4 `RateLimiter` is "**structurally identical** to the Juris.AI#5 hand-rolled quota-manager — reuse, do not port" (`RESEARCH.md:41`): it already ships fixed-window/token-bucket algorithms, `onExceeded: "delay"|"fail"`, an adaptive phase machine, both stores, and auto-honoring of `retry-after` on 429. Adoption is greenfield-in-repo (`RateLimiter`/`retryTransient` have **0** current usages, `RESEARCH.md:89`) but the primitive exists, so the work is wiring + a tier-config schema, not invention. The stateful stack's heavier dependency surface and store boundary (`RESEARCH.md:116,120`) argue for an isolated `@beep/resilience` leaf so the AI-free `@beep/utils`/`@beep/schema` foundation stays light; the namespace is explicitly **unstable** and "may shift across betas" (`RESEARCH.md:101`), warranting a pin-and-re-verify guard wherever it is consumed.

**Status:** open (for /grill-with-docs)
