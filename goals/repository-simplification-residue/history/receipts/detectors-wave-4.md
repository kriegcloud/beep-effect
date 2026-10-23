# #1855 detector repairs wave 4: the #1875 hand-off classes

Lane `residue-detectors` wave 4, branch `feat/residue-detectors-wave4`, on `main`
`6f25dd7c4d`. The classes come from the #1875 hand-offs: wave 2
(`vitest-canon-wave-2.md`, EV015 single-test blocks) and wave 3 (still open as #2163, read
from `origin/feat/residue-vitest-canon-wave3`: EV002 body-derived stores with a reopen
boundary, EV004 scope-close assertions, EV006 in real-browser tests). EV010 is untouched:
#2039 and #2059 have both merged, and no EV010 class is in this wave's scope.

## Measurement at `6f25dd7c4d`

`bun run beep lint effect-vitest`: 2,507 files, 1,319 findings, `introduced=0 resolved=1`.
The inventory held 1,320 rows (564 open, 756 exceptions). The one already-resolved row is
`stream-console.test.ts:856` EV002 (open), whose `provideScopedLayer(NodeServices.layer)` was
removed on `main` by #2152 (inherited).

| Rule | Exceptions before | Open before | Hand-off rows (open) | Exceptions after | Open after |
| --- | ---: | ---: | --- | ---: | ---: |
| EV001 | 1 | 0 | | 1 | 0 |
| EV002 | 125 | 190 | 16 body-derived reopen rows | 101 | 171 |
| EV003 | 15 | 20 | | 15 | 20 |
| EV004 | 86 | 75 | 3 scope-close rows | 89 | 72 |
| EV005 | 6 | 3 | | 6 | 3 |
| EV006 | 73 | 76 | 4 browser rows | 70 | 72 |
| EV007 | 2 | 6 | | 2 | 6 |
| EV008 | 4 | 5 | | 4 | 5 |
| EV009 | 28 | 0 | | 28 | 0 |
| EV010 | 137 | 150 | | 137 | 150 |
| EV011 | 0 | 5 | | 0 | 5 |
| EV012 | 6 | 3 | | 6 | 3 |
| EV013 | 0 | 5 | | 0 | 5 |
| EV014 | 233 | 0 | | 233 | 0 |
| EV015 | 40 | 26 | 9 single-test rows | 17 | 17 |
| **Total** | **756** | **564** | | **709** | **529** |

After `lint effect-vitest --write` the inventory holds 1,238 rows. Rows were paired by
`(ruleId, file, symbol, occurrence)` against the base inventory: 82 removed, none added. 81
are this wave's repairs (54 exceptions, 27 open), and the 82nd is the inherited
stream-console row. Seven open rows became exceptions (below). A second scan reports
`introduced=0 resolved=0`. The rewrite also refreshes line numbers for 108 rows whose files
moved on `main` since the last write; those rows keep their status and reason.

## Repair 1: EV015 top-level single-test layer blocks

**Ruling: a true false positive.** `@effect/vitest` 4.0.5 `makeLayer`
(`node_modules/@effect/vitest/src/internal/internal.ts:264-304`) builds every top-level
`it.layer` as `Layer.provideMerge(layer, TestEnv)` in a fresh `Layer.makeMemoMap`, so the
block's TestClock is its own. A nested `it.layer` forks the parent's memo map
(`Layer.forkMemoMapUnsafe(memoMap)`) over the parent's `withTestEnv`, so it shares the
parent's TestClock.

**Recognition** (`ownsUnsharedTestClock` in `EffectVitestDetectors.ts`). A `TestClock.adjust`
inside a layer block is exempt only when all of these hold:

- the block is not lexically inside another layer block;
- the block callback holds exactly one harness registration of any mode, including nested
  layer blocks;
- that registration contains the `adjust`;
- it is a single-case call: its callee holds no call (so no curried `each(cases)(...)`) and
  none of the members `each`, `for`, `prop` or `propEffect`;
- it is a direct statement of the block body, or the arrow's expression body, so it is not
  inside a loop or a callback;
- the block's tester parameter appears only as that registration's base, so it is never
  handed to a helper that could register more tests.

**Paired fixtures**, case "exempts top-level single-test layer blocks, whose TestClock no
other test shares". It was written first and failed against the base at the negative loop
(`test/effect-vitest-detectors.test.ts:1912`, `true !== false`).

- Silent:
  - an unnamed block with a timeout;
  - a named block with an `Effect.fnUntraced` body;
  - an arrow expression body;
  - the standalone `layer(...)` export inside a `describe`;
  - a block with a `const` beside the one test.
