# Research

<!--
Stage 1. Ground the capture in reality. Two halves: what exists outside the
repo (cited), and what exists inside it (so we compose bricks instead of
rebuilding them). Date sections; research goes stale.
-->

## External Landscape (researched 2026-06-18)

Three `deep-research` passes (one per track) plus direct primary-source fetches.
Full reports and citations live in [`research/`](./research/):
[`01-ip-prosecution-docketing.md`](./research/01-ip-prosecution-docketing.md),
[`02-court-litigation-outlook.md`](./research/02-court-litigation-outlook.md),
[`03-official-data-handroll.md`](./research/03-official-data-handroll.md).

**Method caveat:** a transient server-side rate limit degraded the harness's
adversarial-verify/synthesis phases on Tracks 1 & 3 (Track 2 synthesized
cleanly). Headline facts were re-checked by hand; per-vendor claims are
confidence-labelled in the track files. Vendor ownership/pricing is in flux —
re-verify before committing code.

### The four-layer frame (how the research resolves it)

Docketing is **four independently build-vs-buy layers**. The approval gate is the
stable seam: every layer emits a *candidate* the attorney approves.

| Layer | Verdict from research | Why |
|---|---|---|
| **L1 — Event source / truth feed** | **Mostly HAVE / integrate (open)** | US patents via **USPTO ODP** (already wrapped by `@beep/uspto`, exposes office actions, daily poll); TM via **TSDR**; foreign via **EPO OPS**; **litigation via CourtListener** (the one source with **API + webhooks + MCP**). PACER itself has no usable API. |
| **L2 — Rules engine (deadline math)** | **BUY or narrow-HANDROLL; never broad-handroll** | The malpractice-grade layer. **No open-source rules library exists** (greenfield if built). BUY candidates that pass the API gate: **CPI** (best API+due-date endpoints), **Alt Legal** (TM, self-serve), **LawToolBox** (court, partner-gated). Narrow US-deterministic handroll (maintenance fees, §133/§136, PCT, TM post-reg) is defensible. |
| **L3 — Agent / approval orchestration** | **BUILD (the moat; half-built)** | No vendor offers candidate-only writes + evidence spans + an Effect SDK. Already have `CandidateTask`, `ApprovalGate`, `ContextPacket`, `EmailArtifact`. |
| **L4 — Reminder / escalation / Outlook sync** | **BUILD orchestration, REUSE the M365 channel** | The Outlook transport is already being built by the sibling **`microsoft-365-integration`** packet (`@beep/m365`, `Calendars.ReadWrite`). Reminders/escalation/dead-man's-switch are NET-NEW. |

### Decision matrix — agent-integratable candidates (survivors of the API gate)

| Candidate | Layer | API for agents | Rules engine | Outlook fit | Solo price | Verdict |
|---|---|---|---|---|---|---|
| **USPTO ODP** (`@beep/uspto`) | L1 patent | REST + API key, poll | — | push via `@beep/m365` | free | **Adopt (have)** — patent event source |
| **CourtListener / RECAP** | L1 litigation | **REST + webhooks + MCP** | — | push via `@beep/m365` | free tier | **Adopt** — court event source |
| **TSDR / EPO OPS / WIPO** | L1 TM/foreign | REST/OAuth (SOAP for WIPO), poll | — | push via `@beep/m365` | free/fair-use | adopt as scope expands |
| **Narrow US rules module** | L2 (build) | n/a (ours) | US-deterministic only | — | $0 | **Build as first slice** (candidate-gated, ODP-checked) |
| **Computer Packages (CPI)** | L2 buy | **REST + due-date endpoints** | Patent/TM/Annuity | data-only (we push) | enterprise-sales | strongest L2 BUY *(verify access)* |
| **Alt Legal** | L2 buy (TM) | first-party API | TM auto-sync | data-only | **$60/mo/50 matters** | best **TM** buy (patents manual) |
| **LawToolBox** | L2 buy (court) | REST + recalc + rule-change poll | court-rules + recalc | add-ins (we bypass, push via `@beep/m365`) | ~$35–42/user/mo, gated | best **court** buy *(partner-gated)* |
| **Clio Manage** | L2 buy (court) | open V4 API | CalendarRules | via Clio | PM platform | court fallback (open API) |

**Disqualified for agents (no public API):** **AppColl** (explicit no-API policy
— despite great rules engine + USPTO auto-sync + $100/mo solo price),
**PATTSY WAVE/Anaqua**, **CourtAlert**, **CalendarRules** (B2B-embedded only).
**Docket Alarm** has an API but is docket *monitoring*, not a rules engine.

### Cross-track verdict

- **Best single L2 BUY if buying:** **CPI** for IP (real REST + due-date
  endpoints + patent/TM/annuity engine) and **LawToolBox** for court (recalc +
  pull API) — both *data/engine via API, Outlook push owned by us*. Caveat: both
  are enterprise/partner-gated, not self-serve; **Alt Legal** is the only
  self-serve real-API option but is **trademark-first** (patents = manual entry).
