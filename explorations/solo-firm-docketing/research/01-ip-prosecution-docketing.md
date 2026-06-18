# Research Track 1 — IP-Prosecution Docketing Vendors (agent-integration lens)

Researched 2026-06-18 via the `deep-research` harness, then re-run
sequentially. This file reflects the **verified rerun** (`w9640wo1m`): 20
confirmed claims, with the load-bearing vendor/API findings adversarially
checked.

The gate: a vendor is **agent-integratable** only if it exposes a real
REST/GraphQL API, SDK, or MCP server. "Fails Public API AND Webhooks" means
**DISQUALIFIED** for the agent use case regardless of how good its rules engine
is. The Outlook/M365 transport is owned by the graduated
[`m365-driver`](../../../goals/m365-driver/README.md) goal, so the decisive
vendor question is: **does it expose deadline data via API for our own agents to
pull or write, while `@beep/m365` owns Outlook push?**

## Scorecard

| Vendor | Public API/SDK | Rules engine | USPTO auto-sync | Solo pricing | Agent verdict |
|---|---|---|---|---|---|
| **Computer Packages Inc (CPI)** | **Yes — public REST**, Postman-backed docs, OAuth2 bearer, unattended password grant | Patent / TM / annuity due-date engine | product-level IP docketing | enterprise-sales / hosted-on-prem variable | **#1 BUY** — strongest headless-agent fit |
| **Alt Legal** | **Yes — public API announced**, but developer docs/auth are sales-gated | TM-strong rules engine | **TM yes via TSDR**, patent manual | **$60/mo / 50 matters**, published tiers | **#2 BUY** — TM-first, TSDR SPOF |
| **AppColl** | **No** — staff say no API and no plans for security reasons | Patent/TM/PCT engine + e-OA auto-docket | **Patent/TM yes** | **$100–130/user/mo** | **DISQUALIFIED** despite strong solo fit |
| **Clarivate FoundationIP / IPfolio** | Public API is bibliographic IP Data API only, not docketing | mature enterprise IPMS | enterprise | enterprise-sales | **DISQUALIFIED** for deadline data |
| **Anaqua / PATTSY WAVE** | Marketing-only "APIs"; no public developer docs | mature docketing; DMS sync | product-level PAIR/TSDR/etc. | enterprise-sales | **DISQUALIFIED** |
| **Dennemeyer DIAMS iQ** | Demo-gated partner API only | **220 jurisdictions / 5,500+ due-date guidelines** | enterprise | enterprise-sales | disqualified for solo agents; useful danger-line evidence |
| **Patrix Patricia / Inteum / Anaqua Essential/IPDAS** | no primary public developer-API evidence found | mature/off-segment | varies | enterprise/off-segment | no usable public API found |

## Per-vendor notes (with sources)

### Computer Packages Inc (CPI) — strongest headless-agent BUY

- **Real public REST API.** `developer.computerpackages.com` is reachable without
  auth to read docs and is backed by a Postman collection. The portal describes
  RESTful JSON endpoints using standard HTTP verbs/codes and bearer
  authentication. The verified collection contains patent, trademark, annuity,
  and general-matter resources, with bidirectional read/write patterns
  (GET/POST/PATCH/DELETE) across resource families.
  https://developer.computerpackages.com/
- **Due-date endpoint exists.** The load-bearing patent due-date endpoint appears
  verbatim as `/api/patent/actions/{actId}/duedates`, including a concrete
  example action id (`2891`). The broader claim that every due-date verb and
  parallel trademark due-date endpoint is documented was **refuted** in the
  rerun; treat the due-date resource as confirmed, but verify the exact full
  endpoint inventory during partner evaluation. https://developer.computerpackages.com/
- **Auth is headless-ready.** CPI documents OAuth2 bearer auth via
  `POST /connect/token`, with supported grants including `password` and
  `refresh_token`. The docs explicitly say the **password grant can be used for
  unattended API calls**, which upgrades CPI from "possible API" to the strongest
  agent-integratable buy option for this packet. The base host is a configurable
  `{{url}}`, consistent with hosted/on-prem deployments.
  https://developer.computerpackages.com/
- **Annuity API posture matches the overlay shape.** CPI markets annuity APIs as
  usable even when the client uses another patent docketing platform or vendor,
  reinforcing the "vendor as rules/data engine, Beep as approval/reminder
  overlay" architecture. https://www.computerpackages.com/patent-annuity-management/

**Verdict:** CPI is the best IP-prosecution **L2 BUY** candidate: real public
REST docs, due-date resources, patent/TM/annuity coverage, write verbs, and a
documented unattended OAuth2 path. Open due diligence: commercial access for a
solo, exact deployed base URL, credential issuance, SLA/export terms, and the
complete due-date endpoint set.

### Alt Legal — #2, trademark-first, API real but sales-gated

- **Public API announcement is real.** Alt Legal says its API gives
  "programmatic access" to Alt Legal data and names docketing-oriented use
  cases, including syncing important dates with internal calendaring or
  notification systems and feeding docket data into other tools to automate
  actions. https://www.altlegal.com/blog/alt-legal-api/
