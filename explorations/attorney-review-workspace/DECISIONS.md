# Decisions

<!--
Stage 2. The grilling log. One entry per resolved branch-closing question,
newest last. Unresolved questions live in ops/manifest.json `openQuestions`
until they land here. Deferred questions get an entry too, marked DEFERRED
with the reason.
-->

## 2026-10-14 — framing

**Question:** Should attorney review be a feature-rich annotation workspace, or a queue?

**Answer:** Queue-first.
- Agents evaluate first; only unresolved items reach the attorney, one at a time.
- Each item shows a plain answer, one highlighted source passage, Right / Wrong / Note with undo,
  and "Open in Box".
- Annotation or pins are added only where an item type needs them.

**Rationale:**
- Every failed attempt spread across several apps or used a long deck (R1).
- Ruling S15 retired the sitting app in favour of agents evaluating and the attorney seeing
  unresolved items only (R2).
- Identification review is capped at about 20 hard cases.

The capture's list (annotation, highlighting, inline chat, side chat, tiling) is kept only where
evidence supports each item. Rejected: a full annotation workspace as the core, which repeats the
confusing pattern, and a queue now with the workspace as a named follow-on.

## 2026-10-14 — home

**Question:** Where does the review workspace live in the code?

**Answer:** As a phase of `practice-claude-mod`: one plugin and one release path. It reuses the
verdict rows (D8), the matter band, and the Windows proof path.

**Rationale:** Splitting would give the attorney two installs and the team two release paths;
`practice-claude-mod` D12 already argued against splitting. Rejected: a sibling goal shipping into
the same plugin (two packets coordinating one codebase), and a separate app (the multi-app problem).

## 2026-10-14 — verdict-envelope

**Question:** Where does the canonical attorney verdict live, given that `practice-claude-mod` D8
uses local JSONL and `claim-element-graph` chose `ClaimDisposition`?

**Answer:** One append-only `VerdictRow` log on the attorney's PC, with undo and a lock, is the write
path. A projector maps claim-finding verdicts into `ClaimDisposition`:
- `right` → `active`
- `wrong` → `rejected` with the note as the reason

The `ReviewItem` / `VerdictRow` schema is promoted out of the app when the projector lands
(practice-claude-mod D10's second-consumer rule).

**Rationale:** This keeps D8's local write path and D10's app-local schema, honours
claim-element-graph's verdict-storage decision, and gives every producer one envelope. Rejected:
writing `ClaimDisposition` directly from the mod (a write path from the attorney's PC into
epistemic tables), and JSONL only (would reverse claim-element-graph).

## 2026-10-14 — ask-the-attorney-first

**Question:** Should we ask the attorney which app he lives in day to day before the Windows pane
spike?

**Answer:** Yes, with one plain-language question: Outlook, Word, Claude Code, or the Claude desktop
app?

**Rationale:** If the Code tab is not his daily home, a pane there is still a new place for him, and
the Outlook-category verdict pattern from docket intake would need weighing. Rejected: assuming the
Code tab.

## 2026-10-14 — mod-envelope-widening

**Question:** How far does `practice-claude-mod` D9 widen for the review phase?

**Answer:** Add `$.mcp.call` on the Box connector's read tools (`get_file_content`,
`get_preview_page`) and add `$.prompt.fill`, which drafts text into the attorney's prompt for him to
send. Excluded in this phase: Box writes, `$.prompt.submit`, and `$.model.*`.

**Rationale:** `$.mcp.call` raises no permission prompt, so writes stay out. Drafting into the
prompt keeps the attorney as the one who sends. Rejected: `$.prompt.submit` and `$.model.fork`
(turns attributed to the plugin, spending usage without his explicit send), and no widening (no
Box passages in the pane).

## 2026-10-14 — source-rendering

**Question:** How does a Box source show in a review item by default?

**Answer:** As the extracted passage with the key words highlighted (`Text` spans with a background
color, verified to validate on both surfaces). The item labels the location, for example "page 3,
lines 12–18". "Open in Box" opens the full document in the desktop's Browser pane. Page images are
shown only if spike S2 proves an Svg-wrapped PNG paints on the desktop.

**Operator question answered — can "Open in Box" scroll to exact lines?** No.
- The Box web app documents no URL parameter for a page, line or text search.
- The Box Content Preview library supports `fileOptions[FILE_ID].startAt: { unit: "pages", value }`
  (page or seconds only; github.com/box/box-content-preview README), but that needs an embedded
  preview with a Box token. The UI Element guide does not even list the option
  (developer.box.com/guides/embed/ui-elements/preview).
- No option searches or highlights text when a file opens.

Line-exact positioning therefore exists only in our own pane. A page-level jump is added as spike
S8: open a PDF copy in the Browser pane with `#page=N`, which Chromium's PDF viewer supports.

**Rationale:** Exact lines in the pane plus a whole-document escape hatch satisfy R4 without a Box
token in any page. Rejected: page images by default (an unverified paint path, and large).

## 2026-10-14 — side-chat

**Question:** How does side chat about an item work?

**Answer:** Through the desktop's built-in side chat (Ctrl+;), which reads the main thread. A
mod-owned side chat (`$.model.fork`) is added only if the attorney wants a saved record.

**Rationale:** The built-in costs nothing to build. `$.model.fork` is one-shot and has no tools.
Rejected: a mod side chat now.

## 2026-10-14 — drawings

**Question:** How are drawings reviewed?