- Still EV015:
  - two tests;
  - `it.effect.each([1, 2])(...)`;
  - a `for` loop registration;
  - a test plus a nested layer block;
  - a test plus `registerMore(it)`;
  - `it.effect.prop`;
  - a nested single-test block.

The existing "retains shared deterministic clock review" case, with the nested single-test
and `beforeEach` reset/concurrent blocks, still passes.

**Rows retired: 9 open, 23 exceptions.**

- The open rows are exactly the nine wave 2 named: `PracticeMailTagging.command.test.ts`
  :199/:201/:238/:240, `PdfTools.service.test.ts` :1376/:1378, `accounts-usage.test.ts`
  :1407/:1693 and `yeet-gh-rest-first.test.ts:312`.
- Each retired exception's reason already argued sole ownership of a single-test block:
  - `PracticeMailTagging.command` ×3 and `.lock` ×2;
  - `chat-contract.test.ts:699`;
  - `M365.service.test.ts:843`;
  - `Service.test.ts` ×3;
  - `step-capture-lifecycle.test.ts` ×9. Each is a top-level `it.layer(BunCrypto.layer)`
    block holding one test (checked at lines 591-782).
  - `tailscale.test.ts:292`;
  - `ThreadStore.test.ts:470`;
  - `Tika.server.test.ts:554`;
  - `yeet-monitor-check-registration.test.ts:486`.

The 17 multi-test rows wave 2 named stay open: `corpus-command`, `yeet-monitor-ready`,
`yeet-pr-provenance`, `yeet-review-window` ×2 and `yeet-settle`. With this repair their
canonical fix becomes resolvable. Split each clock-owning test into its own top-level block
over the same layer. That is #1875 migration work.

**Reversal**: drop the `ownsUnsharedTestClock` guard from `detectLayerClockReset` and run
`lint effect-vitest --write`. Restore the 23 reasons from the base inventory
(`git show 6f25dd7c4d:standards/effect-vitest.inventory.jsonc`).

## Repair 2: EV006 in vitest browser-mode projects

**Ruling: a true false positive, scoped by the vitest config.** EV006's replacements are
`@effect/vitest/utils` asserters (`assertSome`, `assertNone`, ...), which wrap `node:assert`.
Real Chromium does not provide that module. Wave 3's attempt failed with
"deepStrictEqual is not a function", and the file's three exceptions record the same error.
Effect ships no browser-safe asserter, so no replacement can be recommended. Inventing one
would be a new test kit, not a detector repair.

**Recognition** is at the scan, not by path convention:

- `discoverBrowserModeTestPaths` globs every `{apps,packages,infra}/**/vitest*.config.*`.
- `browserModeIncludeGlobs` (exported, JSDoc) reads the literal `include` array of each
  object literal that holds `browser: { enabled: true }`.
- The scan globs those patterns relative to the config's directory.
- `retainBrowserSafeFindings` (exported, dual) drops only EV006 rows from files in that set.
  Every other rule still reports in browser files.

The two browser projects found are `ontology/client/vitest.browser.config.ts` and
`drivers/graph-3d/vitest.browser.config.ts`, both with `include: ["test/browser/**/*.test.{ts,tsx}"]`.
`browserTestConfig` in `vitest.shared.ts` is `environment: "jsdom"` (Node, where
`node:assert` works), so its apps keep EV006. The storybook project has no literal
`include` beside its `browser` block, so it adds nothing.

**Paired fixtures**, written first; both failed with
`browserModeIncludeGlobs is not a function` / `retainBrowserSafeFindings is not a function`:

- "reads browser-mode include globs only from enabled vitest browser projects":
  - globs come back for a `defineConfig` browser project and for one inside `mergeConfig`;
  - nothing comes back for `enabled: false`, a jsdom environment, an `exclude`-only test
    block, a browser block without `include`, or a computed `include` binding.
- "drops only node:assert-backed data-assertion rows from files a browser project runs":
  - rows are unchanged when `browserMode` is false;
  - EV006 is dropped and EV002 kept when it is true.

**Rows retired: 4 open, 3 exceptions**, all in
`ontology/client/test/browser/graph-renderer-toggle.test.ts`: open :291/:301/:311/:317,
exceptions :202/:207/:280.

**Reversal**: remove the `retainBrowserSafeFindings` call in `runEffectVitestLint` (and the
two exports), then `--write`. Restore the three reasons from the base inventory.

## Repair 3: EV002 repeated lifecycles over test-body values

