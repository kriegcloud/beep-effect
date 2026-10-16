# CI portability candidate — 2026-10-16

lane: rsc-f-agents
head: db1fa941a67ad7808d67d9453821dd5b60945546   PR: #1797
package-verify: @beep/repo-cli: pass (full audit 1258.4s; docgen 38.3s)
hosted-parity: test-tsgo pass (381 files) | docgen local pass | jsdoc-ratchet pass | knowledge refs pass | fallow audit+health pass | coverage read pass (334 tests, 17 files; all 8 matching floors)
config fingerprint (final): 2f5a7469595a414e8ac8add825cf7d0ea0b387043e56e9679389ebc299b7d2da (353 equality inputs / four observed-only)   backups: none this wave; zero native configuration applies
handoff: goals/repository-simplification-confidence/history/handoffs/rsc-f-agents-2026-10-16.md
open items: driver-owned exact-head hosted CI and merge final; retained qualification windows / external-owner prerequisites; native-platform EV010 provenance advisories described below. Panel was CLEARED on ddf343221a; this report is a CI candidate, not a new panel verdict.

The repair injects ModelsAtomicExchange as an Effect Context.Service. The live
layer retains the cached GNU mv --exchange probe and the same typed fail-closed
refusal. Apply, restore, ownership, displaced-inode and hash checks are unchanged.
Tests provide an Effect FileSystem swap model that preserves inodes and symlinks;
injected competitors act at transaction boundaries. It is test-only, with no
production fallback. Models fixtures now use scoped OS temporary directories.
The unsupported live layer still refuses two writes with one cached probe and
unchanged native bytes.

The full repo-cli package test script passed with a PATH shim that rejects every
live mv --exchange call. A direct live-layer probe under that same environment
returned supported=false before the suite. Settled result: 336 files and 6,765
tests passed, exit 0, 1221.72 seconds. The initial root-level Vitest attempt was
stopped for its wrong-cwd lint-worker expectation; the successful package-cwd
run replaces it. The final Effect-only helper is covered by the settled 334-test
coverage run, and final test-tsgo passes.

Effect Diagnostics: pass, 331 programs / 80,694 file visits, zero findings.
Oxlint: zero findings in PR-changed files; all 18 reported findings are in files
byte-identical to origin/main. Cheap gates: 16 pass; effect-vitest reports the two
standing F-S31-EV010 native-platform provenance advisories and one in the touched
catalog fixture. That catalog import is unchanged from origin/main; its native
filesystem ledger round-trip remains intentional. No exception rows were added.
S31: 15 inventories compared, zero added rows. Changeset-graph: pass, 157 packages,
zero changeset files / references / missing references. Both catalog owners ran.
Main 379573e3eb was merged once, followed by bun install.

Receipts: history/receipts/stage-5-f-ci-portability-verification.json and
history/receipts/stage-5-f-ci-portability-fingerprint.json. Private logs are under
.beep/rsc-f-ci-portability/. No home configuration was applied. Claude memory
and Cursor CLI config changed concurrently since the wave-start snapshot; the
fresh fingerprint includes them, and its immediate equality check passed.
Pre-existing handoff edits and .impeccable/live/ residue are preserved.

The driver owns hosted CI and the merge final. No readiness monitor, merge-final
marker or .final gate file is created by this lane. Source proof checkpoint:
db1fa941a67ad7808d67d9453821dd5b60945546. The delivery report is refreshed with the pushed head.
Graft saved approximately 155,617 estimated tokens in two retrievals.

ci-candidate db1fa941a67ad7808d67d9453821dd5b60945546 #1797
fingerprint 2f5a7469595a414e8ac8add825cf7d0ea0b387043e56e9679389ebc299b7d2da
full repo-cli with live exchange forced unavailable: PASS — 336 files, 6,765 tests, exit 0

---

lane: rsc-f-agents
head: 34f53ea82f938fd4938fe659e2b42f5fb0803d08 (qualified fix; pushed-head supplement follows)   PR: #1797
package-verify: @beep/repo-cli: pass (default audit 1259.1s / docgen 36.8s; final lint/check pass)
hosted-parity: test-tsgo pass | docgen local pass | jsdoc-ratchet pass | knowledge refs pass | fallow audit+health pass (zero findings) | coverage pass (334 tests / 17 files / all eight floors)
config fingerprint (final): cda547c676f6999bfa3627743d837b3df218ba1645cd8c3b948cf9ca2c73cc54 (panel candidate; 353 equality inputs / four observed-only)   backups: none this wave; no native writes
handoff: goals/repository-simplification-confidence/history/handoffs/rsc-f-agents-2026-10-16.md
open items: panel OPEN for the driver's capped Grok/Fable re-check; exact-head hosted checks; retained 30-session windows and external-owner prerequisites; previously tracked F-S31-EV010

