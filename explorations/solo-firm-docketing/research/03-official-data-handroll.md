# Research Track 3 — Official-Data Sources + the Handroll Route

Researched 2026-06-18 via the `deep-research` harness, then re-run
sequentially. This file reflects the **verified rerun** (`wkcbdgqqo`): 24
confirmed claims, with the data-source findings unanimous where noted. The data
foundation is high-confidence; the legal-rule determinism boundary remains
partly inferential and should be re-verified against primary legal sources
before build.

The question: can we **handroll** deadline tracking on top of authoritative
government data instead of (or alongside) buying a rules engine — and where does
handrolling cross into malpractice-grade danger?

## Part A — Authoritative data sources (the L1 event feeds)

| Source | Covers | Auth | Limits | Push? | Notes |
|---|---|---|---|---|---|
| **USPTO ODP** (`api.uspto.gov`, `data.uspto.gov`) | US patent application data, Patent File Wrapper, office actions, continuity, PTA, datasets | **API key** | **burst=1 / no concurrent same-key calls**; ~4–15 req/s sequential; metadata APIs 5M/week; Patent File Wrapper 1.2M/week | **No — poll sequentially** | Patent L1 backbone; already wrapped by `@beep/uspto` |
| **USPTO Office Action APIs** | full-text office actions, rejections, citations | API key | ODP rate categories | No | ODP OA Text Retrieval endpoint gives dates and text |
| **USPTO `ptmnfee2`** | maintenance-fee events for patents granted 1981-09-01→present | API key / bulk dataset | weekly cumulative ASCII | bulk poll | cleanest ground truth for 3.5/7.5/11.5-yr windows |
| **USPTO TSDR** | US trademark status/documents | API key (flagged for re-verify) | flagged 60 req/min uncertainty | No | TM source, but outage/churn risk |
| **EPO OPS** | EP/worldwide biblio, **INPADOC legal-status events**, EPO Register | **OAuth2 client_credentials** | fair-use quota flagged for re-verify | No | foreign status/annuity event feed; OSS clients exist |
| **WIPO PATENTSCOPE / ePCT** | PCT publication/status data | SOAP/Java; paid bulk SFTP | paid bulk subscriptions | No | heavyweight, not first-slice dependency |
| **PACER** | federal litigation dockets/documents | PACER account | per-page fees | No real public retrieval API | avoid direct polling |
| **CourtListener / RECAP** | RECAP archive, dockets, entries, parties, documents | **Token auth** | free default now **5/min, 50/hr, 125/day** | **Yes — Docket Alert webhooks + hosted MCP** | open litigation L1 route |

### USPTO ODP: patent L1, but poll one-at-a-time per key

- **Auth and limits are design-driving.** USPTO ODP uses API-key auth. The rate
  limits page says same-key concurrent calls are blocked: one API call per API
  key, burst **1**, with sequential request rates around **4–15 req/s**. Metadata
  APIs share **5M calls/week** resetting Sunday midnight UTC; Patent File Wrapper
  is a separate **1.2M/week** category. Live verification in the rerun saw 401
  unauthenticated and 403 with a bad key. **Design implication for `@beep/uspto`
  and any poller: poll sequentially per key; do not fan out.**
  https://data.uspto.gov/apis/api-rate-limits ·
  https://data.uspto.gov/apis/getting-started
- **Prosecution data is rich enough for L1.** ODP exposes Patent File Wrapper
  application data, continuity, transactions, PTA, documents, and full-text
  office actions. The Office Action Text Retrieval endpoint is
  `POST https://api.uspto.gov/api/v1/patent/oa/oa_actions/v1/records`, refreshes
  daily, and requires an API key. ODP also includes Office Action Rejections and
  Office Action Citations APIs (PTO-892/PTO-1449-derived). Full-text OA coverage
  starts around 12-series applications and public/published office actions.
  https://data.uspto.gov/apis/patent-file-wrapper/documents ·
  https://data.uspto.gov/apis/api-rate-limits
- **PEDS retirement is complete.** ODP launched 2025-02-12; PEDS was retired on
  2025-03-14, and USPTO publishes a PEDS-to-ODP mapping document. PEDS is not a
  pending risk for this packet; the re-verify-before-build risk is legacy
  Developer Hub / ODP-Beta sunset timing. https://www.uspto.gov/about-us/news-updates/uspto-launches-new-open-data-portal ·
  https://www.uspto.gov/learning-and-resources/electronic-data-products/additional-patent-data-products ·
  https://data.uspto.gov/documents/documents/PEDS-to-ODP-API-Mapping.pdf

