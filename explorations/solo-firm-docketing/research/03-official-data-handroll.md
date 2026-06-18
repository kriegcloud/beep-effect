# Research Track 3 — Official-Data Sources + the Handroll Route

Researched 2026-06-18. The `deep-research` harness scope-failed here (rate
limit), so **this track was reconstructed by direct, primary-source
WebFetch/WebSearch** against the official portals and the governing rules. Source
links inline.

The question: can we **handroll** deadline tracking on top of authoritative
government data instead of (or alongside) buying a rules engine — and where does
handrolling cross into malpractice-grade danger?

## Part A — Authoritative data sources (the L1 event feeds)

| Source | Covers | Auth | Limits | Push? | Notes |
|---|---|---|---|---|---|
| **USPTO ODP** (`data.uspto.gov`, `api.uspto.gov`) | US patents: app data, **file-wrapper docs, Office Actions (full text)**, continuity, PTAB | **API key** (USPTO.gov + ID.me) | per-key (see rate-limits page) | **No — poll, daily refresh** | The patent L1 backbone; **already wrapped by `@beep/uspto`** |
| **USPTO TSDR** | US trademark status & documents | **API key** (since 2020-10-02) | **60 req/min** (4/min PDF/ZIP) | No — poll | TM status/deadlines; migrating into ODP |
| **USPTO Patent Maintenance Fee Events** | maintenance-fee status/events, bulk | (bulk) | bulk dataset | bulk file | clean handrollable rule source |
| **EPO OPS** | EP/worldwide biblio, **INPADOC legal status**, EPO Register | **OAuth2** key+secret (free tier) | **4 GB/week** free; header quota | No — poll | foreign status/annuity events; mature OSS clients exist |
| **WIPO PATENTSCOPE / ePCT** | PCT international status (IASR), national-phase data | account | — | No | PATENTSCOPE = **SOAP/Java**; ePCT = REST (XML/JSON) but Office-oriented |
| **PACER** (CM/ECF) | federal litigation dockets | account | **$0.10/page** | No real API | PCL metadata search only, ~1-day delayed — **not agent-friendly** |
| **CourtListener / RECAP** (Free Law Project) | RECAP archive of PACER dockets, entries, parties | **API token** | 5/min, 50/hr, 125/day free | **Webhooks + MCP** | **The open, agent-native litigation route** |

### Details + sources

- **USPTO Open Data Portal (ODP)** is the consolidated go-forward platform. It
  exposes Patent File Wrapper **search**
  (`GET https://api.uspto.gov/api/v1/patent/applications/search`), **documents**
  (`.../applications/{appNum}/documents`), **application-data**, and **Office
  Actions full text** (the legacy Office Action APIs were migrated into ODP).
  Coverage: applications **Jan 2001→present, refreshed daily**. **API key**
  required (MyODP + USPTO.gov + ID.me). **No webhooks** — you poll.
  https://data.uspto.gov/apis/getting-started ·
  https://data.uspto.gov/apis/patent-file-wrapper/documents ·
  https://data.uspto.gov/apis/api-rate-limits
  - **Sunsets to track:** ODP **Beta** shuts down **2026-05-29**; the legacy
    **Developer Hub** is decommissioned **2026-06-05**. The repo's `@beep/uspto`
    must be pinned to the `api.uspto.gov` ODP surface, not legacy endpoints.
    https://data.uspto.gov/
- **USPTO TSDR** (trademark) requires an **API key** (since 2020-10-02),
  rate-limited **60 req/key/min** (4/min for PDF/ZIP).
  https://developer.uspto.gov/api-catalog/tsdr-data-api · https://tsdr.uspto.gov/faqview
  - **Fragility flag:** TSDR's API access model has churned (Alt Legal publicly
    documented a **TSDR API shutdown** disrupting their sync) — the TM L1 feed is
    less stable than the patent ODP feed. https://www.altlegal.com/blog/tsdr-api-shutdown-alt-legal/
- **USPTO Patent Maintenance Fee Events** dataset (`ptmnfee2`) provides the
  status/timing of maintenance-fee events in bulk — the clean source for the most
  deterministic deadline of all. https://data.uspto.gov/bulkdata/datasets/ptmnfee2 ·
  https://developer.uspto.gov/product/patent-maintenance-fee-events-and-description-files
- **EPO OPS**: free developer account, **OAuth2 consumer key+secret**, **fair-use
  4 GB/week** (quota tracked via response headers). Covers DOCDB bibliographic,
  **INPADOC legal-status events** (pending/issued/abandoned/expired — the foreign
  annuity/lapse signals), and the EPO Register. Multiple **mature OSS clients**
  (`ip-tools/python-epo-ops-client`, `patent-dev/epo-ops` Go) to model the driver
  on. https://www.epo.org/en/searching-for-patents/data/web-services/ops ·
  https://github.com/ip-tools/python-epo-ops-client/
- **WIPO**: PATENTSCOPE offers a **SOAP/Java** API (IASR status, batch
  downloads); **ePCT Web Services** are REST (XML/JSON/PDF/ZIP) but Office-facing.
  Usable for PCT national-phase data, but the least developer-friendly surface.
  https://www.wipo.int/en/web/patentscope/data/index · https://pct.wipo.int/ePCT/about-epct.xhtml
