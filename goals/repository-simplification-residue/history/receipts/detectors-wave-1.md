# #1855 detector repairs wave 1: F-S31-EV010 record

Lane `residue-detectors`, branch `feat/residue-detectors-ev010` off `main`
`b7712d0aed`. Source evidence:
`goals/repository-simplification-confidence/history/receipts/stage-4-detectors.md`,
`history/receipts/packet-opening-verification.md` (the three F-S31-EV010 findings)
and `history/receipts/vitest-canon-wave-1.md` (the EV010 coordination note with
#1875). The detector is the EV010 `platform-resource-provenance-review` class in
`packages/tooling/tool/cli/src/commands/Lint/internal/EffectVitestDetectors.ts`.

## Fresh measurement at `b7712d0aed`

`bun run beep lint effect-vitest`: 2,005 files, 1,714 findings, `introduced=0
resolved=14`. The committed inventory holds 1,728 rows. The 14 resolved rows were
already fixed on main by other PRs: 2 EV010 `platform-filesystem-candidate`
exceptions (`@beep/test-utils` `FileSystemConformance.{bun,node}.test.ts`) and 12
EV004/EV014 rows in the `@beep/test-utils` MemoryFileSystem suites.

EV010 rows in the live scan at the base:

| Class | Open | Exception |
| --- | --- | --- |
| `platform-resource-provenance-review` | 117 | 92 |
| `platform-filesystem-candidate` | 44 | 53 |

**The three F-S31-EV010 findings are already gone.** The opening verification
reproduced them at packet opening. #1899 (`e11f0c4e5a`, 2026-10-17, "classify
proven native filesystem subjects in EV010") then repaired the detector with paired
fixtures: a services bundle counts as a proven native-filesystem integration when
every `it.layer` harness it reaches through `const` bindings and preserving Layer
combinators also reaches a `yield* FileSystem.FileSystem` binding, and either the
layer supplies a workspace subject or the callback calls a native-only operation
(`chmod`, `link`, `symlink`, ...). The packet never recorded that PR. A
per-file detector run at the base finds zero EV010 rows in `models-apply-command`,
`models-apply` and `models-catalog`. The later models suites (#1879/#1880/#1881:
`models-exchange-capability`, `models-exchange-recovery`,
`skills-publication-recovery`) have none either.

Two EV010 rows remained in the models tests, both open in the inventory:

- `models-check.test.ts:25` (`@effect/platform-node`)
- `models-locators.test.ts:16` (`@effect/platform-node`)

## Diagnosis

- **`models-check.test.ts`: detector false positive.** The file has three
  `layer(...)` harnesses. Each one provides `NodeServices.layer` to the workspace
  subject (`ModelsCatalogLive`, `ModelsCheckLive`, ... `.pipe(Layer.provide(platform))`),
  so the subject flag holds. The harness at line 102 yields `FileSystem.FileSystem`
  in its own callbacks and is proven. The harnesses at lines 495 and 506 reach the
  real filesystem only through same-file helpers: `runCheck` → `runCheckIn` →
  `stageWorkspace`, which yields `FileSystem.FileSystem` and calls
  `fs.makeTempDirectoryScoped`. The #1899 proof inspected only the callback's own
  descendants, so those two harnesses stayed unproven, and one unproven harness
  makes the whole import opaque. The resource is properly scoped
  (`makeTempDirectoryScoped` under the `it.layer` scope). The test is correct.
- **`models-locators.test.ts`: true opaque residue, not this wave.** The harness
  merges `NodeServices.layer` beside `ModelsLocatorReaderLive`, which reads in-memory
  `ModelsTargetFile` content and never receives the platform. The only filesystem
  use is the cross-module fixture reader `readFixtureText`
  (`./helpers/models-fixtures.ts`), which a syntax-only, per-file detector cannot
  follow. Platform use is real but not the subject, so the row is the ordinary
  "identify the actual services" review that #1875 wave 7 owns. It is left open.
  No exception was added and the test was not changed.

## Detector fix and paired fixtures

`harnessProvesNativeFileSystem` now collects FileSystem evidence from the harness
callback plus every same-file helper it reaches by name, each region visited once
(cycles terminate). A helper is followed only when all of these hold:

- the callee is a bare identifier that resolves lexically to a `function`
  declaration or a `const` binding;
- the binding's value is an arrow or function expression, or `Effect.fn(name)(body)`,
  `Effect.fn(body)` or `Effect.fnUntraced(body)` with no pipeline stages (a stage
  such as `Effect.provide(...)` could replace FileSystem);
- the helper body calls no `Effect.provide`, `provideContext`, `provideService` or
  `provideServiceEffect`.

The subject and native-operation requirements are unchanged. A helper's
`FileSystem` binding proves nothing without a subject unless a native-only
operation is called on that same binding.

Paired fixtures: the new case "follows same-file helpers that read FileSystem in
the harness context" in `packages/tooling/tool/cli/test/effect-vitest-detectors.test.ts`.

- False-positive fixtures, which must now pass (no EV010 row): the models-check
  shape (subject layer, `stageWorkspace` helper); the three-level
  `runCheck` → `runCheckIn` → `stageWorkspace` chain; an `Effect.fn("name")` helper;
  a `function` declaration helper; a subject-less helper calling `fs.symlink`; and a
  self-recursive helper next to a proving one.
- True-positive fixtures, which must still flag
  `platform-resource-provenance-review`: an `Effect.fnUntraced` helper with an
  `Effect.provide(FakeFs.layer)` stage; a helper whose body pipes
  `Effect.provide(FakeFs.layer)`; a `let` helper; an imported helper; a helper
  reached as `helpers.stageWorkspace()`; a helper built by an unknown wrapper
  (`withFakeFileSystem(function* ...)`); a subject-less helper that only reads a
  file; and a proving helper that the callback never calls.

With the repair reverted (`HEAD` detector, new test kept), the case fails a
false-positive assertion. With the repair applied it passes, and all 341 tests in
the detector, contract and four models suites pass on Bun and Node.

## Rows resolved

After the repair: 1,698 findings, `introduced=0 resolved=30` against the committed
inventory, which is the 14 rows already resolved at the base plus 16 resolved by this
repair. All 16 are `platform-resource-provenance-review` rows. In each, a real
filesystem is reached through a same-file helper:

| Package | File | Status before |
| --- | --- | --- |
| `@beep/repo-cli` | `models-check.test.ts` | open |
| `@beep/repo-cli` | `cache-qualification.test.ts` | open |
| `@beep/repo-cli` | `create-package-lab.test.ts` | open |
| `@beep/repo-cli` | `frozen-grant-set.test.ts` | open |
| `@beep/repo-cli` | `graft-cache-sync.test.ts` | open |
| `@beep/repo-cli` | `image-command.test.ts` | open |
| `@beep/repo-cli` | `research-timers.test.ts` | open |
| `@beep/repo-cli` | `run-scope.test.ts` | open |
| `@beep/repo-cli` | `skills-review.test.ts` | open |
| `@beep/tesseract` | `Tesseract.test.ts` | open |
| `@beep/repo-cli` | `cache-dispatch.test.ts` | exception |
| `@beep/repo-cli` | `cache-workflow.test.ts` | exception |
| `@beep/repo-cli` | `labs-list.test.ts` | exception |
| `@beep/repo-cli` | `lint-tsconfig-overlay.test.ts` | exception |
| `@beep/libpff` | `Libpff.pffexport.test.ts` | exception |
| `@beep/tika` | `Tika.tikaapp.test.ts` | exception |

The six exception reasons already said the native filesystem was the intended
subject. The detector now proves what those reviews asserted, so the rows drop out
instead of staying as exceptions.

EV010 after the repair:

| Class | Open | Exception |
| --- | --- | --- |
| `platform-resource-provenance-review` | 107 | 86 |
| `platform-filesystem-candidate` | 44 | 53 |

The inventory was regenerated with its owner command,
`bun run beep lint effect-vitest --write`: 1,728 rows before, 1,698 after, no row
added (S31). The 30 resolved rows drop out. The regeneration also re-keys 66 rows
whose source lines other merged PRs shifted (for example
`PracticeKg.projections.test.ts`, `GraphOperations.test.ts`). Their ids change
with the line, but content, status and exception reasons do not.

## #1875 coordination

The 16 resolved rows come off the EV010 backlog that #1875 wave 7 planned to
migrate after this repair. That backlog is now 290 EV010 rows (151 open, 139
exceptions). `models-locators.test.ts:16` stays in it, along with the other opaque
platform rows whose filesystem use crosses a module boundary. This wave chased no
EV010 row beyond what the classification fix resolved on its own.

## Verification

Run in the lane worktree at base `b7712d0aed` with the change applied:

- Detector, contract and four models suites (`models-apply-command`, `models-apply`,
  `models-catalog`, `models-check`): 341/341 on Bun (`bunx --bun vitest run`) and
  on Node (`bunx vitest run`). After the final refactor, the detector and
  models-check suites pass 239/239 on both runtimes.
- `bun run beep lint effect-vitest`: `introduced=0`. Before regeneration it reported
  `resolved=30`, and against the regenerated inventory `resolved=0`, with 1,698
  findings.
- `lint:schema-first`: introduced=0 on every ratchet.
- `quality effect-diagnostics --filter @beep/repo-cli`: 0 in the changed files. The 4
  `preferEffectArray` errors are inherited from `test/laws-schema-tag-idioms.test.ts`,
  which is unchanged and identical on `origin/main`.
- oxlint and Biome: 0 on the changed files. `lint:retired-effect-paths`: findings=0.
- `quality package-verify @beep/repo-cli`: docgen ok. The audit failed exactly one
  test, `knowledge-doctor-evaluators` "reads the same packets ...". That test
  compares the `HEAD` tree with the live packet manifests, so it fails while this
  lane's `ops/manifest.json` edit is uncommitted. With the `HEAD` manifest
  restored it passes. The failure is environment-only and clears on commit.
  The other 7,118 tests pass.
- `quality fallow audit --check --base origin/main`: exit 0, after extracting
  `appendCalledHelpers` to clear one introduced cognitive-complexity finding.
- JSDoc ratchet (`jsdoc:inventory:check` then `jsdoc:ratchet:check`):
  `increased=0`.
- `lint schema-catalog`: current. `quality catalog-usage`: findings=0.
- `goals doctor`: blocking_new=0, blocking_inherited=0.

Route: S39/S41 Claude chain, `claude-opus-5-5` Agent child (step 1), no fallback.

## Reversal

Revert the PR. That restores the callback-only proof, removes the fixture case, and
returns the inventory to its previous rows: the 16 rows come back with their original
status and exception reasons. No baseline, exception or schema change is involved.
