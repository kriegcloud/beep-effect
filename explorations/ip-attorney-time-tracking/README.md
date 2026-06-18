# IP Attorney Time Tracking

## Status

Stage: `align`
Status: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Spark

Can a local-first Tauri + PGlite + Effect/TypeScript product help an IP
attorney capture billable and nonbillable time without becoming the billing
system of record? The central bet is that agents can observe activity and
draft candidate time entries, while the attorney keeps approval authority over
what becomes billable.

## Current Recommendation

Treat Beep as a **time-capture and prebill overlay**, not the accounting,
invoice, trust-accounting, or billing ledger. Build toward four layers:

1. L1 activity/event capture: local timers plus M365 mail/calendar/document
   signals when an M365 driver exists; optional PST/libpff history import.
2. L2 candidate time-entry inference: agent-generated candidates with evidence,
   matter hints, task codes, and draft narratives.
3. L3 approval/prebill workflow: attorney review gates using the existing
   CandidateTask / ApprovalGate / ContextPacket pattern.
4. L4 system-of-record export: push approved entries to a legal billing or
   practice-management system by API, CSV, or LEDES/e-billing formats where
   appropriate.

## Next Open Question

Is Beep a time-capture/prebill overlay, or should it become the billing/timekeeping
system of record?

## Read This First

1. [`ops/manifest.json`](./ops/manifest.json) - machine state: stage, status, open questions.
2. [`../ip-practice-rundown.html`](../ip-practice-rundown.html) - standalone two-tab lawyer-facing handout for time tracking + docketing.
3. [`CAPTURE.md`](./CAPTURE.md) - raw dump (stage 0).
4. [`RESEARCH.md`](./RESEARCH.md) - summary, recommendation, repo inventory, and constraints.
5. [`DECISIONS.md`](./DECISIONS.md) - recommendation log and unresolved human gate.
6. [`research/01-solo-small-firm-time-tracking.md`](./research/01-solo-small-firm-time-tracking.md) - small-firm legal time systems.
7. [`research/02-mid-large-enterprise-time-platforms.md`](./research/02-mid-large-enterprise-time-platforms.md) - mid/large-firm platforms.
8. [`research/03-agent-developer-integration-and-handroll.md`](./research/03-agent-developer-integration-and-handroll.md) - APIs, MCP, M365, and build/buy boundary.
9. [`BRIEF.md`](./BRIEF.md) - template stub only; not shaped.
10. [`MAP.md`](./MAP.md) - template stub only; not decomposed.

## Trail

- 2026-06-18: added this packet to the shared standalone [`ip-practice-rundown.html`](../ip-practice-rundown.html) handout for nontechnical lawyer review; packet remains at `align`.
- 2026-06-18: packet opened from live `beep-effect2`; scaffolded from the exploration template, researched the market and repo inventory, aligned to a prebill-overlay recommendation, and stopped at human review gate.
