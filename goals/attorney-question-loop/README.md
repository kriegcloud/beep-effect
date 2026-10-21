# Attorney Question Loop

## Status

Lifecycle: `completed-retained`

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

Closed (`completed-retained`). The operator turns the services on through
`docs/runbooks/practice-review-hub.md`; follow-ups are in `PLAN.md`.

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
- 2026-10-14 P3a: `DocketQuestions` (needs-review items become questions) and `DailyNotice` (at most one
  count-only notice a day), with the `NoticeMailbox` adapter over `@beep/m365`.
- 2026-10-14 P3b: the `apps/practice-review-hub` app, an HTTP MCP bound to loopback and gated on the
  tailnet login, with four tools (the pane contract is in `research/P3B-HUB.md`, as built) and the
  JSONL verdict, answer and item stores.
- 2026-10-15 P3c:
  - sample user units for the hub and for the daily notice service and timer;
  - docket-intake publishes questions to the hub's store, opt-in through
    `DOCKET_INTAKE_REVIEW_HUB_DIR`;
  - the hub app's `notice` subcommand;
  - `docs/runbooks/practice-review-hub.md`;
  - JSONL reads tolerate an append in progress;
  - the hub's 403 and allowed-login behaviour proven locally on loopback.
- 2026-10-15 P4: the amendment and the hub contract are in the repo and registered with the
  orchestrator as a routing item for the review-queue follow-on.
- 2026-10-15 P6: closeout reflection `history/reflections/2026-10-15-claude.md`.
- 2026-10-20 operations: the hub runs on the workstation with the interim identity (SPEC Decision
  Log). On loopback, a request with no login and one with an unlisted login both get 403;
  `server/discover` through `tailscale serve` gets 200. The daily notice timer is not on yet.
- 2026-10-21 operations: the hub runs the post-#1930 code with its bearer token. Without the token,
  a forged login on loopback and a tailnet request both get 403. Claude Code on the attorney's
  device has the four tools through a `headersHelper`: `claude mcp get` reports Connected and a
  `review_open_items` call returned the 11 open questions. The token is in none of its
  configuration or history files. The daily notice timer is still off.

## Notes

- The motivating evidence (2026-10-14 docket spot-check) names clients and stays out of the repo
  at `$HOME/.cache/beep/handoffs/attorney-followup-loop/INPUT.md`.
- The notice sends as the attorney's own mailbox, to himself, through `@beep/m365`
  (`createDraftMessage` / `sendDraftMessage`).
