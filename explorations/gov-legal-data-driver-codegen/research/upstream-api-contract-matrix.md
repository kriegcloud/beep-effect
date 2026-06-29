# upstream-api-contract-matrix

Scope: per-upstream contract sheet (auth, base URL/version, pagination, rate limits, live deprecations) for CourtListener V4, eCFR, DOL, Federal Register, GovInfo — to drive the env-auth matrix and the declarative client factory. Verified 2026-06-29.

## Findings

### 0. Three distinct auth families (the matrix axis)

The five upstreams split into **three** auth mechanisms, not the two implied by CAPTURE.md:

- **Token-header (DRF-native):** CourtListener V4 — `Authorization: Token <key>` (literal word `Token`, NOT `Bearer`). Source: https://wiki.free.law/c/courtlistener/help/api/rest/v4/overview
- **api.data.gov shared key:** GovInfo only — key passed as `api_key` query param (api.data.gov also accepts an `X-Api-Key` header). Source: https://www.govinfo.gov/features/api , https://api.data.gov/docs/developer-manual/
- **Agency-native key (DOL data portal):** DOL v4 — `X-API-KEY` issued by `dataportal.dol.gov`, NOT api.data.gov. Source: https://www.dataportal.dol.gov/pdf/dol-api-user-guide.pdf
- **Keyless:** eCFR and Federal Register — no key, no header. Sources: https://www.ecfr.gov/developers/documentation/api/v1 , https://www.federalregister.gov/developers/documentation/api/v1

> CORRECTION to CAPTURE.md line 74 ("GovInfo + DOL require api.data.gov api_key"): only **GovInfo** uses api.data.gov. **DOL's current v4 API uses its own `X-API-KEY` from dataportal.dol.gov**, so the env-auth matrix needs a third auth type, not a shared api.data.gov branch. (Verified below.)

---

### 1. CourtListener (V4)

- **Auth:** HTTP Token auth. Header is literally `Authorization: Token <your-token-here>` — the docs explicitly warn "A common mistake is to forget the word 'Token' in the header"; keyword is `Token`, not `Bearer`. Cookie/session and HTTP Basic are also supported but Token is recommended for programmatic use. Source: https://wiki.free.law/c/courtlistener/help/api/rest/v4/overview
- **Base URL / version:** `https://www.courtlistener.com/api/rest/v4/` (example: `.../api/rest/v4/clusters/`). V4 is current (latest **v4.5**). Source: https://wiki.free.law/c/courtlistener/help/api/rest/v4/overview , https://wiki.free.law/c/courtlistener/help/api/rest/change-log
- **Pagination:** Cursor-based (search moved to ElasticSearch + cursor pagination in v4.0). A `count=on` query param returns total counts without fetching data. **Pagination past page 100 is blocked.** Sources: https://wiki.free.law/c/courtlistener/help/api/rest/change-log , https://www.courtlistener.com/help/api/rest/ (search summary)
- **Rate limit — MAJOR RECENT CHANGE (2026-05-07):**
  - **Old default (pre-2026-05-07):** "Before today, we gave every CourtListener user 5,000 API requests per hour out of the box." Source: https://free.law/2026/05/07/api-included-in-memberships/
  - **New default (as of 2026-05-07):** "By default, authenticated users may make up to **5 requests per minute, 50 requests per hour, and 125 requests per day**." Rolling-window; all throttles apply concurrently, most restrictive wins. Source: https://wiki.free.law/c/courtlistener/help/api/rest/v4/overview (confirmed across two independent fetches + search summary)
  - **Grandfather clause:** "If you've ever made 1,000 or more API requests, you're grandfathered in. Your existing rate stays in place." Source: https://free.law/2026/05/07/api-included-in-memberships/
  - **Membership = elevated access:** Full API access (incl. PACER endpoints) is now bundled with CourtListener membership tiers (no contact-form gate). Source: https://free.law/2026/05/07/api-included-in-memberships/
  - **Citation Lookup endpoint** has its own throttle: **60 valid citations/minute**, **max 250 citations per request**; citations past the per-request cap are parsed but return a per-citation `status: 429` rather than matching. The endpoint otherwise inherits "the same request throttle rates as the other CourtListener APIs." Sources: https://wiki.free.law/c/courtlistener/help/api/rest/v4/citation-lookup , https://github.com/freelawproject/courtlistener/discussions/6895
- **Deprecations (from changelog):** v4.5 **removed** text-filter ops `contains`/`icontains`/`endswith`/`iendswith` (full-table-scan performance); v3.6 deprecated flat citation fields (`federal_cite_one`, `neutral_cite`, `lexis_cite` → nested `citations`); v3.12 deprecated the experimental "Core API" interface in favor of OpenAPI/Swagger. V3 is legacy but **no formal v3 sunset date is published** in the changelog. Source: https://wiki.free.law/c/courtlistener/help/api/rest/change-log

