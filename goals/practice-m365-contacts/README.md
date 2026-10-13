# Practice M365 Contacts

## Status

Lifecycle: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Mission

Give `@beep/m365` its confidential-client auth lane and contacts write verbs
behind per-lane decoded scope configs, then seed the attorney's dedicated
contact folder from the salvaged contact-export CSVs — dedup by normalized
email, rollback-tagged, hand edits never overwritten.

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/practice-m365-contacts/GOAL.md
```

`GOAL.md` is the compact launcher. `SPEC.md` remains the normative contract.

## Read This First

1. [`GOAL.md`](./GOAL.md) - compact `/goal` launcher.
2. [`SPEC.md`](./SPEC.md) - normative source of truth.
3. [`PLAN.md`](./PLAN.md) - active execution plan.
4. [`ops/manifest.json`](./ops/manifest.json) - machine-readable routing.
5. [`research/SOURCES.md`](./research/SOURCES.md) - provenance, inherited
   from the source exploration.
6. [`history/`](./history/) - evidence and closeouts, if present.

## Current Phase

P0 and P1 are done; P2 remains in progress. PR 1 #1591 and reviewed follow-up
#1595 are merged. The scoped grant and runtime read passed. The pre-seed export
contains 536 contacts; SPEC records its full hash. The online plan finds every
identifiable source contact already present: zero creates, 480 existing skips,
seven unidentifiable skips, zero conflicts and zero untracked tags.

Live verification exposed the zero-create apply path: it returns before folder
discovery and run-journal persistence, so the required dedicated-folder and
per-run rollback evidence cannot be produced in this mailbox state. Stop before
smoke/apply under the brief's live-defect rule. A reviewed change or scope ruling
must address this before another live run; existing contacts remain untouched.
No mailbox write has run, and completed-retained is not claimed.

Historical package, type, scoped docgen, fallow and coverage proofs are in the
earlier handoff. This resume edits only packet evidence.

## Latest Evidence

- [Contact census](./history/2026-10-09-p0-contact-census.md): 533 CSV records,
  487 normalized contacts; four inputs share one byte hash. VCF is census-only.
- [Offline dry run](./history/2026-10-09-seeding-dry-run.md): 480 creates, seven
  unidentifiable skips, zero conflicts and zero untracked tags.
- [Earlier lane handoff](./history/handoffs/m365-contacts-2026-10-09.md): setup, decisions
  and historical qualification evidence.
- [Grant observations](./history/2026-10-13-p0-grant-proof.md): scoped
  administrative handback and passing runtime read after admission queueing.
- [Resume handoff](./history/handoffs/m365-contacts-2026-10-13.md): deadline
  boundary, terminal unit evidence and remaining live steps.

- [Online plan](./history/2026-10-13-seeding-dry-run-online.md): zero creates,
  480 existing skips, and the zero-create verification blocker.

## Notes

- Graduated 2026-08-30 from `explorations/practice-office-provisioning`
  (BRIEF solution sketch point 2). The write-verbs scope was deliberately
  shrunk to contacts in align — no driveItem upload, no `Sites.Selected`,
  no Graph mail-write lane. Do not re-expand it here.
- The r4 report's broader upload/MIME verb sketches are context for the
  HTTP-executor design only; those verbs are out of scope.
- Contact content, real mailbox addresses, and machine-local salvage paths
  never enter this public repo — evidence uses counts, headers, and tags.
