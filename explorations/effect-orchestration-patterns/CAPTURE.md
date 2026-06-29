# Capture

<!--
Stage 0. Append-only raw dump: thoughts, links, screenshots (drop files in
assets/ and reference them), half-sentences, contradictions. Nobody tidies
this file; cleaning it up destroys provenance. New material goes under a new
dated heading at the bottom.
-->

## 2026-06-29 — Gold-intake seed

Seeded from the gold-intake routing run. Full synthesis context lives in the
`### Effect & advanced TypeScript` section of
[`../_gold-intake/GOLD_SYNTHESIS.md`](../_gold-intake/GOLD_SYNTHESIS.md)
(line ~1402: failure-vs-defect wall, centralized `Schedule` retry library,
`Layer.unwrapEffect` provider selection, bounded-concurrency fan-out).

### Cluster

Effect orchestration patterns (Schedule, Layer provider, bounded fan-out).

Rationale (verbatim from routing): The three candidate targets do not own this
cluster: `goals/effect-native-migration` is scoped to migrating native JS
Map/Set/String/Date/JSON to Effect-native data types (not runtime
orchestration), while `standards/effect-first-development.md` and `.patterns`
already document the *conceptual* laws (EF-25/26 retry-Schedule, EF-27 bounded
fan-out, EF-31 failure-vs-defect). The genuinely net-new work is consolidation
into a shared library: a centralized retry-policy module (policies are currently
duplicated inline per-driver) and `Layer.unwrapEffect` provider selection, which
has zero occurrences in the repo. No existing exploration/goal covers Effect
orchestration as a library.

route=new-exploration · primaryTarget=effect-orchestration-patterns (targetExists=false) · wave=P1 (histogram P1:5 / P2:2 / P3:1) · themeSpan=[effect-ts, governance-ops] · secondaryTargets=[standards/effect-first-development.md, .patterns/error-handling.md, packages/drivers/anthropic, goals/effect-native-migration]

SPECIAL NOTE: Laws EF-25/26/27/31 are documented and used per-driver; net-new is
a SHARED retry-policy/`Schedule` library + `Layer.unwrapEffect` provider
selection (zero current repo usages).

### Nuggets (8)

