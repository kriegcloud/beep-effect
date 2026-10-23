# #1875 Effect Vitest canon wave 2: record

Lane `residue-vitest-canon`, branch `feat/residue-vitest-canon-wave2` off `main`
`ff6f2c3767`. Scope: the timing and live-mode families named by wave 1, EV014
(resource layer without a hook timeout), EV009 (unjustified live test) and EV015
(shared test-clock adjustment). The detector lane #1855 owns detector policy; this
wave changes no detector and adds no exception.

## Fresh measurement at `ff6f2c3767`

`bun run beep lint effect-vitest`: 2,361 files, 1,358 findings, `introduced=0
resolved=1`. The inventory held 1,359 rows (596 open, 763 exceptions). The one
already-resolved row is an EV014 exception in
`packages/tooling/tool/cli/test/worktree-command.test.ts` that main fixed before this
wave (inherited).

| Rule | Open before | Exceptions before | Open after | Exceptions after |
| --- | --- | --- | --- | --- |
| EV009 unjustified-live-test | 20 (5 files) | 28 | 0 | 28 |
| EV014 resource-layer-without-hook-timeout | 12 (11 files) | 240 | 0 | 233 |
| EV015 shared-test-clock-adjustment | 26 (9 files) | 40 | 26 | 40 |

The scan after this wave: 1,320 findings, `introduced=0`; the inventory was
regenerated with `lint effect-vitest --write` and shrinks from 1,359 to 1,320 rows
(564 open, 756 exceptions). Of the 39 retired rows, 38 are this wave's: 20 EV009 open,
12 EV014 open and 6 EV014 exceptions. The 39th is the inherited worktree-command row.
No row was added. The rewrite also refreshes line numbers and occurrence hashes for rows
whose files moved on main since the last write; those rows keep their status and reason.

## Per-file migrations

| Package | File | Rows | Change |
| --- | --- | --- | --- |
| `@beep/repo-cli` | `test/proof-shadow.test.ts` | 13 EV009 | `it.live` to `it.effect`. The bodies only run the shadow recorder and ledger against a temp checkout. The ledger stamps `DateTime.now` and compares expiry against the same clock, so the fixed TestClock keeps every decision; no body sleeps or times out. |
| `@beep/repo-cli` | `test/proof-digest.test.ts` | 3 EV009 | `it.live` to `it.effect`. Golden-digest checks over Crypto and fixture files; no clock or console dependency. |
| `@beep/repo-cli` | `test/proof-job.test.ts` | 2 EV009 | Both cases move to `it.effect` (final form after review round 1). Wait timeout: the wait is forked with `startImmediately`, which arms its 15 ms deadline on the test's own TestClock. A delegating `Clock` counts the loop's 1 ms poll sleeps and signals a `Deferred` on the first one. The loop requests that sleep only after a full read of the still-running record. The clock advances past the deadline only after that signal, and the test asserts at least one completed poll. Record lock: a delegating `Clock`, provided when the launcher is made, counts the contender's 25 ms retry pauses and returns at once. The test asserts the busy verdict, exactly 199 pauses (the full 200-attempt backoff) and an unchanged record (`cancelRequestedAt` none). |
| `@beep/repo-cli` | `test/yeet-inbox-porcelain.test.ts` | 1 EV009 | `it.live` to `it.effect` with `TestClock.setTime` pinned to the file's `AT` instant (2026-08-17). The expired-waiver case (`2000-01-01`) needs a "now" after that stamp, which the live clock supplied; the pinned TestClock supplies it deterministically. |
| `@beep/professional-desktop` | `test/intake-atoms.test.ts` | 1 EV009 | Stays `it.live`, because AtomRegistry arms its idle sweep with a native `setTimeout` against `Date.now`, which TestClock cannot advance. The idle witness is armed after the file-input release. The test asserts the witness is present, awaits the registry's own `onNodeRemoved` signal for it under a 3 s live watchdog, then asserts it was evicted no earlier than the 10 ms TTL and is gone from `getNodes()`. Only then does it check that the file input survives. |
| `@beep/repo-cli` | `test/ci-heavy-admission.test.ts` (2), `doctest.test.ts`, `fixtures/bun-spawn-env/spawn-env.test.ts`, `graft-cache-sync.test.ts`, `native-runtime.test.ts`, `schema-catalog.test.ts`, `session-orchestrator.test.ts` | 9 EV014 | Explicit `{ timeout: "30 seconds" }` hook budget, the policy's canonical value. |
| `@beep/repo-cli` | `test/skills-provenance.test.ts` | 1 EV014 | `{ timeout: "60 seconds" }`, the value the file's other layer blocks already use. |
| `@beep/agents-use-cases` | `test/AssistantTurn.test.ts` | 1 EV014 | `{ timeout: "30 seconds" }`. |
| `@beep/nlp-mcp` | `test/Streaming.functions.test.ts` | 1 EV014 | `{ timeout: "30 seconds" }`. |
| `@beep/workspace-server` | `test/ThreadStore.test.ts` | 1 EV014 open, 6 EV014 exceptions | All eight fresh Cuid layer blocks take `{ timeout: "10 seconds" }`, the value the file's one timed block already used. The six exceptions argued only that the in-memory layer needs no budget; an explicit budget is the canon form, so they retire instead of staying excepted. |