---

### 2. eCFR (Electronic Code of Federal Regulations)

- **Auth:** **Keyless** — "No authentication required"; public unauthenticated REST. Source: https://www.ecfr.gov/developers/documentation/api/v1
- **Base URL / version:** `https://www.ecfr.gov`; all services under `/api/<service>/v1/`. Machine-readable OpenAPI spec at `https://www.ecfr.gov/developers/documentation/api/v1.json` (useful for the codegen pipeline). Sources: https://www.ecfr.gov/developers/documentation/api/v1 , https://cdn.jsdelivr.net/npm/@us-legal-tools/ecfr-sdk@0.8.2/README.md
- **Services / endpoint groups (three):** Source: https://cdn.jsdelivr.net/npm/@us-legal-tools/ecfr-sdk@0.8.2/README.md
  - **Search** (`/api/search/v1/...`): `results`, `count`, `summary`, `counts/daily`, `counts/titles`, `counts/hierarchy`, `suggestions`.
  - **Versioner** (`/api/versioner/v1/...`): `titles.json`, `full/{date}/title-{title}.xml`, `structure/{date}/title-{title}.json`, `versions/title-{title}.json`, `ancestry/{date}/title-{title}.json`.
  - **Admin** (`/api/admin/v1/...`): `agencies.json`, `corrections.json`, `corrections/title/{title}.json`.
- **Pagination:** Search uses page/offset params (per-spec); versioner returns whole-title structures (date-scoped, not paged). (Exact per_page values not stated in primary docs — see Open/Unverified.)
- **Rate limit:** No published numeric limit; a 429 ("Rate limit exceeded") is the documented error case. Source: https://www.ecfr.gov/developers/documentation/api/v1 (and SDK error-handling notes)

---

### 3. DOL (Department of Labor)

- **Current API = v4 (Open Data Portal).** The legacy `api.dol.gov` V1/V2 services were superseded by the modernized **APIv4** and the legacy developer portal `developer.dol.gov` **no longer resolves** (DNS ENOTFOUND on 2026-06-29 — concrete signal that the legacy hub is decommissioned). Sources: https://www.dataportal.dol.gov/pdf/dol-api-user-guide.pdf , https://usdepartmentoflabor.github.io/DOLAPI/
- **Auth:** **`X-API-KEY`** — DOL-native key (NOT api.data.gov). Obtained by registering at `https://dataportal.dol.gov/registration` (questionnaire) and managed at `https://dataportal.dol.gov/api-keys`. The key is accepted as a header **and** as a query param (the metadata template shows `...?X-API-KEY=<api_key>`). Some endpoints (e.g. `/v4/datasets` catalog listing) require no key; dataset reads require it. Sources: https://www.dataportal.dol.gov/pdf/dol-api-user-guide.pdf , https://usdepartmentoflabor.github.io/DOLAPI/ (DOL API User Guide "Last updated 08/05/2024")
- **Base URL / version:** `https://apiprod.dol.gov/v4/`. Catalog: `https://apiprod.dol.gov/v4/datasets`. Read pattern: `https://apiprod.dol.gov/v4/get/<agency>/<endpoint>/json/...`. Metadata: `https://apiprod.dol.gov/v4/get/<agency>/<endpoint>/json/metadata?X-API-KEY=<key>`. Source: search summary of https://www.dataportal.dol.gov/pdf/dol-api-user-guide.pdf
- **Pagination / rate limit:** Not stated in the extracted primary docs (PDF truncated) — see Open/Unverified.
- **Key-creation limit:** Up to 5 additional API keys per account. Source: https://developer.dol.gov/experienced/ (cached search summary; live page now 404/gone)

---

### 4. Federal Register

- **Auth:** **Keyless** — "No API keys are needed; all you need is an HTTP client or browser." Source: https://www.federalregister.gov/developers/documentation/api/v1
- **Base URL / version:** `https://www.federalregister.gov/api/v1/`. Run by NARA's Office of the Federal Register + GPO. Sources: https://www.federalregister.gov/developers/documentation/api/v1 , https://github.com/rOpenGov/federalregister
- **Endpoints:** `documents` (`/documents.json`, `/documents/{document_number}.json`), `articles` (alias), `public-inspection-documents`, `agencies`, plus search variants. Response formats: JSON and CSV. Sources: https://www.federalregister.gov/reader-aids/developer-resources/rest-api , https://github.com/rOpenGov/federalregister
- **Pagination:** `per_page` default **20**, max **1000**. **Hard cap: you can only paginate through the first 2000 results** — beyond that, narrow with date-range filters. Sources: https://www.federalregister.gov/developers/documentation/api/v1 , https://www.federalregister.gov/reader-aids/developer-resources/rest-api
- **Rate limit:** None published / no documented numeric limit. Source: https://www.federalregister.gov/developers/documentation/api/v1 (absence of any rate-limit statement)

