# #1875 Effect Vitest canon wave 4: record

Lane `residue-vitest-canon`, branch `feat/residue-vitest-canon-wave4` off `main`
`1a92168cca`, which includes waves 2 and 3. Scope: the assertion and harness families
EV006, EV005, EV007, EV011, EV012, EV013 and EV008. The detector lane #1855 owns detector
policy. This wave changes no detector and adds no exception.

The #1855 wave 4 PR (#2186) was still open when this wave started. It rewrites the same
generated inventory, so whichever PR merges second regenerates it with
`lint effect-vitest --write` after merging `main`. Its EV006 browser-mode repair retires
the four `@beep/ontology-client` browser rows, so this wave leaves them alone.

## Fresh measurement at `1a92168cca`

`bun run beep lint effect-vitest`: 2,508 files, 1,292 findings, `introduced=0
resolved=0`. The inventory held 1,292 rows (539 open, 753 exceptions).

| Rule | Package | Open before | Exceptions before | Open after | Exceptions after |
| --- | --- | ---: | ---: | ---: | ---: |
| EV006 | `@beep/repo-cli` | 68 | 14 | 0 | 0 |
| EV006 | `@beep/ontology-client` (browser) | 4 | 3 | 4 | 3 |
| EV006 | 16 other packages | 0 | 56 | 0 | 56 |
| EV005 | `@beep/repo-cli` | 3 | 0 | 0 | 0 |
| EV005 | other packages | 0 | 6 | 0 | 6 |
| EV007 | `@beep/repo-cli` | 6 | 2 | 0 | 2 |
| EV011 | `@beep/repo-cli` | 5 | 0 | 0 | 0 |
| EV013 | `@beep/repo-cli` | 5 | 0 | 2 | 0 |
| EV008 | `@beep/repo-cli` | 5 | 0 | 5 | 0 |
| EV008 | other packages | 0 | 4 | 0 | 4 |
| EV012 | `@beep/repo-cli`, `@beep/agents-server`, `@beep/epistemic-server` | 3 | 0 | 3 | 0 |
| EV012 | other packages | 0 | 6 | 0 | 6 |
| **In scope** | | **99** | **91** | **14** | **77** |

The open rows sat in 33 files, 32 of them in `@beep/repo-cli`. This wave edits 24 test
files, all in `@beep/repo-cli`, so it stays under the 40-file budget and needs no split.

After the migrations the inventory is regenerated with `lint effect-vitest --write`. It
shrinks from 1,292 to 1,193 rows (open 539 to 454, exceptions 753 to 739), and the next
scan reports `introduced=0 resolved=0`. The 99 retired rows are 85 open rows and 14
EV006 exceptions, all in this wave's files. No row was added.

Before that write, the plain scan reported seven "new" rows. They are not new findings.
They are seven existing open EV002 rows (`turbo-lane-digest` ×4, `yeet-command-wiring` ×2,
`yeet-settle` ×1) in tests whose bodies this wave edited. The occurrence anchor hashes the
whole enclosing statement (`occurrenceAnchor` in `EffectVitestDetectors.ts`), so editing
an `it.effect(...)` body re-keys every row inside it. Each re-keyed row pairs one-to-one
with a retired key in the same file, with the same symbol, evidence, class and `open`
status. The EV002 count is unchanged. The rewrite also refreshes line numbers for rows in
edited files; those rows keep their status and reason.

## Per-file migrations