## Capped round-10 bounded repair: F-GROK-R10-01

Fix commit: `34f53ea82f938fd4938fe659e2b42f5fb0803d08`. The single native eligibility gate returns
the schema-defined `unsupported-removal-shape` outcome for parsed tables,
dotted parents, arrays and arrays of tables. The span writer defensively
refuses the same shapes. Preview gets removal presence from the parsed gate,
including boolean and numeric scalar values. Check, dry-run and write refuse
before backup creation with the same message:

`Ineligible native target: Unsupported removal shape: owned leaf must be a scalar TOML assignment.`

The exact Grok input (`[sandbox_mode]` followed by
`sandbox_mode.foo = "native"`) and the other non-scalar cases pass through
ModelsApply.apply check/dry-run/write and codex-permissions CLI
check/dry-run/write. Every refusal asserts unchanged bytes and no backup or
journal. Direct span calls refuse too. Tests:
`refuses non-scalar removals consistently before backup in every removal mode`,
`previews and removes every supported scalar shape from parsed ownership`,
and the updated table/dotted-key regression. Existing scalar removal and
absent-key idempotence cases pass. The settled coverage suite passes all
334 tests in 17 files and all eight tracked floors.

Fresh Effect Diagnostics passes all 331 projects / 80,687 file visits with
zero findings. Oxlint has zero findings in changed files; all 18 repository
findings are in untouched files byte-identical to origin/main. Cheap gates
have 16 passing lanes; only the two previously tracked F-S31-EV010 platform
provenance advisories remain. Both introduced complexity findings were fixed
in code; Fallow audit and health each report zero findings. S31: all 15 debt
inventories compared, zero changed files and zero added rows. Both sharded
catalog owners pass without tracked changes. Changeset-graph passes with
157 workspaces, no changeset and no missing references.

Fetch found main d4bc1726b33e6b98322744454aecd2a36154f8b1 already contained;
no new main merge was necessary. Bun install passed. No home configuration
was written, so no new native backup, rollback or Codex model probe was
needed. The protected Codex pins were untouched. Four external configuration
inputs differ from the earlier candidate: Claude registry, plugin registry,
Claude memory and Cursor native configuration. All remain equality inputs;
none was written by this wave. The immediate fingerprint equality check
passes with zero changed paths. The set is recaptured on the pushed head.

Exact workstation models check summary (exit 1, unchanged operator-owned
Claude alias and shell-form findings; no F-owned drift):

models: 24 manual target(s); 6 finding(s) across 498 catalog model(s) from router-for-me, codex-cache, grok-cache, cursor-agent, proxy-v1-models

Evidence: history/receipts/stage-5-f-r10-bounded-verification.json and
history/receipts/stage-5-f-r10-bounded-fingerprint.json. Private command logs:
.beep/rsc-f-r10-fix/. Previous handoff edits and plugin-owned .impeccable/live/
residue are preserved separately. No readiness monitor or final gate file is
created. The driver owns panel clearance and the merge gate.
Graft saved approximately 35,203 tokens in one retrieval.

---

lane: rsc-f-agents
head: 6996ce18bd432669100d46d5302089757aaab55c (qualified source; publication supplement follows)   PR: #1797
package-verify: @beep/repo-cli: pass (default audit 1238.3s / docgen 41.0s; final lint/check subset passes after equivalent simplification)
hosted-parity: test-tsgo pass; docgen local pass; JSDoc ratchet pass; knowledge refs pass; Fallow audit+health pass (zero findings); coverage pass (332 tests / 17 files / all eight touched-file floors); fresh final Effect Diagnostics pass (331 projects / 80,687 file visits / zero findings)
config fingerprint (final): 905d5b49978347400ba446712a6e0b906145b2f4928eccba115ac3d5a1306731 (panel candidate; 353 equality inputs / four observed-only)   backups: no new native writes or backups; all three retained backups present
handoff: goals/repository-simplification-confidence/history/handoffs/rsc-f-agents-2026-10-16.md
open items: driver-owned capped panel round 10 and exact-head hosted checks; incomplete 30-session windows and existing external-owner prerequisites; previously tracked F-S31-EV010

