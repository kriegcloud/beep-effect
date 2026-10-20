# P1 contract design

Status: design, 2026-10-14. This document is normative for P1. P1 declares `Context.Service`
contracts, ports, typed errors and their schemas in `@beep/law-practice-use-cases`. It contains no
implementation bodies and no Layers: those come in P2. The P0 schema (`values/Question`,
`values/AnswerRow`, the `question` ReviewItem) is binding.

The contracts mirror the shipped review envelope (`src/ReviewQueue`, `src/VerdictProjector`), so a
reader of one can read the other.

## Concept `src/QuestionQueue/`

| File | Contents |
| --- | --- |
| `QuestionQueue.schemas.ts` | `RecordAnswerInput`: an `AnswerRow` without `revision` and `recordedAt`, which the queue assigns. It keeps the `state` cases and is built as a `LiteralKit` tagged union, like `AnswerRow`. `DigestSelection`: `{ today: LocalDate, items: ReadonlyArray<QuestionReviewItem> }`. `QuestionReviewItem` is the `question` member type. |
| `QuestionQueue.errors.ts` | `UnknownQuestionOptionError { itemId, optionId }`: a `decided` answer names no option of its item. `QuestionNotFoundError { itemId }`: an answer for an item not given. `AnswerLogError { operation: LiteralKit(["read", "append"]), cause }`, with the cause kept for diagnostics only through `internal/DefectCause.ts`. |
| `QuestionQueue.ports.ts` | The `AnswerLog` port: `append(row)`, `rows`. It is a store with no policy, like `VerdictLog`. The `QuestionQueue` service shape: `recordAnswer({ item, answer })`, which validates the `optionId` against `item.options`, assigns `revision` (max + 1 for the item) and `recordedAt` (the clock), and appends under one permit; `currentAnswers(items)`, a `HashMap` from item id to its latest row (greatest `recordedAt`, then append order); `digest({ today, items })`, the items with no answer, a `keep-reminding` answer, or a `pending-on-client` answer whose `resurfaceOn` is on or before today (`decided` and `withdrawn` are excluded); `readLog`. |

## Concept `src/QuestionWrites/`

| File | Contents |
| --- | --- |
| `QuestionWrites.schemas.ts` | `ProposedWrite { itemId, optionId, write: OptionWrite, answeredAt }`. `ProposedWriteBatch { batchId: NonEmptyString, proposals: NonEmptyArray<ProposedWrite> }`. `OperatorApproval { approvedBy: Principal, approvedAt: DateTimeUtcFromMillis }`. `AppliedWrite { proposal, eventId, prior: Option<CalendarPrior> }`, where `CalendarPrior` holds the event's date, title and category before the write, enough to restore it. `AppliedWriteBatch { batchId, approval, applied: NonEmptyArray<AppliedWrite> }`. |
| `QuestionWrites.errors.ts` | `QuestionWriteError { reason: LiteralKit(["calendar-unavailable", "event-not-found", "restore-failed"]), itemId?, cause? }`. |
| `QuestionWrites.ports.ts` | The `QuestionCalendar` port: `upsert({ key, write })` returns the `eventId` and the prior state, and `restore(applied)` puts the prior state back or deletes a created event. The key is `question:<itemId>:<optionId>`, so applying twice is idempotent. The `QuestionWrites` service shape: `propose({ items, rows })` is pure and deterministic, and turns each item whose current answer is `decided` with an option that names a write into one `ProposedWrite`; notes and other states never propose. `apply({ batch, approval })` applies each proposal through `QuestionCalendar` and returns an `AppliedWriteBatch` for the journal. `undo(applied)` restores each write in reverse order. |

## Rules

- Proposals need operator approval: `apply` takes an `OperatorApproval` and has no default
  approver.
- `propose` returns nothing (`Option.none`, or an empty result rather than a failure) when no
  answer implies a write.
- Every schema is a branded `S.Opaque` over an annotated struct, or a `LiteralKit` tagged union.
  Errors are `S.TaggedError` with a brand, as in the post-#1758 envelope files.
- Exports: add `./QuestionQueue` and `./QuestionWrites` subpaths, plus namespace exports in
  `src/server.ts`, matching `ReviewQueue` / `VerdictProjector`.

## Tests (P1)

There are no service bodies to test yet. Schema tests cover:
- `RecordAnswerInput` decodes every state;
- `ProposedWriteBatch` rejects an empty proposal list;
- `AppliedWrite` round-trips with and without `prior`;
- each error constructs with its fields.

## As built (2026-10-14)

- **`propose`** returns `ReadonlyArray<ProposedWrite>`, empty when no answer implies a write. A
  pure function has no source for a `batchId`, so the caller wraps the proposals in a
  `ProposedWriteBatch` before `apply`.
- **`QuestionCalendar.upsert`** returns `{ eventId, prior: Option<CalendarPrior> }` inline in the
  port shape.
- **`RecordAnswerInput`** reuses each `AnswerRow` case's own fields, without `state`, `revision`
  and `recordedAt`, so `resurfaceOn` keeps P0's day-checked date.
- **Dates.** `CalendarPrior.date` and `DigestSelection.today` use `LocalDateFromString`, which
  docket-intake also uses. `CalendarPrior.category` is docket-intake's `DocketCategory`.
- **Errors.** `AnswerLogError` carries `operation` and `cause`. `QuestionWriteError.itemId`
  defaults to none.
- **Tests.** `test/QuestionLoop.contract.test.ts` has 9 tests, including property round-trips for
  `RecordAnswerInput`, `ProposedWriteBatch` and `OperatorApproval`.

