# #1875 Effect Vitest canon wave 6: record

Lane `residue-vitest-canon`, branch `test/residue-vitest-canon-wave6` off `main`
`8ea6ba7401`. Scope: the open `@beep/repo-cli` EV002 `unresolved-layer-provide` rows,
where a layer provided inside one `it.effect` becomes a shared `it.layer` block. The
detector lane #1855 owns detector policy. This wave changes no detector and adds no
exception.

Two EV002 files also carry EV003 rows, which the parallel #1855 wave 5 lane edits:
`yeet-sweep-retire.test.ts` (27 rows) and `research-history-sift.test.ts` (6 rows). They
are left out. No file touched by the open PRs #2214 (EV002 detector) or #2216 (EV012
seams) carries an EV002 row, so no other file was skipped.

## Fresh measurement at `8ea6ba7401`

`bun run beep lint effect-vitest`: 2,662 files, 1,115 findings, `introduced=1`. The one
introduced finding is inherited: `config-file/test/ConfigFileKeyTyping.test.ts` EV011, a
file #2214 and #2216 both touch. The inventory held 1,114 rows (422 open, 692
exceptions).

Open `@beep/repo-cli` EV002 rows: 168 in 35 files. Without the two skipped files: 135
rows in 33 files.

| | Rows | Files |
| --- | ---: | ---: |
| Open EV002 at base | 168 | 35 |
| Skipped (EV003 files owned by #1855 wave 5) | 33 | 2 |
| In scope | 135 | 33 |
| Migrated | 116 | 31 |
| Left open, handed to #1855 | 19 | 4 (2 of them partly migrated) |

After the migrations and `lint effect-vitest --write`, the inventory holds 984 rows (292
open, 692 exceptions). 131 rows retired, all open: 116 EV002, 6 EV004 and 9 EV010. The
inherited EV011 row was added by `--write`. The PR adds no other row and no exception,
and changes no exception reason. EV002 open rows across the repository fell from 168 to
52.

## Migration patterns

Three patterns, chosen per test by what the provided layer holds.

1. **Shared block.** The layer is a module-level constant with no state a test can
   observe: `NodeServices.layer`, a `Layer.mergeAll` of Node platform layers,
   `FsUtilsLive` over `NodeServices.layer`, `ResearchCommandServiceLive`, or a
   `MemoryStats` stub. The `describe("X", () => {` becomes
   `it.layer(L)("X", (it) => {`, so suite and test names do not change. Where only some
   tests in a `describe` need the layer, or the `describe` already holds named
   `it.layer` blocks, an unnamed `it.layer(L)((it) => { ... })` wraps just those tests
   inside the `describe`. An unnamed block registers into the current suite, so names
   stay the same there too.
2. **Split blocks.** The layer holds state that a test reads back: TestConsole lines,
   the TestClock, or a TSMorph project cache. A top-level `it.effect` gets a fresh
   TestConsole and TestClock per test. Inside one `it.layer` block every test would share
   them. Each such test gets its own single-test `it.layer` block. Each top-level block
   builds its own memo map and TestEnv, so isolation matches the per-test provide.
3. **Stub value to `Effect.provideService`.** The provided layer was a test-body stub
   built by a same-file factory that returned `Layer.succeed(Tag, value)`, sometimes
   merged with `ConfigProvider.layer(...)`. `ConfigProvider.layer(p)` is
   `Layer.succeed(ConfigProvider)(p)` (`effect/src/ConfigProvider.ts:946`). The factory
   now returns the service value, and the test uses
   `Effect.provideService(Tag, value)`. The detector already accepts an inline pure
   `Layer.succeed` stub (`isPureStubLayer`); the factory only hid it. Any platform layer
   that was merged in goes to a shared or split block.

The `it.layer` blocks whose layer acquires a resource get `{ timeout: "30 seconds" }`,
the hook timeout their sibling blocks use, so no EV014 row appears. A whole-body
`Effect.scoped` that only sat in front of the removed provider is dropped: `it.effect`
scopes the whole test already. That retired the six EV004 rows.

`provideScopedLayer` wraps its effect in `Effect.scoped`, so scoped resources acquired
in a migrated test (temp directories) were released when the provide ended. That was
also the end of the test. They are now released by the test's own scope, at the same
point.

## Per-file migrations

| File | EV002 | Pattern | Notes |
| --- | ---: | --- | --- |
| `ci-lane-timings.test.ts` | 26 | stub, split, shared | 16 `windowGithubLayer(commands, ...)` stubs become `windowGithubClient` values under `provideService`, so each test keeps its own `commands` array. 8 `laneTimingsCommandLayer` tests each get a single-test block: they read TestConsole and pin the TestClock. The 2 `laneTimingsSpawnerLayer` tests share one unnamed block. |
| `proof-shadow.test.ts` | 8 of 21 | shared | `describe("proof shadow changed packages")` becomes `it.layer(NodeServices.layer)`. The 13 `PlatformLayer` rows stay open (hand-off 2). |
| `yeet-monitor-loop.test.ts` | 7 | stub, shared, split | `monitorSpawnerLayer` becomes `monitorSpawner`, a spawner value. The four `collectYeetMonitorFailedJobs` tests share `it.layer(BunCrypto.layer)`. The three `applyYeetMonitorJobDecision` tests read TestConsole, so each gets its own block. The old `spawner(n)` layer merged `TestConsole.layer`; the block's TestEnv now supplies a fresh one. |
| `yeet-command-wiring.test.ts` | 6 | shared, split | Four `describe`s become `it.layer(commandTestLayer)`. The planner-dispatch test sits in a `describe` that already holds named blocks, so it gets its own block. |
| `git-worktree.test.ts` | 5 | shared | |
| `turbo-lane-digest.test.ts` | 5 | split | The five tests sit between named `it.layer` blocks. Wrapping the `describe` would nest those blocks under a shared TestClock, so each test gets its own block. |
| `yeet-merged-preview.test.ts` | 5 | shared | Only `describe("yeet merged tier guards")`. |
| `doctest-lane.test.ts` | 4 | shared | `providePlatform` becomes `PlatformLayer`. The `describe` options `{ concurrent: false }` move to the `it.layer` options, which forward them to the suite. |
| `research-notion-pull.test.ts` | 4 | shared | `provideTestLayer(...)` wrappers removed. |
| `yeet-settle.test.ts` | 4 | stub, split | The `ruleset reader ${label}` loop provided `BunCrypto` plus a scripted spawner layer. `spawner` is now a value under `provideService`, and each iteration gets its own `BunCrypto` block, because the cases assert exact TestConsole error counts. The three `platform` tests each get their own block. |
| `cache-dependencies.test.ts` | 3 | shared | |
| `cache-synthetic-orchestration.test.ts` | 3 | shared | |
| `ci-heavy-admission.test.ts` | 3 | stub | `gitSpawner` returns the spawner value. `env` is a `ConfigProvider`, not a layer. Both go under `provideService` inside the existing `platform` block. |
| `knowledge-refs.test.ts` | 3 | shared, removal | Two `provideScopedLayer(TestConsole.layer)` calls are removed: a top-level `it.effect` already provides a fresh TestConsole (`internal.ts:59`, `:386`). The baseline `describe` becomes `it.layer(baselineLayer)`, and its whole-body `Effect.scoped` (EV004) is dropped. |
| `proof-digest.test.ts` | 3 | shared | The crypto-only tests now run under the superset `PlatformLayer`. The unused `CryptoLayer` constant is removed. |
| `research-command.test.ts` | 3 | shared | |
| `research-timers.test.ts` | 3 | stub, nested split | `withoutHome` and its sibling `withHome` provide a `ConfigProvider` value. Each of the two `FetchHttpClient.layer` tests gets a nested block inside the existing `NodeServices` block (`excludeTestServices` is inherited). |
| `cache-linker.test.ts`, `cache-profile.test.ts`, `check-census.test.ts`, `process-identity.test.ts`, `qa-judge-skill.test.ts`, `yeet-monitor-phase-empty.test.ts` | 2 each | shared | The `check-census` whole-body `Effect.scoped` stages are dropped (EV004). |
| `codegen-command.test.ts` | 2 | shared | The whole-body `Effect.scoped` stages are dropped (EV004). |
| `create-package-identity-template.test.ts`, `test-tsgo-turbo-inputs.test.ts` | 1 each | shared | `test-tsgo`: the whole-body `Effect.scoped` is dropped (EV004). |
| `policy-fingerprint-turbo-inputs.test.ts` | 1 | split | Own block beside the existing `platform` block. |
| `proof-job.test.ts` | 1 | stub | `ConfigProvider.layer(...)` becomes `provideService(ConfigProvider.ConfigProvider, ...)`, the form the same file already uses. |
| `step-git-exec.test.ts` | 1 | stub, split | The spawner goes under `provideService`. `BunCrypto.layer` gets its own block beside the existing `Git filename inventory capture` block. |
| `yeet-monitor-ready.test.ts` | 1 | split | The `for (const waiting of ...)` loop registers one block per case, since each pins the TestClock and reads TestConsole. |
| `roadmap-refs.test.ts` | 1 of 2 | split | Only "blocks only the dead link..." migrates, to its own block: `testLayer` holds a TSMorph cache and TestConsole. The other row stays open (hand-off 2). |

No assertion was changed, removed or weakened. No test was skipped, renamed, added or
removed: the 31 touched files run 635 tests before and after. Nine EV010
`platform-resource-provenance-review` rows on the `@effect/platform-node` imports
retired with the per-test provides: cache-linker, cache-profile, codegen-command,
doctest-lane, git-worktree, policy-fingerprint-turbo-inputs, proof-shadow,
research-command and research-notion-pull.

## Exceptions re-checked

None of the touched files holds an EV002 exception, so none needed migrating. All 692
exceptions are byte-identical in the inventory. The seven `#1855 wave 4 register`
exceptions are present, and none needed re-keying.

## Not migrated: handed to #1855

No exception was added. These rows stay open, each with a counterexample.

1. **Rebuilding the subject over a test-body service double (3 rows).**
   `graft-cache-sync.test.ts:226`, `:426`, `:473`. Each test rebuilds
   `Layer.fresh(GraftCacheSyncLive)` over a `FileSystem` double declared in its own body.
   The double wraps the fixture's real `fs` and closes over body-local counters
   (`directoryReads`, `realPaths`, `stats`, `renames`) and the fixture's `source` and
   `target` paths. Some test code runs inside the double's `rename`, and the tests assert
   the counters afterwards. `it.layer` builds before the body runs. The only other route
   is `it.layer(Layer.unwrap(...))`, which would have to build the fixture inside the
   layer and expose the counters and observers through a new test service. That moves the
   subject's setup and some of its assertions into a hook. A test-side constructor would
   need a new production export (`makeGraftCacheSync` is module-private).

   Proposed repair: when the provided layer is `Layer.fresh(X)` or `X.pipe(Layer.provide(d))`,
   and `d`, or a `provideService` stage after it, names a binding declared in the
   enclosing test callback, emit a distinct judgment class (for example
   `body-double-rebuild`) whose sketch does not recommend `it.layer`. Paired fixtures:
   `Layer.fresh(Live).pipe(Layer.provide(Layer.succeed(FileSystem, counting)))` with a
   body-local `counting` (new class), and the same layer over a module-level stub
   (`unresolved-layer-provide`, unchanged).
2. **EV002 masking an EV003 whole-body resource wrapper (16 rows).**
   - `proof-shadow.test.ts`: 13 `PlatformLayer` rows: `:226`, `:264`, `:329`, `:354`,
     `:389`, `:422`, `:465`, `:483`, `:506`, `:529`, `:556`, `:717`, `:738`.
   - `identity-registration-removal.test.ts`: `:226`, `:251`.
   - `roadmap-refs.test.ts`: `:78`.

   Each test body is `wrapper(...).pipe(provideScopedLayer(L))`, where the wrapper is
   `inTempCheckout` or `withTempWorkingDirectory`. A first attempt migrated them; the next
   `--write` added 16 open EV003 rows. With the provide gone, the wrapper becomes the
   whole body, and `detectResourceWrapper` fires (`isWholeBodyCall`). The wrapper gives
   each test its own temp checkout or working directory, and a shared layer would break
   that isolation. The migration was reverted rather than trade EV002 rows for new EV003
   rows (S31). Proposed repair, for wave 5's EV003 ruling: classify a whole-body wrapper
   that acquires and releases a per-test temp root as deliberate per-test isolation. Then
   these 16 EV002 rows can migrate. Paired fixtures: `inTempCheckout((root) => ...)` as
   the whole body inside an `it.layer` block (no finding, or an info class), and a wrapper
   that only provides a shareable layer (EV003, unchanged).
3. **A detector gap (no open row).** A same-file factory that returns
   `Layer.succeed(Tag, value)` is reported as `unresolved-layer-provide`, while the same
   `Layer.succeed` written inline is accepted as a pure stub. The factory cases in
   ci-lane-timings, ci-heavy-admission, yeet-monitor-loop, yeet-settle and step-git-exec
   migrated to `provideService`, so no row is left. Suggested repair: let
   `layerComposedOf` follow a same-file arrow factory to its returned expression.

## Remaining for #1875

- Wave 5, the resource-lifetime families: EV004 and EV003, including the 33 rows in the
  two skipped files once the #1855 wave 5 detector ruling lands, and the 16 rows of
  hand-off 2.
- Wave 7, EV010 platform filesystem provenance.
- The 3 rows of hand-off 1 if #1855 keeps them as EV002.

## Verification

Route: S39/S41 Claude chain, `claude-opus-5-5` child (Claude Code Agent tool), no
cross-provider lane. Every heavy command ran alone through `beep-heavy` with stdin from
`/dev/null`, serialized with the parallel `rsc-residue-detectors-w5` lane through the
same admission. Dependency dists were built first with
`bunx turbo run build --filter=@beep/repo-cli^...` (62 tasks, 61 cached).

| Check | Result |
| --- | --- |
| `bun run beep lint effect-vitest` | base `introduced=1` (inherited ConfigFileKeyTyping EV011); a first migration pass `introduced=46`, all from this lane: 16 EV003 rows behind removed provides, 23 EV014 hook timeouts and 6 EV004 whole-body scopes. The EV003 tests were reverted (hand-off 2), and the EV014 and EV004 cases were fixed in place. Final `introduced=0 resolved=0` after `--write`. |
| `--write` byte stability | two consecutive writes, identical sha256 `1ee1ffcc...7a857`; 1,114 to 984 rows |
| Exceptions | 692 before and after, reasons unchanged; 7 `#1855 wave 4 register` exceptions present |
| `bunx turbo run build --filter=@beep/repo-cli^...` | 62/62 successful |
| repo-cli `bun run check` (tsconfig.check, scripts, test overlay) | exit 0 |
| `bunx tsc-rs -p test/tsconfig.json --noEmit` | exit 0 |
| 31 touched files, Bun (`bunx --bun vitest run`) | 31 files, 635 tests passed |
| 31 touched files, Node (`bunx vitest run`) | 31 files, 635 tests passed |
| Full repo-cli suite, Bun (`bun run test`) | 7,621 passed, 1 failed: `knowledge-doctor-evaluators.test.ts` "reads the same packets ... as the live filesystem". Environment-only: it compares the live packet files with committed state, and the diff is this lane's uncommitted `statusNote`. Not a source defect; it passes once the packet edits are committed. |
| Mutation probes (Bun) | shared block: a `git-worktree` expected value flipped, which failed; stub: the `ci-lane-timings` run-page count changed from 4 to 5, which failed; split block: the `yeet-monitor-loop` allowance text changed, which failed; isolation: the `yeet-settle` ruleset-reader loop merged into one shared block, which failed the `invalid` and `truncated` cases on accumulated TestConsole errors. Every file was restored byte-identical (`cmp`). |
| Biome / oxlint on the 31 changed files | clean |
| Coverage ratchet `bun run coverage --filter=@beep/repo-cli` | PENDING. The first run failed in its test step before the comparison: the knowledge-doctor environment row above, plus a `cache-pilot-orchestration.test.ts` 300 s timeout under load, which passes alone on Node (25/25). The rerun was stopped for the workstation reboot. |
| `lint:schema-first`, `quality fallow audit --base origin/main --check`, root `lint:oxlint`, `jsdoc:inventory:check` + `jsdoc:ratchet:check`, `lint:retired-effect-paths`, `goals:doctor`, `quality package-verify @beep/repo-cli` | PENDING (after the reboot) |

## Reversal

Revert the PR. The 131 rows come back open with their previous ids and occurrences, and
the inventory returns to the base. No source, detector, baseline or exception reason
outside the 31 test files and the inventory changes.
