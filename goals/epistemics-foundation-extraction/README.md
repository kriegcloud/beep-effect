# Epistemics Foundation Extraction

## Status

Lifecycle: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Mission

Move tenant-free epistemic vocabulary into foundation/modeling @beep/epistemics so party and other slices build claims on it

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/epistemics-foundation-extraction/GOAL.md
```

`GOAL.md` is the compact launcher. `SPEC.md` remains the normative contract.

## Read This First

1. [`GOAL.md`](./GOAL.md) - compact `/goal` launcher.
2. [`SPEC.md`](./SPEC.md) - normative source of truth.
3. [`PLAN.md`](./PLAN.md) - active execution plan.
4. [`ops/manifest.json`](./ops/manifest.json) - machine-readable routing.
5. [`research/`](./research/) - supporting research, if present.
6. [`history/`](./history/) - evidence and closeouts, if present.

## Current Phase

P0 Research — complete (2026-10-21): inventory and importer census in `SPEC.md`.
P1 Implement — complete (2026-10-22): four modules moved, seven id-bearing modules as factories (P1b), intervals and the `Claim<P>` envelope; evidence in `research/p1-move-report.md`.
P2 Verify — complete (2026-10-22): `package-verify`, cheap-gates and Repo Sanity green locally; hosted checks on #2017 (see Latest Evidence).
P3 Yeet — complete (2026-10-22): #2017 merged as `ab6000add2`.
P4 Close — in progress (2026-10-22): reflection written; closeout proposed as `completed-retained` with final PR #2017; completion gate unsatisfied (see Latest Evidence).

## Latest Evidence

- **Final PR:** #2017 merged as `ab6000add2`. Its final head is `62fdeb3680`, a merge with main pushed by plain fast-forward after `635be50874` (round-1 review fixes).
- **Reds on main:** after the merge, three required checks went red on main at `ab6000add2`.
  - Heavy / Docgen: invalid `@category` values. Fixed by #2019 (`9439053a3f`).
  - Heavy / Lint Policy: root oxlint `no-inline-schema-compile`. Also fixed by #2019.
  - JSDoc Ratchet: five tracked totals rose. Fixed by #2021 (`07f8856fec`).

  The schema-catalog shards were regenerated inside #2017 itself (`08f0347030`) and never reached main.
- **Reflection:** `history/reflections/2026-10-22-claude.md`. `bun run beep lint reflection-artifacts`: blocking 0, advisory 0.
- **Completion gate:** unsatisfied. `bun run beep goals completion refresh --slug epistemics-foundation-extraction` reports #2017 unsatisfied, because it merged over attributed reds under S43; the remediation ledger carries them as fixed by #2019 and #2021. The gating `yeet-verdict` ref names #2017's run directory, `.beep/yeet/runs/feat_epistemics-foundation-p1-ada9d9015733/verdict.json`. That verdict is not retained:
  - The lane was retired after merge.
  - No publish verdict binds the final head `62fdeb3680`, because that commit was a plain push.

  Until head-bound readiness evidence is re-established, the gate reads `unknown`/`unsatisfied` and the lifecycle stays `active`. The original readiness monitor job was `6a578a15-389a-410c-8296-cbb0d25a67ac` (`--readiness-job` recovery input).

## Notes

- `goals completion refresh` resolves the `yeet-verdict` ref as a repo-contained file. Retain the lane's `.beep/yeet/runs/<run-id>/verdict.json` before `yeet sweep --retire`, and push the final head through `yeet publish` so a publish verdict binds it.