**Answer:** As whole-sheet verdicts (Right / Wrong plus a note per sheet) in the same queue.
Artifact pins (spike S7) are tried only if he keeps sending flattened markup the coverage matcher
cannot read.

**Rationale:** One surface (R1). Artifact comments need the organization comment model and a session
watching with auto-replies armed. Rejected: artifact pins now.

## 2026-10-14 — draft-text-surface

**Question:** Where does the attorney review draft text: specification paragraphs, claim
amendments, office-action responses?

**Answer:** One surface per work-product type, never two. First, a one-hour check of whether Claude
for Word (generally available, with tracked changes and comment-thread replies) can reach
practice-kg or Box from its sidebar:
- if it can, drafts go to Word, and only Word;
- if it cannot, drafts go through the mod queue as passages with verdicts.

**Rationale:** Word is a lawyer's natural home for drafts, but a surface that cannot see the firm's
knowledge would split the work. Rejected: the mod queue only (awkward for long text, no tracked
changes) and Word only without the check.

## 2026-10-14 — no-box-writes

**Question:** Should review ever write comments back into Box?

**Answer:** No. Verdicts and notes stay in `VerdictRow`.

**Rationale:** Box connector comments are whole-file, capped at 1,000 characters, unanchored, and
visible to every collaborator, and `$.mcp.call` raises no permission prompt. Rejected: mirroring
notes into Box behind a confirmation.

## 2026-10-14 — handoff

**Question:** `practice-claude-mod` belongs to another active session (PR #1711 at the gate, with
ModEngine work under way). How does this exploration hand off?

**Answer:** Two outputs:
- One new goal, `review-verdict-envelope`: the `ReviewItem` / `VerdictRow` schema, the projector to
  `ClaimDisposition`, and the spike set.
- A written amendment for the `practice-claude-mod` owner to apply in their own packet: the
  review-queue phase and the D9 widening.

Neither session edits the other's packet.

**Rationale:** Existing owners keep execution scope, the same pattern as research-corpus-synthesis.
The envelope is cross-producer domain schema that should not wait inside a goal that is
mid-implementation. Rejected: folding everything into `practice-claude-mod` (it loads a goal that is
mid-implementation), and building the pane from this session (two sessions editing one app).

## 2026-10-14 — shape-review

**Question:** Do `BRIEF.md` and `MAP.md` match the operator's picture?

**Answer:** Yes. The plan is a queue-first review phase in `practice-claude-mod`, applied by its
owner from a written amendment, plus one new goal, `review-verdict-envelope` (schema, projector,
spikes S1–S8). Drawing pins, draft review in Word, and a mod side chat stay as gated re-entry
points.

**Rationale:** Accepted as shaped. claim-element-graph's brief was updated in the same round to
route its findings through this queue.

## 2026-10-14 — re-entry align: the attorney question loop

The packet was re-entered at `decompose` for the question loop (CAPTURE, re-entry section). One
round of four questions; the operator took the recommended answer each time.

**Question:** Where does the question → answer → apply loop live?
**Answer:** It reopens this exploration. A question is a new `ReviewItem` kind on the shared
envelope, and the attorney sees it in the same `practice-claude-mod` review queue.
**Rationale:** This keeps one review surface for every producer. Rejected: a separate exploration,
which would duplicate the envelope and the queue; and folding it into docket-intake, which is only
the first producer.

**Question:** Where does the attorney answer?
**Answer:** On a card in the Claude review queue. Email is only a notice that questions are waiting.
**Rationale:** It matches the operator's direction of moving the attorney into Claude, and structured
answers beat parsed email (6 of 6 answered against no replies). Rejected: a standalone answer page,
which is one more app and the transient-server failure; and parsing email replies, which interprets
free text and was missed in practice.

**Question:** Who approves the writes an answer implies (calendar, docket, Box)?
**Answer:** The operator approves each write batch. Writes are guarded, journaled with prior state,
and reversible.
**Rationale:** This is the policy that worked on 2026-10-14. Per-question or automatic apply waits
for a track record. Rejected for now: per-question policy, and auto-applying structured answers.

**Question:** How do open questions keep reminding him?
**Answer:** A daily digest. A "pending on client" answer comes back on a date he sets for that
question.
**Rationale:** One predictable touch a day. The resurface date handles the most common non-decision
answer. Rejected: per-question cadence, which is noisy and harder to explain; and a weekly digest,
which is too slow for docket dates.

## 2026-10-14 — re-entry shape review: the attorney question loop

**Question:** Do the re-entry sections of `BRIEF.md` and `MAP.md` match the operator's picture?
**Answer:** Yes. Graduate one goal, `attorney-question-loop`, and write a pane-card amendment for
the `practice-claude-mod` owner. Email-reply parsing and auto-apply stay gated.
**Rationale:** Accepted as shaped.

**Question:** Which mailbox sends the daily notice?
**Answer:** The attorney's own mailbox, to himself, through the existing m365 outbox.
**Rationale:** It needs no new grant or send route. Rejected: sending from the operator's mailbox,
which needs a server-side send route because the claude.ai connector cannot run from a timer; and
sending no email, because the operator wants email as the notice.

**Question:** Should answers get their own row type, or widen `VerdictRow`?
**Answer:** A separate `AnswerRow` beside `VerdictRow`, with the same recency rule and append-only
discipline.
**Rationale:** Answers are not right or wrong judgements. A separate row keeps `VerdictProjector`
and claim dispositions untouched. Rejected: widening `VerdictRow`, which would make every verdict
consumer handle answer states.
