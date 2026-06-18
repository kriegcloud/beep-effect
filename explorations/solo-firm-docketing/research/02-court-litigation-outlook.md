# Research Track 2 — Court / Litigation Deadline Engines (agent + Outlook lens)

Researched 2026-06-18 via the `deep-research` harness (6 angles, 17 sources, 84
claims). This track's synthesis phase **succeeded** before the rate limiter bit,
so the headline findings carry 3-0 / 2-0 adversarial verdicts; the per-vendor
pricing/coverage claims that abstained (0-0, rate-limited) are labelled
single-source.

The question: who exposes court-deadline **data via API for our agents to
PULL** (not just push to a calendar), with a **rules-engine that recalculates
dependent deadlines** when a trigger date changes — and which ride Microsoft 365?

## Scorecard

| Vendor | Rules engine + recalc | Public API (pull) | Webhooks/MCP | M365/Outlook | Solo pricing | Agent verdict |
|---|---|---|---|---|---|---|
| **LawToolBox** | **Yes** (court-rules + recalc + rule-change poll) | **Yes — REST**, *partner-gated (NDA)* | no webhooks / no MCP | deep — but in **add-ins**, not the API | ~$35–42/user/mo, min 2 users, sales-quote | **BEST court BUY** (gated) |
| **Clio Manage** | Yes (CalendarRules engine, since 2021) | **Yes — open V4 API** (OAuth2) | no webhooks / no MCP | via Clio, not Graph | full PM platform | **2nd** (open API, PM platform) |
| **CalendarRules** (ALN/Aderant) | Yes (2000+ rule sets, 50 states) | **No public API** (B2B only) | no | push-only Outlook/Gmail | B2B-embedded | engine, not directly buyable |
| **Docket Alarm** (vLex→Clio) | **No** (docket *monitoring*) | **Yes — REST** + OSS Python client | push notifications, no MCP | one-way ICS export only | per-seat | monitoring, not a rules engine |
| **CourtAlert** | No (rides CalendarRules) | **No public API** | no | one-way push Outlook/Exchange | enterprise | monitoring, not agent-reachable |

## Per-vendor notes (with sources)

