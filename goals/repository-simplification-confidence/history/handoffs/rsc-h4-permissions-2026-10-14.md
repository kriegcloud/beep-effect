# H4 permission continuity handoff — 2026-10-14

```text
lane: rsc-h4-permissions
head: 7f55eeca0d2773ac0fd9491b5f8a53e1cfd8d383 (qualified integration snapshot; publication SHA follows in dispatch receipt)   pr: #1770
package-verify: @beep/repo-cli pass — default audit 1190.6s and package docgen 46.4s
hosted-parity: test-tsgo=fail (sole inherited AgentMessage TS377032); docgen local=pass; jsdoc-ratchet=fail (inherited 1345>1343); knowledge refs=pass; fallow audit+health=pass; coverage read=pass (incumbent row 100% all metrics, zero uncovered)
routes: ChatGPT Desktop x fresh/dormant-idle/dormant-relaunch/background/subagent-followup -> unknown, build 26.1007.71326-1, fixture none; Claude Desktop x same routes in bypass/auto -> unknown, build 2.37337.1-1, fixture none
config: no H4 writes or backups; legacy sandbox_mode still coexists with default_permissions at 21:55Z; F writer and drift check pending; project default mode and settings-edit deny preserved
handoff: goals/repository-simplification-confidence/history/handoffs/rsc-h4-permissions-2026-10-14.md
open: publication and review replies; attributed main test-tsgo/JSDoc and live Security ruleset drift; operator Desktop fixtures; F owned-field config repair; overall Permission continuity remains open
```

## Delivered scope

The existing Session family now offers `session continuity --input` with
schema-first PermissionTuple, ContinuityRoute and ContinuityVerdict models,
an explicit read-only Context service and command. All paths are selected by
manifest, resolved relative to it, and read without launching/resuming a
session. Codex history is keyed by first metadata thread ID, family-tagged,
ordered across supplied segments, and compared against the chosen tuple.
Settings/segment boundaries and missing evidence are conservative. Claude
compares the app with the last mode-bearing CLI user row, bound to that row's
session identity. Config coexistence uses the existing Models locator reader.
Output excludes transcript text and config values. It is metadata evidence,
not proof that Desktop exercised a particular route.

The new runbook documents both apps, all route variants, effective readers,
probe commands, stop-on-mismatch behaviour, candidate safe routes, backup
ownership and fixture cleanup. Agent-pools links it. PLAN, README, SPEC
Decision Log, acceptance and friction records carry the same partial state.
No unrelated refactoring, generated inventory, manifest, lock, home config,
Claude harness or AGENTS file changed. No new changeset follows D's landed
private release-note policy.

## Decisions and reversals

R98: Session owns the census, Models owns its existing locator and F owns the
writer. R97: retain project Claude `defaultMode=default` and the settings-edit
deny. No fixture evidence justifies a project-wide change. R99/R101: report
legacy Codex key coexistence to F; no one-off repair. Reversal is `git revert`
of the H4 PR. No workstation rollback is needed because none was changed.

## Evidence and qualification

- Step 0 `git fetch origin && git merge origin/main` fast-forwarded the lane
  from `e62411d63f` to `529d77338d`; `bun install` completed successfully.
- `bun run beep session open` read the live roster without taking over peers.
- `bun run beep architecture --help` and `architecture plan --help` checked
  the existing command-family topology workflow before creating role files.
- Live package versions: `pacman -Q chatgpt-bin claude-desktop` returns the
  versions in the report. No app was restarted or messaged.
- Sanitized top-level config inspection confirms both Codex permission keys
  are present. Model/effort match the required defaults. Project mode is
  `default`; the settings-edit deny remains present.
- `bun run beep session continuity --input .beep/h4-smoke/input.json` returns
  the expected verified **metadata-only** tuple for a synthetic thread.
- The same command against the selected live home/project configs reports
  home permission-key coexistence as unsatisfied and project policy as unknown;
  no configuration value or transcript text is emitted.