| File | Rows | Change |
| --- | --- | --- |
| `turbo-lane-digest.test.ts` | 15 EV006, 1 EV007 | `toEqual(O.none())` and `toEqual(O.some(x))` become `assertNone`/`assertSome(x)` with the same operands. `.not.toEqual` of two Options becomes `notDeepStrictEqual`. `expect(O.isSome(..)).toBe(true)` and the `Exit.isFailure` check become `x.pipe(O.isSome, assertTrue)` and `x.pipe(Exit.isFailure, assertTrue)`. The JSON round-trip property moves from `Arbitrary.checkEffect` plus a `_tag === "Passed"` check to `it.effect.prop` over the same `Arbitrary.schema(TurboRunSummary)` and `fcRuns(25)`. |
| `yeet-merge-gate.test.ts` | 15 EV006 | Thread counts and required contexts use `assertSome`/`assertNone`. The three `O.isNone(parseMergeGateTolerance(..))` checks become `assertNone(..)`. Bare `isSome` checks keep their Boolean polarity as `x.pipe(O.isSome, assertTrue)`. |
| `schema-first-schema-class.test.ts` | 10 EV006 | `assertSome(x, [...])` and `assertNone(x)` with the same expected tuples and strings. |
| `session-orchestrator.test.ts` | 6 EV006 | `assertSome`/`assertNone`. `decoded.rows[0]?.waitingOnOrchestrator` becomes `O.flatMap(A.get(decoded.rows, 0), ..)`, so a missing row still fails (None against Some). |
| `proof-job.test.ts` | 5 EV006 | `assertSome` for the runner pid and verdict outcome, `assertNone` for the untouched outcome, and the piped `assertTrue` for the two `publishedAt` presence checks. |
| `harness-ledger.test.ts` | 4 EV006 | `toStrictEqual(O.some(..))`/`O.none()` become `assertSome`/`assertNone`. |
| `yeet-settle.test.ts` | 4 EV006, 1 EV005 | `assertSome` for the two `failing` gates. "rejects duration" was `expect((yield* Effect.result(..))._tag).toBe("Failure")` and is now `() => Effect.flip(yeetMonitorDurationMillis(value))`: a parse that succeeds still fails the test, and a defect still fails it, exactly as before. The repeated-cursor status test pipes `Effect.flip` instead of `Effect.result`, and the conditional `toContain` becomes an unconditional `assertInclude(failure.message, ..)`. |
| `research-library-views.test.ts` | 1 EV006 open, 14 EV006 exceptions | The Exit polarity checks become `exit.pipe(Exit.isFailure, assertTrue)` (or `Exit.isSuccess`). The four scenario-dependent ones, such as `toBe(requested === "")`, become `strictEqual(Exit.isSuccess(x), requested === "")`. The exception reason argued against inventing an `assertExitFailure` Cause. These forms invent nothing: they keep the polarity and the operands, so the 14 exception rows retire with the open one. |
| `skills-review.test.ts` | 3 EV006 | `deepStrictEqual` for the recorded-row tuples, `assertSome` for the ghost row. The compound `[second.twoStrike, O.isNone(second.ghost)]` against `[true, true]` splits into `assertTrue(second.twoStrike)` and `assertNone(second.ghost)`. |
| `research-daily.test.ts` | 2 EV006 | `assertSome` on the two API URLs. |
| `drawings-sign-email.test.ts`, `knowledge-doctor.test.ts` | 1 EV006 each | Piped `assertTrue` on `Result.isSuccess` and `Exit.isFailure`. |
| `yeet-review-thread-state.test.ts` | 1 EV006 | The ternary `cond ? O.isNone(x) : false` against `true` becomes `assertTrue(cond && O.isNone(x))`. It is the same predicate, and the detector accepts that compound form. |
| `yeet-command-wiring.test.ts` | 2 EV005 | `Effect.result` plus `_tag` checks become `Effect.flip`, the file's own idiom for typed failures (it is used throughout `detached proof job command wiring`). The CLI exit keeps `toMatchObject({ _tag: "CliReportedExit", exitCode: 1 })`. The timeout message check was conditional on the failure branch and is now an unconditional `assertInclude`. |
| `cache-pilot-orchestration.test.ts` | 1 EV007 | `it.effect.prop` over the same `Arbitrary.schema(Sha256Hex)` with `fcRuns(40)`. The property is unchanged (`Result.isFailure(outcome) === (sha256 !== digest)`). Each generated pin now builds its own `fixture()` in a per-sample scope, where before all 40 samples shared one. The pin is rejected before execution, so no sample observed another's state. |
| `goals-bootstrap-plan.test.ts`, `policy-fingerprint-turbo-inputs.test.ts`, `root-tasks-turbo-inputs.test.ts` | 1 EV007 each | `it.effect.prop` with the same arbitraries (`[Arbitrary.schema(BootstrapInput)]`, `[FingerprintRunSummaryArbitrary]`, `[fixtureArbitrary]`) and the same `fcRuns` floors (32, default, 25). The bootstrap property keeps its per-run `TestConsole` as an `Effect.fnUntraced` pipeable. |
| `yeet-pr-provenance-boundary.test.ts` | 1 EV007 | The callback was synchronous, so the property moves to `it.prop`, keeping the same keyed arbitrary and `fcRuns(64)`. The unused `Effect` and `expect` imports go. |
| `directory-handle`, `qa-judge-contract-parity`, `quality-tsgo-plugin-options`, `quality-tsgo-severity`, `worktree-reap` | 1 EV011 each | `from "vitest"` becomes `from "@effect/vitest"` for the same names. |
| `quality-scheduler.test.ts` | 1 EV013 | The ticket poll becomes `listDirectory(..).pipe(Effect.repeat({ schedule: Schedule.spaced("5 millis"), until: A.isReadonlyArrayNonEmpty, times: 100 }))`, still under `TestClock.withLive`. An empty queue still ends in `O.getOrThrow` and fails. The bound is now one initial read plus 100 recurrences (101 reads, at most 500 ms of spacing), where the loop made 100. |
| `quality-tasks.test.ts` | 2 EV013 | Both artifact polls become one `readFileString` pipeline with `Effect.repeat({ schedule: Schedule.spaced("10 millis"), until: (read) => A.length(read) >= 2, times: 200 })`. The `toHaveLength(2)` assertion after the interrupt is unchanged. |

