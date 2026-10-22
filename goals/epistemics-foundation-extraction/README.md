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

## Latest Evidence

Not started.

## Notes

<Record high-signal constraints or resume notes that do not belong in the
normative spec.>
P2 Verify — complete (2026-10-22): #2017 hosted checks passed, apart from three hosted-only reds on main (schema catalog, root oxlint `no-inline-schema-compile`, JSDoc Ratchet). Each was fixed on main by #2019 (`9439053a3f`) or #2021 (`07f8856fec`).
P3 Yeet — complete (2026-10-22): #2017 merged as `ab6000add2`.
P4 Close — in progress (2026-10-22): reflection `history/reflections/2026-10-22-claude.md`; closeout proposed as `completed-retained` with final PR #2017. `goals completion refresh` reports the gate unsatisfied, because #2017 merged over attributed reds under S43. The lifecycle stays `active` until the remediation ledger verifies completion.
