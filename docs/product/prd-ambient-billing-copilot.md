# Ambient Billing Copilot — Product Requirements Document

**Project codename:** TBD (working name: "Sidecar")
**Status:** Draft v0.1 (in active design)
**Target launch:** July 2026, paired with the firm's go-live
**Document owner:** Elpresidank (developer/in-house IT)
**Primary user:** Solo IP attorney (founder, billing at $700/hour)
**Last updated:** May 20, 2026

---

## 1. Executive Summary

Sidecar is an **ambient billing copilot** for a solo intellectual property attorney. It runs as a desktop daemon that continuously observes the attorney's work activity (active documents, email threads, browser tabs, calendar events), intelligently associates that activity with the correct client/matter using a federated knowledge graph, presents a small Liquid Glass picture-in-picture overlay for quick corrections and commands, and pushes finalized time entries to whichever billing system the firm adopts.

The product exists because the attorney's current time-tracking software at his outgoing firm has no streamlined way to switch billing context between clients. At $700/hour, every uncaptured minute is $11.67 of lost revenue. Existing legal time-tracking tools (Toggl, Clockify, Timely, Memtime, Clio's native timer) all require the user to manually start/stop or accept generic ML attribution; none leverages a domain-specific knowledge graph of the attorney's actual book of business. Sidecar's unfair advantage is the IP Law Ontology and entity-resolution work already underway in the developer's beep-effect / TodoX projects, which can reliably resolve "an email from `mueller-partners.de` mentioning app `17/123,456`" to "Acme Corp matter M-2025-014" — something no off-the-shelf tracker can do.

## 2. Background and Context

### 2.1 Current pain (from primary user interviews)

> *"The time tracking software used for billing purposes does not have a very ergonomic or streamlined way to switch billing between clients. When you are charging $700 an hour as he does every minute counts. He said he wished there was some sort of time tracking software that integrated with billing that had some sort of picture in picture / voice interface to quickly change what clients are being billed. He also noted that if it was some hybrid 'human in the loop' / Microsoft Word / Outlook extension that had visibility into what client is currently being worked on that he would kill for such a piece of software."*

### 2.2 Relationship to other firm systems

Sidecar is **one component** of the firm's overall IT footprint going live in July 2026, alongside:

- **DMS:** Per a separate research effort, recommended path is iManage Cloud (with custom MCP/AI extension layer) or Box Business (with custom Tauri shell). Sidecar consumes matter and document metadata from the chosen DMS.
- **Docketing:** AppColl (most likely) — Sidecar reads docket deadlines and matter status as additional attribution signal.
- **CRM:** HubSpot (existing) — Sidecar reads client/contact metadata for entity resolution; optionally writes deal-stage updates on invoice payment.
- **Knowledge graph:** Federated read-replica from the developer's beep-effect / IP Law Ontology graph (FalkorDB).
- **Billing system:** TBD (see §3.1, R5).

### 2.3 Scope decisions deferred

The following are explicitly **out of v1 scope**. Each is a Phase 2 decision:

- IOLTA / trust accounting (covered by QuickBooks + LawPay TrustBooks or a separate Clio Trust seat)
- LEDES e-billing (only required if a corporate client demands it)
- Multi-currency, multi-tax-jurisdiction
- Conflict checking (lives in the DMS layer)
- 1099 reporting
- Microphone-based ambient detection (deferred to v2 as push-to-talk only)

## 3. Functional Requirements

Each requirement is tagged `R##` and traces back to the design conversation that produced it.

### 3.1 Time entry lifecycle

**R1.** The primary editing UI is a **calendar-style view** with user-selectable interval presets: 1 day, 1 week, 1 month, 1 year, plus custom date ranges.

**R2.** The user can perform precise per-entry edits inside the calendar: drag to resize a time block, click to edit attribution and narrative, split/merge adjacent blocks, mark non-billable.

**R3.** Time entries have a **six-state lifecycle**:

