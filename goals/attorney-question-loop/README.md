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

The pane card is an amendment for the owner of the `practice-claude-mod-review-queue` follow-on.

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

P3 Producer + notice. P0–P2 are complete.

## Latest Evidence

- 2026-10-14: graduated from the `attorney-review-workspace` re-entry. The align and shape rulings
  are in that packet's `DECISIONS.md`; the first vertical slice is in its `MAP.md`, re-entry
  section.
- 2026-10-14 P0: `question` ReviewItem, `values/Question` (options 2-5 with unique ids, optional
  `calendar-date` write, facts) and `values/AnswerRow` (four states) in `@beep/law-practice-domain`;
  `test/QuestionLoop.test.ts` (9 tests); package-verify passes for domain and use-cases.
- 2026-10-14 P1: the `QuestionQueue` and `QuestionWrites` contracts (schemas, errors, the
  `AnswerLog` and `QuestionCalendar` ports, and service shapes) in `@beep/law-practice-use-cases`;
  `test/QuestionLoop.contract.test.ts` (9 tests).
- 2026-10-14 P2:
  - `QuestionQueueLive` and `QuestionWritesLive` (all-or-nothing apply with rollback, undo in
    reverse order).
  - `makeQuestionCalendarLayer` over `@beep/m365` (provisional events only; undo never overrides
    the attorney).
  - The first vertical slice in `test/QuestionLoop.slice.test.ts` (5 tests), plus
    `server/test/QuestionCalendar.test.ts` (3 tests).

## Notes

- The motivating evidence (2026-10-14 docket spot-check) names clients and stays out of the repo
  at `$HOME/.cache/beep/handoffs/attorney-followup-loop/INPUT.md`.
- The notice sends as the attorney's own mailbox, to himself, through `@beep/m365`
  (`createDraftMessage` / `sendDraftMessage`).
