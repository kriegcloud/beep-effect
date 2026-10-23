# Attorney Question Loop Spec

## Objective

Agents ask the attorney through the review queue, never through a polled inbox. Graduated from
[`explorations/attorney-review-workspace`](../../explorations/attorney-review-workspace/README.md)
(re-entry 2026-10-14; see that packet's BRIEF and MAP re-entry sections).

1. A `question` member of the `ReviewItem` union carries:
   - the question text;
   - the facts already checked, each with a `SourceRef`;
   - two to five options, each optionally naming the write it implies;
   - the matter and mail thread (`conversationId`) it belongs to.
2. An append-only `AnswerRow` records the attorney's answer. Its states are `decided` (with an
   `optionId`), `pending-on-client` (with a `resurfaceOn` date), `keep-reminding` and `withdrawn`,
   with an optional note. The latest row wins by the envelope's recency rule.
3. `QuestionQueue` lists open questions and selects the daily digest: every question with no answer,
   a `keep-reminding` answer, or a `pending-on-client` answer whose `resurfaceOn` is on or before
   today.
4. A write-proposal batch turns `decided` answers whose option names a write into proposed calendar
   or docket changes. The operator approves the batch. The docket-intake calendar adapter applies
   it, journaled with the prior state and undoable. A note never writes.
5. docket-intake is the first producer. It raises a question only for an open item that records
   cannot settle.
6. A daily practice-services job sends the attorney a notice ("N questions are waiting in Claude")
   from his own mailbox to himself, and only when the digest is non-empty.
7. The pane card ships as an amendment that the owner of the `practice-claude-mod-review-queue`
   follow-on applies (gated in `explorations/claude-mods-law-practice/MAP.md`):
   [`AMENDMENT-question-card.md`](../../explorations/attorney-review-workspace/research/AMENDMENT-question-card.md).

## Non-Goals

- Writes without operator approval. Per-question auto-apply is the gated `question-auto-apply`
  MAP row.
- Parsing free-text email replies. That is the gated `question-email-replies` MAP row; when it
  lands, it only ever proposes.
- Polling an inbox from chat sessions.
- A new app or page. The attorney answers in the Claude review queue.
- Calendar changes outside the docket-intake adapter's provisional categories.
- Client documents in fixtures, tests or the repo. The evidence that motivated this goal stays in
  the out-of-repo handoff.

## Source Hierarchy

1. User objective or issue that created this packet.
2. `AGENTS.md`, `CLAUDE.md`, and required skills.
3. Governing architecture/package standards.
4. This `SPEC.md`.
5. `PLAN.md`.
6. `GOAL.md`.
7. Supporting `research/`, `ops/`, and `history/` files.

Higher sources outrank lower sources when they conflict.

## Target Surfaces

| Surface | Path | Role | Status |
| --- | --- | --- | --- |
| `question` ReviewItem member | `packages/law-practice/domain/src/values/ReviewItem/` | domain value | EXTENDS #1761 |
| `AnswerRow`, `AnswerState`, `QuestionOption` | `packages/law-practice/domain/src/values/AnswerRow/` | domain value | NET-NEW |
| `QuestionQueue`, digest selection, `AnswerLog` port, errors | `packages/law-practice/use-cases/src/QuestionQueue/` | use-case service | NET-NEW |
| Write-proposal batch and approval | `packages/law-practice/use-cases/src/QuestionQueue/` (or a sibling concept, decided in P1) | use-case service | NET-NEW on the docket-intake journal and undo |
| Calendar apply | `packages/law-practice/server/src/DocketIntake/` calendar adapter, journal and undo | server adapter | EXISTS |
| docket-intake producer | `packages/law-practice/use-cases/src/DocketIntake/` | producer | EXTENDS |
| Daily notice job | `apps/docket-intake` (or a practice-services sibling, decided in P3), over `@beep/m365` `createDraftMessage` / `sendDraftMessage` | job | NET-NEW on existing drivers |
| Pane card | `practice-claude-mod-review-queue` follow-on (its owner applies the amendment) | handoff | AMENDMENT |

## Constraints

- Design order is schema, then the `Context.Service` contract, then implementation. Effect v4
  only. Schemas default to branded `S.Opaque` per `goals/schema-opaque-default`, with `LiteralKit`
  for the answer states.