No assertion was removed and no test was skipped. Where a migration made a check
unconditional (`yeet-command-wiring`, `yeet-settle`), it is stronger than before. The
first `check` run flagged 23 `missedPipeableOpportunity` diagnostics on
`assertTrue(O.isSome(x))` and one `unnecessaryEffectGen`. All of them were rewritten to
the repository's piped form `x.pipe(O.isSome, assertTrue)` (the form `step-capture-lifecycle`,
`goals-bootstrap-plan` and `worktree-reap` already use) before the rerun.

## Exceptions re-checked

The only in-scope exceptions in the touched files were the 14 `research-library-views`
EV006 rows. All 14 migrated (above). The two EV007 exceptions are in untouched files
(`cache-accept-cli.test.ts:106`, `cache-operational-acceptance.test.ts:369`). Each
property runs inside one authenticated transaction and restores shared snapshots for
each case, so a per-sample `it.effect.prop` scope cannot hold that state. They are kept.

## Not migrated: handed to #1855

No exception was added, so these rows stay open, each with a counterexample for #1855.

1. **EV008 waits in `excludeTestServices: true` blocks (3 rows), and the EV013 rows they
   block (2 rows).** `it.layer(layer, { excludeTestServices: true })` runs its tests on
   the live Clock. `inspectContext` sets `testClockMode` from `mode === "effect"` alone
   (`EffectVitestDetectors.ts:1713`), so a wait in such a block is still classified as a
   TestClock stall risk. Rows:
   - `step-capture-lifecycle.test.ts:567` and `:580`: `Effect.sleep("10 millis")` in the
     two process polls of "keeps a cross-process nested StepExec child in the registered
     outer process group" (an `excludeTestServices` block that waits on a real `bun`
     child and `/proc`).
   - `yeet-monitor-comment-stream.test.ts:181`: the shared `until` helper's
     `Schedule.spaced(Duration.millis(5))`. Every caller (lines 353, 389, 408, 441, 469)
     is in an `excludeTestServices: true` block.
   - The two polls at `step-capture-lifecycle.test.ts:565` and `:578` are EV013 rows.
     Their canonical form (`Effect.repeat` with `Schedule.spaced`) replaces each EV008
     `sleep` row with a new EV008 `spaced` row, which counts as introduced. They stay as
     loops until the EV008 repair lands, and then migrate.

   Proposed repair: when the enclosing layer block passes `excludeTestServices: true`,
   treat its tests as live-clock (`testClockMode` false), as `it.live` is. Paired
   fixtures: a `Schedule.spaced` poll inside an `excludeTestServices` block (no
   finding), and the same poll in a default block (finding).
2. **EV008 waits a same-body fork and `TestClock.adjust` already drive (2 rows).**
   - `step-capture-lifecycle.test.ts:720` (class `controlled-clock-wait-review`): the
     `abortWhen: Effect.sleep("1 minute")` watchdog runs inside
     `Effect.flip(runCaptured(..)).pipe(Effect.forkChild)`. The body then calls
     `TestClock.adjust("1 minute")` and joins. `controlledWait` already proves this
     shape, but the class is still a finding.
   - `yeet-pr-provenance.test.ts:192` (class `deferred-clock-wait-review`): the
     `Effect.sleep("3 seconds")` sits in a `FileSystem` override bound in the test body.
     The body passes it to the service it forks with `Effect.forkChild(service.detect(..))`,
     then calls `TestClock.adjust("2 seconds")` to cross the detector bound.

   Both are the TestClock canon the EV008 sketch asks for. The only remaining move is to
   rename the wait (`Effect.delay`, `Effect.never`) so the detector stops seeing it,
   which would hide the subject without changing it. Proposed repair: make a controlled
   wait (fork plus same-body `adjust`/`setTime`/`interrupt`) produce no finding. Extend
   `controlledWait` to a wait inside a value bound in the test body that is handed to a
   forked effect in the same body. Paired fixtures: both shapes above (no finding), and
   the same wait awaited directly without a fork (finding).

## EV012: no production seam (3 rows)

`Layer.mock` needs a `Context.Service` that the subject reads. None of the three subjects
has one. Adding a seam would be a production refactor in the owning package, so these
rows stay open for their owners and are not detector false positives:

- `agents/server/test/AnthropicTurnKernel.test.ts:33` mocks `@beep/anthropic`. The kernel
  imports `AnthropicTurnPlan` (`src/AssistantTurn/AnthropicTurnKernel.ts:31`), and
  `BlockRepair.ts:11` imports `generateAnthropicToolJson` directly. The candidate seam is
  a provider service carrying the plan and the repair call.