### LawToolBox — the standout court-rules engine with a real (gated) API
- **True recalculation engine + pull API** (*confirmed 3-0*): the partner REST API
  documents `GET .../matters/{m}/deadlines` (read all deadlines),
  `GET .../matters` (list), `POST .../deadlines/calculate` ("surface ONLY the
  deadlines dependent on the triggerdate submitted"), and a **"Rule Change
  Notification"** endpoint `GET /api/deadlines/modified?cutOffDate={date}`
  ("return any trigger date or deadline modified on/after the submitted date").
  When court rules change, LawToolBox **recalculates** the matter's deadline.
  https://api.lawtoolbox.com/api · https://lawtoolbox.com/partners-surface-lawtoolbox-deadlines
- **Access is partner-gated** (*confirmed 3-0*): NDA + LawToolBox activation +
  sales-rep-issued OAuth credentials. **No self-serve developer portal** — a solo
  cannot just sign up. This is the single biggest integration risk.
- **The API has NO webhooks and NO Graph/Outlook integration** (*confirmed 3-0*):
  change detection is **poll-based** (run the modified-since query each morning).
  LawToolBox's famous **deep M365 integration lives in its separate first-party
  add-ins** (which use Graph `Calendars.ReadWrite`, Teams, Mail, Files, OneNote
  — per the MS 365 App Certification page, updated 2025-07), *not* the partner
  API. So the data comes from the API; **the Outlook push is ours to build** via
  `@beep/m365`. https://learn.microsoft.com/en-us/microsoft-365-app-certification/teams/lawtoolboxcominc-lawtoolbox
- **Pricing** [single-source, rate-limited]: per-user/per-M365-mailbox, tiered by
  user count (2–9, 10–19, …); ~**$35/user/mo annual / $42/mo monthly**, minimum
  2-user tier, contact-sales quote. No confirmed single-attorney self-serve tier.
  https://lawtoolbox.com/pricing/
- **Verdict: best court-deadline BUY** for the rules engine + pull API + recalc,
  *if* a solo can obtain partner credentials. The clean architecture: **pull
  deadlines from LawToolBox's API, push to Outlook via our own `@beep/m365`
  driver** from [`goals/m365-driver`](../../../goals/m365-driver/README.md) —
  bypassing their add-in entirely.

### Clio Manage — the open-API second path
- **Open self-serve V4 API** (OAuth2 developer onboarding) exposing court-rules
  GET endpoints: **Jurisdictions, Jurisdictions-To-Triggers, Matter Dockets
  (incl. a "preview calendar dates" GET), Service Types** (*confirmed 3-0/2-0*).
  Backed by the **CalendarRules** engine Clio acquired in 2021 (~50 states /
  ~2,200 jurisdictions). https://docs.developers.clio.com/clio-manage/api-reference/
- **Caveat:** whether "preview calendar dates" returns the full *recalculated
  dependent* cascade (vs just immediate docket dates) is **inferential** — the
  field-level schema was inaccessible (Clio help-center 403). Needs a sandbox
  token to confirm. Also: Clio is a **full practice-management platform**, not a
  standalone deadline engine — adopting it for court rules means standing up Clio
  as a system of record (doctrine-relevant).
- M365: integrates through Clio's own connectors, not direct Graph. No MCP.

### Monitoring tools (not rules engines)
- **Docket Alarm** (now vLex→Clio, June 2025): **genuine public REST API** +
  **official OSS Python client** (`github.com/DocketAlarm/pacer-api`) for pulling
  **PACER/court docket data** (login, search, searchpacer, getdocket, track).
  But **no rules engine / no recalculation** (*refuted as a rules engine 0-2*),
  no MCP, only one-way ICS calendar export. It's a docket *monitoring/feed* tool.
  https://www.docketalarm.com/api/v1/
- **CourtAlert**: PACER/ECF **monitoring** (all federal + select NY/NJ/TX),
  *licenses CalendarRules* for calc, one-way push to Outlook/Exchange, **no public
  API/MCP/webhooks** for agents [single-source]. https://www.courtalert.com/content/CaseManagement
- **CalendarRules** itself (American LegalNet / Aderant): a real **engine**
  (2000+ rule sets, all 50 states, Fed/State/Bankruptcy/Appellate/Local/Judges/
  Agency) but **sold B2B-embedded** into other vendors (Clio, CourtAlert) with
  **no public API** and push-only calendar sync [single-source].
  https://www.calendarrules.com/

## Time-sensitivity / collisions (harness caveat)
- Ownership is in flux: **CalendarRules → Clio (2021)**; **Docket Alarm/vLex →
  Clio (June 2025)** — re-verify before committing. Microsoft cert pages update
  periodically. Do **not** confuse **Docket Alarm** with unrelated products
  "Docket" (docket.io) or "Docket Enterprise" (BEC Legal).

## Track-2 takeaways for the four-layer frame
- **L2 court-rules BUY:** **LawToolBox** (best engine+pull API+recalc, but
  partner-gated) > **Clio** (open API, but PM platform + inferential recalc) >
  CalendarRules-as-engine (no direct buy). Docket Alarm/CourtAlert are **L1
  monitoring**, not L2 engines.
- **No MCP server anywhere in this set**; webhooks largely absent → change
  detection is **polling** for the court track too (mirrors USPTO ODP in Track 3).
- **Architecture validated:** the clean shape is **buy the court-rules data/engine
  via API, own the Outlook push via `@beep/m365`** — which is exactly what the
  graduated [`m365-driver`](../../../goals/m365-driver/README.md) goal enables.
  LawToolBox's M365 depth being in *add-ins, not the API* is a feature for us,
  not a bug: we don't want their calendar writer, we want their deadline data.
- **Court orders are a genuinely separate market** from IP prosecution docketing
  (different engines, different event source = PACER/CourtListener, see Track 3)
  — confirming the decision to sequence litigation as its own track.