No assertion was removed or weakened, no test was skipped, and no test deadline changed.

## Exceptions re-checked

- **EV009 (28):** native browser, DOM/WebGL, React/jsdom scheduling, AtomRegistry idle
  eviction, real websocket and filesystem-lock subjects. Each needs real time and records
  why; none reads the Effect clock in a way the detector would now accept without new
  evidence. Kept.
- **EV014 (233 after this wave):** the reasons fall into two classes. Most argue that a
  named fixture or `Layer.succeed`-backed layer acquires nothing, which a per-file
  detector cannot see across modules; #1855 wave 4 owns that named-test-layer frontier.
  The rest keep reviewed default budgets for real acquisitions. Only the ThreadStore
  rows above changed, because that file was already being edited and its own idiom
  supplies the value. The others stay for #1855 wave 4, so this wave does not pre-empt
  its counterexample set.
- **EV015 (40):** each records proven ownership (single-test block, nested
  `TestClock.layer`, `concurrent: false` with joined fibers). None can move without the
  trade described below. Kept.

## EV015: not migrated; handed to #1855

The detector flags every `TestClock.adjust` lexically inside an `it.layer` callback.
Under that rule, a row clears only if the test leaves the layer block for a plain
`it.effect`, which gets its own fresh TestClock. But the test still needs the layer, so
it must call `Effect.provide(layer)` or `provideScopedLayer(layer)` in the test body.
EV002 flags that (major, `per-test-layer-provide` or `unresolved-layer-provide`) unless
the layer is a pure `Layer.succeed`/`Layer.mock`/`Layer.empty` stub. Every open EV015
row sits under a resource or platform layer (FileSystem, process spawner, scripted
GitHub budget, Junie HTTP stub over platform services). So the move would add a major
EV002 row for each info EV015 row, which S31 forbids, and the brief forbids exceptions.
All 26 rows stay open.

Counterexamples for #1855 (each verified against `@effect/vitest` 4.0.5 `makeLayer`,
which builds `Layer.provideMerge(layer, TestEnv)` in a fresh memo map for every
top-level `it.layer` call, so a top-level block's TestClock is its own):

1. **Top-level single-test blocks (false positive, 9 rows).** The block holds exactly one
   test, so no other test shares its TestClock:
   - `apps/practice-mail-tagging/test/PracticeMailTagging.command.test.ts`: two
     `it.layer(World, { timeout: "30 seconds" })` blocks (lines 193 and 233, four
     rows). The same file's other rows, including the sibling block at line 214, are
     already excepted for this reason.
   - `packages/drivers/pdf-tools/test/PdfTools.service.test.ts:1368`
     (`HangingLayer`).
   - `packages/tooling/tool/cli/test/accounts-usage.test.ts:1399` and `:1679` (Junie
     layers).
   - `packages/tooling/tool/cli/test/yeet-gh-rest-first.test.ts:304`
     (`resettingBudget`).

   Proposed repair: skip EV015 when the enclosing layer block is not nested in another
   layer block and registers exactly one test, with paired fixtures (one test: no
   finding; two tests: finding; nested single-test block: finding).
2. **Multi-test blocks (true judgment, 17 rows).** The clock really is shared across
   sequential tests:
   - `corpus-command.test.ts:4358` (20 tests, `concurrent: false`);
   - `yeet-monitor-ready.test.ts:1133` (3);
   - `yeet-pr-provenance.test.ts:29` (8);
   - `yeet-review-window.test.ts:178` (6) and `:473` (3);
   - `yeet-settle.test.ts:682` (3) and `:1240` (2).

   Their canonical fix is to split each clock-owning test into its own top-level block
   over the same layer. That becomes resolvable only once repair 1 lands; splitting now
   would churn the files and leave the rows open. Wave 3 or a later wave takes them
   after #1855 rules on repair 1.
3. **Rule conflict.** EV002 sends a resource layer used by a single test into `it.layer`,
   while EV015 flags clock control inside `it.layer`. Without repair 1, no form of a
   single clock-owning test over a resource layer is clean under both rules.

## Verification

Route: S39/S41 Claude chain, `claude-opus-5-5` child (Claude Code Agent tool), no
cross-provider lane. All heavy commands ran one at a time through `beep-heavy` with
stdin from `/dev/null`. Dependency dists were built first
(`bunx turbo run build --filter="<pkg>^..."` for the five packages), since a fresh lane
reports TS6305 without them.