### USPTO maintenance-fee events (`ptmnfee2`)

- **`ptmnfee2` is the cleanest ground truth for maintenance-fee windows.** It
  covers patents granted **1981-09-01 to present** and ships as a weekly
  cumulative ASCII file (`MaintFeeEvents.zip`, released Tuesday and dated
  Monday). Each fixed-width record includes patent number, application number,
  small-entity flag, filing date, grant/issue date, event entry date, and event
  code. https://data.uspto.gov/bulkdata/datasets/ptmnfee2 ·
  https://www.uspto.gov/learning-and-resources/electronic-data-products/additional-patent-data-products
- **Reusable OSS parser exists.** `github.com/iamlemec/fastpat` parses the real
  fixed-width maintenance-fee event file; its event-code handling corroborates
  that issue date + event code can compute/cross-check the 3.5/7.5/11.5-year
  windows. https://github.com/iamlemec/fastpat

### EPO and WIPO: useful, heavier, not first slice

- **EPO OPS** uses OAuth2 `client_credentials`: register an app, send HTTP Basic
  key:secret to `https://ops.epo.org/3.2/auth/accesstoken`, and call OPS
  endpoints. OPS draws from EPO bibliographic, worldwide legal-status
  (INPADOC), full-text, and image databases; `GetLegal`/`GetLegalRaw` return
  dated legal-status events. Model a future driver on existing OSS clients such
  as `ip-tools/python-epo-ops-client` or `patent-dev/epo-ops` (Go). The commonly
  cited EPO fair-use quota (~4 GB/week) should be re-verified before build.
  https://www.epo.org/en/searching-for-patents/data/web-services/ops ·
  https://developers.epo.org ·
  https://github.com/ip-tools/python-epo-ops-client
- **WIPO PATENTSCOPE** programmatic access is SOAP/Java, not REST. Bulk PCT data
  products are paid SFTP subscriptions: PCT-Text **3,900 CHF/yr** and
  PCT-Bibliographic **400 CHF/yr**. ePCT Web Services are REST, but they are a
  separate Office-facing surface, not a first-slice PATENTSCOPE data API.
  https://www.wipo.int/en/web/patentscope/data/index

### Litigation: CourtListener webhooks over polling, PACER only through RECAP

- **PACER has no real public retrieval API.** Direct PACER access remains
  account/per-page oriented; PACER Case Locator is delayed metadata search, not
  an agent-grade retrieval API. The open route is CourtListener/RECAP.
  https://pacer.uscourts.gov/pacer-pricing-how-fees-work
- **CourtListener REST is usable but too tight to poll on free tier.** REST API
  v4.4 uses `Authorization: Token <token>`. On 2026-05-07, Free Law Project
  tightened the default free limits to **5 requests/minute, 50/hour, 125/day**,
  which is not enough for broad polling. https://www.courtlistener.com/help/api/rest/ ·
  https://free.law/2026/05/07/api-included-in-memberships/
- **Use Docket Alert webhooks.** CourtListener Docket Alerts can send webhooks in
  real time when monitored cases get new filings. Webhooks cover five event
  types: **Docket Alert, Search Alert, RECAP Fetch, Old Docket Alerts Report,
  Pray-and-Pay**. Failed deliveries retry seven times with exponential backoff
  over roughly 54 hours, auto-disable after eight total failures, and support
  two-day event replay. This is the only push-capable L1 source in the study.
  https://www.courtlistener.com/help/api/rest/alerts/ ·
  https://www.courtlistener.com/help/api/webhooks/
- **RECAP Fetch fills the PACER gap, but costs pass through.** The API can
  asynchronously request dockets, PDFs, or attachment pages
  (`request_type` 1/2/3) using the user's PACER credentials. The API is free, but
  the user pays their PACER bill. https://www.courtlistener.com/help/api/rest/v4/recap/ ·
  https://free.law/recap/
- **CourtListener has an official hosted MCP.** Free Law Project operates
  `https://mcp.courtlistener.com`, live in Anthropic's MCP Connector Directory
  since 2026-05-12 with OAuth and no self-hosting. This is useful for agentic
  litigation data access, but the product should still own durable event records
  and reminder state locally. https://free.law/2026/05/12/courtlistener-is-now-available-inside-claude/ ·
  https://wiki.free.law/c/courtlistener/help/api/mcp/model-context-protocol-mcp-server-for-agentic-access

## Part B — The handroll question (which rules are safe to encode)

