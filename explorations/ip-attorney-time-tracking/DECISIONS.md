# Decisions

<!--
Stage 2. The grilling log. One entry per resolved branch-closing question,
newest last. Unresolved questions live in ops/manifest.json `openQuestions`
until they land here. Deferred questions get an entry too, marked DEFERRED
with the reason.
-->

## 2026-06-18 - Recommendation for human review gate

**Question:** What recommendation should this packet carry into the first human
review gate?

**Answer:** RECOMMENDED, not accepted yet: treat Beep as a local-first
time-capture and prebill overlay, not the billing/accounting system of record.
Agents may propose candidate entries and narratives, but attorney approval is
required before anything becomes billable or exportable.

**Rationale:** The live repo already has CandidateTask, ApprovalGate,
ContextPacket, EmailArtifact, law-practice entities, PGlite, libpff/PST, and
NLP foundations. The repo does not currently have time-entry, billing-ledger,
trust-accounting, invoice, LEDES, UTBMS, or M365 driver models. The market
already contains mature billing/accounting systems with timers, invoices,
trust/accounting boundaries, prebill review, and enterprise compliance layers.
The lowest-risk wedge is therefore capture, inference, narrative drafting,
discrepancy detection, and approval-gated export.

**Human gate:** This is deliberately unresolved until the user answers the
open questions in `ops/manifest.json`.
