# Attorney Question Loop

## Status

Lifecycle: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Mission

Agents ask the attorney through the review queue, never through a polled inbox:
- a `question` ReviewItem;
- an append-only `AnswerRow` (decided, pending on client with a resurface date, keep reminding,
  withdrawn);
- a `QuestionQueue` with daily digest selection;
- operator-approved write batches applied through the docket-intake calendar adapter;
- docket-intake as the first producer;
- a daily notice email.

The pane card is an amendment for the `practice-claude-mod` owner.

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/attorney-question-loop/GOAL.md
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

P0 Schema. It waits for `review-verdict-envelope` (#1761) to merge.

## Latest Evidence

- 2026-10-14: graduated from the `attorney-review-workspace` re-entry. The align and shape rulings
  are in that packet's `DECISIONS.md`; the first vertical slice is in its `MAP.md`, re-entry
  section.

## Notes

- The motivating evidence (2026-10-14 docket spot-check) names clients and stays out of the repo
  at `$HOME/.cache/beep/handoffs/attorney-followup-loop/INPUT.md`.
- The notice sends as the attorney's own mailbox, to himself, through `@beep/m365`
  (`createDraftMessage` / `sendDraftMessage`).
