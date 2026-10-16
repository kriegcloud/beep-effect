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
