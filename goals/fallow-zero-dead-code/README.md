# Fallow Zero Dead-Code

## Status

Lifecycle: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Mission

Drive the Fallow dead-code lane to a true zero (fix all verified true
positives, eliminate false positives via config only), re-baseline at zero,
promote the dead-code and audit lanes to blocking pre-push proof (closing
fqe-005/fqe-006 in `goals/fallow-quality-enforcement`), and land it all as a
mergeable PR via the normal yeet path.

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/fallow-zero-dead-code/GOAL.md
```

`GOAL.md` is the compact launcher. `SPEC.md` remains the normative contract.

## Read This First

1. [`GOAL.md`](./GOAL.md) - compact `/goal` launcher.
2. [`SPEC.md`](./SPEC.md) - normative source of truth.
3. [`PLAN.md`](./PLAN.md) - active execution plan.
4. [`research/triage.md`](./research/triage.md) - verified per-finding
   verdicts (20 true positives / 41 false positives) and locked policies.
5. [`tasks/tasks.jsonc`](./tasks/tasks.jsonc) - ranked task inventory
   (fzd-001..fzd-006).
6. [`ops/manifest.json`](./ops/manifest.json) - machine-readable routing.
7. [`history/`](./history/) - review rounds and closeout evidence.

Related packet: [`goals/fallow-quality-enforcement`](../fallow-quality-enforcement/)
owns the authoritative feature matrix, knip parity matrix, and the heavy
validators; this packet updates those artifacts and completes its seeded
tasks fqe-005/fqe-006.

## Current Phase

P1 Remediate. Next concrete action: execute `fzd-002` (fix the 20 verified
true positives), then `fzd-003` (config tuning + wire-or-delete loop to
`total_issues: 0`).

## Latest Evidence

- [`research/triage.md`](./research/triage.md) (2026-06-11): all 61 findings
  verified; baseline scan summary `total_issues: 61` reproduced locally.

## Notes

- 0 means 0: no exception lists, no inline suppressions, no `apps/**`
  blanket ignore.
- Knip stays blocking in this packet (`keep-knip`); retirement is a future
  packet once fallow has a clean blocking track record.
- Dupes (930 clone groups) and health (209 over-threshold functions) stay
  advisory with measured ratchet baselines recorded in the feature matrix.