- A question is one item with one answer log, not a workflow engine or a state machine.
- An answer that is a note, or any state other than `decided`, never produces a write.
- Every applied write is journaled with the prior state and has a tested undo.
- Fixtures are synthetic. Nothing in the repo names the attorney, a client, a matter or a machine.
- The notice is one email a day at most. It says only how many questions are waiting.

## Acceptance Criteria

- [x] **P0 schema.**
  - `ReviewItem` decodes a `question` member: facts with `SourceRef`s, two to five options with
    unique ids, an optional write per option, and an optional `conversationId`.
  - `AnswerRow` decodes all four states and enforces the state fields: `decided` requires an
    `optionId`, and `pending-on-client` requires `resurfaceOn`.
  - Round-trip tests pass.
- [x] **P1 contract.** `QuestionQueue` and the write-proposal batch are `Context.Service` contracts
  with typed errors. The answer log is a port.
- [x] **P2 implementation.** The first vertical slice (exploration MAP, re-entry section) passes in
  tests:
  - raise a question;
  - the digest selects it;
  - answer `pending-on-client`; the digest skips it until `resurfaceOn`, then selects it again;
  - answer `decided`, which yields one proposed write;
  - the operator approves; the write applies through a test calendar adapter, journaled;
  - undo restores the prior state.
- [x] **P3 producer and notice.**
  - docket-intake raises questions only for items records cannot settle, with a test over
    synthetic items.
  - The notice job sends at most one email a day, only when the digest is non-empty, tested with a
    fake mailbox.
- [x] **P4 handoff.** The amendment is delivered to the `practice-claude-mod-review-queue` owner and
  recorded in `README.md`.
- [x] `bun run beep quality package-verify` passes for every touched package.
- [x] The PR is mergeable through Yeet, and a closeout reflection exists under
  `history/reflections/`.
- [x] No unrelated refactors or formatting churn.

## Verification Matrix

| Check | Command or evidence | Required result |
| --- | --- | --- |
| Packet launcher size | `test "$(wc -m < goals/attorney-question-loop/GOAL.md)" -le 4000` | Passes |
| Manifest JSON | `jq . goals/attorney-question-loop/ops/manifest.json` | Passes |
| Whitespace | `git diff --check -- goals/attorney-question-loop` | Passes |
| Domain | `bun run beep quality package-verify @beep/law-practice-domain` | Passes |
| Use cases | `bun run beep quality package-verify @beep/law-practice-use-cases` | Passes |
| Server | `bun run beep quality package-verify @beep/law-practice-server` | Passes |
| Reflection | `bun run beep lint reflection-artifacts` | 0 blocking |

## Stop Conditions

- Required source files are missing or materially contradictory.
- Any spend: purchases, paid services, quota top-ups or plan changes need the
  operator.
- The same blocker repeats after reasonable investigation.

Scope growth, destructive side effects and policy calls are not stops: decide
them and record each in the Decision Log.

## Decision Log

Seeded from [`explorations/attorney-review-workspace/DECISIONS.md`](../../explorations/attorney-review-workspace/DECISIONS.md)
(re-entry align and shape review, 2026-10-14). Rationale and rejected options live there.

