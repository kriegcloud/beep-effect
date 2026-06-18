# Docketing for a Solo IP Firm: Build, Buy, or Hybrid — With a Developer/Agent-First Lens

## TL;DR
- **Buy a purpose-built IP-prosecution docketing product as your authoritative system of record (AppColl is the best-fit anchor for a solo patent prosecutor at ~$100/user/month with USPTO auto-sync), then BUILD a thin, agent-facing automation/monitoring layer on top of authoritative government feeds — a HYBRID.** Do not handroll the docket of record from scratch; the malpractice exposure of a silently-failing reminder job is too high for a one-person firm.
- **The IP-docketing vendor market has weak developer tooling.** Almost no patent-prosecution docketing product exposes a genuine, self-serve, documented REST API; none publishes an MCP server as of mid-2026. The richest *programmable* assets are the government/official feeds (USPTO ODP, EPO OPS, WIPO/CourtListener) and the court-rules engines (LawToolBox has a real partner API; CourtListener has a real REST API + webhooks + an MCP server).
- **Reliability for multi-year deadlines is a systems problem, not a calculation problem.** The safe-to-handroll calculations (US maintenance-fee windows, statutory response periods, PCT 30/31-month) are deterministic, but the dangerous failure mode is an automated reminder that silently stops running. Use redundant channels, a vendor docket of record, and dead-man's-switch/heartbeat monitoring.

## Key Findings

1. **Build vs. buy vs. hybrid.** For a solo US patent prosecutor, a pure handroll is imprudent as the *system of record* (malpractice/insurance reality), and a pure commercial buy underuses the developer's skills and the available official APIs. The evidence supports a hybrid: a commercial IP docketing product as the authoritative docket, plus a custom TypeScript automation/agent layer reading authoritative feeds for cross-checking and reminders.

2. **Commercial IP-prosecution docketing vendors have thin developer surfaces.** AppColl (built-in US/PCT docketing rules, e-Office Action ingestion, TSDR auto-update, ~$100/user/mo) is the strongest solo/small-firm fit but has no documented public API. Alt Legal (trademark-first, strong USPTO/CIPO auto-docketing) has an API that is sales-gated ("Email us to gain access") with no public docs. Enterprise tools (Anaqua PATTSY WAVE, Clarivate FoundationIP, CPI/Computer Packages, Dennemeyer DIAMS, Inprotech) are overkill and priced for larger orgs; PATTSY WAVE added APIs in v8 (2024) and CPI advertises a web-services API, but these are partner/enterprise, not self-serve.

3. **Court-rules engines are a separate market with better APIs.** LawToolBox exposes a genuine partner Deadline API (OAuth token, trigger-date calculators, rule-change recalculation, Microsoft 365 native). CalendarRules now powers Clio Court Rules (acquired 2021). CompuLaw/American LegalNet are now Aderant (Milana). Docket Alarm (now Clio, via vLex acquisition closed Nov 2025) has a real API and computes litigation deadlines. These matter only if the firm takes litigation.

4. **Authoritative government feeds are the real programmable foundation.** USPTO Open Data Portal (api.uspto.gov) gives keyed REST access to file-wrapper/office-action/maintenance-fee data; EPO OPS gives OAuth2 REST access to INPADOC legal status; WIPO publishes PCT time limits; CourtListener/RECAP (Free Law Project) offers a REST API, docket-alert webhooks, and an MCP server for US federal litigation.

5. **The safe-to-handroll boundary is real but narrow.** Deterministic, encodable rules: US maintenance-fee windows (3.5/7.5/11.5 yr + 6-month grace), statutory office-action response periods, PCT 30/31-month national-phase entry, trademark §8/§9/§15 windows. Dangerous: foreign annuities across jurisdictions, cascading litigation deadlines, discretionary/fact-dependent dates. Even "safe" rules carry edge cases (37 CFR 1.7 weekend/holiday roll-forward, extension chains, revival).

