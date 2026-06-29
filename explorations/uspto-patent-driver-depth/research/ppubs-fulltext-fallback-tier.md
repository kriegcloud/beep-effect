# ppubs-fulltext-fallback-tier — research

Scope: the undocumented USPTO Public Search (ppubs) full-text tier the ODP API cannot cover — reverse-engineered session/auth handshake, 403/401 re-session + 429 backoff, the `searchWithBeFamily` JSON wire format, document/PDF retrieval, the 403→source-document graceful-degradation fallback, and the decision on whether/how to expose a fragile best-effort tier behind ODP.

## Findings

### Why a ppubs tier exists *behind* ODP (the decision driver)

- ODP Patent File Wrapper search is **bibliographic / front-page metadata only — explicitly "not full-text claims and specifications."** It searches application-status, technology-center, filing-date and similar `applicationMetaData.*` fields, refreshed daily, applications from Jan 2001 onward. Source: search synthesis citing data.uspto.gov — https://data.uspto.gov/patent-file-wrapper and ODP search docs https://data.uspto.gov/apis/patent-file-wrapper/search
- ppubs is the only **no-API-key, no-login, no-cost full-text** search of US granted patents (`USPAT`), published applications (`US-PGPUB`) and OCR corpus (`USOCR`), with daily updates. The reference MCP server lists ppubs as status **"Active"** and "Full-text search of granted patents and published applications via PPUBS." Source: https://github.com/riemannzeta/patent_mcp_server (README)
- PatentsView (the prior free full-text JSON API) is dead — that MCP server returns `API_UNAVAILABLE` for all 14 PatentsView tools and routes full-text patent search to `ppubs_search_patents`. So ppubs is the de-facto free full-text path now. Source: https://github.com/riemannzeta/patent_mcp_server (README, "PatentsView → ppubs" migration table). Corroborates CAPTURE caution "NEVER PatentsView (sunset Feb-2025)".
- The ODP **API** (not the web portal) requires a personal API key tied to an ID.me-verified USPTO.gov account; ppubs needs none. This asymmetry is itself a reason to keep a key-free full-text tier. Source: https://blog.patentriff.com/p/beyond-the-uspto-login-wall-two-ways (dated 2025-09-18)
- Net: ODP for metadata/prosecution/continuity (key required, documented, stable); ppubs for full-text + PDF (no key, undocumented, fragile). A best-effort ppubs tier behind ODP is justified and non-duplicative.

### Session / auth handshake (reverse-engineered) — triple-confirmed

Confirmed identically across two independent maintained implementations and one TS port:

1. `GET https://ppubs.uspto.gov/pubwebapp/` → seeds anonymous session cookies (the client resets its cookie jar first). Sources: patent_client https://github.com/parkerhancock/patent_client/blob/master/patent_client/_async/uspto/public_search/api.py ; patent_mcp_server https://github.com/riemannzeta/patent_mcp_server/blob/main/src/patent_mcp_server/uspto/ppubs_uspto_gov.py
2. `POST https://ppubs.uspto.gov/api/users/me/session` with **JSON body literal `-1`** and header `X-Access-Token: "null"` (the string "null", not absent) plus a `referer` header → returns session JSON. Read `caseId` from `userCase.caseId`; read the live token from the **response header** `X-Access-Token` and set it on all subsequent requests. Sources: both files above.
- No API key, no login, no ID.me. Anonymous cookie + body-`-1` POST is the entire auth.
- **Token lifetime ≈ 1800 s (30 min), and the timeout resets after each use** — continuous use stays alive as long as no two requests are >1800 s apart. Source: patent_client issue #174 https://github.com/parkerhancock/patent_client/issues/174 ; corroborated by `SESSION_EXPIRY_MINUTES = 30` in https://github.com/riemannzeta/patent_mcp_server/blob/main/src/patent_mcp_server/constants.py
- **Divergence (version drift):** patent_client `master` (pushed 2026-04-24) **comments out** the `X-Access-Token: "null"` request header — cookies + body `-1` now suffice in that impl — while patent_mcp_server still sends it. Treat the `"null"` header as historically-required but possibly optional now; send it for safety. Source: https://github.com/parkerhancock/patent_client/blob/master/patent_client/_async/uspto/public_search/api.py (header line is commented).

### 403/401 re-session + 429 backoff