- `epistemic/server/test/BoundedShaclValidator.test.ts:25` mocks the SHACL validation
  codec factory from `@beep/semantic-web/services/shacl-validation`.
- `tooling/tool/cli/test/codex-findings-packet-encode-failure.test.ts:10` mocks
  `encodeCodexTriageLedger`, a codec in `Findings.triage.schemas` that
  `renderPacketDocuments` calls directly. Its only purpose is to reach the
  encode-failure mapping, the same shape as the excepted
  `worker-command-encode-failure.test.ts:18`.

## Remaining

- In-scope rows still open: 4 EV006 (browser, retired by #1855 wave 4 / #2186), 5 EV008
  and 2 EV013 (the #1855 hand-offs above), 3 EV012 (no seam).
- Next: wave 5, the resource-lifetime families (EV004 and EV003) plus the
  `ThreadStore.test.ts:301` EV004 row that wave 3 deferred. After that come EV002 and
  EV010, as wave 1 planned. The two step-capture EV013 polls migrate once the EV008
  `excludeTestServices` repair lands.

## Verification

Route: S39/S41 Claude chain, `claude-opus-5-5` child (Claude Code Agent tool), no
cross-provider lane. Every heavy command ran alone through `beep-heavy` with stdin from
`/dev/null`. Dependency dists were built first with
`bunx turbo run build --filter="@beep/repo-cli^..."` (57 tasks, exit 0).

| Check | Result |
| --- | --- |
| `bun run beep lint effect-vitest` | base `introduced=0 resolved=0`; before `--write`, seven re-keyed EV002 rows reported as new (see measurement); after `--write`, `introduced=0 resolved=0`, 1,193 findings (1,292 to 1,193 rows). The final scan lists 2,545 files where the base listed 2,508: the extra 37 are git-ignored build output from the dependency build, and they contribute no finding. |
| `check` for `@beep/repo-cli` (`tsconfig.check.json`, `scripts/`, `test/tsconfig.json`) | exit 0, 0 errors. The first run reported 23 `missedPipeableOpportunity` and one `unnecessaryEffectGen` diagnostic in the migrated lines. All were fixed before the rerun, and it was rerun again after Biome formatting. |
| `package-test-typecheck` (`quality test-tsgo-package`) | exit 0 |
| Changed suites, Bun / Node | 26 files (the 24 changed files plus two name-matched siblings), 1,030 tests, all passed on both runtimes |
| Mutation probes (16, Bun) | every probed test failed and none hung. EV006: an `assertNone` target, an `assertSome` thread count, `A.get` index and value, `strictEqual` polarity (all seven variations failed), the compound `assertTrue`. EV005: `exitCode: 2`, and a valid `30m` added to the rejected durations. EV007: falsified properties in all six (`Property falsified after 1 run(s)`), including the inverted cache-pilot predicate. EV011: a changed `expect(..).toBe` in `quality-tsgo-severity`. EV013: an inverted `until` (`getOrThrow called on a None` in 13 ms), and `times: 0` (`expected [] to have a length of 2`). Files restored from byte copies and compared with `cmp`. |
| Coverage ratchet (`bun run coverage --filter=@beep/repo-cli`) | `ok: compared 1 package(s) with epsilon 0.001`, 360 files, 7,576 tests passed, 5 skipped |
| `quality package-verify @beep/repo-cli` | exit 0 (`ok audit 1296.3s`, `ok docgen 50.4s`) |
| `lint:schema-first` | `introduced=0` |
| `quality fallow audit --base origin/main --check` | `status ok`, 0 findings |
| Biome on changed files; `oxlint` on changed files; root `lint:oxlint` | clean after formatting three files. Biome's only remaining note is the pre-existing size warning on the 1.8 MiB inventory. |
| `jsdoc:inventory:check` + `jsdoc:ratchet:check` | `increased=0`, zero-legacy ok |
| `lint:retired-effect-paths` | findings=0 |
| `goals:doctor` | `blocking_new=0`, no new blocking findings |

The first coverage run failed one test, `knowledge-doctor-evaluators` ("reads the same
packets ... as the live filesystem"). The test compares the `HEAD` packet manifests with
the working tree, and this lane's uncommitted `ops/manifest.json` statusNote edit is the
only difference in its diff. That is environment-only, the same attribution as
`guidance-wave-2a.md`. The coverage rerun and `package-verify` ran with the base manifest
restored temporarily, and the edit was put back afterwards. The test passes once the
change is committed.

## Reversal

Revert the PR. The 99 rows come back with their previous status, and the 14
`research-library-views` exception reasons come back with the inventory. No source,
detector or baseline outside these 24 test files and the inventory changes.