| State | Definition |
|---|---|
| `captured` | The daemon observed activity in a time window. Raw data, not yet a billable entry. |
| `attributed` | The system identified the activity as belonging to a specific client/matter with a confidence tier (see R20). |
| `billable` | The attorney explicitly reviewed and approved the attribution and narrative. |
| `non_billable` | The attorney reviewed and marked the block as admin / CLE / pro bono / personal / idle. |
| `billed` | The block has been included on an invoice that has been sent. |
| `paid` | The invoice including this block has been marked paid. |

The data model expresses all six states; the UI surfaces them as appropriate to context.

**R4.** Configurable per-client **billing cycles** independent of any global cycle. A client may be billed weekly, bi-weekly, monthly, on retainer draw schedule, or ad-hoc.

### 3.2 Two parallel lifecycles

**R8.** The system runs a **monthly self-review/reconciliation lifecycle** independent of per-client billing cycles. At month-end, the attorney is prompted to:
- Review all time entries captured during the month
- Confirm totals match expectations (target billable hours, anomalies)
- Explicitly finalize the month

Once a month is finalized, all entries for that month become **read-only**.

**R9.** Per-client billing cycles operate independently of month close. A bi-weekly client gets invoices on the 15th and last day; a monthly client gets invoices on the 1st of the following month; a retainer client gets draws applied per their schedule. None of these are coupled to monthly self-review.

**Two state machines run in parallel:**

- **Time entry lifecycle:** `captured → attributed → (billable | non_billable) → month_closed → billed → paid`
- **Invoice lifecycle:** `draft → reviewed → sent → (paid | overdue | written_off)`

A time entry can validly be `month_closed` but `unbilled` — e.g., October entries finalized on Nov 1 but included on a November 15 invoice for a bi-weekly client. The data model expresses this directly.

**R11.** **Approval cadence: daily soft + monthly hard-ish.**
- Daily review is prompted at end of day but not blocking. Unreviewed blocks persist as "pending."
- The system surfaces aging pending blocks ("3 days of unreviewed time, 4.1 hours on Acme") but does not block new capture.
- Monthly close is required to finalize a month: the attorney cannot finalize a month with unreviewed blocks. He can approve, mark non-billable, or explicitly defer with a note.

### 3.3 Capture and consolidation

**R10.** The system **intelligently associates and chunks** noisy raw observations into clean, human-meaningful time blocks at the wall-clock granularity an attorney would actually bill in. Fragmented micro-activity that semantically belongs to a single work session presents as one block, not many.

**Consolidation algorithm:**

1. **Raw observation stream** — Daemon emits a timestamped event on active-window/file-path/URL change, plus heartbeats every 30 seconds. Append-only.
2. **Attribution-first segmentation** — Each observation gets attributed via the confidence-fusion logic to a `(client, matter)` tuple, or to `unattributed` / `non_billable` / `idle`.
3. **Greedy merge by attribution** — Adjacent observations with the same attribution merge into one block, even across apps. `Word in Acme folder → Outlook reading Acme email → USPTO PatentCenter for Acme app → back to Word` is **one** Acme block.
4. **Tolerate brief context switches** — An interruption that returns to the original matter within 3 minutes doesn't break the block; it becomes an annotation.
5. **Hard split on real context switches** — Leaving the original matter for >3 minutes ends the block; the interrupting activity starts its own.
6. **Idle handling** — Idle ≤5min rolls into the surrounding block. Idle >5min ends the block; the idle gap survives as its own record (subject to bathroom-break-vs-thinking review).
7. **Round at billing time, not capture time** — Internal storage is second-precision. Rounding to 0.1hr increments happens only at invoice generation or month close.
8. **Minimum billable block: 0.1hr (6 minutes).** Shorter same-matter activity merges into adjacent blocks or accumulates into a daily "micro-tasks" bucket for review.
9. **Maximum block: 90 minutes** without a refresh signal. The system silently re-validates attribution after 90 minutes of continuous activity.
10. **Sleep/lockscreen always ends the current block.** Block end time = lockscreen activation time, not return time.

**Important non-feature:** the system never silently *deletes* captured time, and it never *invents* time. "Intelligently associate" means **smart consolidation** (Reading 1 from the design conversation), not **billing smoothing** (Reading 2, which would be bill padding and is sanctionable).

### 3.4 Attribution inference