- **research-squad#3** (research-squad) — Centralized Effect Schedule retry-policy library. `src/infrastructure/retry-policies.ts:78-113`. → feeds netNew #1 (the SHARED retry-policy/`Schedule` foundation module: `llmRetry` for LLM drivers, `networkRetry` for gov/data drivers, `databaseRetry` for PGlite/Drizzle). Snippet: `export const llmRetry = Schedule.exponential(Duration.millis(500), 2.0).pipe(Schedule.compose(Schedule.recurs(2)))` // 2 retries for expensive ops; `networkRetry` = 5/200ms exp.
- **research-squad#5** (research-squad) — Lazy provider selection via Layer.unwrapEffect (multi-provider adapter). `src/services/WebSearchService.ts:119-145`. → feeds netNew #2 (the `Layer.unwrapEffect` provider-selection pattern: one provider-agnostic tag selecting anthropic|openai-compat|xai|venice-ai at build time without initializing unused providers; `Layer.die` for unimplemented). Snippet: `Layer.unwrapEffect(Effect.gen(... const config = yield* ConfigService; switch(config.searchProvider){ case "brave": return Layer.effect(WebSearchService, BraveSearchService).pipe(Layer.provide(BraveSearchServiceLive)); ...}))`.
- **research-squad#11** (research-squad) — Bounded-concurrency subagent execution with graceful degradation. `src/services/MultiAgentOrchestratorService.ts:738-751`. → reinforces alreadyCovered law EF-27 (bounded fan-out); concrete blueprint for `@beep/nlp-mcp` batch extraction + agents orchestration where one bad doc must not abort the batch. Snippet: `Effect.forEach(tasks, (task, i) => executeSubagentWithRecovery(...), { concurrency: maxConcurrency })`; each task wrapped so failure → `status:'failed'` finding.
- **research-squad#2** (research-squad) — Failure-vs-defect split in LLM client wrapper. `src/services/BamlClientService.ts:619-648`. → feeds the shared `decode → die` helper (adjacent to netNew; relates to alreadyCovered law EF-31 and secondaryTarget `.patterns/error-handling.md`): execution failures are typed/retryable, schema-validation failures are DEFECTS. Snippet: `Schema.decodeUnknown(outputSchema)(rawOutput).pipe(Effect.catchAll((parseError) => Effect.logError(...).pipe(Effect.zipRight(Effect.die(new BamlParseError({ rawOutput, parseError }))))))`.
- **research-squad#7** (research-squad) — Domain error taxonomy with retryable/defect classification helpers. `src/domain/errors.ts:341-361`. → feeds the same foundation error helper as #2 (`isRetryableError`/`isDefect`/`getErrorMessage` predicates over a tagged-error taxonomy). Snippet: `isRetryableError = (e): e is BamlExecutionError|SubagentExecutionError => e instanceof BamlExecutionError || (e instanceof SubagentExecutionError && e.canRetry)`; `isDefect = (e): e is BamlParseError => e instanceof BamlParseError`.
- **Juris.AI#5** (Juris.AI) — Sliding-window per-key API quota limiter with tier config. `src/lib/quota-manager.ts:28-79`. → feeds an Effect-native rate-limit Layer adjacent to the retry-policy library (outbound USPTO/CourtListener/Anthropic quota guarding); in-memory now, Redis/persistent in prod. Snippet: `const key = quota:${provider}:${apiKey.slice(-8)}; if (entry.count >= entry.dailyLimit) return { allowed:false, remaining:0, resetTime, retryAfter: Math.ceil((entry.resetTime - now)/1000) }`.
- **uspto_pfw_mcp#5** (uspto_pfw_mcp) — Resilience stack: circuit breaker + retry budget + response cache + bulkhead pools. `src/patent_filewrapper_mcp/api/enhanced_client.py:38-101`. → extends the resilience blueprint beyond retry (circuit breaker CLOSED/OPEN/HALF_OPEN, served-while-open cache, per-workload pool bulkheads) for gov-data drivers (USPTO/CourtListener/GovInfo). Snippet: `class CircuitBreaker: can_execute(): if state==OPEN and time()-last_failure_time > timeout: state=HALF_OPEN; return True`.
- **courts-db#9** (courts-db) — Lazy module-attribute loading of heavy data structures. `courts_db/__init__.py:23-38`. → reference (P3) for lazy Layer construction: defer expensive reference-data build (2,809-entry regex compile) until first access; informs the `Layer.unwrapEffect`/lazy-provider work. Snippet: `def __getattr__(name): if name == "courts": value = load_courts_db(); ... globals()[name] = value; return value`.

### netNew (build list)

- Centralized Effect `Schedule` retry-policy library (DRY extraction: today retry policies are inline per-driver as `Schedule.exponential` in `packages/drivers/anthropic/src/Anthropic.service.ts:106`, `Anthropic.repair.ts:105`, and openai-compat; no shared foundation/common retry-policy module exists).
- `Layer.unwrapEffect`-based provider selection (zero usages of `Layer.unwrapEffect` anywhere under `packages/**/src`; provider wiring is currently static Layer composition via ai-provider-cli/openai-compat, not effectful provider selection).

### alreadyCovered (reuse — inventory existing per-driver retry/Schedule usages)

- Failure-vs-defect split in LLM client wrapper: documented as law EF-31 in `standards/effect-first-development.md` and implemented via `TaggedErrorClass` in `packages/drivers/anthropic/src/Anthropic.errors.ts`.
- Schedule-based retry as a pattern: documented EF-25/26 in standards and already used (`Schedule.exponential` + `ExecutionPlan`) in anthropic + openai-compat drivers.
- Bounded fan-out concurrency: documented as law EF-27 ("Parallel fan-out needs explicit concurrency") in `standards/effect-first-development.md` and applied operationally in `goals/effect-native-migration` (one-agent-per-package bounded parallel waves).

### cautions

- Largely a library-extraction/consolidation task, not greenfield — the laws and per-driver implementations already exist, so scope must avoid rebuilding documented standards or working anthropic/openai-compat retry+error code; reuse and DRY-extract them instead. No licensing concerns (all first-party Effect code). Note `Layer.unwrapEffect` must be validated against the vendored effect-v4 API before adopting.
