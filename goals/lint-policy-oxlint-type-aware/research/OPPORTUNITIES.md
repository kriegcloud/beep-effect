# Friction receipts

## 2026-10-14 — Bun cwd install resolution

`bun add --cwd .cache/p2b-tools --exact oxlint@1.88.0 oxlint-tsgolint@7.0.2004`
resolved the ancestor workspace because the disposable directory had no package.json.
It changed root package.json and bun.lock and ran existing lifecycle hooks.
Both tracked files were restored from HEAD (starting tree had no tracked edits).
Prevention: create an independent manifest first, or use an explicitly reviewed root install.
No secrets or resolved env values are recorded.

## 2026-10-14 — Dedicated-profile location and native config rejection

A profile placed under `.cache/p2b-tools/` resolves its scope/ignore globs there,
so its zero corpus findings were not engagement evidence. The root profile
reports the required ten findings. The misplaced full scan is discarded for
parity and timing; it exposed hundreds of `typescript(tsconfig-error)` diagnostics
for pre-existing test projects inheriting a source-only rootDir.
Prevention: restore the dedicated profile at its recorded repo-root location
and prove engagement before interpreting a full run.

## 2026-10-14 — XML decoder migration boundary

The new Oxlint-only Library.evidence.ts:305 finding suggests entityDecoder.
The installed fast-xml-parser declaration accepts an options object, but a
minimal parse throws `this.entityDecoder.reset is not a function` because the
runtime expects a decoder instance. Prevention: aligned vendor declarations
and a behavior smoke before replacing deprecated options. No unsafe source
replacement was retained; orchestrator can route a vendor report/fix separately.

## 2026-10-14 — Clean-scan precondition beyond assignment

The admitted built full scan reports 305 native rootDir errors from two
pre-existing CLI test projects. The production compiler build passes, so a
build receipt alone would conceal this scanner-specific gate failure.
Prevention: include config diagnostics in candidate acceptance before timing;
correct the test project boundaries and run their owning regression checks.

## Resume: fixture and invocation boundary

`tsc-rs -p` on the doctest fixture exposed inherited `missingPipeableSignature` and
shared-config rootDir/composite inclusion errors. RootDir must include imported
vitest.shared.ts; retain strict checks and repair the fixture overload rather than
disable a diagnostic. Initial Vitest command from repo root found no tests; run
from the owning package because its include is `test/**/*.test.{ts,tsx}`.
Bun add in an uninitialized cache subdirectory modified the root manifest; restored
original manifest/lock bytes immediately while retaining installed candidate for gates.
Prevent with a standalone initialized tool manifest before `bun add --cwd`.

## Retired-path command routing

`beep lint retired-effect-paths` is not a registered lint subcommand in this checkout
and dispatches the root lint aggregate. The generated root script is
`beep laws retired-effect-paths --check`; run that exact law command.
Prevent with fail-closed unknown-subcommand dispatch or a documented alias.
The aggregate invocation is not evidence for the focused law gate.

## Host OOM interruption (2026-10-14 10:13Z)

Pending baseline foundation/ui-system, bounded cold scan and accidental aggregate
processes lost their owning tool sessions. Logs exist but lack exit receipts; rerun
those required proofs and continue remaining baseline shards serially. The user
manager bus is unavailable after the interruption; attempt admission first and
use the envelope direct fallback only when that route cannot start.

## Full-scope baseline reconciliation

The inherited shard list omits packages/documents and packages/ontology: comparing
assigned files to the ESLint output exposed 236 uncovered TypeScript subjects.
Add both bounded shards and require exact coverage before the final GO record.
The 36-shard provisional empty diff is not full-repo parity. Native full scan
covered those trees already. Prevent with assignment-vs-baseline file-set reconciliation
in the gate runner instead of trusting the historical shard inventory.

## Full proof attribution