**Ruling: a true false positive for one exact shape.** `it.layer` builds one layer per block
before the body runs. Take a test that provides two built layers whose expressions read the
same variable declared in its own body: it opens a store, closes it and reopens it, or runs
several provisions over one temp output. That test owns several lifecycles of a body-derived
value, and `it.layer` cannot express them.

A single body-derived provision is not exempt. Wave 3 migrated such tests to a nested
`it.layer(Layer.unwrap(...))`.

**Recognition** (`repeatsTestBodyLifecycle`). An EV002 provision is exempt when all of these
hold:

- its layer reads a `const`/`let` or binding element declared inside the enclosing test
  callback. Parameters do not count, and binding resolution ignores name positions.
- another `Effect.provide`/`provideScopedLayer` call in the same callback reads the same
  declaration.
- both start a lifecycle: neither is a pure `Layer.succeed`/`mock`/`empty` stub, a
  `Context.*` value, or a context bound from `yield* Layer.build(...)`/`buildWithScope(...)`.
  A built context is built once, and providing it again rebuilds nothing.

Same-file wrapper providers (`withDuckDb`) are not counted as lifecycles, so their callers
stay judged.

**Paired fixtures**, case "permits repeated lifecycles of a layer built from test-body values
and keeps single provisions". It was written first and failed against the base at the
negative loop.

- Silent:
  - open/close/reopen through two `Fx.provide(Store.makeLayer({ dataDir }))`;
  - a body `const layer = makeRunLayer(manifest, out)` provided twice with
    `provideScopedLayer`;
  - two `provideScopedLayer(Store.makeLayer({ dataDir: path.join(carried, "kg") }))` in an
    `Effect.fnUntraced` body.
- Still EV002 (expected row count):
  - a module-level layer provided twice (2);
  - a single body-derived provision (1);
  - two provisions over distinct body bindings (2);
  - a `Layer.succeed` stub beside one store over the same binding (1);
  - two provisions over a callback parameter (2);
  - a body context from `yield* L.build(...)` provided twice (2). This fixture was added
    after the first `--write` retired `semantica/test/Fixtures.test.ts` :175/:193, whose
    reason says one built context is deliberately reused. It failed before the
    `isBuiltContext` guard, and those two exceptions come back unchanged.

**Rows retired: 15 open (14 this wave plus the inherited stream-console row), 28
exceptions.**

- Hand-off rows (12 of 16):
  - `EdgeAuthority.restart.pglite.test.ts:280`;
  - `Gold.test.ts` :547/:560;
  - `PracticeKg.projections.test.ts` :1992/:2183/:2187/:2194/:2350/:2380/:2414/:2424/:2434.
- Other open rows: `ci-heavy-admission.test.ts` :430/:446. Two admission runs over the
  body's `env` and `commands`; the second reads the output file the first wrote.
