# Research Track 1 — IP-Prosecution Docketing Vendors (agent-integration lens)

Researched 2026-06-18 via the `deep-research` harness (6 search angles, 20
sources, 91 extracted claims). **Methodology caveat:** a transient server-side
rate limit ("temporarily limiting requests · not your usage limit") crippled the
harness's adversarial-verify and synthesis phases mid-run, so only 2 claims
reached a full 3-vote verdict; the rest are **single-/primary-source claims that
were extracted but not adversarially cross-voted**. They are labelled by
confidence below. Load-bearing facts were re-checked by hand where it mattered.

The gate: a vendor is **agent-integratable** only if it exposes a real
REST/GraphQL API, SDK, or MCP server. "Fails Public API AND Webhooks" ⇒
**DISQUALIFIED** for the agent use case regardless of how good its rules engine
is. The Outlook/M365 transport is already owned in-repo (see
[`../../microsoft-365-integration`](../../microsoft-365-integration/README.md)),
so the decisive vendor question is: **does it expose deadline DATA via API for
our own agents to pull?**

## Scorecard

| Vendor | Public API/SDK | Rules engine (offices) | USPTO auto-sync | Solo pricing | Agent verdict |
|---|---|---|---|---|---|
| **Computer Packages Inc (CPI)** | **Yes — public REST** w/ due-date endpoints | Patent/TM/Annuity (long-standing engine) | (legacy patent docketing) | enterprise-sales | **SURVIVES** (best API+rules combo) |
| **Alt Legal** | **Yes — first-party API** | TM-strong rules engine; patent = manual | **TM yes**, **patent NO** (manual entry) | **$60/mo / 50 matters** (self-serve) | **SURVIVES** (TM-first) |
| **AppColl** | **No** (explicitly, "no plans", security) | Patent/TM/PCT engine + e-OA auto-docket | **Patent yes** (Patent Center/PAIR) | **$100–130/user/mo** (self-serve) | **DISQUALIFIED** (no API) |
| **FoundationIP** (Clarivate/CPA) | Yes — REST API | Patent/TM/foreign (mature) | yes | enterprise-sales | survives-but-enterprise |
| **Inteum** (Minuet API) | Yes — REST + Python/C# SDKs | tech-transfer / IP-mgmt | partial | enterprise; wrong segment | survives-but-off-segment |
| **PATTSY WAVE** (Anaqua) | **No public API** | Patent/TM + TSDR/PAIR linkage | in-product only | mid-market | **DISQUALIFIED** (no public API) |
| **Anaqua** (Essential/IPDAS) | partner-gated only | mature, full | yes | enterprise | enterprise-only (unverified API) |
| **Dennemeyer DIAMS / iQ** | partner-gated (unverified) | strong annuity/foreign | yes | enterprise | needs-verification |
| **IPfolio** (Clarivate) | API exists (corp IP) | corporate IP mgmt | yes | enterprise/corporate | off-segment |
| **Patrix Patricia** | unverified | full | yes | enterprise | needs-verification |

## Per-vendor notes (with sources)

### Computer Packages Inc (CPI) — strongest API + rules combination
- **Real public REST API.** `developer.computerpackages.com` documents
  resource-oriented JSON endpoints covering **Patent, Trademark, Annuity
  Management, and General Matter**, including **due-date endpoints** (e.g.
  `GET/POST /api/patent/actions/{actId}/duedates`). [primary, harness-extracted;
  live re-fetch was JS-blocked — confirm endpoint set + auth with a credentialed
  read] — https://developer.computerpackages.com/
- CPI is one of the oldest US docketing engines (the rules-engine half is its
  core product). The combination of *a real REST API that returns computed due
  dates* + *a mature rules engine* makes it the **single most promising L2 BUY
  candidate on the API gate** — pending verification of auth model, solo
  availability, and pricing (all enterprise-sales-shaped, not self-serve).

### Alt Legal — the trademark-first survivor with self-serve pricing
- **First-party API exists** for docketing data (matters, dockets, deadlines).
  https://www.altlegal.com/blog/alt-legal-api/ [primary; the announcement gives
  no auth/webhook/SLA mechanics — those need the developer docs].
- **Trademark USPTO auto-sync + rules engine**: adds USPTO TM filings, updates
  statuses, dockets/removes deadlines automatically.
  https://www.altlegal.com/features/automated-ip-docketing/ [primary, 1 vote].