**R20.** Attribution uses **ranked-confidence fusion** across multiple signal sources, resolving to one of three tiers:

| Tier | Confidence | System behavior |
|---|---|---|
| Tier 1 | ≥ 0.9 | Auto-attribute. Show passive indicator in PiP. No interruption. One-click correction available. |
| Tier 2 | 0.6 – 0.9 | Soft-prompt via PiP: top 2–3 candidate matter chips appear, one quiet sound, no modal. Ignorable. |
| Tier 3 | < 0.6 | Hold in unattributed buffer. No interruption. Review at day end or month close. |

**Signal sources (v1, ranked by reliability):**

1. Active document path / filename in Word, Excel, PDF
2. Active Outlook email metadata (To/From/CC, subject, conversation ID)
3. Active browser tab URL (USPTO Patent Center, EPO Espacenet, Google Patents, etc.)
4. Calendar event in progress
5. Active window title + process name (universal fallback)
6. Recent file activity / git activity (transactional drafting context)
7. Docketing system state from AppColl (browser extension picks it up while AppColl is active)
8. **Microphone — explicitly out of v1.** Push-to-talk only in v2.
9. Explicit user input via PiP voice/hotkey

The **knowledge graph (§3.7)** is the engine of fusion. The graph already knows the firm's clients, matters, application numbers, contacts, foreign associates. Three weak signals (email domain, app number string, Word doc folder) collapse into one strong inference because they all point at the same graph entity.

### 3.5 Manual capture (foreground flag)

**R21.** The capture model is **continuous capture + optional explicit foreground flag** (Model C).

- Continuous capture is the default. The daemon runs in the background; everything captured.
- An optional explicit "I am now working" flag (hotkey or PiP) is available for situations where ambient signal is unreliable: phone calls without a screen, in-person meetings, deep thinking without a document open, court appearances, depositions.
- The manual block accepts attribution (defaults to the most recent active matter), a narrative, and a stopwatch that ends when the attorney ends it.

### 3.6 PiP overlay

**R7 / R16.** The picture-in-picture overlay is a thin command surface, **not** a mini-dashboard. It uses native platform "Liquid Glass" materials.

**Visual states:**

1. **Ambient (default).** Compact pill ~200×40px, draggable to any screen corner, semi-transparent until hovered. Shows:
   - 6px solid colored dot (Tier 1 green / Tier 2 yellow / Tier 3 grey / paused red) — the only solid element; everything else uses vibrancy material.
   - Current attributed client/matter as short text (e.g., `● Acme / OA Response`).
   - Small timer with current block's elapsed time.

2. **Expanded (on hover, hotkey, or Tier 2 prompt).** ~320×200px. Shows:
   - Current block summary.
   - 3–5 most-recent matters as quick-select chips.
   - Non-billable toggle.
   - Day's running total.
   - Single action button: "end block & describe."

3. **Voice-active (v2 only).** Pulsing pill with live transcription.

**Input modalities (v1):**

1. **Global hotkey** (default `Cmd+Shift+B`) — primary path. Toggles expanded/collapsed and grabs keyboard focus. Arrow keys + Enter select matter chips. Esc collapses.
2. **Click** on a matter chip in expanded state — reattributes the current block.
3. **Right-click** on ambient pill — quick menu: Pause 15min / Pause until resumed / Mark current block non-billable / Open day review / Quit daemon.
4. **Voice** — v2 only. Push-to-talk via a second hotkey; intent recognition over knowledge graph entities.

**Command vocabulary (v1):**

- Reattribute current block to matter X
- Mark current block non-billable (with optional category)
- Pause capture (15min / until resumed / rest of day)
- End current block manually and start a new one
- Open day-review modal
- Start a manual block (for phone calls, in-person meetings, deep thinking)

**Deliberately not on PiP:** time totals beyond running day total, invoice review, billing-cycle management, knowledge graph queries, matter search, dashboards, charts, alerts unrelated to Tier 2 prompts.

**Tier 2 surfacing rule:** Tier 2 prompts surface *through* the PiP pill (color change + chips appear directly under the pill + one quiet sound), **not** as a separate notification or modal. Modal interruptions break flow and are prohibited.