- Focused synthetic tests pass 13/13 in 5.07s via
  `beep-heavy bunx --bun vitest run test/session-continuity.test.ts` from the
  CLI package. The tests include a schema-derived tuple JSON property and
  both independent-review regressions.
- Focused synthetic tests and the package audit run through `beep-heavy`.
  Initial test-tsgo found introduced API/callback errors; repaired before
  requalification. Its next run found test-helper layer/decoder diagnostics;
  the helper now uses the Vitest layer entry point and typed decodeResult.
  The repaired typecheck exits 0 across 354 files. The first Node test attempt exited 143 before cases;
  the package's Bun test route passes the rerun. Logs remain under
  the lane's ignored `.beep/h4-*` paths.
- Separate pinned `gpt-6.1-sol` medium source review identified two P2 false
  verified cases: equal-timestamp settings ordering and mode-row/session
  identity. Both are repaired with regression fixtures. Review corrected the
  equal-timestamp test to distinguish the previous implementation. Final
  read-only review after the helper/equivalence cleanup has zero outstanding
  actionable findings; runtime and hosted proof remain separate.

## External dependencies, delivered to the orchestrator

R96/S8 reserve Desktop GUI actions and app restarts to the orchestrator's
batched operator window. This worker has no Desktop session creation or
continuation connector and the user's checkout-only write boundary excludes
creating the external fixture root. Prepare the root and use the runbook
matrix. No route, safe alternative, CLI version, fixture ID or probe result is
invented. Permission continuity acceptance stays open. The historic ChatGPT
app-level send path remains unsupported for live unrestricted work; the
current build is not claimed to reproduce it.

F must remove only top-level legacy `sandbox_mode`, preserve
`default_permissions`, retain the `$HOME/.config-backups/` backup name and
run the return-of-key drift check before its final fingerprint panel.
No project Claude permission change needs to be included in that fingerprint.

The resume inputs named several earlier reds; the later wave-2 correction
states they were repaired on main. No current diagnostic is attributed from
its category alone. The current shared findings below have explicit logs,
source comparisons and reproductions.

## Historical qualification before the S25 integration

Executable source was qualified at `64079959cfe9c0210a38004a468642ba020978be`,
with current main `061d5a40e425b7c03702a8ca03c4459e31166815` integrated.
The last fetch before publication found no newer main commit. Later receipt
updates change only packet prose; they do not change the qualified source.

| Gate | Result |
| --- | --- |
| Default package verification before main integration | Audit 1,257.0s and docgen 42.2s pass. This is historical worktree proof, not a full audit of the integrated source commit. |
| Integrated upstream closure | Canonical `turbo run build --filter=@beep/repo-cli^...`: 44 tasks pass, 43 cached. |
| Integrated `package-verify @beep/repo-cli --quick` | Lint 5.2s and check 5.3s pass after restoring the new main declaration outputs. |
| `quality test-tsgo` | Exit 0, 363 files; the initial introduced diagnostics are repaired. |
| `docgen local --base origin/main` | Exit 0; CLI and scratchpad examples compile; only canonical CLI output is aggregated. |
| Doctest owner/verification | Nine pure examples marked by the owner command; verification exits 0. |
| `ci lane jsdoc-ratchet` | Exit 0, 21 tracked totals, zero increased, zero non-generated legacy findings. No baseline rewrite. |
| `CI=true knowledge refs --check` | Exit 0; zero live gated observations. |
| Fallow audit and health, `--check --base origin/main` | Both exit 0 with zero findings after removing redundant Claude incompleteness checks. No suppressions or baseline changes. |
| `laws retired-effect-paths` | Exit 0. |
| Scoped Node/V8 coverage | Three files and 39 tests pass in 22.61s, including 14 census cases and the actual wired CLI command. |
| Existing Session.command baseline row | Lines/statements/branches/functions all 100%, all uncovered counts zero. Meets every floor and ceiling; baseline unchanged. |

The quick check initially failed with TS6305 because new main dependency
outputs were absent. The failure was acknowledged as environment-only with
that diagnosis, the canonical closure restored the outputs, and the rerun
passed. There is no unacknowledged P0. The initial Fallow complexity finding
was introduced and repaired, not relabelled inherited. Source review of that
cleanup returned zero outstanding actionable findings.