- **Not truly self-serve for developers.** No public developer portal, endpoint
  reference, auth model, or `api.altlegal.com` docs were found. Access appears
  to route through demo/login/sales/support, and it is unconfirmed whether API
  access is included in the solo tier or sold as an add-on.
  https://www.altlegal.com/blog/alt-legal-api/
- **Published solo pricing exists.** Tiers are transparent up to 400 matters:
  50 matters **$60/mo**, 100 **$100/mo**, 200 **$195/mo**, 400 **$295/mo**, with
  trademark add-ons in the **$30–95/mo** range; 1,000+ matters is "Get in
  touch." The CTAs still route through request-a-demo/login rather than a clean
  pay-and-create developer flow. https://www.altlegal.com/pricing/
- **TSDR is a single point of failure.** Alt Legal publicly stated TSDR API was
  the only source for its trademark autotracking data when a USPTO shutdown
  temporarily disabled the feature; USPTO also showed a fresh TSDR outage on
  2026-04-29. This is a structural risk for any TM auto-sync path, not just Alt
  Legal. https://www.altlegal.com/blog/tsdr-api-shutdown-alt-legal/
- **Patent story is weaker.** Patent matters are manual-entry workflows; this is
  not a patent auto-sync engine comparable to AppColl's internal USPTO sync.
  https://support.altlegal.com/en/articles/2358912

**Verdict:** Alt Legal is the best solo-accessible **TM** buy and the #2 overall
agent-integratable vendor. It is not the first patent spine because the API docs
are sales-gated and its strongest automation depends on fragile TSDR access.

### AppColl — great small-firm product, no usable API

- **No API, explicitly.** AppColl staff state: "we do not have plans to
  introduce an API for security reasons." The only automation surface found is
  inbound integrations AppColl itself consumes plus scheduled export/reporting
  patterns, not a queryable REST/GraphQL/webhook/MCP surface for our agents.
  https://forum.appcoll.com/topic/285/api
- **Solo pricing and USPTO automation are real.** PM Pro is published at
  **$100/user/mo** and PM Plus at **$130/user/mo**; AppColl can auto-create tasks
  from USPTO e-Office-Action emails and retrieve Patent Center documents.
  https://www.appcoll.com/law-firm-product-pricing/ ·
  https://support.appcoll.com/eoffice-actions

**Verdict:** DISQUALIFIED for this architecture despite being otherwise the
closest small-firm product fit. It may be a docket system of record the attorney
uses separately, but it cannot be the agent-readable L2 engine.

### Enterprise and off-segment products

- **Clarivate FoundationIP / IPfolio:** the public developer portal exposes an
  **IP Data API** for bibliographic/search/analytics use cases, not
  FoundationIP/IPfolio docketing or deadline data. Access is contract/use-case
  gated. https://developer.clarivate.com/apis/ipdata-api ·
  https://developer.clarivate.com/content/developer-portal-faq
- **Anaqua / PATTSY WAVE:** Anaqua mentions "APIs for seamless data sharing" in
  marketing copy, but no public developer portal, endpoint reference, SDK, auth
  model, webhook docs, or MCP server surfaced. The concrete connector found is
  PATTSY WAVE Sync for DMS point-to-point integration, not an open agent API.
  https://www.anaqua.com/resource/pattsy-wave-an-integrated-docketing-platform-for-ip-operations-leaders/ ·
  https://www.anaqua.com/pattsy-wave/achieve-docketing-excellence/
- **Dennemeyer DIAMS iQ:** demo-gated partner API posture only, but the rules
  engine itself is serious: 220 jurisdictions and 5,500+ due-date calculation
  guidelines. This is a strong warning about where **not** to handroll: foreign
  annuities and multi-jurisdiction chains. https://www.dennemeyer.com/ip-software/diams/ ·
  https://www.dennemeyer.com/services/digital-ip/dennemeyer-api
- **Patrix Patricia, Inteum, Anaqua Essential/IPDAS:** no primary developer-doc
  evidence for a usable public deadline/docketing API survived this rerun. Treat
  as "no public API found" pending direct vendor contact.

## Track-1 takeaways for the four-layer frame

- **Ranked L2 BUY shortlist:** **CPI** first (public REST, due-date resources,
  OAuth2 password grant for unattended calls, read/write), **Alt Legal** second
  (real API + solo pricing, but docs/auth sales-gated and TSDR is fragile).
- **Disqualified:** AppColl, Clarivate FoundationIP/IPfolio, Anaqua/PATTSY WAVE,
  Dennemeyer DIAMS iQ, Patrix Patricia, Inteum, and Anaqua Essential/IPDAS for
  lacking a usable public/partner developer API for deadline data in this packet.
- **No vendor offers MCP or documented public webhooks.** Any bought engine is
  REST-over-our-own-driver, then optionally surfaced through Beep's own MCP
  server pattern.
- **Patent event source still belongs to ODP.** The best small-firm USPTO
  auto-sync product (AppColl) has no API; Alt Legal is TM-first; CPI is buyable
  only after partner/commercial access checks. The first patent slice should
  keep L1 on official USPTO ODP and treat vendors as additive L2 redundancy.