**Liquid Glass material specifications:**

- macOS: `NSVisualEffectView` with `HUDWindow` material for ambient state; `Popover` or `Sidebar` material for expanded state. Never `Window` material (too opaque).
- Windows: Mica or Acrylic (platform-equivalent).
- Continuous (squircle) corner radius: 16–20px ambient, 20–24px expanded.
- Typography: SF Pro (macOS) / Segoe UI Variable (Windows). `.semibold` for matter name, `.regular` for timer.
- Vibrancy-aware label colors (`secondaryLabelColor` / `tertiaryLabelColor`) so text reads on any background.
- Subtle drop shadows (1–2px, low opacity). Liquid Glass material does the visual separation, not shadow.
- Spring animations on expand/collapse — never linear ease, never instant snap.
- **Respect Reduce Transparency accessibility setting.** Fall back to high-contrast solid version automatically.

### 3.7 Knowledge graph (federated)

**R30.** The system uses a **federated** knowledge graph architecture (Model 3): a local time-tracking-specific FalkorDB instance, reading from the developer's larger IP Law Ontology graph via a read-only projection for matter/client/patent entities.

**Authoritative ownership:**

- The upstream IP Law Ontology graph **owns** entities for: Client, Matter, Patent, PatentApplication, ClaimSet, OfficeAction, Person (attorneys, inventors, foreign associates), Organization (foreign associate firms, IP departments).
- Sidecar's local graph **owns** entities for: RawObservation, TimeBlock, AttributionEvidence, MonthClose, Invoice, LineItem.
- Sidecar reads upstream entities via local read replica with eventual consistency.

**Time-tracking graph schema sketch:**

```
RawObservation {
  id, timestamp, kind: 'window' | 'file' | 'url' | 'email' | 'calendar' | 'idle' | 'heartbeat',
  payload: <kind-specific>, machine_id, daemon_session_id
}
// Append-only. Default retention: 90 days.

TimeBlock {
  id, start_ts, end_ts, duration_seconds,
  status: 'captured' | 'attributed' | 'billable' | 'non_billable' | 'billed' | 'paid',
  confidence_tier, narrative_draft, narrative_final,
  billing_rate, created_at, updated_at
}

AttributionEvidence {
  id, time_block_id, observation_ids[], rule_or_model, score, reasoning
}
// The "why did the AI attribute this to Acme" record. Critical for auditability.

MonthClose {
  id, year, month, finalized_at, finalized_by,
  anomaly_report, total_billable_hours, breakdown_by_matter
}

Invoice {
  id, matter_id, client_id, period_start, period_end, status,
  line_items[], total, sent_at, paid_at, payment_method
}

LineItem {
  id, invoice_id, time_block_ids[], description, hours, rate, amount
}
```

**Edges:**

- `TimeBlock --DERIVED_FROM--> RawObservation` (many-to-many)
- `TimeBlock --ATTRIBUTED_TO--> Matter` (federated read-replica reference)
- `TimeBlock --SUPPORTED_BY--> AttributionEvidence`
- `TimeBlock --MEMBER_OF--> MonthClose`
- `LineItem --AGGREGATES--> TimeBlock`
- `Invoice --CONTAINS--> LineItem`

**Bitemporal attribution:** Attribution decisions can change. A TimeBlock attributed to Acme at 2pm on the 4th may, at month close, get reattributed to Beta because the attorney remembers he was actually drafting a Beta filing while in the Acme folder. The graph records both the original attribution and the correction with timestamps, reasoning, and the user action that caused the change. State bar audits look for exactly this kind of evidence trail.

### 3.8 Narrative drafting

**R12.** The system **AI-drafts every invoice line narrative** from observed activity (Word doc titles, USPTO documents viewed, email subjects, calendar event titles). The attorney must **explicitly approve each narrative** before the corresponding invoice is sent. AI-drafted narratives never reach a client unreviewed — this is the malpractice firewall.

The pre-drafted narrative appears in the day-review and month-close UIs as an editable field, with a clear "Approve this narrative" action per block. Bulk approval is available, but only for blocks the attorney has scrolled past (the UI enforces eyes-on-text before bulk-approve is enabled — implementation detail TBD).