The 39-test coverage totals across the selected production files are 95.89%
statements, 98.76% branches, 91.3% functions and 95.78% lines. New command
coverage is 85.71% statements/lines, 100% branches and 66.66% functions. The
service is 94.26% statements, 98.41% branches, 89.13% functions and 93.93%
lines. Only the incumbent Session.command row has a published touched-file
baseline; no new floor is silently minted.

No hosted review thread exists before publication. Reply/thread IDs will be
recorded if publication produces actionable review. The orchestrator owns
merge-gate and retirement; the lane never merges itself.

## Publication preflight correction

The first Yeet publication attempt pushed nothing: the Effect Vitest ratchet
reported 15 introduced instances in the new test file. Commit
`1105fd8556af2e71bbb83dd361e8d121a6711dd9` removes 13 redundant whole-body
scopes, replaces incidental Node services with the existing in-memory
filesystem and Path layer, and gives shared-layer acquisition an explicit
30-second timeout. The reference harness already scopes each Effect test;
fixture cleanup and all assertions remain intact. Independent pinned review
of this cleanup has zero actionable findings. The P0 publication row is
acknowledged with this fix commit. No detector inventory or exception changed.

A full package verification and the full pre-final parity sequence are running
again through admission against this cleanup. Results above remain the
previous qualification until the new sequence returns. Per the MAIN MERGE
FREEZE ruling, a `final` marker must also wait for #1758 to merge, a main
integration and another parity pass. Desktop fixture and F-writer dependencies
remain open independently.

## First published head and shared CI blocker

PR #1770 is ready for review at
`269e79969838c343efc16fd1f88c4b78ce1a50d1`, with `ready-for-heavy` applied.
The successful retry's Effect Vitest ratchet has zero introduced findings.
Readiness monitor: `4d4e66fc-ea4f-4506-859d-4867c432f9db`. Hosted Security
job 116095380764 passed vulnerability/dependency checks and failed only on
live ruleset/declaration drift. Local `ci ruleset --check` reproduces an extra
live `beep-reviewer`; the lane has no CI/ruleset/workflow diff from main.
The Security row is acknowledged as environment-only, but remains a failing
merge gate. Shared reconciliation belongs to the orchestrator/main owner.
The two failing Vercel deployments explicitly report rate limiting; those
rows are acknowledged under the existing canonical exception.

## Explicit CLI environment correction

The repeated default package gate passed audit in 1,045.0s and docgen in
30.8s. The separate test-tsgo then found an introduced static service-context
diagnostic in the wired CLI test; it was not classified as inherited. Commit
`00209410a8` supplies the CLI environment explicitly: the existing memory
filesystem, Path, narrow Node Crypto, test stdio, deterministic terminal
dimensions with fail-on-input, and a spawner that fails on any invocation.
The test continues to exercise the actual Session command registration.
Dedicated test-tsgo now exits 0 across 363 files; quick package lint/check
pass in 5.6s/6.2s, and the Effect Vitest ratchet again has zero introduced
findings. Independent pinned review of this correction has zero actionable
findings. The PR was returned to draft while this wave is qualified and
prepared for publication. Production census source remains unchanged.

## Corrected-wave qualification checkpoint

Qualified source/test commit:
`00209410a861eb39b7050e7902524731593a44ce`. Production code is unchanged
from the previously reviewed census commit. The following results supersede
the earlier partial checkpoint:

- Default integrated package audit/docgen pass (1,045.0s / 30.8s).
- Explicit CLI environment quick package lint/check pass (5.6s / 6.2s).
- Dedicated test-tsgo rerun passes all 363 files. The first sequence's
  `test-tsgo=1` is retained in its raw receipt and superseded by the exit-0
  environment-correction rerun.
- Effect Vitest canon ratchet passes with zero introduced findings.
- Doctest verification, bounded docgen, JSDoc ratchet (21 tracked totals,
  zero increased, zero non-generated legacy findings), CI knowledge refs,
  retired paths, Fallow audit and health all pass; Fallow has zero findings.