- **PACER** has **no real public API** ($0.10/page; only the PACER Case Locator
  metadata search, ~1-day delayed) → unusable directly by agents.
  https://pacer.uscourts.gov/pacer-pricing-how-fees-work
- **CourtListener (Free Law Project)** is the **open, agent-native** litigation
  route: a **REST API v4** over the RECAP archive (~½ billion PACER items:
  dockets, entries, documents, parties), token auth (`Authorization: Token …`),
  **free** (5/min, 50/hr, 125/day; elevated via FLP membership). It has
  **Docket Alerts + webhooks** (notify on new filings) and an **official hosted
  MCP server** (`https://mcp.courtlistener.com`, in Anthropic's MCP Connector
  Directory, OAuth). A **RECAP Fetch API** buys PACER content into CourtListener
  using your own PACER credentials. https://wiki.free.law/c/courtlistener/help/api/rest/v4/overview ·
  https://www.courtlistener.com/help/api/webhooks/ ·
  https://wiki.free.law/c/courtlistener/help/api/mcp/model-context-protocol-mcp-server-for-agentic-access
  - **This is the only L1 source in the whole study with webhooks AND an MCP
    server** — the litigation *event source* is the most agent-ready piece, even
    though the court-rules *engine* (L2) still needs LawToolBox/CalendarRules.

## Part B — The handroll question (which rules are safe to encode)

**Safe to handroll** (deterministic, single governing rule, US-only), *as a
candidate cross-checked against ODP/TSDR ground truth*:

- **Patent maintenance fees** — windows at **3.5 / 7.5 / 11.5 yr**; the 6-month
  window-period (no surcharge) precedes each due date, the 6-month grace period
  (with surcharge) follows. **37 CFR 1.362(d)/(e)**. The single cleanest rule, and
  the Maintenance Fee Events dataset gives ground truth.
  https://www.uspto.gov/web/offices/pac/mpep/s2506.html
- **Office-action response periods** — statutory **6 months max** (35 U.S.C.
  §133), shortened to typically **3 months** with extensions of time purchasable
  up to the 6-month cap (**37 CFR 1.136(a)**). Trigger = OA **mail date** (now
  available in ODP). Deterministic given the mail date + shortened period.
- **PCT national-phase entry** — **30/31 months** from priority (PCT Art. 22/39).
  Deterministic from the priority date.
- **Trademark post-registration** — **§8 & §15** (between 5th–6th yr), **§8 & §9
  renewal** (between 9th–10th yr, then each 10), with 6-month grace. Deterministic
  from registration date (cross-check TSDR).

**Edge cases that add real risk even within the "safe" set:** weekend/federal-
holiday/USPTO-closure roll-forward (**37 CFR 1.7**), extension chains, and
restoration/revival provisions. Encodable, but each is a tested-rule line item,
not an afterthought.

**Do NOT handroll (license or keep human-as-engine):**

- **Foreign annuities/renewals** — hundreds of jurisdictions, per-country fee
  schedules, grace/restoration rules; this is precisely what Dennemeyer/CPA sell.
- **Litigation / court-order deadlines** — thousands of federal+state+local+judge
  standing-order rules with cascading recalculation; this is the LawToolBox/
  CalendarRules domain (Track 2).
- Anything where the governing rule is **discretionary or fact-dependent** (e.g.
  examiner-set non-statutory periods, court-ordered bespoke schedules).

## Part C — Open-source tooling

- **No production-grade open-source rules-based deadline-calculation library
  exists.** The closest is `openlegaldata/awesome-legal-data`'s narrow **"Lien
  Deadlines"** dataset (CA/TX/FL mechanics liens, JSON+CSV, CC BY 4.0) — not a
  general engine. https://github.com/openlegaldata/awesome-legal-data
  - **This absence is itself a finding:** if we handroll L2, we build the rules
    engine from raw statute/CFR with **no library to lean on** — which is exactly
    why broad handrolling is malpractice-grade dangerous and why the safe handroll
    is deliberately *narrow + deterministic + ground-truth-checked + approval-
    gated*.
- **Reusable API clients** exist and are worth modelling the drivers on:
  `ip-tools/python-epo-ops-client` (EPO OPS), `patent-client` (multi-office),
  CourtListener is itself **open-source Django** (RECAP). The repo already has
  `@beep/uspto` for ODP.

## Track-3 verdict

- A **narrow, US-only, deterministic handroll** — maintenance fees + §133/§136
  response periods + PCT national-phase + TM post-registration — **cross-checked
  against ODP/TSDR as ground truth and emitted as approval-gated candidates** — is
  **defensible as the first slice**. The data sources exist (ODP has office
  actions + the maintenance-fee dataset; `@beep/uspto` already wraps ODP), the
  rules are few and statutory, and the candidate/approval doctrine contains the
  liability.
- **The danger line:** foreign annuities, litigation/court-rules, and any
  discretionary period. Past that line, **buy the engine** (CPI/Alt Legal for IP;
  LawToolBox/Clio for court) or keep the attorney as the rules engine.
- **L1 is largely solved/open:** US patents via ODP (have), TM via TSDR, foreign
  via EPO OPS, **litigation via CourtListener (API+webhooks+MCP)**. **Polling** is
  the norm everywhere except CourtListener — the reminder/heartbeat layer (L4)
  must assume poll-based freshness.
