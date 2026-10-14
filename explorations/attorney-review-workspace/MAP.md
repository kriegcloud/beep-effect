# Map

<!--
Stage 4. Decomposition into candidate goal packets. This is the graduation
surface: the definition-of-ready in explorations/README.md is checked against
this file. Every major component cites an existing repo capability or is
explicitly marked NET-NEW.
-->

## Candidate Goal Packets

| Slug | Mission | Depends on | Capabilities cited |
| --- | --- | --- | --- |
| `review-verdict-envelope` (promised now) | One cross-producer review envelope: `ReviewItem` / `SourceRef` / `VerdictRow` schema, `ReviewQueue` + `VerdictProjector` services (claim findings → `ClaimDisposition`), and the S1–S8 spike set that gates the pane | none (spikes need non-client test files and operator access to the attorney PC) | `@beep/law-practice-domain` (values/ beside `PatentDocument/`), `@beep/epistemic-domain` `ClaimDisposition`, `@beep/law-practice-use-cases` service pattern (`PatentClaimCandidate`); schema itself NET-NEW |
| Amendment → `goals/practice-claude-mod` (owner applies) | Review-queue phase: `/review` pane, band count, Right/Wrong/Note with undo and lock writing `VerdictRow` (D8 path), Box passages via `$.mcp.call`, "Open in Box", "Ask about this" via `$.prompt.fill`; D9 widened to Box read tools + `$.prompt.fill` | `review-verdict-envelope` P1 schema; spikes S1 + S3 pass | `practice-claude-mod` D6–D10 (plugin skeleton, delivery, verdict JSONL, app-local schema) |
| Gated: `drawing-review-pins` | Artifact `customAnchors` pins for drawing markup | Gate: S7 passes **and** the attorney keeps sending flattened markup the T2 matcher cannot read | artifact `comments` + `db` capabilities (RESEARCH §Surface capabilities) |
| Gated: `draft-review-in-word` | Drafts reviewed in Claude for Word, not the queue | Gate: the one-hour Word check shows practice-kg or Box reachable from its sidebar | NET-NEW (external product) |
| Gated: mod side chat | `$.model.fork` side conversation with a saved record | Gate: the attorney asks for saved side answers | `practice-claude-mod` engine |

## Sequencing

1. `review-verdict-envelope` P0. Ask the attorney the one-app question, then run the spikes:
   - S1 and S3 first (go/no-go);
   - then S2, S4, S6 and S8;
   - the Word check at any point.
2. `review-verdict-envelope` P1 schema and P2 services + projector. Spike S5, the verdict round
   trip, is the verify.
3. Deliver the amendment to the `practice-claude-mod` owner. It is written once S1 and S3 pass, or
   rewritten as the row-only fallback if S1 fails.
4. claim-element-graph's first goal emits `claim-finding` ReviewItems instead of standalone tool
   output.

## First Vertical Slice

One `claim-finding` ReviewItem fixture travels end to end in tests:
1. it is decoded;
2. it is queued;
3. a `wrong` verdict with a note is written to the append-only log;
4. it is undone, which creates a superseding revision;
5. it is re-judged `right`;
6. the log is locked;
7. it is projected to a `ClaimDisposition` with `status: active`.

On the attorney's PC, a throwaway sample mod (not the firm plugin) proves the pane renders in the
Desktop Code tab, and that a Box test file's passage arrives through `$.mcp.call`.

## Open Risks Inherited From The Brief

- Windows Desktop pane placement and painting are unproven (S1 is the go/no-go).
- The Box connector from a mod is unproven (S3).
- Desktop page images depend on an Svg path (S2).
- Selection inside a pane may be unavailable (S4).
- The early-access mod API may drift; pin the version.
- `$.store` races and the 100,000-character tree cap.
- Spikes on the attorney's PC need operator access and non-client files.

## Re-entry 2026-10-14: the attorney question loop

### Candidate Goal Packets

| Slug | Mission | Depends on | Capabilities cited |
| --- | --- | --- | --- |
| `attorney-question-loop` (promised now) | Ask the attorney through the review queue. A `question` ReviewItem kind (facts, sources, options, and the matter and thread it belongs to). An append-only `AnswerRow` (decided with an option, pending on client with a resurface date, keep reminding, withdrawn; optional note). A `QuestionQueue` that selects the daily digest. A write-proposal batch: decided answers become proposed calendar or docket changes that the operator approves and the docket-intake calendar adapter applies, journaled and reversible. A daily digest job that emails a notice only. docket-intake is the first producer: it raises a question only for open items that records cannot settle. | `review-verdict-envelope` (#1761) merged | `ReviewItem` envelope (#1761); docket-intake Graph mailbox, calendar adapter, journal and undo; m365 outbox send; practice-services timers. Question schema, answer states, digest selection and the proposal batch are NET-NEW (RESEARCH, re-entry section). |
| Amendment → `goals/practice-claude-mod` (owner applies) | A question card in the `/review` pane: facts and sources, one button per option, "Pending on client" with a date, "Keep reminding", and a note. It writes `AnswerRow`s. The band count includes open questions. | `attorney-question-loop` schema; the P1b queue gate | `practice-claude-mod` P1b (D15, D16, D22) |
| Gated: `question-email-replies` | Interpret a free-text email reply in a tracked thread (`conversationId`) as a needs-review answer proposal, using headless `claude -p` with practice-kg-mcp. | Gate: in the first two weeks, the attorney replies by email to a digest or notice instead of using the queue at least 3 times. | docket-intake `conversationId`; practice-kg-mcp; CLIProxyAPI |
| Gated: `question-auto-apply` | Per-question auto-apply for structured answers. | Gate: 20 consecutive operator-approved write batches applied without edits. | the proposal batch from `attorney-question-loop` |

### Sequencing

1. `attorney-question-loop` P0 schema: the `question` kind and `AnswerRow`, beside the envelope.
2. Its services: `QuestionQueue`, digest selection and the proposal batch. Tests run over
   synthetic questions only.
3. docket-intake raises questions for unsettled items, and the digest job runs as a practice
   service.
4. The amendment goes to the `practice-claude-mod` owner. The card ships with their P1b queue.

### First Vertical Slice

One synthetic question travels end to end in tests:
1. A producer raises it with two date options.
2. The digest selects it.
3. The attorney answers "pending on client" with a resurface date; the digest skips it until that
   date, then selects it again.
4. He answers with an option. That yields one proposed calendar change.
5. The operator approves the batch. It applies through a test calendar adapter, journaled.
6. Undo restores the prior state.

### Open Risks

- Notices send as the attorney mailbox, so the digest goes from his own address to himself.
  Confirm that he accepts this, or route the notice through the operator.
- The queue card depends on the gated P1b review queue. Until it ships, questions have no surface
  except the digest.
- Answers that are notes, not decisions, must never produce a write.