- **Re-session trigger:** patent_client re-handshakes on **401 OR 403** then retries once; patent_mcp_server re-handshakes on **403 only**. Issue #174 reports the *session-expiry* error as **`401 Unauthorized`** (on `/searches/counts`), so catching only 403 would miss the documented expiry case → **catch both 401 and 403**. Sources: api.py (`if response.status_code in (401, 403)`) https://github.com/parkerhancock/patent_client/blob/master/patent_client/_async/uspto/public_search/api.py ; ppubs_uspto_gov.py (`if response.status_code == 403`) https://github.com/riemannzeta/patent_mcp_server/blob/main/src/patent_mcp_server/uspto/ppubs_uspto_gov.py ; issue #174 https://github.com/parkerhancock/patent_client/issues/174
- **429 backoff:** sleep `int(headers["x-rate-limit-retry-after-seconds"]) + 1` then retry. Both impls identical. Default when header absent = 5 s (`RATE_LIMIT_RETRY_DELAY = 5`). Sources: both files; constants.py https://github.com/riemannzeta/patent_mcp_server/blob/main/src/patent_mcp_server/constants.py
- **Network errors:** tenacity exponential backoff — patent_client `stop_after_attempt(3), wait_exponential(multiplier=1, min=4, max=15)`; patent_mcp_server `MAX_RETRIES = 3, RETRY_DELAY = 1.0`. Sources: api.py + constants.py above.

### `searchWithBeFamily` JSON wire format (counts-then-search, two-step)

Step 1 — counts: `POST https://ppubs.uspto.gov/api/searches/counts` with just the inner `query` object.
Step 2 — search: `POST https://ppubs.uspto.gov/api/searches/searchWithBeFamily` with the full envelope. Sources (both steps, both files): api.py + ppubs_uspto_gov.py above; canonical template https://github.com/riemannzeta/patent_mcp_server/blob/main/src/patent_mcp_server/json/search_query.json

Envelope (verified template):
```json
{
  "start": 0, "pageCount": 500, "sort": "date_publ desc",
  "docFamilyFiltering": "familyIdFiltering", "searchType": 1,
  "familyIdEnglishOnly": true,
  "familyIdFirstPreferred": "US-PGPUB", "familyIdSecondPreferred": "USPAT", "familyIdThirdPreferred": "FPRS",
  "showDocPerFamilyPref": "showEnglish", "queryId": 0, "tagDocSearch": false,
  "query": {
    "caseId": <from session>, "hl_snippets": "2", "op": "OR",
    "q": "(\"6103599\").pn.", "queryName": "(\"6103599\").pn.",
    "highlights": "1", "qt": "brs", "spellCheck": false, "viewName": "tile",
    "plurals": true, "britishEquivalents": true,
    "databaseFilters": [
      {"databaseName": "US-PGPUB", "countryCodes": []},
      {"databaseName": "USPAT",    "countryCodes": []},
      {"databaseName": "USOCR",    "countryCodes": []}
    ],
    "searchType": 1, "ignorePersist": true,
    "userEnteredQuery": "(\"6103599\").pn."
  }
}
```
- `qt: "brs"` selects USPTO's legacy **BRS** query parser; `.pn.` is the BRS patent-number field suffix (e.g. `("6103599").pn.`). `databaseFilters` chooses which corpora to search; `familyId*Preferred` + `docFamilyFiltering: "familyIdFiltering"` collapse to one representative member per family with US-PGPUB preferred. `pageCount` caps at 500. Source: search_query.json + run_query mutation in ppubs_uspto_gov.py (sets `q/queryName/userEnteredQuery`, rebuilds `databaseFilters` from `sources`, deep-copies the template per call to avoid shared mutation). https://github.com/riemannzeta/patent_mcp_server/blob/main/src/patent_mcp_server/uspto/ppubs_uspto_gov.py

### Document + PDF retrieval (the "source-document" path ppubs uniquely gives)

- Full text by GUID: `GET https://ppubs.uspto.gov/api/patents/highlight/{guid}?queryId=1&source={US-PGPUB|USPAT|USOCR}&includeSections=true&uniqueId=null`. Sources: both impls.
- PDF generation is a 3-call async print job: `POST /api/print/imageviewer` with `{caseId, pageKeys: ["{image_location}/00000001.tif", ...], patentGuid, saveOrPrint: "save", source}` → print-job id; poll `POST /api/print/print-process` `[jobId]` until `printStatus == "COMPLETED"`; then stream `GET /api/print/save/{pdfName}`. Page keys are 8-digit zero-padded `.tif` names. Source: patent_client `_request_save`/`download_image` https://github.com/parkerhancock/patent_client/blob/master/patent_client/_async/uspto/public_search/api.py

