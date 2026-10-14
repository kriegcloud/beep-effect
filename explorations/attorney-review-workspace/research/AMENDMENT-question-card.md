# Amendment proposal for `goals/practice-claude-mod`: question card in the review queue

From: [`attorney-review-workspace`](../README.md), question-loop re-entry, 2026-10-14.
To: the `practice-claude-mod` owner, who applies it in their own packet
([handoff ruling](../DECISIONS.md)). This exploration does not edit that packet.

## Why

Agents need decisions and facts from the attorney. Email gets late or missed replies, while a
structured page got every answer in one sitting ([CAPTURE](../CAPTURE.md), re-entry section). The
operator ruled that questions appear in the same review queue as every other item, and that email
is only a notice ([DECISIONS](../DECISIONS.md), re-entry align and shape review). The schema and
the services come from `goals/attorney-question-loop`.

## What changes in `practice-claude-mod`

### 1. The P1b review queue renders `question` items

A `question` `ReviewItem` shows:
- the question in plain language;
- the facts already checked, each with its source (a highlighted passage, or "Open in Box", as
  for other items);
- one button per option;
- **Pending on client**, with a date picker for when to ask again;
- **Keep reminding**;
- a note field and undo, as for verdicts.

Each action writes one `AnswerRow` from `@beep/law-practice-domain` (import the domain subpath
only):

| State | Fields |
| --- | --- |
| `decided` | `optionId` |
| `pending-on-client` | `resurfaceOn` |
| `keep-reminding` | — |
| `withdrawn` | — |

Every row also carries `itemId`, `revision`, `recordedAt` and an optional `note`. Undo appends a
superseding row, the same as for verdicts.

### 2. The band count includes questions

"N to review" counts open questions too: no answer yet, `keep-reminding`, or `pending-on-client`
with a `resurfaceOn` on or before today. Use `QuestionQueue`'s digest selection rather than a
local rule, so the band and the daily notice agree.

### 3. No writes from the pane

Choosing an option records the answer and nothing more. Calendar and docket changes go through
the operator-approved batch in `goals/attorney-question-loop`.

## Entry gate

The P1b review queue is live, and the `attorney-question-loop` schema (the `question` kind and
`AnswerRow`) is merged.