| Check | Result |
| --- | --- |
| `bun run beep lint effect-vitest` | base `introduced=0 resolved=1`; after `--write`, `introduced=0 resolved=0`; 1,359 to 1,320 rows |
| `check` (includes the test overlay) `@beep/repo-cli`, `@beep/professional-desktop`, `@beep/agents-use-cases`, `@beep/nlp-mcp`, `@beep/workspace-server` | exit 0, 0 errors each; repo-cli `tsc-rs -p test/tsconfig.json` exit 0 |
| repo-cli changed suites (12 files incl. `bun-spawn-env-parity`), Node / Bun | 277 / 277 passed |
| `ThreadStore`, `AssistantTurn`, `Streaming.functions`, `intake-atoms`, Node / Bun | 12, 7, 2, 8 passed on both |
| proof-job timeout probes | 14 ms adjust: hangs to the 5 s deadline. Adjust before the first-poll signal: fails `expected 0 to be greater than or equal to 1` on Node and Bun |
| coverage ratchet `@beep/workspace-server`, `@beep/agents-use-cases`, `@beep/nlp-mcp` | `ok: compared 3 package(s) with epsilon 0.001` |
| coverage ratchet `@beep/professional-desktop` | `ok: compared 1 package(s)` |
| coverage ratchet `@beep/repo-cli` | `ok: compared 1 package(s)`, 358 files / 7,535 passed. A first run had two reds outside this wave: `knowledge-doctor-evaluators` compares the `HEAD` tree with the working tree, so it fails on the uncommitted packet manifest (it passes 14/14 with that file at `HEAD`), and `cache-pilot-orchestration` hit `EADDRINUSE 127.0.0.1:47511` (environment; passes 25/25 alone). The rerun held the manifest at `HEAD` and restored it afterwards. |
| `package-verify` `@beep/repo-cli`, `@beep/professional-desktop`, `@beep/agents-use-cases`, `@beep/nlp-mcp`, `@beep/workspace-server` | all ok (audit and docgen); repo-cli ran with the manifest held at `HEAD` for the same reason |
| `lint:schema-first` | introduced=0 |
| `quality fallow audit --check --base ff6f2c3767` | `status ok`, 0 findings |
| Biome / oxlint on changed files | clean (Biome formatted two files) |
| `jsdoc:inventory:check` + `jsdoc:ratchet:check` | `increased=0`, zero-legacy ok |
| `lint:retired-effect-paths` | findings=0 |
| `goals:doctor` | no new blocking findings |

Environment note: the dependency build emits `dist/**/test/*.d.ts` declaration files
for four test kits, which the effect-vitest scope counts (files 2,361 to 2,365). They
produce no finding and are ignored build output.

## Review round 1 (#2153)

Two P2 threads on test validity, fixed in the lane at `85985aaf38`:

- **PRRT_kwDOPbO_N86vuxeZ** (`proof-job.test.ts`, wait timeout): `TestClock.adjust` could
  fire the 15 ms deadline before the first record read, which is real filesystem I/O, had
  finished. The test seam is the `Clock` reference. `Effect.sleep` resolves it through
  `clockWith`, so a delegating clock provided to the forked wait sees the poll loop's 1 ms
  sleep, which the loop requests only after a complete read. The test awaits that signal
  before advancing and asserts at least one completed poll. Probe: advancing before the
  signal fails with `expected 0 to be greater than or equal to 1` on Node and Bun. Restored
  afterwards. No production change.
- **PRRT_kwDOPbO_N86vuxet** (`intake-atoms.test.ts`): the `elapsed > 10` check after a fixed
  50 ms sleep could not fail. The fixed sleep and that check are gone. The test awaits the
  registry's `onNodeRemoved` callback for the idle witness and asserts presence before and
  eviction no earlier than the TTL. It stays live because the sweep is a native timer.
  A first draft polled `getNodes()` in a sleep loop, which the scan flagged as EV013
  `retry-loop-candidate`; the removal hook replaces that draft.
- **Same scrutiny for the record-lock test:** its `>= 4,000 ms` bound was dropped. The
  launcher captures its context, `Clock` included, at `make`, so the counting clock is
  provided there. The test now runs under `it.effect` with no real wait (it used to take about 5 s),
  and asserts the exact pause count plus the unchanged record.

Rerun, each command alone through `beep-heavy`:

| Check | Result |
| --- | --- |
| `check` with test overlay, `@beep/repo-cli` and `@beep/professional-desktop` | exit 0, 0 errors; repo-cli deps rebuilt first after the main merge (TS6305) |
| `proof-job.test.ts`, Node / Bun | 106 / 106 passed |
| `intake-atoms.test.ts`, Node / Bun | 8 / 8 passed, three runs on each |
| `lint effect-vitest` against the committed inventory | `introduced=0 resolved=0`; the inventory needs no rewrite |
| Biome / oxlint on both files | clean |

## Reversal

Revert the PR. The 38 rows come back with their previous status, and the six ThreadStore
exception reasons come back with the inventory. No source, detector or baseline outside
these test files and the inventory changes.
