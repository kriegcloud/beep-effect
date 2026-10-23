# P0 schema design

Status: design, 2026-10-14. This document is normative for P0. The P0 code lives only in
`@beep/law-practice-domain` `values/`. It follows the envelope conventions from
`review-verdict-envelope`, the repo's branded `S.Opaque` default for plain data, and `LiteralKit`
tagged unions.

## `values/Question/` (new concept)

| Schema | Shape | Rules |
| --- | --- | --- |
| `QuestionOptionId` | `S.NonEmptyString`, lowercase kebab-case (`^[a-z0-9]+(?:-[a-z0-9]+)*$`) | Stable within one question. Answer rows reference it. |
| `OptionWrite` | `LiteralKit(["calendar-date"]).toTaggedUnion("kind")`. `calendar-date`: `title` (`NonEmptyString`), `dueOn` (`LocalDate` from `@beep/schema/LocalDate`), `eventId` (`OptionFromOptionalKey(NonEmptyString)`, the provisional event to update; absent means create) | The write an option implies. It has one kind now, and the union leaves room for docket writes later. |
| `QuestionOption` | Opaque struct: `optionId`, `label` (`NonEmptyString`), `write` (`OptionFromOptionalKey(OptionWrite)`) | |
| `QuestionOptions` | `S.Array(QuestionOption)` | Checks: 2–5 options and unique `optionId`s. Each custom check has an `identifier`, `title` and `description`. |
| `QuestionFact` | Opaque struct: `text` (`NonEmptyString`), `sourceRefs` (`S.Array(SourceRef)`) | A fact the producer already checked against records. |

## `ReviewItem` gains `question`

- `ReviewItemKind` adds `"question"`.
- The `question` case is `{ ...ReviewItemFields, facts, options, docket, conversationId }`:
  - `text` is the question, in plain language;
  - `facts` is `S.Array(QuestionFact)`;
  - `options` is `QuestionOptions`;
  - `docket` is `OptionFromOptionalKey(NonEmptyString)`, defaulting to none;
  - `conversationId` is `OptionFromOptionalKey(NonEmptyString)`, the Graph mail thread, defaulting
    to none.
- The other six members are unchanged. The verdict projector ignores `question` items (it already
  projects `claim-finding` only).

## `values/AnswerRow/` (new concept)

- `AnswerState` = `LiteralKit(["decided", "pending-on-client", "keep-reminding", "withdrawn"])`.
- `AnswerRow` = `AnswerState.toTaggedUnion("state")`, piped through `S.toTaggedUnion("state")`.
- Every case carries the common fields:
  - `itemId` (`ReviewItemId`);
  - `revision` (`PosInt`, counting from 1 per item);
  - `recordedAt` (`S.DateTimeUtcFromMillis`);
  - `note` (`OptionFromOptionalKey(NonEmptyString)`, defaulting to none).
- Case fields:
  - `decided`: `optionId` (`QuestionOptionId`);
  - `pending-on-client`: `resurfaceOn` (`LocalDate`);
  - `keep-reminding`: none;
  - `withdrawn`: none.
- There is no `batchId` and no lock: an answer can always be revised by a later row.
- The current answer is the row with the greatest `recordedAt`. A tie goes to the row appended
  last, by the same rule as `VerdictRow`.
- That `optionId` names an option of the item is a cross-value rule. `QuestionQueue` enforces it in
  P1/P2 with a typed error; the row schema cannot.

## Tests (`packages/law-practice/domain/test/QuestionLoop.test.ts`)

- A `question` item decodes and round-trips with facts, three options (one with a
  `calendar-date` write), a docket and a `conversationId`.
- Rejected: one option, six options, duplicate `optionId`s, an `optionId` that is not
  kebab-case, and an unknown `OptionWrite` kind.
- `AnswerRow` decodes all four states. Each state requires its own field: `decided` without an
  `optionId` fails, and `pending-on-client` without `resurfaceOn` fails. An unknown state fails.
- Every new schema round-trips. Property round-trips are optional; if the options filters make
  `Arbitrary.schema` exhaust, use fixed examples instead.

## Out of scope for P0

Services, ports and errors (P1), the producer and the notice (P3), and the pane card (an
amendment).

## As built (2026-10-14)

- **Dates.** `dueOn` and `resurfaceOn` decode to `LocalDate` and encode as `"YYYY-MM-DD"` through
  `LocalDateFromString`. That is the format docket-intake and `DocketDeadline` already use. The
  domain's `CalendarDate` check (`src/values/CalendarDate/CalendarDate.model.ts`) also rejects days
  that do not exist in their month, such as February 30. The bare `LocalDate` class would encode as
  `{year, month, day}` and accept February 31.
- **Defaults.** `OptionWrite.eventId` and `QuestionOption.write` also default to none, like the
  envelope's other optional fields.
- **Naming.** The literal kit for write kinds is exported as `OptionWriteKind`, following
  `ReviewItemKind`.
- **Existing test.** `ReviewVerdict.test.ts` now expects seven kinds and builds `question` items
  with `facts` and `options`.