| Date | Decision | Reason | How to reverse |
| --- | --- | --- | --- |
| 2026-10-14 | home: a `question` ReviewItem kind on the shared envelope, shown in the `practice-claude-mod` review queue. | One review surface for every producer. | Split into its own exploration and surface. |
| 2026-10-14 | channel: a card in the Claude review queue; email is only a notice. | Structured answers got 6 of 6 replies; email got late or missed replies. | Add the gated email-reply row. |
| 2026-10-14 | writes: the operator approves each batch; writes are guarded, journaled and reversible. | This is the policy that worked on 2026-10-14. | Open the gated `question-auto-apply` row. |
| 2026-10-14 | reminders: a daily digest, plus a per-question `resurfaceOn` for pending-on-client. | One predictable touch a day. | Per-question cadence. |
| 2026-10-14 | notice-from: the attorney's own mailbox, to himself, through `@beep/m365`. | No new grant or send route. | Route the notice through the operator's mailbox. |
| 2026-10-14 | answer-row: a separate `AnswerRow` beside `VerdictRow`, with the same recency rule. | Answers are not right or wrong; `VerdictProjector` stays untouched. | Widen `VerdictRow`. |
| 2026-10-14 | handoff-target: the question-card amendment goes to the `practice-claude-mod-review-queue` follow-on, not the `practice-claude-mod` packet. | `practice-claude-mod` closed (its D24) and moved the review queue to that gated follow-on; the card is one of its phases, gated on this goal's P0. | Address the amendment to whichever packet owns the review queue. |
| 2026-10-14 | P0 dates encode as ISO `YYYY-MM-DD` via `LocalDateFromString` plus a day-in-month check (`src/internal/CalendarDate.ts`). | The format docket-intake already uses; the bare `LocalDate` class encodes as an object and accepts February 31. | Use the bare `LocalDate` class. |
| 2026-10-14 | P0 `OptionWrite` has one kind, `calendar-date` (`title`, `dueOn`, optional `eventId`), as a `LiteralKit` tagged union. | Calendar dates are the only writes answers drove on 2026-10-14; the union leaves room for docket writes. | Add kinds to `OptionWriteKind`. |
| 2026-10-14 | P0 `AnswerRow` has no `batchId` and no lock; the current answer is the latest `recordedAt`, then append order. | An answer can always be revised by a later row; sittings and locks belong to verdicts. | Add a batch and lock as on `VerdictRow`. |
| 2026-10-14 | P1 `QuestionWrites.propose` returns a plain list of `ProposedWrite`s; the caller forms the `ProposedWriteBatch` (with its id) before `apply`. | A pure function has no source for batch ids. | Make `propose` effectful and mint the batch id. |
| 2026-10-14 | P1 adds a `QuestionCalendar` port (`upsert` by key `question:<itemId>:<optionId>`, `restore`) instead of reusing `DocketCalendar`. | `DocketCalendar` only creates and looks up; options can name an event to update, and undo needs the prior state. | Extend `DocketCalendar` with update and restore. |
| 2026-10-14 | P2 `QuestionWrites.apply` is all-or-nothing: if a later write fails, the writes already applied in that call are restored in reverse before the failure returns. | A partial apply would leave calendar changes with no journal record to undo. | Return partial results and let the operator undo. |
| 2026-10-14 | P2 calendar writes land as docket-intake's provisional all-day tentative entries; a write may update a named event only while all its docket categories are provisional, and undo refuses (`restore-failed`) once the attorney has moved an event out of them. | Never override an entry the attorney has verified. | Allow writes to verified events with explicit operator approval. |
| 2026-10-14 | P2 server layer is `makeQuestionCalendarLayer(config)` (mailbox and time zone), like `makeDocketGraphLayer`. | The calendar adapter needs per-deployment config. | Read the config from the environment inside a fixed Layer. |
| 2026-10-14 | data-plane (operator ruling): a workstation review hub over the tailnet is the one source of truth. Producers write items there; the attorney's review pane reads items and appends answers and verdicts through an authenticated HTTP MCP tool exposed only on the tailnet (`tailscale serve`); the answer, verdict and item logs are JSONL on the workstation. | One source of truth for the digest, calendar writes and projections. The building blocks exist: `@beep/mcp-kit` HTTP layers and the `@beep/tailscale` `serve` driver. Rejected: mail as the return channel, and an M365 file store that needs new Graph write scopes. | Move the logs to an M365 file store, or add mail ingestion. |
| 2026-10-14 | P3b hub auth: it listens on loopback only, and `tailscale serve` plus an exact, case-sensitive `Tailscale-User-Login` allow-list is the boundary; there is no bearer token. Anything else gets an empty 403 before any route runs. | The tailnet already authenticates the device and user; a token would be a second secret to rotate on the attorney's PC. | Add a bearer token from 1Password checked beside the login. |
| 2026-10-14 | P3b tool contract for the review pane: `review_open_items`, `review_record_verdict`, `review_lock_batch`, `review_record_answer`, with `ReviewHubToolError` codes `not-found`, `locked`, `unknown-option` and `store-unavailable` (`research/P3B-HUB.md`, as built). | One stable contract for the `practice-claude-mod-review-queue` follow-on. | Version the tools (`*_v2`) on a breaking change. |
| 2026-10-14 | P3b `ReviewItemStore.upsert` skips items equal to their stored latest version. | Producers re-raise the same items every cycle; without the skip, `items.jsonl` grows forever. | Append every upsert and compact on read. |
| 2026-10-15 | P3c notice mailbox: the daily notice uses the existing m365 outbox app registration's scoped `Mail.ReadWrite` and `Mail.Send` grant, sending from the attorney's mailbox to himself. | The operator's shape-review ruling (notice from his own mailbox through the existing outbox, no new grant). The docket registration never sends. | Give the notice its own app registration with the same scoped roles. |
| 2026-10-15 | P3c producer wiring is opt-in: docket-intake publishes questions to the hub's item store only when `DOCKET_INTAKE_REVIEW_HUB_DIR` is set. Every cycle covers the whole needs-review ledger (idempotent through stable ids and unchanged-item skips). | Behaviour without the setting is exactly as before; publishing the whole ledger backfills records that predate the setting. | Publish only new records. |
| 2026-10-15 | P3c JSONL reads ignore a trailing segment with no final newline (an append in progress) and still fail on a corrupt complete line. | Docket-intake appends while the hub reads; a half-written line must not fail the request. | Lock the file for reads. |
| 2026-10-15 | P4 delivery: the question-card amendment and the hub tool contract (`research/P3B-HUB.md`, as built) are committed in the repo and registered with the orchestrator as a standing routing item for whichever session opens `practice-claude-mod-review-queue`. | The follow-on has no owner yet; the practice-claude-mod session asked for this routing before it stopped. | Deliver directly once an owner exists. |
| 2026-10-20 | Interim hub identity (operator ruling): the hub's `--allowed-logins` names the operator's own tailnet login, which the attorney's device also signs in with, instead of a login only the attorney's device uses. | The operator prefers it for now. Every device on that login is the operator's, so access stays inside the operator's own devices. The cost: every one of those devices reaches the hub, and answer and verdict rows cannot show whether the attorney or the operator recorded them. | Invite the attorney as their own tailnet user, sign the attorney's device in as that user, set `--allowed-logins` to that login alone (`docs/runbooks/practice-review-hub.md`, section 4), reload and restart the hub unit, and remove the interim notes from runbook sections 4 and 7. |
| 2026-10-21 | Hub auth amended by the security remediation (#1930): every request also needs a bearer token, `PRACTICE_REVIEW_HUB_API_TOKEN` from 1Password through `op run`, checked in constant time before the login allow-list. This replaces the "no bearer token" part of the 2026-10-14 P3b hub auth row. | Other local OS users could reach the loopback port and forge `Tailscale-User-Login`. | None that is safe: a revision without the token check must stay stopped (runbook, section 9). |
| 2026-10-21 | Client token delivery: the attorney's Claude Code sends the bearer token through a `headersHelper` that reads a DPAPI (CurrentUser) file, filled over a user-only named pipe from SSH standard input (`docs/runbooks/practice-review-hub.md`, section 8), instead of a static `headers` entry. | It keeps the token out of `.claude.json`, shell history and command lines, and rotation needs no client configuration change. | Remove the user-scope registration and `api-token.dpapi`, then register the hub another way: static `headers`, or the practice gateway extension once it includes the hub. |
| 2026-10-21 | Daily notice on (operator ruling): `practice-review-notice.timer` runs at 08:30 America/Chicago from 2026-10-21, sending from the attorney's mailbox to the same mailbox as the 2026-10-15 P3c notice-mailbox row decided. | The attorney's Claude Code reaches the queue now (2026-10-21 operations evidence), so the notice points at something the attorney can open. | `systemctl --user disable --now practice-review-notice.timer`. |
| 2026-10-22 | Questions name their email: a needs-review ledger outcome also keeps the message's subject, sender, day received, Outlook link and thread, the candidate dates, the matter and the docket item's title, all as optional or defaulted keys so older records still decode. Each docket question starts with the email (subject, sender, day), its Outlook link, its needs-review entry link and the matter; its text names the email by subject; candidate dates become date options that move the needs-review entry under the item's title. Item ids and option ids do not change, and links stay in fact text because `SourceRef` names Box files only. `docket-intake backfill-questions` (dry run unless `--apply`) names the email of questions stored earlier, matching them to journaled messages by digest. | Live questions could not be answered: they did not say which message they were about. | Drop the optional `DocketNeedsReview` keys and the identity facts, and remove the `backfill-questions` command; already rewritten questions keep their text until answered. |

## Exception Ledger

| Exception | Scope | Owner | Rationale | Removal condition |
| --- | --- | --- | --- | --- |
| None | N/A | N/A | N/A | N/A |