Both review comments were read in full over REST before the fixes. One shared
gate now returns schema-defined eligibility tags and takes the operation kind.
Live removals accept absence as their satisfied post-state; presence reports
drift. Clean check/dry-run/write succeed idempotently, with change=false and
no extra backup. Valid missing TOML/JSON ownership reports missing-locator;
other refusals retain their explicit unsupported-form reason. Canonical
resolution/extension, fatal UTF-8 and full parsing still apply. The document
is parsed once; no per-path eligibility checks are duplicated.

| Thread | Fix commit | Test evidence |
| --- | --- | --- |
| PRRT_kwDOPbO_N86tBFzz / 4289652719 (P1) | 33cf2521e7c06261d54169110fecb8212686c22c; final qualification 6996ce18bd | models-apply-command: present legacy key drifts, write removes it, clean check/dry-run/write succeed and preview change=false. models-apply: quoted/unquoted CRLF removal, exact backup bytes, idempotence and retained restore refusal. Normal TOML/JSON set/restore remains byte-exact. Native codex-permissions --check passes without writing. |
| PRRT_kwDOPbO_N86tBFz7 / 4289652731 (P2) | 33cf2521e7c06261d54169110fecb8212686c22c; final qualification 6996ce18bd | Actual check --offline --json exercises every gate tag, TOML and JSON missing ownership, invalid bytes, parse errors, unsupported format, canonical mismatch, I/O failure and an eligible control. Assertions require missing-locator with omitted current, or stale with the explicit refusal tag. All bytes remain unchanged. |

The full P1 comment explicitly retains the round-9 restore refusal when a
completed removal has no live owned path. This fix preserves that refusal
and its byte-exact retained backup; it does not claim automatic removal
rollback now succeeds.

The delivery suite passes 332 tests across 17 files, with all eight existing
coverage floors. Latest CLI assertions separately pass 72 tests across three
files. Default package audit/docgen passed before equivalent simplification;
final lint/check, tests, docgen and diagnostics verify the simplified source.
Oxlint has zero findings in changed files; all 18 repository findings are in
untouched files byte-identical to origin/main. Cheap gates: 16 lanes pass;
only the two previously tracked EV010 native-platform provenance advisories
remain under RSC-F-S31/F-S31-EV010. All introduced complexity, Option assertion
and temporary schema-heavy-file findings are repaired in code.

Git fetch completed; main d4bc1726b33e6b98322744454aecd2a36154f8b1 was already
contained, so the merge reported already up to date. Dependencies installed.
Both sharded catalog owners pass. Changeset-graph passes with no changeset.
S31 compares 15 debt/exception inventories: zero changed files and zero added
rows. Receipts: history/receipts/stage-5-f-review-threads-verification.json
and history/receipts/stage-5-f-review-threads-fingerprint.json.

Exact workstation models check summary:
models: 24 manual target(s); 6 finding(s) across 498 catalog model(s) from router-for-me, codex-cache, grok-cache, cursor-agent, proxy-v1-models

F-owned drift is zero. The six findings remain the operator-owned Claude
alias and five shell expressions. Pinned read-only Codex probe: pass (OK).
Native permission check: pass, no file written. Native model/effort pins and
Claude harness files were not written. Prior backups remain present:
models-2026-10-14T222221002Z-16103436.backup,
rsc-f-pre-rollback-20261014T222520875693Z.backup,
models-2026-10-14T222525456Z-12665845.backup.
Previous ModelsApply rollback evidence remains retained. SPEC Decision Log
RSC-F-REVIEW10-ELIGIBILITY records the decision and reversal. Repository
reversal is revert of this review-fix wave.

The fingerprint recaptures changes outside this wave in Claude memory,
the Claude registry and Cursor CLI config since round 9. Every owned input
remains in equality; observed-only exclusions are unchanged. No capability
is retired for incomplete telemetry. The panel remains OPEN. No readiness
monitor, merge or final gate file is created. The pre-existing October 15
handoff edit and plugin-owned .impeccable/live/ residue are preserved.
Graft saved an estimated 32,706 tokens in one retrieval.

REST replies and pushed-head fingerprint recapture follow the single push.
fingerprint file: .beep/rsc-f-review10/fingerprint-pushed.json