### 3.9 Export and integration

**R5.** The system integrates with the firm's CRM (HubSpot in v1) for:
- Reading client and matter metadata (Companies, Deals, custom objects)
- Writing deal-stage updates on invoice payment events (e.g., move Deal to "Paid" stage)
- Optionally creating a HubSpot Task when an invoice is overdue >30 days

HubSpot is **CRM only** — not billing system, not payment processor, not accounting. See §3.10.

**R6.** Export paths:
- **CSV** export of time entries for any date range with filterable columns
- **Excel** export with formatted sheets (one sheet per client, or one sheet per month — user choice)
- **PDF invoice generation** via the firm's billing provider (Phase 2 decision — see Open Questions §5)
- **JSON** export for backup/migration purposes

### 3.10 Billing system integration (Phase 2 decision)

The billing system itself is **out of v1 scope** as a Sidecar-built feature. v1 ships with the calendar UI, lifecycle gates, CSV/Excel/PDF export, and an integration *contract* that allows hooking up:

- **Direct PDF + Stripe.** Sidecar generates PDF invoices, emails via Postmark/Resend, accepts payment via Stripe links, reconciles in HubSpot.
- **Clio Manage as billing backend.** Sidecar pushes finalized time entries to Clio's `Activity` API; Clio handles invoicing, trust, LEDES.
- **Hybrid.** Sidecar owns capture and calendar UI; Clio (or TimeSolv) is invoked once per month for invoice finalization and trust.

The recommendation, pending user decision, is the **hybrid path**: Sidecar owns the daily UX and the time-entry lifecycle, a battle-tested billing system handles invoicing and trust accounting. This avoids reimplementing IOLTA/LEDES while preserving the calendar-UI differentiator.

## 4. Architecture

### 4.1 Daemon

**R13.** The capture daemon runs **fully locally** on the attorney's machine. **All-local processing** (Model 1):

- All observation capture happens on-device.
- All attribution inference happens on-device.
- All narrative drafting happens on-device (local LLM via Ollama: Qwen 2.5 14B, Llama 3.3, or Mistral Small 3).
- Storage is local SQLite + local FalkorDB.
- Network calls are limited to: CRM sync (HubSpot), billing system push (if external), optional encrypted backup to the developer's homelab.

If local-LLM narrative quality is inadequate in practice, Phase 2 may introduce **hybrid processing (Model 3)** where heavy AI work goes to cloud LLMs with **redacted/abstracted inputs** (no client names, no app numbers, no document filenames — only the structured fields needed for narrative templating). This follows the same threat model as TodoX's PII-scrubbing pattern.

**No client data ever leaves the attorney's devices for time-tracking purposes** is the headline privacy posture. This is the sentence that ends the Rule 1.6 / state bar conversation.

### 4.2 Stack

**R14.** Stack alignment with developer's existing preferences:

