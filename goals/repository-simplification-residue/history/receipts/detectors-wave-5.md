# #1855 detector repairs wave 5: the EV003 process-state ruling and the #1875 EV008/EV013 hand-offs

Lane `residue-detectors` wave 5, branch `feat/residue-detectors-wave5`, on `main` `8ea6ba7401`
(includes #1855 wave 4, #2186, and #1875 wave 4, #2205). Scope: the 35 EV003 rows that
`detectors-wave-4.md` "Closing frontier" lists by wrapper, plus the five EV008 rows and two
step-capture EV013 polls that `vitest-canon-wave-4.md` hands to #1855. EV010 is untouched.

## Measurement at `8ea6ba7401`

`bun run beep lint effect-vitest`: 2,662 files, 1,115 findings, one new finding. The inventory
held 1,114 rows (692 exceptions, 422 open).

The new finding is inherited, not this lane's: `EV011
packages/foundation/capability/config-file/test/ConfigFileKeyTyping.test.ts:10`,
`import { expectTypeOf } from "vitest"`, added on `main` by #2203 (`ff57c724ea`) without an
inventory refresh. It is fixed at the source here (the name comes from `@effect/vitest`, which
re-exports `vitest`), so the row never enters the inventory.

Counts below are against the PR base, `main` `a1542ea161` (1,111 rows: 692 exceptions, 419 open),
which already includes the three EV012 seam resolutions (#2216); the lane measured first at
`8ea6ba7401` (1,114 rows: 692 exceptions, 422 open).

| Rule | Exceptions before | Open before | Exceptions after | Open after |
| --- | ---: | ---: | ---: | ---: |
| EV001 | 1 | 0 | 1 | 0 |
| EV002 | 98 | 168 | 98 | 167 |
| EV003 | 15 | 20 | 23 | 0 |
| EV004 | 89 | 57 | 89 | 56 |
| EV005 | 6 | 0 | 6 | 0 |
| EV006 | 56 | 0 | 56 | 0 |
| EV007 | 2 | 0 | 2 | 0 |
| EV008 | 4 | 5 | 2 | 0 |
| EV009 | 28 | 0 | 28 | 0 |
| EV010 | 137 | 150 | 137 | 150 |
| EV012 | 6 | 0 | 6 | 0 |
| EV013 | 0 | 2 | 0 | 0 |
| EV014 | 233 | 0 | 233 | 0 |
| EV015 | 17 | 17 | 17 | 17 |
| **Total** | **692** | **419** | **698** | **390** |

The 35 EV003 rows (15 exceptions, 20 open), the 9 EV008 rows (5 of them open hand-offs) and the
2 EV013 polls, at the base:

- EV003 save/restore wrappers (15): `withEnvVarEffect` ×4 (`ci-lane` :195/:1836,
  `quality-tasks:359`, `yeet:300`), `withCwd` ×3 (`session-ledger:124` exception,
  `worktree-remove-fence:81`, `yeet-sweep-retire:150`), `withRealCwd` ×2
  (`worktree-remove-fence:98`, `yeet-sweep-retire:262`), `withPrependedPath` ×2
  (`ai-metrics-command:206`, `quality-scheduler-synthetic-scenario:145` exception),
  `withPathPrefix` (`image-command:50`), `withWorkingDirectory` (`ci-lane:287`),
  `withPartitionShim` (`ci-lane:221`) and `withEnvVar` (`files-command:755`).
- EV003 `image-command` `withTempDirectory` (8): exceptions :34/:162/:240/:383, open
  :200/:281/:305/:339.
- EV003 `inTempCheckout` (4 exceptions): `yeet-inbox-porcelain` :533/:556/:577/:594.
- EV003 other judgments (8): `withRedirectingCognee` ×2 (`research-daily` :48/:315, open),
  `withUnreadableDataDir` (exception), `withFakeBox` (exception), `seedHistory`
  (`research-history-sift:64`, open), AgentMessage `query`/`call`/`fixture` (exceptions).
- EV008 hand-offs (5 open): `step-capture-lifecycle` :567/:580 (`deferred-clock-wait-review`)
  and :720 (`controlled-clock-wait-review`), `yeet-monitor-comment-stream:181`, and
  `yeet-pr-provenance:192`. The other four EV008 rows were exceptions:
  `ProviderCache.test.ts:366`, `browser-failure-atoms.test.ts:26`, `DuckDb.service.test.ts:774`
  and `Libpff.pffexport.test.ts:1171`.
- EV013 hand-offs (2 open): `step-capture-lifecycle` :565/:578.

After the wave, `lint effect-vitest --write` leaves 1,088 rows (698 exceptions, 390 open) against
the base's 1,111 (692, 419). Paired by `(ruleId, file, occurrence)` against the base inventory, 24
rows are gone and one is new:
- 22 rows retire through this wave's work: 15 open and 7 exceptions.
- 12 open rows convert to exceptions in place, and 10 EV003 exception reasons gain an owner and exit.
- The `files-command` `withEnvVar` open row is replaced by the new `withReplacedPath` exception at
  the same `PATH` call (see below), so 13 open rows become owner/exit exceptions in all.
- One gone row is base drift, not this wave: the open EV002 `yeet-settle.test.ts:1172`
  `provideScopedLayer` row, whose provision #2220 had already removed from the code without an
  inventory refresh.

Check: 419 − 15 − 13 − 1 = 390 open; 692 − 7 + 13 = 698 exceptions; 1,111 − 24 + 1 = 1,088 rows.
A second `--write` is
byte-identical (sha256 check OK), and the plain scan reports `introduced=0 resolved=0`. All 7 `#1855 wave 4 register` exceptions are present.

## The EV003 process-state ruling

**A process-state save/restore wrapper is its own judgment class, not an `it.layer` candidate.**
EV003's remedy (`it.layer` sharing) assumes the wrapper holds a resource the block can own. A
wrapper that sets and restores `process.env`/`Bun.env`, `PATH`, `process.cwd` or the OS working
directory holds global process state. Moving that into `it.layer` would leak the change across
every test in the block and across concurrent blocks. So each row gets one of three dispositions:

1. **The subject reads the value through an Effect seam:** migrate the test to provide it
   (a `ConfigProvider` service), so nothing global is mutated. The row resolves.
2. **The mutation is not read by the subject:** delete it. The row resolves.
3. **The subject reads process state directly** (`Bun.env`, `process.cwd()`, `/proc/<pid>/cwd`, or
   an executable resolved through the inherited `PATH`): the row becomes an exception that names
   the missing seam as its exit. A seam is added only when it is small and in scope. None of these
   is: each would be a production change to a command's environment, cwd or executable
   resolution, and `process.cwd()` alone is read in 146 places in repo-cli `src`.

The detector's `resource-wrapper` class is unchanged. The inventory key includes the class, so
renaming it would re-key every row as new, and the class itself is correct: these are resource
wrappers, judged by reason.

### Per-row dispositions

| Row | Disposition | Why |
| --- | --- | --- |
| `files-command:755` `withEnvVar` | migrated, resolved | `BEEP_UV_PATH`, `BEEP_TIKA_TIMEOUT_MILLIS`, `BEEP_FFMPEG_PATH` and `BEEP_FFPROBE_PATH` are all read through `Config` (`MatchPerson.ts` `readOptionalConfig`, `Tika.server.ts` `Config.Int`, `MediaExec.ts` `Config.String`). The wrapper already provided `ConfigProvider.fromUnknown({ [name]: value })`; its `Bun.env` write was dead for those names. It is now `Effect.provideService(use, ConfigProvider.ConfigProvider, ConfigProvider.fromUnknown({ [name]: value }))`, the same provider as before (`ConfigProvider.layer` is `Layer.succeed(ConfigProvider)`). **Correction found by the full suite:** one call passed `PATH`, which `Files` does not read through `Config`; the real `ChildProcessSpawner` resolves `exiftool` through the inherited process `PATH`, so "warns once and uses filesystem dates when exiftool is unavailable" failed on Bun and Node. That call now uses a separate `withReplacedPath` save/restore wrapper, and its EV003 row is an owner/exit exception (exit: Files resolves exiftool through Config, like its `BEEP_FFMPEG_PATH`/`BEEP_FFPROBE_PATH` reads). |
| `image-command` `withTempDirectory` ×8 (4 exc, 4 open) | chdir deleted, resolved | Ruled below: the acquire is real process state, but nothing reads it. |
| `image-command:50` (now :44) `withPathPrefix` | exception | `FFmpeg.makeLayer()` keeps the bare `ffmpeg`/`ffprobe` names, resolved through the inherited `PATH`. Exit: the image command reads those paths through `Config`, as `MediaExec` already does. |
| `ai-metrics-command:206` `withPrependedPath` | exception | ssh/rsync shims resolved through the inherited `PATH`. |
| `yeet:300` `withEnvVarEffect` | exception | `PATH` carries a `gh` shim that the gh operations spawn. Exit includes a fake `ChildProcessSpawner`, as `yeet-sweep-retire`'s `ghLayer` does. |
| `quality-scheduler-synthetic-scenario:145` `withPrependedPath` | exception kept, owner/exit added | systemctl shim through `PATH`. |
| `ci-lane:195` `withEnvVarEffect` (definition) | exception | `CiLane.ts` reads `BEEP_CACHE_TOOLCHAIN_DIGEST`, `BEEP_QUALITY_CHECK_CONCURRENCY` and the `TURBO_*` names from `Bun.env` and forwards the ambient env to children. |
| `ci-lane:1836` `withEnvVarEffect` (call) | exception | The ambient `BEEP_CACHE_TOOLCHAIN_DIGEST` rejection is the subject (`assertCacheRuntimeKeyUnspecified(step.command, step.args, Bun.env, stepEnv)`). |
| `ci-lane:221` `withPartitionShim` | exception | bunx/bun shims through `PATH`, and the `CI_LANE_TEST_*` inputs the shim reads from its inherited env. |
| `ci-lane:287` `withWorkingDirectory` | exception | `findRepoRoot()` starts from `process.cwd()`. |
| `quality-tasks:359` `withEnvVarEffect` | exception | `Tasks.ts`, `LaneProofReuse.ts` and `isCiSync` read `Bun.env`, and `PATH` carries the shims. |
| `worktree-remove-fence:81`, `yeet-sweep-retire:150` `withCwd` | exception | `process.cwd` override. The commands read `process.cwd()` (`Worktree.command.ts:123`; sweep and retire resolve the lane from it). |
| `worktree-remove-fence:98`, `yeet-sweep-retire:262` `withRealCwd` | exception | The archive fence reads `/proc/<pid>/cwd`, and the command moves the process out of the lane it removes. Only `process.chdir` exercises that. |
| `session-ledger:124` `withCwd` | exception kept, owner/exit added | Session and Register commands read `process.cwd()`. |
| `inTempCheckout` ×4 | exceptions kept, owner/exit added | `process.cwd` swap. The inbox runners resolve the checkout from `process.cwd()`. |
| `withRedirectingCognee` ×2 (open) | migrated, resolved | A real `Bun.serve` used by one test. The server is now a test-scoped `Effect.acquireRelease` value (`redirectingCognee`) that the test yields. `it.effect` supplies the scope, so the server stops when that one test ends. No wrapper remains. |
| `seedHistory` (open) | migrated, resolved | A hand-rolled `Layer.build` + `Effect.provide(context)` + `Effect.scoped` around a scratch `:memory:` DuckDB. It is now `Effect.fn(..., provideScopedLayer(DuckDb.makeNodeLayer(...)))`, the shared `@beep/test-utils` helper with the same per-seed lifetime. That lifetime is a precondition: the connection must detach and close before the sift reads the file. `Effect.provide(layer)` was tried first and rejected by the `strictEffectProvide` diagnostic. The removed `Effect.scoped` also retires the EV004 `inner-helper-scope-lifetime-review` row at `:92`. |
| `withFakeBox` (exception) | detector repair, resolved | Repair 1 below. |
| `withUnreadableDataDir` | exception kept, owner/exit added | The `chmod 0` bracket is deliberately shorter than the test, so the assertion sees failed access before restoration. That is not a shareable resource. |
| AgentMessage `query`/`call`/`fixture` | exceptions kept, owner/exit added | Per-call `Layer.build` over a helper parameter (a path, a grant). The first-open race and the per-grant handler are the subjects, so a static `it.layer` cannot express them. Wave 4 ruled that a single body-derived provision is not exempt, so this is not a detector false positive. |

### The `image-command` `withTempDirectory` acquire

The brief asked for an acquire-classification repair if this was a false positive. **It is not
one.** The wrapper's only `acquireUseRelease` acquires `process.chdir(tmpDir)` and releases
`process.chdir(previousCwd)`. That is process state, and EV003 flags it correctly: wave 3's FP-2
ruling deliberately keeps wrappers that mutate process state under review, and the existing
fixtures "reviews temp wrappers that mutate imported process state" and the `withTempCwd`
`shareable` cases pin that.

Treated as a save/restore wrapper, the row is disposition 2. Nothing reads the cwd:

- every case passes absolute paths (`--video`, `--out-dir` and `--dir` all sit under `tmpDir`);
- `Image.service.ts:181` `path.resolve(dir)` gets an absolute `dir`;
- the ffmpeg shims write the absolute paths ffmpeg is given;
- the one CLI case, `runCliCommand`, spawns with an explicit `cwd` and `env`.

So the chdir is deleted. `withTempDirectory` is now `makeTempDirectoryScoped` plus the per-case
`TestConsole`. With no acquisition left, EV003 has nothing to flag, and all 8 rows resolve. The
four exception reasons said the wrapper kept `acquireUseRelease` "solely to restore
process.cwd". The suite passes unchanged on Bun and Node.

## Detector repairs

All three repairs were written failing-first. The new cases failed against the base at the silent
loop: `test/effect-vitest-detectors.test.ts:477` (layer factories), `:783` (controlled waits) and
`:807` (`excludeTestServices`). The changed "piped fork cancellation" case failed at `:909`.

### Repair 1: EV003 layer factories (`isLayerFactory`)

**A true false positive.** `withFakeBox` (`DmsMirrorBox.test.ts:291`) is
`(adapter) => L.unwrap(...).pipe(L.provideMerge(L.sync(...)))`, and its only callers are
`it.layer(Layer.fresh(withFakeBox(mirrorLayer)))`. It returns a Layer to `it.layer`, which owns
the build and its scope, so it is exactly what EV003 recommends. It was flagged only because it
is named `with*` and its body holds a `Layer.unwrap` call.

**Recognition.** `functionHasShareableResource` is false for a definition whose expression body,
or every return statement of its own block body, is a Layer value. A Layer value is a call to a
`Layer` value constructor or combinator (`LAYER_VALUES`), or such a value piped only through
data-last `Layer.provide`/`provideMerge`/`merge` stages (`isLayerPipe`).

**Fixtures**, case "permits with-named layer factories that hand their Layer to it.layer":

- Silent:
  - the `withFakeBox` shape under `L.fresh`;
  - a block body returning `L.unwrap(...)`;
  - `(dataDir) => L.scoped(Store, openStore(dataDir))` passed to `it.layer`.
- Still EV003:
  - a `with*` that returns `use.pipe(Fx.provide(L.scoped(...)))`, an Effect;
  - `L.build(L.unwrap(...))`, which returns an Effect;
  - a Layer piped through `Fx.provide(other)`;
  - a body with one Layer return and one `Fx.acquireUseRelease` return.

**Rows retired: 1 exception** (`withFakeBox`).

### Repair 2: EV008 waits in `excludeTestServices: true` blocks

**A true false positive.** `@effect/vitest` 4.0.5 `makeLayer`
(`node_modules/@effect/vitest/src/internal/internal.ts:264-267`) builds the block without TestEnv
when `excludeTestServices` is set, and passes the flag to nested blocks (`:304`). So the block's
tests run on the live Clock, exactly as `it.live` does.

**Recognition.** In `createEffectVitestHarnessIndex` (`EffectVitestSyntax.ts`), an `it.effect`
registered in such a block, or in a block nested in one through the tester parameter, is indexed
as `live`. `testClockMode` is then false, and so is the helper reachability `testClock` bit. The
flag counts only when:

- it is a literal `true` in the options object, the builder call's second argument;
- the block's layer does not compose `TestClock.layer()`, directly or through same-file bindings
  (`composesTestClock`). `TestClock.layer` installs a TestClock as the Clock again
  (`TestClock.ts:553`).

This guard was added after the first `--write`. That run retired
`ProviderCache.test.ts:366`, whose block layer `CacheTestServices` merges `TestClock.layer()`, and
whose exception reason relies on that TestClock. The guard fixtures failed first at `:820`. The
row's exception and reason are back unchanged.

**Fixtures**, case "treats waits in excludeTestServices layer blocks as live-clock waits":

- Silent:
  - a sleep in an excluded block;
  - the same with a named block plus a `timeout`;
  - a sleep in a block nested in an excluded one;
  - a same-file `Schedule.spaced` helper reached only from an excluded block.
- Still EV008:
  - a default block;
  - `excludeTestServices: false`;
  - a computed flag;
  - `timeout` only;
  - a top-level `it.effect` beside an excluded block;
  - the helper reached from a default block;
  - the helper reached from both kinds of block;
  - an excluded block whose layer merges `TC.layer()`, inline or through a `const`.

**Rows retired: 3 open and 1 exception.**

- The open rows are the hand-offs `step-capture-lifecycle` :567/:580 and
  `yeet-monitor-comment-stream:181`. Every caller of the `until` helper is in an excluded block.
- The exception is `Libpff.pffexport.test.ts:1171`, in the excluded block at `:1145`. Its reason
  already called the 1,250 ms sleep a "wall-clock absence observation".

### Repair 3: EV008 controlled waits produce no finding

**The ruling changes.** Before, a wait with a syntactic fork ancestor plus any same-body
`TestClock.adjust`/`setTime` or `Fiber.interrupt`/`interruptAll` was a
`controlled-clock-wait-review` judgment row. That is the TestClock canon EV008 recommends: the body
forks the wait and then drives the clock or ends the fiber, so the direct test body cannot stall
on it. Keeping it as a review row asked owners to rename the wait (`Effect.never`,
`Effect.delay`), which hides the subject. Controlled waits now produce no EV008 finding, and
`controlled-clock-wait-review` is no longer emitted.

**Recognition** (`controlledWait`, `forkOfWait`, `waitCarriers`), tightened at the same time:

- The fork is a syntactic `Effect.forkChild`/`forkScoped`/`forkDetach` ancestor in the test
  callback, data-first or as a `.pipe` stage. Or the wait sits in the initializer of a test-body
  declaration whose value flows, through further test-body declarations that read it, into a fork
  call's arguments or receiver in the same body. This is the `yeet-pr-provenance` shape: a
  `FileSystem` override holds the sleep, the override is provided to the service, and the service
  call is forked.
- The clock or interrupt call must start after the fork ends. A control before the fork cannot
  drive it.
- A directly awaited wait is never controlled, and neither is a fork with no later control.
- A carrier the test body also yields itself is not held by the fork (`directlyAwaited`, from the
  #2227 review): a `yield*` outside the fork and outside the initializers that build the forked
  value, whose operand reads a carrier declared before the fork, runs the wait on the test fiber.
  The fiber handle and later join results are not carriers of the wait, so `Fiber.join(fiber)`
  after the control stays silent.

**Fixtures**, case "permits waits a forked fiber holds while a later same-body clock operation
drives it":

- Silent:
  - fork plus `adjust` plus `join`;
  - fork plus `setTime`;
  - the piped `transaction(() => sleep).pipe(Fx.forkChild({ startImmediately: true }))` plus
    `Fiber.interrupt`;
  - the bound fake-filesystem service forked, then `adjust` plus `join`.
- Still EV008:
  - fork plus `join` with no control;
  - `adjust` before the fork;
  - a bound wait awaited directly before `adjust`;
  - a bound wait whose holder the fork does not read;
  - `adjust` before forking the bound wait.
  - a bound wait forked and also yielded directly, as a statement or into a declaration, before
    `adjust` (failing first against the carrier path that accepted any fork reading the carrier).

The old assertions that a controlled wait is a judgment row are removed. "limits withLive
exemption to the wrapped wait" keeps its sequential-wait detector row. "permits piped fork
cancellation without hiding a subsequent direct wait" now expects no judgment row and still
exactly one detector row for the later direct sleep.

**Rows retired: 2 open and 1 exception.**

- The open rows are the hand-offs `step-capture-lifecycle:720` (the `abortWhen` watchdog in
  `Effect.flip(runCaptured(..)).pipe(Effect.forkChild)`, then `TestClock.adjust("1 minute")`) and
  `yeet-pr-provenance:192`.
- The exception is `DuckDb.service.test.ts:774`. Its reason said the pending transaction is
  "explicitly interrupted ... the test does not wait for this sleep".

**Reversal (all three repairs):**

- Drop `!isLayerFactory(...)` from `functionHasShareableResource`.
- Drop the `liveOwner`/`excludesTestServices` registration in `createEffectVitestHarnessIndex`.
- Restore the `controlled-clock-wait-review` return in `clockWaitClassification`, and remove the
  `controlledWait` early return in `detectClockWait`.
- Run `lint effect-vitest --write`, then restore the three retired exception reasons from the base
  inventory (`git show 8ea6ba7401:standards/effect-vitest.inventory.jsonc`).

## The EV008/EV013 hand-offs

| Row | Outcome |
| --- | --- |
| `step-capture-lifecycle:567`, `:580` EV008 | Repair 2: the `excludeTestServices` block runs on the live Clock. |
| `step-capture-lifecycle:720` EV008 | Repair 3: forked watchdog driven by `TestClock.adjust`. |
| `yeet-monitor-comment-stream:181` EV008 | Repair 2: the helper is reached only from excluded blocks. |
| `yeet-pr-provenance:192` EV008 | Repair 3, through the bound-value flow. |
| `step-capture-lifecycle:565`, `:578` EV013 | Migrated. Readiness is `fs.exists(readyPath).pipe(Effect.repeat({ schedule: Schedule.spaced("10 millis"), until: (ready) => ready, times: 2_000 }))`. Liveness is the same with `while: (alive) => alive, times: 300`. Both run in the live block, so no EV008 row replaces them. The bounds are one initial read plus 2,000 or 300 recurrences, where the loops made 2,000 and 300 reads. The `expect(ready).toBe(true)` and `expect(nestedAlive).toBe(false)` assertions are unchanged. |

**Mutation probes** (Bun, each file restored from a byte copy afterwards):

- `until: (value) => !value` fails at once ("expected false to be true", 2 s).
- `times: 0` fails the same way (2 s).
- Inverting the liveness `while` still passes, because the nested child is already dead at the
  first read. So the real regression was probed instead: without `Fiber.interrupt(outer)` the
  child survives, and the test fails "expected true to be false" in 5 s, bounded by
  `times: 300`, with no hang and no stray `sleep 30` afterwards.
- `research-daily`: a server answering 200 instead of 302 fails the redirect test (1 s).
- `research-history-sift`: deleting the seeded rows fails the sift count ("expected +0 to be 4",
  2 s).
- `files-command`: a `withEnvVar` that ignores its value fails 8 tests. Some of them reach the
  real 30 s Tika and uv timeouts, because the probe also removes the timeout override. That is
  probe-induced, and the original wrapper behaves the same under it.

## Open to exception conversions (12)

Each reason ends with `Owner: @beep/repo-cli. Exit: <condition>. #1855 wave 5 register.`

| Row | Missing seam (the exit) |
| --- | --- |
| `ai-metrics-command.test.ts:206` `withPrependedPath` | The mirror sync resolves ssh and rsync through `Config` or an injected executable path. |
| `ci-lane.test.ts:195` `withEnvVarEffect` | CiLane reads its ambient environment through `Config` or an injected environment service and hands children an explicit env. |
| `ci-lane.test.ts:1836` `withEnvVarEffect` | Same as `:195`. |
| `ci-lane.test.ts:221` `withPartitionShim` | Same as `:195`. |
| `ci-lane.test.ts:287` `withWorkingDirectory` | The CI lane takes its repository root from an injected working-directory service or an explicit option. |
| `image-command.test.ts:44` `withPathPrefix` | The image command reads `BEEP_FFMPEG_PATH`/`BEEP_FFPROBE_PATH` through `Config`, as `MediaExec` does. |
| `quality-tasks.test.ts:359` `withEnvVarEffect` | The `Bun.env` reads in `Tasks.ts`, `LaneProofReuse.ts` and `isCiSync` move to `Config`, and the shims to an injected executable path. |
| `worktree-remove-fence.test.ts:81` `withCwd` | The worktree command takes its invoking directory from an injected working-directory service. |
| `worktree-remove-fence.test.ts:98` `withRealCwd` | The fence takes the invoking process's working directory as an injected input instead of reading its own `/proc` entry. |
| `yeet-sweep-retire.test.ts:150` `withCwd` | Yeet sweep and retire take their invoking directory from an injected working-directory service. |
| `yeet-sweep-retire.test.ts:262` `withRealCwd` | Same as the fence row. |
| `yeet.test.ts:300` `withEnvVarEffect` | The yeet gh operations resolve gh through `Config` or an injected path, or the test supplies a fake `ChildProcessSpawner`. |

Ten existing EV003 exceptions keep their reasons, with an owner and exit appended:

- `session-ledger:124`;
- `quality-scheduler-synthetic-scenario:145`;
- `inTempCheckout` ×4;
- `withUnreadableDataDir` (owner `@beep/professional-desktop`);
- AgentMessage `query`/`call`/`fixture`.

The EV003 family now has 22 exceptions, every one with an owner and an exit, and 0 open rows.

## Remaining frontier

- **Wave 6, EV014 named test layers (233 exceptions, 0 open).** Resolve imported test layers
  across files, and rule on same-file `Layer.effect`/`scoped` test layers without a hook timeout
  (`detectors-wave-4.md` census).
- **Waves 7-9, the owner/exit register.** 698 exceptions; EV003's 23 and the 7 wave 4 rows now
  carry an owner and exit. Wave 7 is EV010. Wave 8 is EV002, EV004 and EV006. Wave 9 is the rest,
  including the two remaining EV008 exceptions and the EV012 rows.
- **Open rows: 390.** EV002 167, EV010 150, EV004 56, EV015 17 (splittable since wave 4) and
  EV012 3 (no production seam). These are #1875 migrations, not detector false positives.
- **Closeout:** a fresh zero actionable scan once #1875 has migrated its cohorts, then flip
  #1855 to `complete`.

## Verification

All on `8ea6ba7401` with the change applied. Each heavy command ran alone through `beep-heavy`
with `</dev/null`. Dependency dists were rebuilt first:
`bunx turbo run build --filter="@beep/repo-cli^..." --filter="@beep/config-file^..."` (62 of 62
tasks). Results are in the lane report and the PR body; this receipt records the commands.

- Typed checks:
  - `bun run --cwd packages/tooling/tool/cli check` exits 0;
  - `tsc-rs -p test/tsconfig.json --noEmit` exits 0 with 0 errors;
  - `@beep/config-file` `check` (including `beep:check:tests`, `tsconfig.test.json`) exits 0.

  The first repo-cli check found:
  - TS377032 `strictEffectProvide` on `Effect.provide(layer)` in `seedHistory`, fixed with
    `provideScopedLayer`;
  - TS2375/TS377004/TS377030 from `identity` as the `until`/`while` predicate, which inferred
    `unknown`. Fixed with typed lambdas.
- Suites: effect-vitest-detectors (240 tests, 3 of them new), -contract, -primitives, -store, lint-command,
  files-command, image-command, research-daily, research-history-sift and step-capture-lifecycle,
  10 files, 508 of 508 on Bun and 508 of 508 on Node. `ConfigFileKeyTyping` passes 7 of 7 on both.
- `lint effect-vitest`: after `--write`, `introduced=0 resolved=0`, 1,088 findings after merging main `a1542ea161`. The second
  `--write` is byte-stable.
- Biome and oxlint (`--disable-nested-config`) are clean on the 9 changed source and test files.

Route: S39/S41 Claude chain, `claude-opus-5-5` Agent child (step 1), no fallback and no
cross-provider lane.

## Reversal

Revert the PR. The 23 rows come back from the base inventory with their status and reasons. The
12 converted rows return to `open`, and the 10 annotated reasons lose their owner/exit suffix. The
inherited EV011 row returns as a new open finding until its import is fixed again. Per-repair
reversals are listed above.
