# Independent integrated R20 refresh candidate review — 2026-10-14

## Verdict and exact scope

**No source or generated-value blocker found for committed candidate `f5163d65a2b22c8025ddba5ccffd8ae667c2e003` against supplied main `a0838402f50a24113748b92b2600d160e62d445d`.** One minor stale receipt sentence requires correction in the qualification receipt: stage-4-detectors.md:115 says “Pending the candidate commit” although this candidate is committed. The owner acknowledged it and plans to replace it with actual committed-candidate parity results. No check not independently qualified by this review is marked pass.

This is a fresh review of the integrated candidate. The earlier review/committed receipt remains explicitly limited to `7878eb9238`; it is not used as proof of current artifacts. Current owner replay head is `a00d3fdaf7c285109ed1d6986adb32fcb4eb95e2`, intentionally recorded as such in the handoff. The candidate SHA and replay SHA are different because owner outputs and packet qualification were then committed; source equality is checked by the pinned diff.

The supplied base-to-candidate diff contains15 files:7 generated standard snapshot deltas and8 packet files (PLAN, README, SPEC, handoff, original bounded review receipt, detector receipt, stage-5 acceptance, OPPORTUNITIES). Schema-first's owner command is a no-op against this base, so it is reviewed among the eight owner outputs without manufacturing a tracked delta. There are no workspace/source/test/cohort/agent-guidance, manifest/lockfile, allowlist/provenance-schema, generated ESLint snapshot, Effect/Vitest inventory, policy fingerprint or coverage-floor edits. The replay-head-to-candidate diff also consists only of generated measurements and packet receipts. R20 first-wave separation is preserved.

## Before/after capture and counts

All six parsed JSON objects in `integrated/main-artifacts.json` exactly equal their supplied-base artifacts at `a0838402f5`, although the private `main-base` file records earlier main `b096cbd99b43`; these snapshot objects did not change across the intervening main delta. All six parsed objects in `integrated/current-artifacts.json` exactly equal the artifacts committed in `f5163d65a2`. JSONC header comments were excluded only for parsing; no JSON values were normalized away.

Verified source values:

| Measurement | Supplied main | Committed candidate |
| --- | ---: | ---: |
| JSDoc packages/public modules/public exports |141 /2,880 /20,404 |147 /3,464 /23,464 |
| Remediation packages/open modules/open exports |120 /366 /2,949 |81 /912 /1,388 |
| Missing export examples |9 |8 |
| Example-import/root-package findings |3,111 /3,110 |1,363 /1,342 |
| Multiple description paragraphs |426 |425 |
| Schema-catalog entries |6,211 |7,383 |
| Schema-first entry bodies |126 |126, exact equal arrays |
| Fallow health per-file counts/target keys |181 /13 |180 /13, target keys exactly equal |
| CLI single-checker instantiations |4,936,391 |5,168,345 (+231,954) |

The other five census counts remain 456,717;896,665;17,335;20,586;17,915. The owner baseline still records compiler `7.0.2+effect-tsgo.0.51.1`, replay head `a00d3fdaf7` and dirty measurement state. This does not pretend the owner measurement ran on a clean `f516` head. Check-time values remain measurements/advisory, not hidden source fixes. All 21 JSDoc ratchet tracked totals exactly match the committed inventory totals (`refresh-jsdoc-ratchet.log:2`). The companion Markdown is in the actual owner-generated diff and generation log.

Independently recomputed integrated JSDoc finding identities using path, symbol-or-module, row kind, family and serialized finding body without line/column/anchor. Result remains 3,411 old;2,731 current;1,560 persisting;1,851 disappeared;1,171 new. Missing-summary and missing-required-tag values are included. Receipt interpretation is accurate: source/detector history accounts for differences; disappearance is not1,851 B repairs, and root-package findings do not imply live root Effect import violations.

## Replay outcomes and health units

`integrated/head` names `a00d3fdaf7`. `integrated/refresh.sh` orders install→build→JSDoc→ratchet→catalog→schema-first→dead-code→health→census. `integrated/results.tsv` records exit 0 for every command except health exit 1. The full build log at line 7421 reports 151 successful / 151 total tasks; cached replay counts are visible rather than represented as 151 fresh compiler executions.

Parsed current raw health JSON in `integrated/refresh-fallow-health.log` reports 5,230 files and 99,855 functions, with 148 above threshold (2 critical / 13 high / 133 moderate), static-estimated coverage. These updated analyzed-population counts differ from the explicitly historical first reproduction's 5,227 files / 99,692 functions; the receipt's earlier numbers remain under its 01b3d54700 history, not claimed as current replay population. Per-file baseline count 180 is a separate unit from 148 functions. Raw health remains failing; writing a baseline does not establish repaired complexity or zero debt.

Dead-code owner output reports zero issues under Fallow 3.32.0 and retains the explicit diagnostic that rule packs are not configured, so policy zeros are unmeasured. No unsupported proof of boundary coverage is claimed. Catalogs are preserved/regenerated and schema-first exception bodies unchanged. Source/coverage floors and Effect/Vitest registry bytes are exactly equal to supplied main.

## Fallow health newline normalization

Current working file bytes exactly equal `f516`'s committed health baseline, with one final newline and no extra blank final line; there is no live formatter dirt. Parsed candidate values exactly equal the owner-captured health object. The base-to-candidate semantic diff removes only one `complexity_moderate` finding for Goals/Doctor.ts; the other 180 counts and 13 target keys remain owner values. Therefore the restored newline-only formatting dirt did not alter semantic owner values. This review validates retained bytes/objects; it does not reconstruct an uncaptured transient formatter edit as a new proof run.

## Attribution and remaining gates

The handoff correctly distinguishes owner replay head `a00` from subsequent committed-candidate parity. Earlier fixture/Sherif/source-law/full-census results remain attributed to 01b3d54700; later replay install/build/owner writes have separate completed logs. Neither earlier review nor older canceled hosted jobs are used as final-head proof. Inherited Coverage Regression attribution remains the standing orchestrator-owned splice, not a current hosted-pass claim, and B changes no coverage floor.

Required committed-candidate parity was queued/not fully qualified at review request and remains outside this read-only artifact verdict. The owner will record actual terminal results and replace the stale “pending candidate commit” sentence. No new hosted readiness or merge gate is certified here. R14 serialized merge must land this candidate before counts become accepted program baselines; cap authorization precedes publication. Later R20 guidance/detector waves remain pending, S5 notification precedes effect-laws edits, and V owns open cohorts under R102. Private later-wave proposals are accurately described as proposals, not admissions or zero debt. The brief-named separate Claude reviewer remains a separate review result; this report does not substitute for it.

Only this private report written. No tracked edits, heavy commands, delegation, admissions, generated mutations or hosted actions by this reviewer.