- **Daemon:** Rust binary running as a user-level launchd agent (macOS) / Windows service / systemd user unit (Linux, future).
- **UI shell:** Tauri 2.x + React + Effect-TS, communicating with the daemon over local Unix socket / named pipe.
- **Local DB:** SQLite for transactional data (via Bun's native SQLite or rusqlite), FalkorDB embedded (`falkordblite` npm) for graph queries.
- **Local LLM:** Ollama with one of {Qwen 2.5 14B, Llama 3.3 70B, Mistral Small 3} depending on hardware. Heavy inference may run on the developer's homelab Server 2 (after RAM upgrade) over Tailscale link — still local in the privacy sense, both endpoints inside trust boundary.
- **OS observation APIs:**
  - macOS: Accessibility API, AppleScript dictionaries (Word/Outlook), Safari/Chrome/Edge browser extension.
  - Windows: UI Automation API, Office COM/Interop, Edge/Chrome/Firefox browser extension.
  - Linux: deferred (Wayland support is significant work).
- **Browser extension:** single codebase, manifest variations across Chrome/Edge/Firefox/Safari. Emits only `(active_tab_url, timestamp)` to the daemon — never page contents.
- **Office integration:** Outlook Add-in (officejs) for cross-platform email metadata; Word Add-in optional for richer file-context signal.
- **Knowledge graph sync:** local read replica of upstream IP Ontology graph; sync mechanism TBD (likely periodic pull + change-feed subscription).

### 4.3 Privacy and consent model

**R15.** User-facing privacy posture is **visible, controllable, and inspectable**:

- **First-run consent screen** explaining exactly what's captured (window titles, file paths, URLs, email metadata), what's never captured (page contents, email bodies, document contents unless explicitly invoked), and where the data lives (this machine, optionally the developer's homelab — disclosed).
- **Always-visible tray/menubar icon** showing daemon status. Green = capturing. Yellow = paused. Red = error.
- **One-click pause.** PiP and global hotkey both expose: Pause 15 min / Pause until resumed / Pause for rest of day. For personal time, sensitive conversations, client screen-share.
- **Domain/app exclusion list.** Default-excludes obviously personal: banking sites, healthcare portals, password managers, personal email accounts. User-editable.
- **Inspectable raw observation log.** Any time, the attorney can open the log and see exactly what was captured in the last hour/day/week.
- **No developer telemetry.** Even crash reports are opt-in and redacted. The developer (son) does not get a "developer mode" that streams client data for debugging. Debugging requires the developer to physically sit at the machine or be handed a redacted log dump.

## 5. Open Questions (deferred to next grilling rounds)

These are the remaining Q9–Q12 from the in-progress design conversation. None of them block PRD adoption; each is a follow-up grilling target.

**Q9 — Multi-device strategy.**
- Desktop only in v1, or phone too?
- iPad workflow when traveling?
- Cross-device sync model if multi-device?
- Capture on phone via mic/calendar/email-only without active-window/file-path signals?

**Q10 — Auditability and defensibility.**
- Can the attorney prove to a client (or to a state bar in an audit) what evidence supported a specific time entry?
- Retention policy for the AttributionEvidence chain.
- Read-only audit reports per matter, per client, per time period.
- Tamper-evidence: are finalized months cryptographically sealed?

**Q11 — Data model and storage details.**
- Local-first vs. cloud-replicated.
- Sync model: CRDT? Event sourcing? Sync to homelab as cold backup?
- What happens if his laptop dies mid-month? Recovery story.
- Backup encryption, retention, key management.
- Append-only event log retention beyond 90 days.

**Q12 — Build sequencing and v1 cutline.**
- What ships in v1 for July 2026?
- What's the smallest viable capture loop?
- Can we ship without the knowledge graph and bolt it on, or is the graph the v1 differentiator?
- Validation plan: can the attorney use this for one client before relying on it for all four?

**Plus the deferred billing system decision (§3.10):** direct-Stripe vs. Clio-backed vs. hybrid.

## 6. Glossary

- **Block / TimeBlock.** A consolidated, attributed wall-clock interval that represents a single semantic work session. The unit billable time is measured in.
- **Capture.** The act of the daemon observing activity. Captured ≠ billable.
- **Attribution.** The act of the system identifying which client/matter a block belongs to, with a confidence tier.
- **Attribution evidence.** The chain of raw observations and rules/models that justified an attribution decision. Audit trail material.
- **Month close.** The monthly self-review gate at which the attorney finalizes a month's worth of entries, after which they are read-only.
- **Billing cycle.** Per-client interval on which invoices are generated. Independent of month close.
- **Liquid Glass.** Apple's translucent UI material; Mica/Acrylic are the Windows platform equivalents. Used across all PiP surfaces.
- **Tier 1 / 2 / 3.** Confidence buckets for an attribution: auto-apply / soft-prompt / hold-in-buffer.
- **PiP.** Picture-in-picture overlay. The always-on-top command pill.
- **Manual block.** An explicit attorney-initiated capture for activity that produces no on-screen signal (phone calls, in-person meetings, deep thinking).
- **Federated graph.** The architecture where Sidecar's local FalkorDB reads from the upstream IP Law Ontology graph via read-only projection.

## 7. Document History

| Version | Date | Author | Notes |
|---|---|---|---|
| 0.1 | 2026-05-20 | Elpresidank + AI grilling session | Initial draft covering R1–R30. Q9–Q12 open. |
