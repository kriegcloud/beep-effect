# Capture

<!--
Stage 0. Append-only raw dump: thoughts, links, screenshots (drop files in
assets/ and reference them), half-sentences, contradictions. Nobody tidies
this file; cleaning it up destroys provenance. New material goes under a new
dated heading at the bottom.
-->

## 2026-06-18

Raw brief:

Create a new exploration packet for IP-attorney time tracking, modeled after
the existing docketing exploration if present, but do not implement product
code.

Packet slug: `ip-attorney-time-tracking`

Core question:

How should a local-first Tauri + PGlite + Effect/TypeScript product help an IP
attorney track billable/nonbillable time, especially when agents can observe
activity and propose time entries, but the attorney approves what becomes
billable?

Research priorities:

1. Developer/agent integration story: APIs, SDKs, webhooks, exports/imports,
   OAuth, MCP, M365/Graph integrations, local-first capture, approval gates.
2. Real market data on top time-tracking solutions for solo/small law firms,
   mid-sized firms, and large/enterprise firms.
3. IP-attorney-specific constraints: patent prosecution, trademark work,
   fixed-fee vs hourly, client/matter/task codes, LEDES/UTBMS, narrative
   quality, billing leakage, privacy, privilege, auditability.
4. Doctrine question: Is this a time-capture/prebill overlay, not the
   accounting/billing system of record?

Workflow instructions:

- Use `/explore`.
- Scaffold `explorations/ip-attorney-time-tracking/` from
  `explorations/_template/`.
- Add it to `explorations/ATLAS.md` Active.
- Fill this file with the raw brief under today's dated heading.
- Run research, then align to a recommendation, then stop at a human review
  gate.
- Leave `BRIEF.md` and `MAP.md` as template stubs if stopping before shape.
- Keep stage at `align`.
- Do not edit product code.
- Do not graduate.
- Do not shape/decompose/graduate unless explicitly asked.
- Preserve unrelated dirty, staged, untracked, or conflicted files.
- Keep work scoped to `explorations/ip-attorney-time-tracking/` plus
  `explorations/ATLAS.md`.

Research files requested:

- `research/01-solo-small-firm-time-tracking.md`
  - Clio, MyCase, PracticePanther, Smokeball, TimeSolv, Bill4Time, LeanLaw,
    Actionstep, CosmoLex, QuickBooks Time, Harvest/Toggl/Clockify if relevant.
  - Pricing, self-serve access, legal matter/client billing, timers, invoices,
    trust/accounting boundaries, exports, APIs.
- `research/02-mid-large-enterprise-time-platforms.md`
  - Intapp Time, Aderant Expert/Milana, Elite 3E, BigHand, iTimekeep,
    Centerbase, SurePoint/Coyote, Litify/Filevine if relevant.
  - Enterprise adoption, APIs/integrations, passive capture, prebill workflows,
    LEDES/e-billing, Microsoft 365/DMS integrations.
- `research/03-agent-developer-integration-and-handroll.md`
  - Rank by developer usefulness: public API docs, OAuth/API keys, webhooks,
    SDKs, export formats, MCP availability, sandbox access, rate limits.
  - Research whether any legal time-tracking vendor has MCP.
  - Identify what Beep can safely build: passive activity capture, local
    timers, M365 email/calendar/document signals, candidate time entries,
    narrative drafting, discrepancy detection.
  - Identify what not to own: final invoice/accounting ledger, trust
    accounting, client billing record, unless the user explicitly chooses that
    doctrine.

Market data instructions:

- Cite every external claim.
- Prefer primary vendor docs/pages, ABA Legal Technology Survey, Clio Legal
  Trends Report, ILTA sources, vendor customer/adoption pages, and accessible
  legal-tech market reports.
- Use G2/Capterra only as secondary signals.
- Define "top" explicitly: solo fit, market adoption, enterprise presence, API
  quality, or review/category ranking.
- Separate "best for attorney users" from "best for agents/developers."

In-repo inventory requested before declaring anything net-new:

- CandidateTask
- ApprovalGate
- ContextPacket
- EmailArtifact
- M365 driver or M365 goal packets
- law-practice domain entities
- DateTime schemas/codecs
- libpff/PST/Outlook ingest
- NLP/date/entity extraction
- timer/time/billing models

Mark gaps as NOT FOUND.

Likely recommendation shape to test, not assume:

- L1 activity/event capture: M365 mail/calendar/docs via the local M365 driver
  if present, local app activity/manual timers, optional PST/libpff history.
- L2 time-entry inference/narrative: build as candidate generation, not
  authority.
- L3 approval/prebill workflow: build with CandidateTask / ApprovalGate if
  present.
- L4 system of record/export: buy or integrate with legal billing /
  practice-management system; export approved entries via API/CSV/LEDES as
  appropriate.

Expected review-gate questions:

1. Is Beep a time-capture overlay/prebill assistant, or should it become the
   billing/timekeeping system of record?
2. First segment: Tom solo IP practice first, or compare solo/mid/enterprise
   from day one?
3. First slice: M365 email/calendar/doc activity to candidate time entry, or
   manual timer plus narrative assistant?
4. Which vendor integration should be evaluated first: Clio/LeanLaw/TimeSolv/
   Bill4Time for small firm, or Intapp/Aderant/Elite for enterprise?
5. Privacy boundary: what passive capture is acceptable, and what must require
   explicit user start/stop or review?

Deliverables requested:

- `explorations/ip-attorney-time-tracking/README.md`
- `CAPTURE.md`
- `RESEARCH.md`
- `DECISIONS.md`
- `research/01-solo-small-firm-time-tracking.md`
- `research/02-mid-large-enterprise-time-platforms.md`
- `research/03-agent-developer-integration-and-handroll.md`
- `ops/manifest.json` with stage `align`, status `active`, and review-gate
  `openQuestions`
- `explorations/ATLAS.md` updated
- Optional: `rundown.html` pure HTML/CSS/JS visualization

Closeout:

- Append a dated Trail line to the packet README.
- Keep stage at `align`.
- Do not edit product code.
- Do not graduate.
- Report a short summary and remaining review-gate questions.