- **A narrow US-deterministic HANDROLL is a defensible first slice:** maintenance
  fees + §133/§136 response periods + PCT national-phase + TM post-registration,
  computed as *candidates*, cross-checked against ODP/TSDR ground truth,
  approval-gated. The rules are few and statutory; the data sources exist; the
  candidate doctrine contains the liability.
- **The danger line for handrolling:** foreign annuities, litigation/court-rules,
  and any discretionary period — past that, buy the engine or keep the attorney
  as the engine.
- **Polling is the norm** (only CourtListener pushes) → L4 must assume poll-based
  freshness and prove to itself it ran (dead-man's-switch).

## In-Repo Capability Inventory

Verified against the current `microsoft-365` branch (2026-06-18). Confirm exact
export paths with ripgrep / `repo-symbol-discovery` before composing.

- **HAVE — `@beep/uspto`** (`packages/drivers/uspto/src/Uspto.service.ts`): ODP
  driver — `getApplication`, `getContinuity`, `getDocuments`, `searchApplications`,
  `downloadDocument`; models capture `docketNumber`, `filingDate`, status. **The
  L1 patent event source, already built.** (Pin to `api.uspto.gov` ODP; legacy
  Developer Hub decommissions 2026-06-05.)
- **HAVE — governance kit** (`packages/workspace/domain/src/entities/`):
  `CandidateTask`, `ApprovalGate`, `ContextPacket`, `EmailArtifact` (with source
  spans). **The L3 candidate-only / approval-gate spine.**
- **HAVE — connector abstraction** (`packages/shared/domain/src/identity/Shared.ts`,
  `.../entity/Principal.ts`, `.../entity/SourceKind.ts`): `ConnectorAccountId`,
  `ConnectorAccountPrincipal`, `SourceKind.Connector` — first-class connector
  actor for provenance/audit.
- **HAVE — `@beep/libpff`** (`packages/drivers/libpff`): Outlook PST export
  (historical mail/calendar ingest); pairs with `EmailArtifact`.
- **HAVE — substrate**: `@beep/schema` DateTime codecs (`DateTimeFromMillis`,
  `DateTimeEncoded`); `@beep/nlp` + `@beep/wink` date/entity extraction;
  `@beep/onepassword-cli` for secrets (the `USPTO_API_KEY` precedent — same
  pattern for TSDR/EPO/CourtListener keys); `apps/professional-desktop` (Tauri +
  PGlite) host.
- **HAVE — thin — `law-practice` slice** (`packages/law-practice/domain/src/entities/`):
  `Matter`, `PatentAsset`, `LegalClient`, `LegalContact`. The extension point —
  but `Matter` has **no deadline fields** yet.
- **IN FLIGHT (sibling packet) — `@beep/m365`**: the Outlook/Graph transport,
  being shaped by [`microsoft-365-integration`](../microsoft-365-integration/README.md)
  (native Effect driver + own MCP server, delegated auth-code+PKCE, read-only
  ingest first, `Calendars.ReadWrite` listed as a write scope to reserve).
  **Docketing reuses this as its L4 Outlook push channel and is the concrete
  driver for the `Calendars.ReadWrite` write-scope decision** (M365 open question
  #1).
- **NOT FOUND (NET-NEW):**
  - `OfficeAction` / `FilingEvent` / `Deadline` / `TriggeringEvent` entities in
    `law-practice/domain` (documented in goal docs, **not implemented**).
  - Any **deadline-rules / deadline-math engine** (none in repo; and none exists
    open-source).
  - Calendar-event / **reminder** / recurrence / **notification** models
    (`packages/foundation/primitive/data/src/Calendar.ts` is date *constants*
    only — not a scheduler).
  - **Dead-man's-switch / heartbeat** scheduler for "prove the deadline check
    ran."
  - TSDR / EPO OPS / WIPO / CourtListener drivers (only ODP exists today).

## Constraints Discovered

- **Malpractice-grade reliability.** A silently-stopped reminder job is as bad as
  a wrong date; for events *years* out the dominant failure mode is the job
  failing to run, not the math — hence a **dead-man's-switch** is mandatory, not
  optional.
- **Local-first / privilege.** Privileged client data stays local (PGlite); any
  vendor adopted must permit **data export / an authoritative local copy** and a
  delegated/attributable auth model (mirrors the M365 packet's posture).
- **Polling, not push.** Every official source except CourtListener is poll-only
  (ODP daily). The freshness/SLA model must budget for poll latency.
- **Source churn.** ODP Beta sunsets **2026-05-29**; legacy USPTO Developer Hub
  **2026-06-05**; TSDR API access has historically broken; CalendarRules→Clio and
  Docket Alarm→Clio acquisitions are recent. Pin versions; re-verify.
- **Doctrine.** The product must remain a **vigilance overlay, not the docket
  system of record** (locked — see [`DECISIONS.md`](./DECISIONS.md) and
  [`CAPTURE.md`](./CAPTURE.md)). Adopting a vendor means the *vendor* is the
  docket of record; handrolling means the *attorney's existing tool* stays the
  record and we mirror approved candidates.
- **No MCP server from any docketing vendor** (only CourtListener offers one) —
  so the agent surface for any bought engine is REST-over-our-own-driver, exposed
  as our own MCP server (the `@beep/nlp-mcp` / `@beep/m365` pattern).