- Scoped V8 run passes all 39 tests in 15.00s. Existing Session command
  coverage remains 100% across all four metrics, with zero uncovered counts;
  no baseline changed.
- Independent source review has zero outstanding actionable findings.

This is a blocked checkpoint, not an orchestrator `final` marker. At this
checkpoint #1758 remains open. After it merges, integrate main, rerun the
required parity list, publish the integration wave and then issue the marker.
The shared Security drift, operator fixture batch and F writer/drift check
remain separate dependencies. The source/report head above identifies the
qualified code; later packet-only commits carry the qualification receipt.

## Current post-S25 and review checkpoint — 21:20 UTC

This checkpoint supersedes the earlier pre-S25 blocked state. #1758 merged
as `dd737364a158bb5bbc6ebe64746beb81a330c230`; main
`d6040249f034a05b2aee014c60230c68a1ad780f` integrated cleanly in
`94b212e65d4050a485e15c2f79ce71983439d306`. Source now stands at
`a0c0177c9830fed0e45db6f036b184341b66e617`; PR #1770 still publishes
`9a1b342f053a2171904c24b754b99c0528ae34c9` until the combined wave pushes.

The six new data models follow branded `S.Opaque`. Reused Models targets
and bindings use their existing constructors. Hosted review discussions
4276306627 / `PRRT_kwDOPbO_N86shXFa` and
4276306638 / `PRRT_kwDOPbO_N86shXFh` are fixed in the source: retain known
policies without identity/time, and require actual timestamp or same-file
position evidence for settings boundaries. Independent review additionally
caught changed tuple rendering order; it is restored. Three new regression
cases cover both findings plus absent/malformed timestamps. The Option
collection uses current Effect v4 helpers. Final pinned source review has
zero outstanding actionable findings bound to `a0c0177c98`.

The latest scoped V8 run passes 42 tests in 37.45s. The census service has
100% branch coverage; the incumbent Session command has 100% in every
metric with zero uncovered counts. The new source's typecheck passes 364
files. A final default package audit and complete parity sequence are running;
bounded docgen will run after the audit to avoid overlapping docgen writers.
No source change is planned unless a real check or review fails.

Shared attribution: the post-S25 JSDoc inventory reproduces two extra root
imports in `TierGate.ts:TierGateVerdict` and
`UsptoDocumentTiers.ts:MintFetchableHandle`. Both files match main; H4 has
zero root-import findings. Old published-head Property Laws and Unit shard
fail the unchanged Skills codec property at `skills-provenance.test.ts:388`;
the final sequence includes a current-main bounded recheck. Hosted Security
on both earlier published heads fails only live ruleset/declaration drift.
These rows are acknowledged with source-bound reasons, without a lane-local
fix or baseline rewrite. Review replies are drafted and will post/resolve
through Yeet after the source wave pushes.

## Stable-source parity results — a0c0177c98

The final source-only review and the completed parity sequence bind to
`a0c0177c9830fed0e45db6f036b184341b66e617`. Effect Vitest, all nine doctests,
364-file test-tsgo, CI knowledge refs (zero live gated observations), both
Fallow checks (zero findings), retired paths, scoped coverage and the coverage
read all exit 0. The scoped run passes 42 cases in 15.68s; service branches
are 100%, and the incumbent Session command is 100% in all four metrics with
zero uncovered counts. No baseline changed.

JSDoc ratchet exits 1 on the two unchanged main examples already attributed
above (`1345 > 1343`). The bounded current-main Skills property recheck also
exits 1 at `skills-provenance.test.ts:388`, reproducing the hosted case after
eight generated examples. Skills source and test still have no H4 diff from
main. This rules out claiming the S25 merge alone resolved it. The default
package audit and subsequent bounded docgen remain in progress/pending; their
actual final results will be recorded before publication.

## Latest main integration — 7f55eeca0d