The first full policy run found own schema inventory line drift, an invalid
bootstrapped completed phase literal, and an in-flight native smoke string parse
error. Repair and rerun. The JSDoc total regression is inherited: two unsafe
examples in technical-drawing Shading.rules.ts/Validation.rules.ts from #1671,
plus module-description paragraphs in RetiredEffectPaths.ts/RetiredEffectPaths.model.ts
from #1700 (one older libpff paragraph disappeared). None of these files is in this
lane diff; do not copy their main fix into lane A.

## Schema inventory line-identity churn

`beep lint schema-first --write` refreshed the codec advisory line from 280 to 295
but lost its existing exception status and detailed provenance-test reason. Restore
that exact status/reason after generation; only line/date should differ. Prevent
with stable exception identity across line-only edits.

## Full-policy admitted OOM

The second full-policy attempt ended after the medium phase announcement without
a CLI aggregate result. The owning user-unit journal records kernel OOM kill and
SIGKILL at 11:05Z. This is environment/resource failure, not a measured deprecation
parity/timing gate failure. Rerun the same full command with the supported
BEEP_QUALITY_CHECK_CONCURRENCY=2 override after the CLI proof releases its memory.
Do not change shared heavy slots or stop unrelated lanes.

## Mixed-source audit replay

The second complete CLI audit passed 6156 tests and failed only the XML-version
regression. Its module graph was loaded while the decoder lifetime edit was in
flight; the focused 16-case suite passes after that edit. Freeze runtime inputs
(frozen-runtime-inputs.json), rerun the complete audit, then replay full policy
with concurrency 2. Do not infer a full-suite pass from the focused result.

## Cheap preflight before the full CLI audit

The frozen audit passed all 6157 TS tests and 53 Python tests (3 skipped), then
failed on two noInferrableTypes annotations added during the earlier malformed
fixture repair. Those booleans infer correctly once the shell fixture string is
valid. Remove only the erased annotations, run package quick lint/check first,
then replay the complete audit. Prevent with a final cheap preflight after every
source edit and before the 16-minute full test suite.

## Native empty-target compatibility

A direct empty-target probe exits 1 under Oxlint. The old ESLint worker allowed
empty lab directories only. Oxlint 1.88 supports the same
--no-error-on-unmatched-pattern flag; reuse LabsWorkspaceDir to retain that
behavior for lab scopes only. The full/hosted scan still gets no tolerance flag.

## Closeout session ledger

`bun run beep session note --state done ...` returned exit 1 with only the generic
beep script failure. No outside-worktree write workaround attempted. Packet and
report-A retain the complete handoff; a diagnostic on ledger failure would avoid
uncertainty about whether an external session note was persisted.

## 2026-10-14 — Review-wave test invocation and process mock boundary

Running Vitest from the repo root with the package config found no tests because
its include is package-relative (`test/**/*.test.{ts,tsx}`); rerun from the CLI
package. Extending the worker's process mock initially also intercepted the test
harness's own subprocesses. Restrict the capture mock to the native worker
executable so the executed fixture proofs keep running real processes.
Prevention: document the package cwd alongside the command and keep mocks narrow.

## 2026-10-14 — Assignment parser and coverage drift

CLI quick check caught `Array.filterMap` receiving Option, where Effect v4
requires Result. The unmatched-file regression failed before this parser repair;
use `Array.map` and `Array.getSomes` validated against installed declarations.
The full debug scan additionally exposed four unassigned managed-peer TS fixtures
in ai-provider-cli. A nearest strict fixture project preserves their existing test
compiler settings. Prevention: enforce assignment on every worker invocation,
including labs, rather than relying on a one-off coverage receipt.

## 2026-10-14 — Optional test project and session ledger write

The extra `tsc-rs -p packages/tooling/tool/cli/tsconfig.test.json --noEmit`
probe failed because this CLI package has no tsconfig.test.json (TS5058).
Its required package quick check and runtime regression suite pass; do not create
an unsolicited compiler project to satisfy an invalid probe. Session closeout
`beep session note --state open ... --pr 1753` exited 1 without a diagnostic in
this restricted lane. Preserve the private A4 handoff and let the orchestrator
write the shared workstation ledger. Prevention: advertise supported package
check projects and surface a typed ledger-write failure with its destination.