- **Patents are MANUAL entry** — *confirmed 2-0*: you click "Add Matter →
  Patent" and populate filing info by hand; the deadline calc then derives from
  what you entered (no patent office auto-sync).
  https://support.altlegal.com/en/articles/2358912
- **Solo pricing is real and self-serve**: entry tier **"Up to 50 matters —
  $60/month"**, +$30/mo for TM-protection/watch features.
  https://www.altlegal.com/pricing/ [primary; API tier/pricing not stated on the
  page — verify whether API is included or an add-on].
- Note: Alt Legal publicly discussed the **USPTO TSDR API shutdown** affecting
  their sync pipeline — relevant to the official-data fragility in Track 3.
  https://www.altlegal.com/blog/tsdr-api-shutdown-alt-legal/
- **Verdict:** the best *trademark* docketing buy for a solo (self-serve, real
  API, TM auto-sync). Weak for patents (manual entry, no patent auto-sync).

### AppColl — great rules engine, solo pricing… but no API (disqualified)
- **Solo pricing confirmed 2-0**: PM Pro **$100/user/mo**, PM Plus **$130/user/mo
  (incl. 200 matters)**. https://www.appcoll.com/law-firm-product-pricing/
- Rules engine covers **US Patent, US Trademark, PCT (to national phase)**;
  **auto-syncs US patents** from Patent Center/Private PAIR and **auto-dockets
  from USPTO e-Office-Action emails**. [primary, single-source]
  https://www.appcoll.com/law-firms/prosecution-manager/tasks-module/
- **BUT: "AppColl has no API and explicitly has no plans to introduce one,
  citing security."** Only programmatic data-out = scheduled report dumps via
  **SFTP / S3 / email**; no queryable REST/GraphQL/webhooks/MCP.
  https://forum.appcoll.com/topic/285/api
- **Verdict: DISQUALIFIED for agent integration** despite being otherwise the
  best-fit small-firm product (rules engine + USPTO auto-sync + solo price). Its
  report-dump export could feed a one-way ingest, but agents cannot read/write it
  live. A strong *cautionary data point*: the best small-firm UX here is the one
  that deliberately walls off programmatic access.

### Others
- **FoundationIP** (Clarivate/CPA Global): implemented a **REST API** for
  near-real-time data sharing. Real engine, but enterprise-sold.
  https://clarivate.com/intellectual-property/blog/innovating-ip-management-making-foundationip-even-better/
- **Inteum**: **"Minuet" API** with official **Python and C# SDKs** — genuinely
  developer-forward, but Inteum targets university **tech-transfer / corporate
  IP**, not solo prosecution docketing. https://www.linkedin.com/posts/inteum-company-llc_the-minuet-api-now-has-new-endpoints-activity-7315391739731632128-WDQ3
- **PATTSY WAVE** (now under Anaqua): advertises **TSDR + Private PAIR** linkage
  but **exposes no public/partner API** on its surface → disqualified on the gate.
  https://www.anaqua.com/pattsy-wave/
- **Anaqua / Dennemeyer DIAMS / IPfolio / Patrix Patricia**: enterprise IP
  platforms with strong rules engines (esp. Dennemeyer for **foreign
  annuities**); APIs are partner-gated and pricing is enterprise-sales. Marked
  **needs-verification**; none is self-serve solo-accessible.

## Track-1 takeaways for the four-layer frame

- **L2 (rules engine) BUY candidates that pass the API gate:** **CPI** (best API
  + due-date endpoints + patent/TM/annuity engine), **Alt Legal** (TM-first,
  self-serve, real API), **FoundationIP/Inteum** (enterprise/off-segment).
- **The cruel irony:** the product with the best *small-firm fit* (AppColl —
  rules engine + USPTO auto-sync + $100/mo) is **disqualified by a deliberate
  no-API policy.** This is the central tension of the buy path: small-firm-priced
  ⇏ developer-accessible.
- **No vendor offers an MCP server.** None offers *both* self-serve solo pricing
  *and* an open public API *and* a patent auto-sync rules engine — the three
  rarely co-occur.
- For **patents specifically**, vendor auto-sync is thin (Alt Legal = manual;
  AppColl = yes-but-no-API), which pushes the patent event source (**L1**) back
  toward the official USPTO ODP route covered in Track 3.
