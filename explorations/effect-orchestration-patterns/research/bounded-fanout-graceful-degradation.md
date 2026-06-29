# bounded-fanout-graceful-degradation

> Scope: canonical bounded-concurrency fan-out + per-item graceful degradation shape for `@beep/nlp-mcp` batch extraction and agents orchestration, anchored to law EF-27, plus lazy Layer construction to defer expensive reference-data builds. Verified against the vendored `effect@4.0.0-beta.91` (the repo's pinned version) as the primary source, with v3 official docs as contrast.

## Findings

### Version / API surface baseline (PRIMARY)

- The repo pins `effect` at `4.0.0-beta.91` (root `package.json`, `"effect": "4.0.0-beta.91"`; `@beep/nlp-mcp` consumes it via `catalog:`), and vendors the matching source at `.repos/effect-v4/packages/effect` (`package.json` `"version": "4.0.0-beta.91"`). All v4 API claims below are read from that vendored tree, which is authoritative for the repo over any web doc (effect.website still documents v3).
- Law **EF-27** ("Parallel fan-out needs explicit concurrency") lives at `standards/effect-first-development.md:659`: "For non-trivial fan-out, set concurrency in `Effect.forEach`, `Effect.all`, or `Effect.validate`. Avoid implicit unbounded parallelism on large collections." Its reference example is `Effect.forEach(ids, fetchUser, { concurrency: 8 })`. Source: `standards/effect-first-development.md:659-673`.

### `Effect.forEach` in v4 has NO `mode` option (KEY DELTA vs v3)

- In `effect@4.0.0-beta.91`, `Effect.forEach`'s only options are `{ concurrency?, discard? }` — there is **no** `mode` parameter. Signature: `forEach(self, f, options?: { readonly concurrency?: Concurrency; readonly discard?: Discard })`. Source: `.repos/effect-v4/packages/effect/src/Effect.ts:773-783`.
- Default failure semantics (still short-circuit): "By default, the combined effect fails on the first failure; with concurrent execution, effects that have already started may be interrupted, while effects not yet started are skipped." Source (the `Effect.all` doc, same engine as `forEach`): `.repos/effect-v4/packages/effect/src/Effect.ts:393-399`.
- CONTRAST — v3 official docs DO expose `mode: "either"` and `mode: "validate"` on `Effect.all`/`Effect.forEach` to run all effects and collect Either/Option instead of short-circuiting. That API is **gone from `forEach` in v4** — copying v3 tutorials will not typecheck against beta.91. Source (v3): https://effect.website/docs/concurrency/basic-concurrency/ and https://effect.website/docs/error-management/error-accumulation/.

### v4 replacement for `mode: "either"`: `Effect.all` `mode: "result"` (Result-valued)

- `Effect.all` (NOT `forEach`) keeps a mode switch, renamed/retyped to `mode: "default" | "result"`. `mode: "result"` "run[s] every effect and collect[s] each success or failure as a `Result` in the same output shape." Source: `.repos/effect-v4/packages/effect/src/Effect.ts:381-401,505-521`.
- The `Result` type backing this is a first-class module (`Result.succeed`/`Result.fail`) — `.repos/effect-v4/packages/effect/src/Result.ts:284,314`. So the v3 `Either`-mode story became a `Result`-mode story in v4. `Effect.all` is for a **fixed/heterogeneous** set of effects (tuple/record), not a homogeneous collection.

### Per-item degradation combinators available in v4 (PRIMARY)

- `Effect.partition(elements, f, { concurrency? })` → `Effect<[excluded: Array<E>, satisfying: Array<B>], never, R>`: "runs every effect and never fails"; returns `[failures, successes]`. Source: `.repos/effect-v4/packages/effect/src/Effect.ts:556-565` (and doc 541-555). Concurrency is the only option — bounded fan-out is supported.
- `Effect.validate(elements, f, { concurrency?, discard? })` → `Effect<Array<B>, NonEmptyArray<E>, R>`: "always evaluates every element. If at least one effect fails, all failures are returned as a non-empty array and successes are discarded." Lossy on success. Source: `.repos/effect-v4/packages/effect/src/Effect.ts:606-637` (doc 568-605).
- Per-effect wrappers that convert a failure into a value (so a wrapped `forEach` never aborts): `Effect.result(self): Effect<Result<A,E>, never, R>` (`Effect.ts:2205`), `Effect.option(self): Effect<Option<A>, never, R>` (`Effect.ts:2253`), `Effect.exit(self): Effect<Exit<A,E>, never, R>` (`Effect.ts:2297`). `nlp-mcp` already uses the `Effect.option` form to drop malformed JSONL lines: `Effect.forEach(lines, (line) => skipInvalid ? Effect.option(parseJson(...)) : ..., { concurrency: 1 })`. Source: `packages/drivers/nlp-mcp/src/Streaming/DatasetLoader.ts:529-533`.
- CRITICAL interaction with EF-31 (failure-vs-defect, CAPTURE #2/#7): `Effect.catchAll`/`result`/`option`/`either` recover **typed failures only, not defects**. So a batch wrapped to `status:'failed'` still correctly *dies* on a Schema-decode defect (`Effect.die(BamlParseError)`), preserving the documented "schema-validation failures are DEFECTS" boundary. The two patterns compose; degradation does not swallow defects. (Derived from EF-31 in `standards/effect-first-development.md` + the `catchAll` semantics; the degraded item's `f` is what catches, defects bypass it.)

### Canonical batch-extraction shape decision (for `@beep/nlp-mcp` + agents)

- RECOMMENDED canonical shape — bounded `forEach` with per-item `catchAll` → tagged status, preserving order/index and never aborting the batch:
  ```ts
  Effect.forEach(
    items,
    (item, i) =>
      extractOne(item).pipe(
        Effect.map((value) => ({ _tag: "ok" as const, index: i, value })),
        Effect.catchAll((error) => Effect.succeed({ _tag: "failed" as const, index: i, error }))
      ),
    { concurrency: maxConcurrency }
  )
  ```
  This is the direct Effect-native realization of CAPTURE nugget **research-squad#11** (`Effect.forEach(tasks, (task,i) => executeSubagentWithRecovery(...), { concurrency: maxConcurrency })`, each task wrapped so failure → `status:'failed'` finding). It satisfies EF-27 (explicit `concurrency`) and graceful degradation (one bad doc cannot abort the batch), and keeps positional correlation between input and result. The seed file `MultiAgentOrchestratorService.ts:738-751` is from the gold corpus, not this repo (CAPTURE provenance), so this is **NET-NEW** here.
- Terser alternative when index/order correlation is NOT needed: `Effect.partition(items, extractOne, { concurrency })` → `[failures, successes]` buckets in one never-failing call (`Effect.ts:556`). Use the `forEach`+tagged-status form when each output row must carry its own `failed` status inline (the MCP/finding case); use `partition` when two buckets suffice.
- Use `Effect.all(..., { mode: "result" })` ONLY for a fixed heterogeneous set of effects (e.g. "run these N named extractors"), not for a homogeneous document collection — `all` does not express a per-element function the way `forEach`/`partition` do.
- REUSE CHECK (PRIMARY, ripgrep over `packages/**/src`): zero existing usages of `Effect.partition`, `Effect.validate*`, `mode: "result"`, `Effect.result(`, or `Effect.either(` — so the per-item degraded-batch shape is genuinely net-new. Current repo fan-outs set concurrency but short-circuit: `packages/foundation/capability/nlp/src/Graph/GraphOperations/Executor.ts` (`concurrency: 4`), `packages/agents/server/src/AssistantTurn/BlockRepair.ts` (`concurrency: 1`), `packages/tooling/library/ai-metrics/*` (`concurrency: 8/16`). `@beep/nlp-mcp` streaming tools use tool-level `failureMode: "return"` with `AiToolError` (per `packages/drivers/nlp-mcp/CLAUDE.md`), which is MCP-boundary degradation, not per-item batch degradation.

### Lazy Layer construction / deferring expensive reference-data builds

- `Layer.unwrapEffect` does NOT exist in v4. The v4 combinator is **`Layer.unwrap`** (`@since 4.0.0`): `unwrap(self: Effect<Layer<A,E1,R1>, E, R>): Layer<...>` — "Unwraps a `Layer` from an `Effect`." This is the effectful/lazy provider-selection primitive (build the chosen provider Layer from a config Effect at build time). Source: `.repos/effect-v4/packages/effect/src/Layer.ts:1095-1131`. This DIRECTLY confirms CAPTURE's caution: seed nuggets **research-squad#5** reference `Layer.unwrapEffect` (a v3 name) — it must be ported to `Layer.unwrap` for beta.91. Second source (rename direction): https://github.com/Effect-TS/effect-smol (v4 prototype) + web-confirmed "`Layer.unwrapEffect` renamed to `Layer.unwrap`".
- Companion lazy/defer primitives in v4: `Layer.suspend(evaluate: LazyArg<Layer>)` (`Layer.ts:1090`), `Layer.fresh(self)` to opt OUT of memoization and force a rebuild (`Layer.ts:2100`), and `Layer.effect(service, buildEffect)` which runs construction work once at build time (`Layer.ts:974`). Layers are memoized by default within a build MemoMap, so an expensive reference-data build inside `Layer.effect` runs once per provided Layer instance — the Effect-native analog of caching.
- For deferring a build until *first access* (not layer-build time), `Effect.cached(self): Effect<Effect<A,E,R>>` memoizes the first run (`Effect.ts:7036`); `Effect.cachedWithTTL` adds expiry (`Effect.ts:7098`). NOTE: `Effect.once` was REMOVED in v4 (confirmed absent from the vendored `Effect.ts` export list; the v4 migration issue lists `Effect.once → removed`) — use `Effect.cached` for "build once, lazily." Source: vendored `Effect.ts` + https://github.com/Effect-TS/effect-smol/issues/1378.
- Port reference (CAPTURE **courts-db#9**): `freelawproject/courts-db` `courts_db/__init__.py` uses Python module `__getattr__` to defer the heavy build (e.g. `regexes = gather_regexes(courts)`, the ~2,809-entry regex compile) until first attribute access, then caches into `globals()[name]`. Source: https://raw.githubusercontent.com/freelawproject/courts-db/main/courts_db/__init__.py. The Effect-native equivalent is `Layer.effect`/`Layer.unwrap` (build-time, memoized) or `Effect.cached` (first-access, memoized). License: **BSD 2-Clause** (permissive; redistribution permitted with copyright-notice retention) — safe to port the *pattern* and, with attribution, the data. Source: https://raw.githubusercontent.com/freelawproject/courts-db/main/LICENSE.

### Adjacent porting gotcha (provenance-only nuggets)

- Several seed snippets (research-squad #2/#5/#11) are v3-flavored: e.g. `Effect.zipRight(...)` in the decode→die helper is `Effect.andThen` in v4, and `Effect.zipLeft → Effect.tap` (v4 migration list). Any code lifted from the gold corpus must be re-aliased to beta.91 names before adoption. Source: https://github.com/Effect-TS/effect-smol/issues/1378.

## Sources

- `standards/effect-first-development.md:659-673` — law EF-27 (primary, in-repo).
- `.repos/effect-v4/packages/effect/src/Effect.ts` (vendored `4.0.0-beta.91`, PRIMARY): `forEach` 773-783; `all` + `mode:"result"` 340-401, 505-521; `partition` 541-565; `validate` 568-637; `result` 2205; `option` 2253; `exit` 2297; `cached` 7036; `cachedWithTTL` 7098.
- `.repos/effect-v4/packages/effect/src/Layer.ts` (vendored, PRIMARY): `unwrap` 1095-1131; `suspend` 1090; `fresh` 2100; `effect` 974.
- `.repos/effect-v4/packages/effect/src/Result.ts:284,314` — `Result` module (vendored, PRIMARY).
- `packages/drivers/nlp-mcp/src/Streaming/DatasetLoader.ts:529-533` — existing `forEach`+`Effect.option` degradation (in-repo).
- `packages/drivers/nlp-mcp/CLAUDE.md` — `failureMode: "return"` MCP-tool degradation (in-repo).
- https://effect.website/docs/error-management/error-accumulation/ — v3 `partition`/`validate`/`validateAll`/`validateFirst` (CONTRAST).
- https://effect.website/docs/concurrency/basic-concurrency/ — v3 `mode: "either"`/`"validate"` + short-circuit default (CONTRAST).
- https://github.com/Effect-TS/effect-smol/issues/1378 — v3→v4 rename/removal list (`Effect.once → removed`, `zipRight → andThen`, etc.).
- https://github.com/Effect-TS/effect-smol — v4 prototype (`Layer.unwrapEffect → Layer.unwrap`).
- https://raw.githubusercontent.com/freelawproject/courts-db/main/courts_db/__init__.py — lazy `__getattr__` (port reference).
- https://raw.githubusercontent.com/freelawproject/courts-db/main/LICENSE — BSD 2-Clause (port licensing).
- CAPTURE provenance: `explorations/effect-orchestration-patterns/CAPTURE.md` nuggets research-squad#5/#11, courts-db#9 (gold-corpus paths, not this repo).

## Open / Unverified

- UNVERIFIED (web): the precise v4 `Effect.all` `mode: "result"` runtime shape (does it return `Result` for the *whole* tuple element-wise, and how defects surface) is read only from the vendored doc-comment + `Result.ts` existence; not independently confirmed against a published v4 doc page (effect.website still documents v3). Confidence high (source-grounded) but second-source web confirmation is absent.
- UNVERIFIED: whether `effect@4.0.0-beta.91` later betas restore a `mode` option to `forEach` or rename `Layer.unwrap` again — beta API churns. The repo pin is the only contract that matters; re-grep the vendored tree at adoption time.
- UNVERIFIED: courts-db *data* licensing nuance — the LICENSE file is BSD 2-Clause, but Free Law Project occasionally dual-states data vs code terms; confirm the data files' headers before porting the dataset (the *pattern* is unencumbered regardless).
- NOT a repo claim: `MultiAgentOrchestratorService.ts` / `BamlClientService.ts` / `WebSearchService.ts` cited in CAPTURE are gold-corpus source paths, not files in beep-effect; they are design provenance, not reusable in-repo symbols. The in-repo equivalents are NET-NEW.
- Open decision (for DECISIONS.md, not resolved here): whether the canonical degraded-batch helper should live as a shared `@beep/utils`/foundation combinator (`forEachSettled`-style returning tagged `ok`/`failed`) or be inlined per call-site; reuse-check shows no such helper exists today.