### Endpoint-base ambiguity — CURRENT STATE caution

Two endpoint bases coexist in active 2026 code; which resolves live cannot be confirmed from here (no endpoint probe in a research run):
- **Current/canonical** `https://ppubs.uspto.gov/api/...` — patent_client `master` (pushed 2026-04-24) and patent_mcp_server (actively maintained). 
- **Legacy** `https://ppubs.uspto.gov/dirsearch-public/...` — swinc/fetch-ppubs-patents (2023, https://github.com/swinc/fetch-ppubs-patents/blob/main/src/searchPatents.ts), patent_client issue #174 (2023, `/dirsearch-public/searches/counts`), AND layer1labs/specsmith **pushed 2026-06-29** (today) still using `SEARCH_URL = ".../dirsearch-public/searches/searchWithBeFamily"`, `DOCUMENT_URL = ".../dirsearch-public/patents"` — https://github.com/layer1labs/specsmith/blob/main/src/specsmith/datasources/ppubs.py
- Implication: pin to `/api/` (most-maintained, handshake-confirmed) with `/dirsearch-public/` as a fallback, and **live-probe both at implementation time**. The migration trajectory in patent_client (issue #174 `/dirsearch-public/` → master `/api/`) suggests `/api/` is the survivor.

### 403→source-document graceful degradation (distinct from session-expiry 403)

There are **two unrelated 403 behaviors** — do not conflate:
1. ppubs *internal* session-expiry 403/401 → re-handshake (above). Recoverable, automatic.
2. ODP *structured-endpoint* 403 (forbidden/privilege) → reroute the agent to the authoritative document path: list documents (`odp-get-documents`) then download the office-action PDF (OCR if scanned). This is the patents-mcp-server#4 `OA_FALLBACK_MESSAGE` pattern from CAPTURE — "always reach the primary PDF," matching the beep provenance ethos. The same degradation applies when ppubs full-text is unavailable: fall back to ODP metadata + the source PDF rather than failing the call. (Source repo `patents-mcp-server` `src/tools/office-actions.tools.ts` could not be located via GitHub code search this session — pattern cited from CAPTURE; treat repo provenance as UNVERIFIED, the *behavior* is the durable part.)

### Licensing (for porting)

- **parkerhancock/patent_client** — **Apache-2.0** (Copyright 2018 Parker Douglas Hancock). Canonical reverse-engineering reference; permissive, port-friendly with attribution. **ARCHIVED 2026-04-24** (read-only, no further fixes — the best reference impl is now frozen). Sources: https://github.com/parkerhancock/patent_client (LICENSE = Apache-2.0; README "This Project Has Been Archived"); archive timestamp via repo API `pushed_at 2026-04-24`.
- **riemannzeta/patent_mcp_server** — **MIT**. The CAPTURE primary (patents-mcp#1/#2). Source: https://github.com/riemannzeta/patent_mcp_server (LICENSE).
- **swinc/fetch-ppubs-patents** — **MIT** (TS). Source: https://github.com/swinc/fetch-ppubs-patents.
- All three permit porting. The handshake + wire format are *factual API behavior* (not copyrightable expression); cleanest path is a fresh Effect re-implementation from documented behavior, citing patent_client (Apache-2.0) as the reference per its NOTICE/attribution norms.

### Recommendation (decision: expose, but gated and degrade-first)

Yes — expose ppubs as a **fragile best-effort full-text tier behind ODP**, never a primary source:
- Effect service `Uspto.ppubs.service.ts` + `Uspto.ppubs.models.ts` (`PpubsSearchRequest`, `PpubsBiblioPage`, `PpubsDocument`). Hold `caseId` + `X-Access-Token` in a `Ref`/`SynchronizedRef`, cached ≤30 min, lazily (re)handshaked.
- Retry policy as an Effect `Schedule`: 401|403 → re-session then retry-once; 429 → honor `x-rate-limit-retry-after-seconds` (+1, default 5 s); network/timeout → exponential 3× (min 4 s, max 15 s). Pin base `/api/`, fallback `/dirsearch-public/`.
- Feature-flag it and surface a typed `UsptoPpubsUnavailable` tagged error so callers degrade gracefully to ODP metadata + the source-document PDF path (the 403→PDF pattern). Mark the whole tier "undocumented, may break without notice."
- Two-step contract: always `counts` before `searchWithBeFamily`; deep-copy the request template per call (concurrency-safe).

## Sources

- patent_mcp_server ppubs client (handshake, 403/429, run_query, get_document, print): https://github.com/riemannzeta/patent_mcp_server/blob/main/src/patent_mcp_server/uspto/ppubs_uspto_gov.py
- patent_mcp_server search_query.json (wire-format template): https://github.com/riemannzeta/patent_mcp_server/blob/main/src/patent_mcp_server/json/search_query.json
- patent_mcp_server constants.py (session expiry, retry, rate-limit defaults, corpora): https://github.com/riemannzeta/patent_mcp_server/blob/main/src/patent_mcp_server/constants.py
- patent_mcp_server README (ppubs "Active", no key, PatentsView→ppubs, "may break without notice", trademark sibling verified live 2026-06-10): https://github.com/riemannzeta/patent_mcp_server
- patent_client public_search api.py (canonical handshake, counts+searchWithBeFamily, 401/403 re-session, 429, highlight, print/save): https://github.com/parkerhancock/patent_client/blob/master/patent_client/_async/uspto/public_search/api.py
- patent_client repo + README (Apache-2.0, ARCHIVED 2026-04-24, "Full Support" for Patent Public Search): https://github.com/parkerhancock/patent_client
- patent_client issue #174 (1800 s token, resets on use, 401 on `/dirsearch-public/searches/counts`): https://github.com/parkerhancock/patent_client/issues/174
- patent_client issue #63 (trail-blazing the PPS request/response chain): https://github.com/parkerhancock/patent_client/issues/63
- swinc/fetch-ppubs-patents searchPatents.ts (TS, MIT, legacy `/dirsearch-public/` base, minimal wire format): https://github.com/swinc/fetch-ppubs-patents/blob/main/src/searchPatents.ts
- layer1labs/specsmith ppubs.py (independent 4th impl, pushed 2026-06-29, still `/dirsearch-public/`): https://github.com/layer1labs/specsmith/blob/main/src/specsmith/datasources/ppubs.py
- ODP Patent File Wrapper (bibliographic/front-page only, not full-text claims/spec; Jan-2001+, daily): https://data.uspto.gov/patent-file-wrapper and https://data.uspto.gov/apis/patent-file-wrapper/search
- patentriff "Beyond the USPTO Login Wall" (ODP API needs ID.me-verified account; ppubs/Global Dossier key-free; 2025-09-18): https://blog.patentriff.com/p/beyond-the-uspto-login-wall-two-ways

## Open / Unverified

- **Endpoint base live status:** cannot confirm from a research run whether `/api/` and/or `/dirsearch-public/` currently resolve. specsmith (today) uses `/dirsearch-public/`; patent_client master + patent_mcp_server use `/api/`. **Live-probe both at implementation time.** A general WebSearch synthesis claimed undocumented ppubs endpoints "return 404/403" and that "every recipe before mid-2024 has been broken" — this is a **single-source, unattributed synthesis** that conflicts with two actively-maintained impls and specsmith pushed today; treat as caution, not fact (UNVERIFIED).
- **`X-Access-Token: "null"` necessity:** patent_client now comments it out; patent_mcp_server still sends it. Whether the session POST still requires it is UNVERIFIED — send for safety.
- **Bot-protection / Cloudflare:** no evidence found of CAPTCHA or anti-automation on ppubs as of June 2026; issue #174 explicitly attributes failures to session expiry, not blocking. Absence-of-evidence, not proof (UNVERIFIED current state).
- **patents-mcp-server (TS, 403→PDF fallback, EPO/BigQuery) repo:** not locatable via GitHub code search this session; the `OA_FALLBACK_MESSAGE` 403→source-document pattern is cited from CAPTURE, behavior durable, repo provenance UNVERIFIED.
- **Rate-limit ceilings:** the numeric ppubs request/minute cap is not published; only the `x-rate-limit-retry-after-seconds` reactive signal is known. Concurrency/throughput limits UNVERIFIED — implement conservatively (serial within a session).
- **Response schema (`PublicSearchBiblioPage` / highlight document):** field-level shape not exhaustively captured here; derive from patent_client `convert/biblio.py` + `convert/document.py` and swinc `src/types/PPubsSearchAPIResponse.ts` when modeling `PpubsBiblioPage`/`PpubsDocument`.
</content>
</invoke>
