# Independent review: R20 first-wave generated refresh

**Candidate:** `c12a1cf29890136de17be1ac818a8685b21d20f8`
**Base:** main `4e66575c646c282169021a6d5eb3d01129617bcf`
**Reviewer:** Claude Opus 5.5 medium, read-only. I made no edits, ran no commands, did not delegate, published nothing and accessed no secrets.

## Verdict

**No P0 or P1 findings.** I found nothing wrong with the generated values or the scope. The refresh-only scope, before/after counts, health units, refusal to claim zero debt, exact-head limits and R20 / S5 / V holds are all recorded truthfully. There are one P2 and four P3 findings, all about packet wording or gate confirmation. None of them changes a measured value.

## What I verified

- **Scope.** The context lists 16 files. Seven are generated snapshots: census, Fallow dead-code, Fallow health, JSDoc inventory `.jsonc` and `.md`, JSDoc totals ratchet, and schema catalog. Nine are packet files.
  - Nothing in scope touches source, tests, manifests, the lockfile, the effect-laws allowlist or its ESLint snapshot, the Effect/Vitest inventory, the coverage baseline or agent-loaded guidance.
  - The #1709 Effect/Vitest update is correctly attributed to main, not to B (handoff lines 204–206).
- **Replay head and order.**
  - `.beep/rsc-resume/integrated/head` = `49ffd94e5f32` and `main-base` = `4e66575c64`.
  - `refresh.sh` runs install → build → JSDoc → ratchet → catalog → schema-first → dead-code → health → census.
  - `results.tsv` shows every step exited 0 except `refresh-fallow-health` (exit 1). This matches `ownerResults` in the context.
- **Counts.** The handoff (lines 189–200) and `stage-4-detectors.md` (lines 116–128) match the context metrics.
  - JSDoc: 141→147 packages, 2,880→3,467 modules, 20,404→23,491 exports. Open modules/exports are 912/1,388; example-import/root-package findings are 1,363/1,342.
  - Catalog: 6,211→7,396.
  - Health baseline: 181→180 findings, 13/13 target keys.
  - Dead-code: 0 issues under Fallow 3.32.0.
  - Census CLI: 5,186,374 − 4,936,391 = 249,983, which is correct arithmetic. The committed census file carries 5,186,374, `commit` 49ffd94e5f and `dirtyWorktree: true`. The other five rows are unchanged.
- **Raw health vs baseline units.** The raw JSON at `refresh-fallow-health.log:2` shows 5,238 files, 100,069 functions and 148 above threshold (2 critical, 13 high, 133 moderate), with `static_estimated` coverage. The receipts report this figure separately from the 180 per-file baseline findings and do not claim baseline absorption as a repair.
- **No zero-debt claims.** The handoff (lines 38–39 and 200–201), `stage-4-detectors.md` (lines 127–128 and 180–183) and the README status all keep the counts as candidate measurements until the R14 merge.
- **Exact-head limits.**
  - The owner-source head (49ffd) and the committed candidate are explicitly kept distinct.
  - The f516 parity and knowledge-refs attribution are labelled historical (handoff lines 165–183; `stage-4-detectors.md` lines 129–138).
  - The handoff header (line 5) keeps every parity row pending. The knowledge-refs red at f516 is not presented as a pass for the new head.
- **R20 sequence and holds.**
  - The generated wave comes first. Guidance previews stay private and unapplied (handoff lines 67–71).
  - S5 notification is required before effect-laws edits (SPEC lines 970–972; detectors line 145).
  - V owns open cohorts under R102 (detectors line 177; SPEC line 972).
- **Coverage.** The inherited red stays with the orchestrator (handoff lines 137–145), and no coverage floor is changed.

## Findings

**P2: cap gate is pinned to a superseded main.** Handoff lines 159–163 record that the cap authorization "names main `a0838402f5`". Main has since moved to `4e66575c64` (#1709), which adds source changes. Neither the handoff nor README line 7 ("the publication cap is released") says whether a gate naming a0838402f5 covers a candidate based on 4e66575c64.
- Fix: before the single push, confirm with the driver that the 12:05 UTC release is not pinned to that base, and record the answer. Otherwise, get a gate for the current base.

**P3: stale "Committed-head parity" heading.** `stage-4-detectors.md:132-140` still opens with "The committed candidate is `f5163d65a2…`", in present tense. Lines 130 and 138 do qualify it, but a reader skimming the heading gets the wrong candidate.
- Fix: retitle it "Historical f516 parity" when the c12a parity results are added.

**P3: stale status lines.**
- `stage-4-detectors.md:5-6` still says the status is "current-head reproduction … at `01b3d54700`".
- README lines 13–14 still say B "is reproducing" the refresh, which contradicts README line 5.
- PLAN line 338 keeps the 2026-10-13 B status. PLAN.md is in candidate scope, so that line could be refreshed in the same pass.

**P3: `stage-5-acceptance.md:438` lists a schema-first snapshot that isn't in the diff.** It says the candidate "carries owner-generated … schema-first … snapshots". The schema-first owner run was a no-op: all 126 entry bodies are equal and `standards/schema-first.inventory.jsonc` is not in scope.
- Fix: say schema-first was regenerated with no tracked delta.

**P3: the integrated-review receipt now points at overwritten logs.** `stage-4-b-refresh-integrated-review.md:35-37` cites `integrated/head` as `a00d3fdaf7` and quotes that run's health population (5,230 / 99,855). Those files now hold the 49ffd pass. The handoff (line 207) says prior passes are "archived separately" but gives no path.
- Fix: name the archive directory so that pinned historical review stays traceable.

## Not verified here

- **Committed-head parity for c12a1cf is not run.** That covers test-tsgo, bounded docgen, JSDoc ratchet, knowledge refs, Fallow audit/health, census and retired-effect-paths. The new-head knowledge-refs result is also unknown, since the f516 inherited attribution doesn't carry over.
- **Base-to-candidate diff.** Without git, I took scope from the context file. I spot-checked the committed census file against the context; I did not byte-compare the other six snapshots with `current-artifacts.json`.
- **Cap gate.** I did not check whether the gate covers the current base (see P2).
- **Hosted checks and the R14 merge.** No hosted run exists for this candidate (no new PR or push yet), and R14 serialized-merge status is open.

Later R20 guidance, detector, provenance and exception-review waves remain explicitly pending and are outside this first-wave verdict.

## Owner qualification response

The subsequent packet-only qualification corrects all four P3 wording/path
findings. It retitles historical f516 parity, refreshes current status and
PLAN, describes schema-first as an owner no-op, and maps old integrated
logs to `.beep/rsc-resume/replay-a00d3fdaf7/`. The P2 cap ambiguity is
resolved against the standing addendum in the SPEC Decision Log: the gate
is file-existence CI admission, with no defined SHA pin; that same rule
requires latest-main integration before push. No absent/revoked gate or
cap override is inferred. Candidate c12 parity subsequently completes with
all passes except fourteen inherited knowledge-refs observations, each
byte-identical to main. These later results are owner qualification evidence,
not retroactive changes to the independent review. Final packet-head checks
and named review closure precede publication.


## Round-two closure at b69e62b66d

The same Claude Opus 5.5 medium reviewer closes the round-one P2 and all
four P3 findings. It reports no remaining P0/P1/P2 and one optional P3:
two chronological log references should point directly to the a00 archive.
This final packet-only correction applies that request; no generated values
change. The original round-two report remains private at
`.beep/rsc-resume/claude-refresh-review-round2.md`. Final packet-head parity
and hosted readiness remain separate proof stages.