6. **Reliability is about redundancy and self-monitoring.** Missed deadlines are the single largest category of legal malpractice claims (24.6% per the ABA's most recent quadrennial profile); many carriers now require rules-based docketing. The catastrophic automation-specific failure mode is a silently-dead cron job — mitigate with heartbeats/dead-man's switches and a vendor system of record as backstop.

7. **Agent integration is feasible and should be human-gated.** Microsoft Graph (Calendars.ReadWrite, client-credentials flow for headless daemons) is the cleanest way for agents to write reminders into Outlook. No domain MCP servers exist for IP docketing yet, so the developer should build their own MCP wrapper over ODP/OPS/the chosen vendor, with human approval gating any legally-operative action.

## Details

### 1. Build vs. Buy vs. Hybrid — the core decision

**The malpractice frame dominates.** Missed deadlines are consistently the single largest category of legal malpractice claims. Per the ABA Standing Committee on Lawyers' Professional Liability ("Profile of Legal Malpractice Claims: 2016–2019"), missed deadlines account for **24.6%** of all claims — "the single most common cause of claims, exceeding substantive errors (18.3%), inadequate discovery (11.2%), and conflicts of interest (9.7%)." Carriers increasingly *require* rules-based docketing: per the ABA's "Profile of Malpractice Claims" (via LeanLaw), many carriers are "no longer writing policies for firms that do not have rules-based docketing systems," and an Aderant report cited a firm whose $50,000 docketing-software investment "saved them $200,000 in insurance premiums in the first year alone." For a solo the stakes are concentrated: ABA data shows "more than 70 percent of all claims are filed against firms with five or fewer attorneys" (via Attorney at Work), and there is no second lawyer to catch an error.

**Why not a pure handroll as the system of record?** The data calculations are tractable, but the operational reliability bar (years-out deadlines, no colleague backstop, insurer expectations) means a self-built docket-of-record concentrates malpractice risk on bespoke code that one person maintains. The failure mode is not a wrong calculation; it is a reminder job that silently stops.

**Why not a pure commercial buy?** It works and is defensible, but wastes the developer's strengths and the rich official APIs, and leaves the firm unable to build the custom AI agents that are the stated goal.

**The recommended hybrid:** Commercial IP docketing product = authoritative docket of record (vendor maintains the rules, auto-syncs from USPTO, and is recognized by insurers). Custom TypeScript layer = a parallel, independent cross-check that ingests authoritative government feeds, computes the deterministic deadlines itself, reconciles them against the vendor docket, pushes redundant reminders, and exposes safe tools to AI agents. This gives defense-in-depth: two independent systems must both fail to miss a date.

### 2. Commercial IP-prosecution docketing vendors (developer lens)

**AppColl Prosecution Manager** — Strongest solo/small-firm fit. Cloud-native; built-in docketing rules auto-calculate due dates for US patents, trademarks, and PCT national-phase entry; hundreds of task types; custom rule creation. It ingests USPTO e-Office Action emails to auto-create prosecution-history items and docket tasks and auto-download documents from Patent Center; trademarks auto-update weekly from TSDR. Pricing is roughly $100/user/month (PM Pro), $130 (PM Plus), billed annually, with some plans matter-based and unlimited users; 30-day free trial. **Developer caveat:** GetApp explicitly reports "AppColl Prosecution Manager does not have an API available," and AppColl's own integration story is import/email/CSV-based (Patent Center XML import, e-Office Action email, QuickBooks sync). So it is excellent as a system of record but not as a programmable surface — your custom layer would integrate via CSV export/import and by independently reading USPTO ODP, not via an AppColl API. (AppColl is also the most commonly used docketing solution among members of the National Association of Patent Practitioners, an organization of mainly solo/small-firm practitioners.)

**Alt Legal** — Trademark-first, also handles patents/other IP. Best-in-class automated trademark docketing: direct USPTO and CIPO connections automatically add filings, update status, and docket/remove deadlines; third-party data partner covers 180+ jurisdictions; native Clio calendar integration. Per-matter pricing (no per-user fee): roughly $60/mo up to 50 matters, $100/mo up to 100, $195/mo up to 200, $295/mo up to 400, plus optional trademark-watch add-ons. **Developer caveat (subagent-confirmed):** Alt Legal has an API but publishes **no** public developer documentation — no developer portal, no Swagger, no documented auth model, base URL, endpoints, rate limits, or webhooks. Access is sales-gated: Alt Legal's own product-update page says "Email us to gain access to the Alt Legal API." The marketing copy implies a pull/read-oriented model ("Pull docket data into your CRM," "programmatic access to your Alt Legal data"); webhook support is neither documented nor confirmed. For a patent-centric solo, Alt Legal is more compelling if trademark volume grows.

**Enterprise / larger-firm tools (generally overkill for a solo):**
- **Anaqua PATTSY WAVE** — 200+ firms/corporations; added APIs in Version 8 (May 2024) to "retrieve bibliographic and action data from any of PATTSY WAVE's primary modules"; "API-based PATTSY WAVE Sync" for iManage/NetDocuments. Microsoft-ecosystem oriented; reviews note API limitations outside Microsoft. Requires attorney approval for critical actions (good agent-safety precedent). No public auth docs, no MCP, no documented webhooks.
- **Clarivate FoundationIP / IPfolio** — mature enterprise IP suite; advanced docketing; small firms "might find the platform too complex and expensive."
- **Computer Packages Inc (CPI)** — 55+ years; single-tenant; advertises a "strong web-services API" and annuity-service APIs that "integrate with any docketing system." Aimed at medium-to-large firms/corporations. No public self-serve developer portal.
- **Dennemeyer (DIAMS iQ), CPA Global/Clarivate annuities, Patrix Patricia, Inteum, IPzen, Inprotech (CPA), Symphony/Lecorpio (now Anaqua)** — enterprise/annuity-oriented; not self-serve developer products for a solo.

**Market consolidation to re-verify (date-sensitive, mid-2026):** Clio signed a US$1B deal to acquire vLex (owner of Docket Alarm/Fastcase) on June 30, 2025 and closed it November 10, 2025 — "the largest M&A transaction ever in legal technology," alongside a $500M Series G led by NEA valuing Clio at $5B. Clio earlier acquired CalendarRules (2021); Aderant acquired American LegalNet (2022) and combines it with CompuLaw; Anaqua acquired PATTSY WAVE (2020) and Lecorpio earlier. Ownership and API roadmaps shift; confirm current status before committing.

### 3. Litigation / court-rules deadline engines (only if the firm litigates)

These are structurally different: they compute *cascading* deadlines from a trigger date and recalculate when rules change. They are not needed for pure prosecution but matter for occasional court/PTAB litigation.

- **LawToolBox** — The standout for developers. A genuine partner **Deadline API** (`api.lawtoolbox.com`): OAuth token auth, query states/toolsets, POST a matter + trigger date to calculate cascading deadlines, retrieve modified deadlines daily for rule-change recalculation (each deadline carries a stable DeadlineID). Deep Microsoft 365/Outlook/Teams integration; integrations across many PMS platforms. Partner API access requires an introductory meeting and credentials.
- **CalendarRules** — Now owned by Clio (2021) and powers Clio's Court Rules (50 states, 2,300+ jurisdictions). Also exposes a calculator integration (used by LegalServer). Best consumed through Clio if the firm uses Clio.
- **CompuLaw / American LegalNet (now Aderant; Milana)** — Market-leading rules library (2,900+ jurisdictions), licensed-attorney rules team, Outlook integration, PACER ingestion. Aderant Milana "offers an API" per secondary sources; enterprise-oriented.
- **Docket Alarm (now Clio via vLex)** — Real API (used by partners like Entegrata), litigation analytics, PACER-backed alerts, and a deadline calculator that "calculate[s] upcoming deadlines based on scheduling orders and local court rules" and syncs to Outlook.
- **CourtAlert, Bloomberg Law Deadline Assistant** — enterprise litigation docketing; less self-serve developer access.

For a solo who only occasionally litigates, the pragmatic answer is to license court-rules deadlines through whatever PMS/court-rules integration is at hand (Clio+CalendarRules, or LawToolBox in Microsoft 365) rather than handroll cascading court deadlines.

### 4. Authoritative / official data sources (the programmable foundation)

**USPTO Open Data Portal (ODP, api.uspto.gov / data.uspto.gov)** — The core feed. Keyed REST (x-api-key header; JSON), Swagger-documented. Patent File Wrapper search (replaces PEDS), Office Action APIs (migrated from the legacy Developer Hub), Bulk Datasets, Citations. **Date-sensitive changes:** legacy Developer Hub decommissioned June 5, 2026; ODP sign-in/registration required starting June 18, 2026; additional required profile fields from Aug 18, 2026; USPTO.gov accounts require non-email MFA since Nov 1, 2025; API key requires ID.me-verified USPTO.gov account. **Rate limits are restrictive:** burst of 1 (no parallel calls per key), ~4–15 requests/sec depending on call type, weekly quotas, bulk-file download limited to 20 downloads of the same file/year; HTTP 429 on exceed, with USPTO discouraging automatic retries (wait ≥5s). Maintenance-fee event data is available as a bulk dataset. Design your custom layer to be strictly sequential per key and 429-tolerant.

**USPTO TSDR** — Trademark status/document retrieval (API-key based); drives trademark docketing (this is what AppColl/Alt Legal consume for trademark auto-update).

**EPO Open Patent Services (OPS)** — RESTful, OAuth2 (Consumer Key + Secret), XML responses. INPADOC family + legal-status events for foreign legal-status cross-checks. The free "Non-paying" tier is **4 GB per week** (per the EPO Fair Use Charter); PatZilla's docs note this "is usually sufficient even for intensive research work performed by a single person," with paid unlimited access at €2,800/year. Mature client libraries exist (Python `patent_client`/`python-epo-ops-client`, Go). Caveat: INPADOC legal status depends on national offices' timeliness and "should always be checked" — not authoritative enough to *drive* annuity payments alone.

**WIPO PATENTSCOPE / ePCT / PCT time limits** — WIPO publishes the authoritative PCT national-phase time-limit tables (30 months standard; 31 for EPO, KIPO, India, Australia; OAPI's non-standard 20-month is a notorious trap). Use as the reference table for the deterministic PCT calculator; ePCT for PCT case data.

**PACER + CourtListener/RECAP (Free Law Project)** — For US federal litigation. CourtListener has a documented **REST API v4** (token auth) with **docket-alert webhooks** (push on new filings; real-time alerts a paid/member feature) and notably **an MCP server**: "Our MCP server allows tools like Claude, ChatGPT, and other AI assistants to access our CourtListener data and APIs directly." **Rate-limit change to note (2026):** per Free Law Project's May 7, 2026 update, the default API limit dropped to "5 requests per minute, 50 requests per hour, and 125 requests per day"; the older 5,000/hour rate is now grandfathered only for accounts that have "ever made 1,000 or more API requests," and full API access is now effectively a paid membership benefit. This is still the one mature, agent-ready, primary litigation data source in the whole landscape.

### 5. The "safe to handroll" boundary

**Safe to encode (deterministic, low-risk) — for cross-checking, not as sole record:**
- **US maintenance fees:** due at 3.5/7.5/11.5 years from grant; payable without surcharge in the 6-month window before each due date (i.e., from 3/7/11 years); 6-month grace with surcharge after (to 4/8/12 years); cannot pay early; design/plant patents exempt. Patent expires day after the 4/8/12-yr anniversary if unpaid.
- **Statutory office-action response periods:** under 35 USC 133 / 37 CFR 1.136 (typically 3-month shortened statutory, extendable to 6 months with fees).
- **PCT national-phase entry:** 30 months (31 for several offices; OAPI 20 — verify per jurisdiction against WIPO tables).
- **Trademark post-registration:** §8 (between 5th–6th year), combined §8/§15, §9 renewal (every 10 years), with grace periods.

**Edge cases that add risk even within "safe" rules:**
- **37 CFR 1.7 weekend/holiday roll-forward:** if a due date falls on a Saturday, Sunday, or DC federal holiday, action is timely the next business day. **Critical subtlety (MPEP 2506):** for maintenance fees the *roll-forward applies to the payment*, but the patent's *expiration* is still tied to the statutory anniversary — i.e., if the grace period ends on a Saturday and you fail to pay by the following Monday, the patent already expired after the Saturday. Encode this asymmetry carefully or you will mis-state expiration.
- Extension chains (1.136(a) auto-extensions vs. 1.136(b)), entity-status changes (small/micro mis-certification voids payment), revival/reinstatement (37 CFR 1.378 unintentional-delay petitions; intervening rights under 35 USC 41(c)(2)).

**Dangerous — license or leave to a human/vendor:**
- **Foreign annuities** across many jurisdictions (rules, currencies, grace periods, local-agent requirements vary constantly) — use an annuity service (CPA Global/Clarivate, Dennemeyer, CPI) and/or a vendor; do not handroll.
- **Cascading litigation/court-rule deadlines** — license (LawToolBox/CalendarRules/CompuLaw).
- **Discretionary or fact-dependent dates** (e.g., dates depending on service method, judge-specific orders) — human-determined.

### 6. Reliability for deadlines years in the future

- **Multiple independent systems of record.** Vendor docket (authoritative) + your custom cross-check. A deadline entered in one should be reconcilable against the other. This is the digital analog of the long-standing "two-person verification" docketing norm.
- **Redundant reminder channels and an escalation ladder.** Email + calendar + dashboard; escalate as the date approaches (e.g., 90/60/30/7/1-day reminders, with unacknowledged critical deadlines escalating to a second channel). Treat the court/office deadline as a "review-complete" date with an internal target days earlier (buffer).
- **The silent-job failure mode.** The defining risk of automation is a reminder job that quietly stops (cron dies, token expires, API quota exhausted, mailbox auth lapses). Mitigate with **heartbeats / dead-man's switches**: the job pings a monitor (e.g., a healthcheck/cron-monitoring service) on every successful run; if the monitor doesn't hear a heartbeat on schedule, *it* alerts you. The monitoring must be independent of the system it watches, and the alert path must itself be tested. Without this, "no reminders" looks identical to "no deadlines."
- **USPTO does not send maintenance-fee reminders** as a reliable backstop — the duty is entirely on the firm; never rely on courtesy notices.
- **Professional-responsibility dimension.** ABA Model Rule 1.1 (competence, including technology), Rule 5.3 (supervising non-lawyer/automated assistance — the attorney remains responsible for what the system does). Document the system, audit it (e.g., a weekly "deadline audit" reconciling vendor docket vs. office records), and log changes for a defensible audit trail.

### 7. Agent integration & outlook

- **Microsoft 365 / Graph for Outlook reminders.** For headless/daemon automation, register an Entra app and use the **OAuth2 client-credentials flow** (`/oauth2/v2.0/token`, `scope=.default`) with **application** permission **Calendars.ReadWrite**; write events via `POST /users/{id}/calendars/{id}/events`. Note app-only calendar write works for M365 work/school mailboxes (not personal Outlook.com). Apply least privilege and, importantly, **scope the app to a single mailbox** using an **application access policy** (Graph application permissions are otherwise tenant-wide — a real risk for a one-mailbox firm). TypeScript SDK (`@microsoft/microsoft-graph-client`) is first-class.
- **State of MCP in this domain.** No IP-docketing vendor publishes an MCP server (subagent-confirmed across Alt Legal, AppColl, CPI, PATTSY WAVE, FoundationIP). The only mature, relevant MCP server is **CourtListener's**. So the developer should **build a custom MCP server** in TypeScript that wraps (a) USPTO ODP, (b) EPO OPS, (c) the chosen vendor's export/import or gated API, and (d) the firm's own deterministic deadline engine — exposing read tools freely and write/operative tools behind approval.
- **Safe agent design — human approval before durable/legally-operative actions.** Let agents *read* docket state, *propose* deadlines, *draft* reminders, and *flag* discrepancies autonomously. Require explicit human approval (a "human in the loop" gate) before any action that is legally operative or irreversible — filing, paying a fee, deleting/altering a docketed deadline, sending client communications. PATTSY WAVE's "requires attorney approval for critical actions" is the right precedent. Keep an immutable audit log of agent actions and approvals.

## Vendor scorecard (developer-integration criteria)

| Vendor | Category | Public/self-serve API? | SDK | Webhooks | MCP | Auth model | Solo pricing | USPTO auto-sync |
|---|---|---|---|---|---|---|---|---|
| **AppColl** | IP prosecution docketing | No (GetApp: "no API available") | No | No | No | n/a | ~$100–130/user/mo | Yes (e-Office Action email + Patent Center XML; TSDR weekly) |
| **Alt Legal** | IP (trademark-first) docketing | API exists but undocumented & sales-gated ("Email us") | No | Unconfirmed | No | Undisclosed | Per-matter ($60–$295/mo tiers) | Yes (USPTO + CIPO) |
| **Anaqua PATTSY WAVE** | Enterprise IP | Partner/enterprise (v8, 2024) | No public | No public | No | Undisclosed | Enterprise (quote) | Yes |
| **Clarivate FoundationIP** | Enterprise IP | Enterprise only | No public | No public | No | Undisclosed | Enterprise (too complex/costly for solo) | Yes |
| **CPI (Computer Packages)** | Enterprise IP + annuities | "Web-services API" (partner) | No public | No public | No | Undisclosed | Medium–large firms | Yes |
| **LawToolBox** | Court-rules engine | Yes — partner Deadline API | No public SDK | Via daily modified-deadline query | No | OAuth token | Via M365 add-in / partners | N/A (litigation) |
| **CalendarRules (Clio)** | Court-rules engine | Via Clio / calculator integration | No public | No | No | Via Clio | Through Clio | N/A |
| **Docket Alarm (Clio/vLex)** | Litigation data + deadlines | Yes — real API | No public | Alerts | No | API key | Subscription | N/A (litigation/PTAB/TTAB) |
| **USPTO ODP** | Official data | Yes — keyed REST, Swagger | Community (Python/Go) | No | No | x-api-key (ID.me account) | Free | Source of truth |
| **EPO OPS** | Official data | Yes — REST | Community (Python/Go) | No | No | OAuth2 key+secret | Free tier 4 GB/wk | INPADOC legal status |
| **CourtListener/RECAP** | Official litigation data | Yes — REST v4 | Community | **Yes** (docket alerts) | **Yes** | Token | Free tier (tight 2026 limits) / membership | Federal dockets |

## Recommendations

**Stage 0 — Foundations (week 1–2).**
- Provision the programmable foundation now: get a **USPTO ODP API key** (ID.me-verify the USPTO.gov account; note the June 18, 2026 registration requirement and post-Aug 2026 profile fields), register a free **EPO OPS** app (Consumer Key/Secret), and stand up an **Entra app** with `Calendars.ReadWrite` (application) scoped to the single firm mailbox via application access policy.
- Adopt **AppColl** (30-day trial) as the authoritative docket of record: it gives rules-based US/PCT docketing, e-Office Action ingestion, and TSDR auto-update at solo-friendly pricing without requiring you to own the rules engine. This satisfies insurers and gives a defensible system of record on day one.

**Stage 1 — Independent cross-check (month 1–2).**
- Build a TypeScript service that ingests USPTO ODP (file-wrapper/office-action/maintenance-fee data) and independently computes the *deterministic* deadlines (maintenance-fee windows w/ 1.7 roll-forward asymmetry, response periods, PCT 30/31-month from WIPO tables, TM §8/§9/§15). Reconcile nightly against the AppColl docket; alert on any discrepancy. Treat this as a *checker*, never the sole record.
- Wire **redundant reminders** (Outlook via Graph + email + a dashboard) with a 90/60/30/7/1-day escalation ladder and acknowledgment tracking.

**Stage 2 — Self-monitoring (month 2).**
- Add **heartbeat/dead-man's-switch** monitoring to every scheduled job (independent cron-monitoring service). Test the alert path quarterly. This is the highest-leverage reliability investment.

**Stage 3 — Agent layer (month 2–4).**
- Build a **custom MCP server** wrapping ODP, OPS, AppColl import/export, and your deadline engine. Expose read/propose/draft tools to agents; gate all legally-operative actions behind human approval with an audit log.

**Stage 4 — Conditional add-ons (as practice mixes shift).**
- If **trademark** volume grows: add **Alt Legal** (and request API access via sales) for superior TM auto-docketing.
- If **litigation/PTAB** work appears: license court-rules deadlines (LawToolBox partner API in Microsoft 365, or Clio+CalendarRules) and add **CourtListener** (REST API + docket-alert webhooks + its MCP server) for federal docket monitoring. Do **not** handroll cascading court deadlines.
- For **foreign annuities**: use an annuity service (CPA/Clarivate, Dennemeyer, or CPI); never handroll.

**Thresholds that change the recommendation:**
- If AppColl ever ships a documented REST API/webhooks, collapse Stage 1's integration onto it (less custom glue).
- If a vendor ships a production MCP server, prefer it over a self-built wrapper for that surface.
- If trademark or litigation share each exceeds ~20–25% of matters, promote the corresponding Stage 4 tool to a core system rather than an add-on.
- If USPTO ODP rate limits/quotas tighten further or the maintenance-fee bulk dataset changes cadence, increase reliance on the vendor docket and reduce custom polling.

## Caveats
- **Vendor API claims are often marketing, not self-serve developer platforms.** With the exception of LawToolBox (court rules), CourtListener, and the government feeds, "API" frequently means a partner/enterprise integration requiring a sales conversation, with no public docs, auth model, sandbox, or webhooks. AppColl (no API per GetApp) and Alt Legal (gated, undocumented) are the clearest examples; verify directly with each vendor before relying on programmatic access.
- **No IP-docketing MCP server exists as of mid-2026** (subagent-confirmed across Alt Legal, AppColl, CPI, PATTSY WAVE, FoundationIP). Plan to build your own.
- **Date-sensitive items to re-verify:** USPTO ODP registration/MFA/quota changes through 2026 (Developer Hub decommission June 5, 2026; ODP sign-in June 18, 2026; profile fields Aug 18, 2026); legal-tech consolidation (Clio–vLex/Docket Alarm signed June 30, 2025, closed Nov 10, 2025; Clio–CalendarRules 2021; Aderant–American LegalNet 2022; Anaqua–PATTSY WAVE 2020); CourtListener's tightened 2026 default API limits (5/min, 50/hour, 125/day) and membership model; vendor pricing (AppColl ~$100–130/user/mo; Alt Legal per-matter tiers; EPO OPS paid tier €2,800/yr).
- **INPADOC/EPO legal status is not authoritative enough to drive payments** — it lags and should be cross-checked with national offices; treat foreign legal status as advisory.
- **The deterministic deadline engine is a cross-check, not a substitute for professional judgment.** Edge cases (1.7 expiration asymmetry, extension chains, entity-status, revival/intervening rights, discretionary dates) require a human attorney's review; the safe-to-handroll set is deliberately narrow.
- **Some statistics cited in secondary sources vary** (e.g., the percentage of malpractice claims attributable to missed deadlines ranges ~22–25% across ABA-cycle studies; the most recent figure is 24.6%); the directional conclusion (missed deadlines are the leading category, and small firms bear most claims) is robust, but treat specific percentages as approximate and tied to a given study cycle.