- Exceptions whose reasons already named the reopen or rerun:
  - `PracticeKg.projections` ×19, the `claimsLayer`/`host` reopen family;
  - `Gold.test.ts` :511/:522/:590/:614;
  - `ContradictionTriage.p0.pglite` :568/:569 and `ContradictionTriage.pglite` :1582/:1606
    ("closes the first persistent PGlite database before rebuilding another over the same
    dataDir");
  - `EdgeAuthority.restart.pglite.test.ts:226`.

**Reversal**: drop `!repeatsTestBodyLifecycle(...)` from `emitLayerProvision`, then `--write`
and restore the 28 reasons from the base inventory.

## Kept as justified exceptions: EV004 scope-close assertions and four EV002 reopen rows

**EV004: not repaired.** "The assertions after `Effect.scoped` read state its finalizers
wrote" needs to know which state a finalizer writes. That is semantic. The syntactic proxy,
statements after the scope that share a binding with it, matches almost every shorter-scope
test: 46 exceptions and 28 open `shorter-scope-lifetime-review` rows sit beside these three.
So it cannot be precise. The rows convert one by one.

**EV002: four of the 16 hand-off rows have a single provision.** In each, the reopen is done
by the subject or by a same-file wrapper, not by a second provision. Recognizing that would
need the wrapper or subject provenance this wave keeps out.

`PracticeKg.projections.test.ts:1322` stays open: #2163 (wave 3) migrates it.

### Open to exception conversions (7)

Each reason carries `Owner:` and `Exit:` and cites "#1855 wave 4 register".

| Row | Owner | Why it.layer or deletion cannot express it | Exit |
| --- | --- | --- | --- |
| EV004 `drivers/duckdb/test/DuckDb.service.test.ts:731` | `@beep/duckdb` | The test then asserts `connectionCloseAttempts`/`instanceCloseAttempts` are 1, which only the scope's finalizers produce | EV004 recognizes assertions over finalizer-written state |
| EV004 `observability/test/LocalLgtmServer.test.ts:53` | `@beep/observability` | `runWithLayer`'s scope close flushes the OTLP exporters before the caller's assertions (helper comment) | EV004 recognizes a helper scope the caller observes |
| EV004 `qa-capture/test/Collector.test.ts:183` | `@beep/qa-capture` | The collector must finish before its files and handle are inspected (inline comment); same reason as the three excepted siblings | as the DuckDb row |
| EV002 `practice-kg-mcp/test/Host.test.ts:328` | `@beep/practice-kg-mcp` | The DuckDB connection that drops `client_name` must close before `runPracticeKgMcpSelfCheck` reopens `practice.duckdb` | The self-check takes an injected DuckDb, or EV002 recognizes a subject reopen |
| EV002 `PracticeKg.projections.test.ts:1121` | `@beep/law-practice-server` | The body's build writes and closes `firstOut/kg.pglite`, which is then reopened to dump | The build exposes its store as a service, or EV002 recognizes it |
| EV002 `PracticeKg.projections.test.ts:1761` | `@beep/law-practice-server` | Two builds and a `withDuckDb` read close their connections before the host reopens both stores | Builds move into a nested `Layer.unwrap` block, or EV002 counts wrapper lifecycles |
| EV002 `PracticeKg.projections.test.ts:2453` | `@beep/law-practice-server` | The failure injection targets `brokenBundle`, which the body creates mid-test | The case splits into its own nested `Layer.unwrap` block |

## Hand-offs to other tools (recorded, unchanged)

- Guidance wave 2a, fallow:
  - `--stale-suppressions` covers only dead-code tokens. 52 complexity and duplication
    directives were stale while it reported 0.
  - The React model charges one cognitive point per hook binding (6 directives).
  - CRAP comes from the `static_estimated` coverage model (5 directives).
  - Diff-attributed audits charge pre-existing clones (13 files).
- Guidance wave 2c, Biome and other linters:
  - Biome cannot see turbo `global.*` env declarations (10 directives).
  - Biome flags Vite built-ins: `import.meta.env.DEV`, `MODE` and `VITE_*` (4 directives).
  - No unused-suppression check exists for `noqa` (ruff `RUF100` is not selected), oxlint
    (no `--report-unused-disable-directives`) or coverage hints.
  - `cspell:` and `shellcheck` directives have no enforcing tool. The suggested guard is a
    Biome GritQL rule rejecting `cspell:`.

None of these is an effect-vitest detector. They belong to fallow, Biome, oxlint, ruff and a
GritQL rule in `@beep/lint-rules`, and stay with those owners.

## Closing frontier: #1855 cannot close in this PR

The acceptance needs a fresh zero actionable scan, plus an individually justified exception
register with owner and exit. Measured on the post-`--write` inventory:

- **Open rows: 529** (483 judgment) in 195 files. These are #1875 migrations: EV002 171,
  EV010 150, EV004 72, EV006 72, EV003 20, EV015 17 (now splittable), and 27 small-rule
  rows. They are not detector false positives.
- **Exception register: 693 of 709 exceptions lack an owner and exit.** They have 290
  distinct reasons across 259 files. By rule:
  - EV010 137 (135 files);
  - EV014 233 (61 files, 27 reasons);
  - EV002 101 (26 files);
  - EV004 89 (39 files);
  - EV006 70 (24 files);
  - the rest 79.
- **EV014 named test layers: 233 exceptions, 0 open.** Census by the binding behind the
  first `it.layer` argument, a text heuristic over each file:
  - imported layer: 39;
  - imported factory: 51;
  - same-file factory: 64;
  - same-file composition: 64;
  - same-file `Layer.effect`/`scoped`/`unwrap`: 15.

  The most frequent names are `testLayer` 46, `makeTestLayer` 35, `Layer.fresh(...)` 16,
  `TestLayer` 16 and `CliRecorderTest` 10.
- **EV003 process-state wrappers: 35 rows (15 exceptions, 20 open).**
  - `inTempCheckout`: 4 exceptions.
  - `image-command` `withTempDirectory`, whose acquire is a `process.chdir`: 4 exceptions
    and 4 open.
  - The save/restore wrappers, 15 rows: `withEnvVarEffect` ×4, `withCwd` ×3, `withRealCwd`
    ×2, `withPrependedPath` ×2, `withPathPrefix`, `withWorkingDirectory`,
    `withPartitionShim` and `withEnvVar`.
  - Other judgments, 8 rows: `withRedirectingCognee` ×2, `withUnreadableDataDir`,
    `withFakeBox`, `seedHistory`, and the AgentMessage `query`/`call`/`fixture`.

Remaining #1855 waves:

1. **Wave 5, EV003 process-state ruling (35 rows).** Decide whether a save/restore wrapper
   is a judgment class of its own. Sharing through `it.layer` would leak the global across
   a block, so the likely ruling is "replace with an injected `ConfigProvider` or cwd
   service where the subject allows, else an owner/exit exception". Repair the
   `image-command` acquire classification with paired fixtures.
2. **Wave 6, EV014 named test layers (233 exceptions).**
   - Resolve imported test layers across files (90 rows).
   - Rule on same-file `Layer.effect`/`scoped` test layers under `it.layer` without a hook
     timeout (143 rows): either a reviewed judgment class, or explicit `{ timeout }` as
     #1875 wave 2 did.
3. **Waves 7-9, the owner/exit register (693 exceptions, about 290 reason rewrites).**
   - Wave 7: EV010, after #1875's EV010 cohort.
   - Wave 8: EV002, EV004 and EV006.
   - Wave 9: the rest, plus anything waves 5 and 6 leave.

   Each row is checked against its source, and the reason is rewritten as
   `<why>. Owner: <package>. Exit: <condition>.` The edits are inventory-only, but the
   per-row review is the cost.
4. **Closeout:** a fresh zero actionable scan once #1875 has migrated its open cohorts.
   Then flip #1855 to `complete`.

## Verification

All on `6f25dd7c4d` with the change applied. Each heavy command ran alone through
`beep-heavy` with `</dev/null`. Dependency dists were rebuilt first
(`bunx turbo run build --filter=@beep/repo-cli^...`, 57/57 tasks).

- Typed checks in `packages/tooling/tool/cli`: `bun run check`
  (`tsconfig.check.json`, `scripts/tsconfig.json` and `test/tsconfig.json`) exits 0. The
  first run found TS2345 in `browserModeIncludeGlobs`, an un-inferred `flatMap` parameter;
  it was fixed with an explicit `ObjectLiteralExpression` annotation. `bunx tsc-rs -p
  test/tsconfig.json --noEmit` exits 0 with 0 errors.
- Suites: effect-vitest-contract, -detectors, -primitives and -store, lint-command and the
  ten models suites, 15 files. Bun (`bunx --bun vitest run`) 543/543 and Node
  (`bunx vitest run`) 543/543. The detector suite has 237 tests, 4 of them new.
- `lint effect-vitest`: after `--write`, `introduced=0 resolved=0`, 1,238 findings.
  `lint:schema-first`: `introduced=0` on every ratchet.
- `quality fallow audit --base origin/main --check`: status ok, 0 findings, `introduced=0`.
- Biome on the four changed source and test files: clean after `--write` formatting.
  oxlint (`--disable-nested-config`): exit 0.
- `jsdoc:inventory:check` ok; `jsdoc:ratchet:check` `increased=0`, zero-legacy ok.
- `lint schema-catalog` current; `quality catalog-usage` findings=0;
  `lint:retired-effect-paths` findings=0.
- `quality effect-diagnostics --filter @beep/repo-cli`: 0 errors, 0 warnings over 3
  programs.
- `bun run docgen:local`: exit 0. The two new exports document compilable examples.
- `goals:doctor`: no new blocking findings.
- `quality package-verify @beep/repo-cli`: the audit ran 7,569 of 7,570 tests. The one
  failure is `knowledge-doctor-evaluators` ("reads the same packets ... as the live
  filesystem"), which compares the `HEAD` packet manifests with the working tree. It fails
  only on this lane's uncommitted `ops/manifest.json` statusNote. With that file temporarily
  held at `HEAD` it passes 14/14, and the lane's file was then restored. This is
  environment-only, as in waves 1-3, and clears on commit. Its docgen step did not run after
  the audit stop; `docgen:local` above covers it.

Route: S39/S41 Claude chain, `claude-opus-5-5` Agent child (step 1), no fallback and no
cross-provider lane.

## Reversal

Revert the PR. The 81 rows come back from the base inventory with their status and
reasons, and the seven converted rows return to `open`. The inherited stream-console row
stays resolved, because `main` removed its source. Per-repair reversals are listed above.