---

### 5. GovInfo (GPO)

- **Auth:** **api.data.gov key required.** "An api.data.gov key is required to use the govinfo API." Passed as a URL query param: `?api_key={YOUR_KEY}` (api.data.gov also accepts `X-Api-Key` header; GovInfo docs show the query-param form). `DEMO_KEY` works for exploration. Sources: https://www.govinfo.gov/features/api , https://api.data.gov/docs/developer-manual/
- **Base URL / version:** `https://api.govinfo.gov/` (unversioned host path; services are top-level). Key signup: `https://www.govinfo.gov/api-signup`. Sources: https://www.govinfo.gov/features/api , https://github.com/usgpo/api
- **Services (discovery + retrieval):** Source: https://github.com/usgpo/api
  - **Search** — `POST https://api.govinfo.gov/search`
  - **Collections** — `https://api.govinfo.gov/collections/{collection}/{startDate}?pageSize=&offsetMark=*`
  - **Published** — `https://api.govinfo.gov/published/{start}/{end}`
  - **Related** — `https://api.govinfo.gov/related/{accessId}`
  - **Packages** — `https://api.govinfo.gov/packages/{packageId}/summary` (also `/zip`, `/pdf`, `/mods`, `/premis`, `/granules`)
- **Pagination:** `offsetMark` (start at `*`, server returns next `offsetMark` in `nextPage`) + `pageSize` (collections capped at 1000). `offsetMark` replaces simple `offset` and enables traversal past the first 10,000 records. Sources: https://www.govinfo.gov/features/api , https://github.com/usgpo/api
- **Rate limit:** GovInfo runs an **elevated** api.data.gov tier — "**36,000 requests per hour** (Primary Rate limit), 1,200 requests per minute, 40 requests per second", rolling hourly, with `X-RateLimit-Limit` / `X-RateLimit-Remaining` response headers. (This is far above the api.data.gov standard 1,000/hr default — GovInfo-specific.) Source: https://github.com/usgpo/api (raw README, confirmed across two fetches)
- **Deprecations:** None published; the Search service (`POST /search`) graduated from "planned" to live. Source: https://www.govinfo.gov/features/api

---

### 6. Shared api.data.gov mechanics (applies to GovInfo)

- **Key submission:** Both supported — `X-Api-Key` HTTP header **or** `api_key` query-string param. Source: https://api.data.gov/docs/developer-manual/
- **Default rate limit:** **1,000 requests/hour** per key, rolling hourly. `429 Too Many Requests` on exceed; block auto-lifts after the hour window. Headers `X-RateLimit-Limit` / `X-RateLimit-Remaining`. Source: https://api.data.gov/docs/developer-manual/
- **DEMO_KEY:** 30 req/IP/hour, 50 req/IP/day. Source: https://api.data.gov/docs/developer-manual/
- Per-agency keys can be elevated above the 1,000/hr default (GovInfo = 36,000/hr is the proof).

---

### Consolidated env-auth matrix (the deliverable)

| Upstream | Auth type | Credential location | Env var (proposed) | Base URL / version | Pagination | Rate limit (current) |
|---|---|---|---|---|---|---|
| CourtListener V4 | Token-header (DRF) | `Authorization: Token <key>` header | `COURTLISTENER_API_TOKEN` | `https://www.courtlistener.com/api/rest/v4/` | cursor (`count=on`, page≤100) | **50/hr, 5/min, 125/day** default (post-2026-05-07); 5,000/hr grandfathered; membership tiers higher |
| eCFR | keyless | — | (none) | `https://www.ecfr.gov` `/api/{search,versioner,admin}/v1/` | page/offset (search); date-scoped (versioner) | none published (429 on abuse) |
| DOL v4 | agency-native key | `X-API-KEY` header **or** query param | `DOL_API_KEY` | `https://apiprod.dol.gov/v4/` | undocumented in primary | undocumented in primary |
| Federal Register | keyless | — | (none) | `https://www.federalregister.gov/api/v1/` | `per_page` ≤1000 (def 20); **2000-result cap** | none published |
| GovInfo | api.data.gov key | `api_key` query param (or `X-Api-Key` header) | `GOVINFO_API_KEY` | `https://api.govinfo.gov/` | `offsetMark=*` + `pageSize` (≤1000) | **36,000/hr**, 1,200/min, 40/s (elevated tier); `X-RateLimit-*` headers |

