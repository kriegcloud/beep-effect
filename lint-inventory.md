# Biome Effect Lint Inventory

Generated: 2026-04-08
Plugin: @catenarycloud/linteffect (48 Grit rules)
Total: ~1528 errors + ~252 infos across 1225 files

## Violations by Rule (descending)

| # | Rule | Count | Severity | Fix Pattern |
|---|------|-------|----------|-------------|
| 1 | no-pipe-ladder | 227 | error | Flatten nested `pipe()` chains into one flat pipeline. Extract intermediate values with `const` bindings. |
| 2 | no-if-statement | 199 | error | Replace `if/else` with `Option.match`, `Either.match`, `Match.value`, or `Effect.if`. For guards, use `Option.filter` or `Effect.when`. |
| 3 | no-manual-effect-channels | 183 | error | Remove explicit `Effect.Effect<A, E, R>` / `Layer.Layer<...>` type annotations. Let return types infer from the Effect/Layer expression. |
| 4 | no-ternary | 168 | error | Replace ternary `a ? b : c` with `Option.match`, `Either.match`, `Match.value`, or pipe through data combinators. |
| 5 | no-react-state | 122 | error | Replace `useState`/`useReducer`/`useContext`/`useEffect`/`useCallback`/`useSyncExternalStore` with `@effect-atom/atom-react` equivalents (`Atom`, `runtime.atom()`, `runtime.fn()`). |
| 6 | no-string-sentinel-const | 113 | error | Replace string status constants (`const status = "loading"`) with tagged unions, `Option`/`Either`, or meaningful domain values. |
| 7 | no-effect-fn-generator | 82 | error | Replace `Effect.fn` with generator body. Use a single flat pipeline or one `Effect.gen` instead. |
| 8 | no-model-overlay-cast | 70 | error | Remove `as` assertions on decoded model flow. Decode with the correct schema type and read fields directly. |
| 9 | no-string-sentinel-return | 65 | error | Stop returning string tokens. Return `Option`/`Either`/tagged unions or real Effect results. |
| 10 | no-nested-effect-call | 62 | error | Flatten `Effect.fn(Effect.fn(...))` towers. Build the inner Effect first, then use `pipe`/`Effect.flatMap`/`Effect.andThen`. |
| 11 | no-effect-call-in-effect-arg | 62 | error | Don't pass `Effect.xx(...)` as argument to another Effect call. Bind the inner effect to a `const` first. |
| 12 | no-nested-effect-gen | 35 | error | Flatten nested `Effect.gen` into a single generator per function/method. |
| 13 | no-effect-wrapper-alias | 32 | error | Don't create `const x = (...) => Effect...` wrappers. Inline the pipeline at the call site or define a real domain function. |
| 14 | no-effect-type-alias | 24 | error | Don't alias `Effect.Effect<...>`. Keep Effect types on service methods or inline at call site. |
| 15 | no-try-catch | 14 | error | Replace `try/catch` with `Effect.try`, `Effect.tryPromise`, or typed error channels. |
| 16 | no-iife-wrapper | 14 | error | Don't use `(() => { ... })()`. Bind a named const and keep one Match/Option decision in a flat pipeline. |
| 17 | warn-effect-sync-wrapper | 9 | warning | Replace `Effect.sync(() => console.log(...))` with `Effect.log`/`Effect.logDebug`/`Effect.logError`. |
| 18 | prevent-dynamic-imports | 8 | error | Replace `import(...)` with static `import` at file boundary. |
| 19 | no-effect-side-effect-wrapper | 7 | error | Replace `Effect.as` with `Effect.map` for value mapping or `Effect.asVoid` after explicit pipeline steps. |
| 20 | no-return-null | 5 | error | Return `Option.none()` for absence or `Effect.fail(...)` for errors instead of `null`. |
| 21 | no-return-in-arrow | ~246 | info | Convert block-bodied arrow callbacks `(x) => { return y }` to expression-only form `(x) => y`. Move complex logic into pipeline. |
| 22 | no-match-effect-branch | 2 | error | Select a value in Match, then run one Effect pipeline outside. Don't sequence inside branches. |
| 23 | no-effect-never | 1 | error | Replace `Effect.never` with `Stream` or explicit acquire/release lifecycle. |

## Violations by Package (descending)

| Package | Violations | Key Hotspot Files |
|---------|-----------|-------------------|
| packages/common (total) | 656 | schema/ (260), ui/ (120), observability/ (82), semantic-web/ (73), nlp/ (58), utils/ (20), identity/ (10) |
| tooling/cli | 343 | src/commands/Docgen/index.ts (24), src/commands/TsconfigSync.ts (16), src/commands/SyncDataToTs/index.ts (15) |
| packages/repo-memory | 161 | runtime/src/indexing/TypeScriptIndexer.ts (16), model/src/retrieval/RetrievalPacket.ts (18), sqlite/src/internal/RepoMemorySql.ts (12) |
| tooling/repo-utils | 120 | test/TSMorph.service.test.ts (17), src/schemas/TSConfig.ts (12) |
| .claude/ | 155 | scripts/analyze-architecture.ts (28), hooks/agent-init/index.ts (24), hooks/skill-suggester/index.ts (19) |
| apps/desktop | 72 | src/RepoMemoryDesktop.tsx (47) |
| tooling/docgen | 60 | src/ (46), test/ (14) |
| tooling/configs | 52 | src/eslint/EffectImportStyleRule.ts (13) |
| packages/runtime | 52 | server/test/SidecarRuntime.test.ts (20), server/src/index.ts (17) |
| apps/editor-app | 49 | src/EditorWorkspaceApp.tsx (23), scripts/dev-with-portless.ts (15) |
| packages/shared | 29 | domain/src/errors/DbError/utils.ts (25) |
| packages/editor | 28 | runtime/src/index.ts (15) |
| tooling/test-utils | 11 | — |

## Fix Priority

### Mechanical fixes (agent-friendly, low risk)

- no-manual-effect-channels (183) — just delete type annotations, let inference work
- no-return-in-arrow (246) — convert block bodies to expression bodies
- warn-effect-sync-wrapper (9) — swap Effect.sync(console.log) → Effect.log
- no-effect-type-alias (24) — inline or remove type aliases
- no-iife-wrapper (14) — extract to named const

### Structural fixes (need understanding, medium risk)

- no-pipe-ladder (227) — flatten nested pipes
- no-if-statement (199) — convert to Match/Option/Either combinators
- no-ternary (168) — convert to Match/Option/Either combinators
- no-effect-fn-generator (82) — restructure to flat pipeline or single Effect.gen
- no-nested-effect-call (62) — extract inner effects to const bindings
- no-effect-call-in-effect-arg (62) — extract inner effects to const bindings
- no-nested-effect-gen (35) — flatten to single generator
- no-effect-wrapper-alias (32) — inline or convert to domain function

### Domain fixes (need context, higher risk)

- no-react-state (122) — migrate to @effect-atom/atom-react
- no-string-sentinel-const (113) — redesign to tagged unions
- no-model-overlay-cast (70) — fix schema decoding
- no-string-sentinel-return (65) — redesign return types
- no-try-catch (14) — model errors in Effect

## Verification

After fixing a package, verify with:

```bash
bunx biome check <package-path> --max-diagnostics=0
```

Full repo check:

```bash
bunx biome check . --max-diagnostics=0
```