The default audit on the preceding snapshot completed in 1,204.5s with one
inherited Skills property failure and 6,479 passing tests; its package docgen
passed in 45.8s. Quick lint/check then passed in 7.4s/6.7s and bounded docgen
passed in 43.79s.

Freshness found three main commits, including consolidated fix #1773. Main
`e54795648b421369d7ac48e3543483fd8c4b6681` merged cleanly as
`7f55eeca0d2773ac0fd9491b5f8a53e1cfd8d383`. A scoped diff confirms H4's
reviewed code/test files equal `a0c0177c98`. All required parity is running
again, alongside a current full package audit. The merged state already
passes quick package lint/check (6.7s/6.3s), Effect Vitest, doctests and bounded
docgen. Test-tsgo reports only inherited TS377032 at
`AgentMessage.runtime.test.ts:322`, introduced by #1766 (`55b1836e40`); the
file equals main and H4 has zero reported diagnostics. The current sequence
also runs the entire Skills provenance and AgentMessage runtime test files
under CI settings to verify the merged fixes.

On the preceding published head, Heavy Build/Check/Docgen/Integration/Coverage
all stopped on the two locator brand errors already repaired in
`e5a69726c2`. Each completed job log was read and its inbox row acknowledged
with that fix SHA; the Coverage job did not reach measurement. Source wave
publication waits for the current collected results, so those stale jobs do
not describe the local source. Queued checks for that superseded head were
cancelled through the canonical Yeet GitHub helper.

## Integrated parity completion — 7f55eeca0d

The full required parity sequence completed on the current merge. Package
quick lint/check, Effect Vitest, nine doctests, bounded docgen, CI knowledge
references, Fallow audit and health, retired paths, scoped coverage and the
coverage read all pass. The three scoped files pass 42 cases in 22.91s.
Coverage is 97.1% statements, 100% branches, 92.1% functions and 97.14% lines;
the incumbent Session command is 100% in every metric, with zero uncovered
counts and every baseline floor/ceiling satisfied. Neither baseline changed.
The full Skills provenance and AgentMessage runtime files pass all 37 cases
in 18.16s under CI settings, confirming the merged runtime/property repair.

Two required parity checks remain red and source-attributed: test-tsgo's sole
TS377032 at `AgentMessage.runtime.test.ts:322` is unchanged from main, and
JSDoc remains `1345 > 1343` root imports. The current generated inventory adds
no root-import examples compared with the inventory already committed on
main, and contains zero H4 root-import examples. No lane-local suppression,
allowlist, baseline or inherited-source repair was made.

At 21:55Z, installed builds remain ChatGPT Desktop 26.1007.71326-1 and Claude
Desktop 2.37337.1-1. Sanitized booleans confirm Codex's two permission keys
still coexist, model and effort match the approved defaults, and project
Claude default mode and the settings-edit deny remain preserved. No home
write or backup was made; F's writer/return-of-key check remains pending.
The old-head Lint Policy job was cancelled by canonical `cancel-queued`:
run 38637405167 and job 116104805039 both report cancelled at head 9a1b342f05.
Its log endpoint is unavailable; that cancellation is not a passing lint claim.

## Final full package result and publication boundary

On integrated main `7f55eeca0d2773ac0fd9491b5f8a53e1cfd8d383`, the default
`beep-heavy bun run beep quality package-verify @beep/repo-cli` exits 0:
audit passes in 1,190.6s and package docgen passes in 46.4s. This supersedes
the historical failed Skills-property audit above; the current full package
gate is green. A fresh fetch and `git merge origin/main` report already up to
date. Source/code tests remain identical to the independently reviewed a0c0177.

The local required parity results remain exactly as recorded above: two
inherited reds, all other required checks pass. The read-only live ruleset
check still reproduces the extra `beep-reviewer` requirement. No red is waived
or called green. The orchestrator owns the S11 merge gate, review window and
retirement; H4 will not merge this PR. Overall route acceptance remains open.

The committed report names the qualification snapshot. The post-publication
dispatch receipt records the exact remote head and review reply results; it
is metadata only and does not change the qualified implementation. Graft
reported approximately 97,006 tokens saved across the lane's discovery calls.