The rerun strongly confirmed **Part A data sources**. The legal-rule boundary
below was established in the earlier hand research and remains an inference to
re-verify before implementation.

**Safe to handroll** (deterministic, single governing rule, US-only), *as a
candidate cross-checked against ODP/TSDR ground truth*:

- **Patent maintenance fees** — windows at **3.5 / 7.5 / 11.5 yr**; the 6-month
  window period precedes each due date, the 6-month grace period follows with
  surcharge. `ptmnfee2` gives a government event stream for cross-checking.
  https://www.uspto.gov/web/offices/pac/mpep/s2506.html ·
  https://www.ecfr.gov/current/title-37/chapter-I/subchapter-A/part-1/subpart-B/subject-group-ECFR335b8caa4be3dd2/section-1.362
- **Office-action response periods** — statutory **6 months max** under
  35 U.S.C. §133, commonly shortened to **3 months** with extensions up to the
  6-month cap under 37 CFR 1.136(a). Trigger = OA mail date, anchored by ODP.
  https://www.uspto.gov/web/offices/pac/mpep/s710.html
- **PCT national-phase entry** — **30/31 months** from priority under PCT
  Art. 22/39. Deterministic from the priority date.
  https://www.wipo.int/en/web/pct-system/texts/time_limits
- **Trademark post-registration** — §8/§15 between 5th–6th year, §8/§9 renewal
  between 9th–10th year and each 10 years after, with grace mechanics.
  Deterministic from registration date, cross-check TSDR before relying on it.
  https://www.uspto.gov/trademarks/trademark-timelines/post-registration-timeline-all-registrations-except-madrid-protocol

**Edge cases that add real risk even within the "safe" set:** weekend/federal
holiday/USPTO-closure roll-forward (37 CFR 1.7), extension chains, revival,
restoration, and fact-dependent exceptions. Encodable, but each must be an
explicit tested rule line item, not a background assumption.
https://www.ecfr.gov/current/title-37/chapter-I/subchapter-A/part-1/subpart-A/subject-group-ECFR5cdb43ad1467198/section-1.7

**Do NOT handroll** (license or keep human-as-engine):

- **Foreign annuities/renewals** — multi-jurisdiction fee schedules, grace
  periods, restoration, and local-law churn. This is the Dennemeyer/CPI/CPA
  engine domain.
- **Litigation / court-rule deadlines** — federal/state/local/judge rules with
  cascading recalculation. This is LawToolBox/CalendarRules territory.
- Anything discretionary or fact-dependent, including bespoke court schedules or
  examiner-set non-statutory periods.

## Part C — Open-source tooling

- **No production-grade open-source legal deadline rules engine was confirmed.**
  This absence was **not re-confirmed** in the verified rerun, so treat it as an
  earlier hand-research finding to refresh before build. The useful open-source
  assets are API/data clients, not rules engines: `fastpat` for USPTO maintenance
  fee events, `python-epo-ops-client` for EPO OPS, `patent_client` for patent API
  access patterns, and Free Law Project's CourtListener code/API client.
  https://github.com/iamlemec/fastpat ·
  https://github.com/ip-tools/python-epo-ops-client/ ·
  https://github.com/parkerhancock/patent_client ·
  https://github.com/freelawproject/courtlistener ·
  https://github.com/freelawproject/courtlistener-api-client

## Track-3 verdict

- **Part A is verified:** authoritative event data exists for the first slice.
  ODP gives patent file-wrapper/office-action data but must be polled
  **sequentially per API key**; `ptmnfee2` gives maintenance-fee ground truth;
  EPO OPS and WIPO are future heavier integrations; CourtListener is the
  litigation push path via webhooks plus hosted MCP.
- **A narrow, US-only, deterministic handroll remains defensible as the first
  slice**: maintenance fees, §133/§136 response periods, PCT national-phase, and
  TM post-registration, emitted as approval-gated candidates and cross-checked
  against ODP/TSDR/`ptmnfee2` where available.
- **The danger line is unchanged:** foreign annuities, multi-jurisdiction
  extension chains, litigation/court rules, and discretionary periods. Past that
  line, buy a rules engine (CPI, LawToolBox, Dennemeyer/CPA-class engines) or
  keep the attorney as the rules engine.
- **Re-verify before building:** ODP-Beta (2026-05-29) and legacy Developer Hub
  (2026-06-05) sunset details, TSDR API-key and 60-req/min limit, EPO fair-use
  quota, and the specific statutory/rule computations that were inferential in
  this rerun.