> Conditional MCP-tool registration (netNew #5): gate CourtListener / DOL / GovInfo tools on their respective env vars; eCFR + Federal Register register unconditionally (keyless).

## Sources

- CourtListener V4 overview (auth, base URL, rate limit, methods): https://wiki.free.law/c/courtlistener/help/api/rest/v4/overview
- CourtListener REST API change-log (v4.5, deprecations, v3 status): https://wiki.free.law/c/courtlistener/help/api/rest/change-log
- CourtListener Citation Lookup throttle (60/min, 250/request): https://wiki.free.law/c/courtlistener/help/api/rest/v4/citation-lookup
- Free Law Project — "Full CourtListener Data Access via API Now Included with Membership" (2026-05-07 rate change, grandfather clause): https://free.law/2026/05/07/api-included-in-memberships/
- CourtListener GitHub Discussion #6895 (API throttles 60/min, 250/request): https://github.com/freelawproject/courtlistener/discussions/6895
- eCFR API Documentation (keyless, base URL, 429): https://www.ecfr.gov/developers/documentation/api/v1
- eCFR OpenAPI spec (for codegen): https://www.ecfr.gov/developers/documentation/api/v1.json
- @us-legal-tools/ecfr-sdk README (search/versioner/admin endpoint inventory): https://cdn.jsdelivr.net/npm/@us-legal-tools/ecfr-sdk@0.8.2/README.md
- GovInfo "New govinfo API" (api.data.gov key, query param, collections/packages, offsetMark): https://www.govinfo.gov/features/api
- usgpo/api README (services, pagination, 36,000/hr rate limit, X-RateLimit headers): https://github.com/usgpo/api
- GovInfo Swagger UI: https://api.govinfo.gov/docs/
- api.data.gov Developer Manual (header vs query param, 1,000/hr default, DEMO_KEY, 429): https://api.data.gov/docs/developer-manual/
- Federal Register API Documentation v1 (keyless, per_page, 2000 cap): https://www.federalregister.gov/developers/documentation/api/v1
- Federal Register Reader Aids — REST API (endpoints, formats): https://www.federalregister.gov/reader-aids/developer-resources/rest-api
- rOpenGov/federalregister R client (base URL, per_page=1000, endpoints): https://github.com/rOpenGov/federalregister
- DOL API User Guide PDF (v4, apiprod.dol.gov, X-API-KEY, dataportal.dol.gov registration; "Last updated 08/05/2024"): https://www.dataportal.dol.gov/pdf/dol-api-user-guide.pdf
- DOL Developer Community (DOLAPI) GitHub Pages (v4 datasets, X-API-KEY): https://usdepartmentoflabor.github.io/DOLAPI/

## Open / Unverified

- **CourtListener "SCOTUS / visualization endpoints are deprecated" (CAPTURE.md line 73): UNVERIFIED.** The change-log shows visualization APIs were *introduced* in v3.10 with **no removal/deprecation notice**. Treat the "do not generate visualization endpoints" instruction as a design preference, not a documented deprecation, until confirmed against the live v4 OpenAPI/Swagger schema. Source checked: https://wiki.free.law/c/courtlistener/help/api/rest/change-log
- **CourtListener v3 formal sunset date:** none published as of the current change-log. v3 is "legacy" but not date-sunset. Re-check before assuming a hard cutoff.
- **DOL pagination + rate limit:** the DOL v4 User Guide PDF rendered truncated; per-page params and any rate limit are NOT confirmed from primary text. Pull the live `apiprod.dol.gov/v4` OpenAPI/metadata to confirm before coding the throttle. The legacy `api.dol.gov` V1/V2 "deactivated end of 2024" appears in secondary summaries but I could not confirm the exact deactivation date from a primary doc.
- **eCFR rate limit / User-Agent requirement:** no numeric limit and no User-Agent mandate is documented in primary sources; field reports of throttling exist but are UNVERIFIED. Assume conservative client-side throttling + a descriptive User-Agent as defensive defaults.
- **GovInfo 36,000/hr:** sourced from the usgpo/api README (authoritative GPO repo, confirmed twice) but is GPO-specific and above the api.data.gov 1,000/hr norm — verify the live `X-RateLimit-Limit` header on the actual issued key, since per-key limits can differ.
- **Federal Register "unofficial prototype" characterization (CAPTURE.md line 74): UNVERIFIED / likely outdated.** The API is the official NARA/GPO FederalRegister.gov service; I found no "prototype" disclaimer in current docs. GovInfo remains the authoritative bulk/official source, but FedReg's API is not a throwaway prototype.
- **Licensing for ports:** us-legal-tools (incl. `@us-legal-tools/ecfr-sdk`) is MIT, but the SDK output is Orval/axios/Zod — port the *endpoint inventory and shapes*, not the code, onto Effect/HttpApi. usgpo/api and the DOL DOLAPI repos are US-Government works (public domain) and safe to reference directly. (Licensing claims here are from CAPTURE.md + repo norms; confirm each repo's LICENSE before any code copy.)
