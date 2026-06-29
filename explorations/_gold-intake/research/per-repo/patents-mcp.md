# patents-mcp  `[T2]`

- **Purpose:** An MCP server exposing USPTO Patent Public Search (ppubs), USPTO Open Data Portal (api.uspto.gov), and Google Patents BigQuery as LLM tools for patent search, full-text/claims/description retrieval, and metadata.
- **Stack:** Python >=3.13; MCP (FastMCP / mcp[cli]); httpx (async, HTTP/2); google-cloud-bigquery + google-auth; python-dotenv; setuptools build; uv lockfile.
- **Size / shape:** ~2,400 LOC across ~12 Python modules; an MCP server / API-client package (single unified tool dispatching to 3 patent data backends).
- **License:** MIT
- **Maturity:** Last commit 2025-12-22; package version 0.2.3; actively maintained as of late 2025.

**Notes:** T2 standard pass. Repo is a focused Python MCP server (3 backends). Highest-value reuse for beep: the undocumented ppubs session/auth handshake + JSON search payload, and the Google Patents BigQuery queries (a genuinely new non-USPTO global prior-art source not in beep's existing skeleton drivers). ODP endpoint map and error shapes overlap beep's existing USPTO skeleton but supply precise URL templates. No OWL/SHACL/provenance/span-grounding code here; classification handling is limited to passing CPC/IPC strings through.

## Web enrichment
- **Status:** patents-mcp targets three live-but-volatile sources. (1) USPTO Open Data Portal (data.uspto.gov / api.uspto.gov) is the current canonical USPTO API surface and is healthy as of mid-2026; the legacy PatentsView API (search.patentsview.org) was SHUT DOWN March 20, 2026 and the old developer.uspto.gov Developer Hub / Office Action / Enriched Citation / PTAB-v2 APIs were decommissioned in early-to-mid 2026 — so any code path pointing at patentsview.org or developer.uspto.gov is dead and must use data.uspto.gov + ODP-issued API keys (old PatentSearch keys are NOT valid on ODP). (2) PPUBS (ppubs.uspto.gov) remains a UI-only tool with NO official public API; the undocumented /dirsearch-public/searches/searchWithBeFamily backend the repo depends on is unsupported, sits behind an AWS WAF JS challenge + session cookie, and USPTO has repeatedly broken pre-mid-2024 reverse-engineering recipes (intermittent 403/404). This is the single biggest fragility in the repo and should be treated as best-effort with aggressive retry/fallback, not a stable contract. (3) Google Patents BigQuery (patents-public-data, e.g. patents-public-data.patents.publications) is alive (data updated through 2026) but ships with no SLA — Google does not guarantee continued availability. Net: ODP path is the durable one; PPUBS and BigQuery paths are the at-risk ones and the graceful-degradation/capability-gating design in the repo is the correct posture.</statusNotes>
<parameter name="deprecations">["PatentsView API (search.patentsview.org/api) shut down 2026-03-20; data moved to ODP Bulk Datasets. Old PatentSearch API keys do NOT work on ODP — must request new keys via data.uspto.gov 'Getting Started'.","Legacy USPTO Developer Hub (developer.uspto.gov) decommissioned ~June 2026; Office Action, Enriched Citation, and PTAB API v2 (decommissioned 2026-01-06) are gone. Use data.uspto.gov equivalents.","PPUBS searchWithBeFamily is an undocumented, WAF-protected internal endpoint with no support contract; USPTO has broken prior reverse-engineering approaches and may return 403/404 without notice. Treat as best-effort; expect periodic breakage and maintenance windows.","Google Patents BigQuery patents-public-data has no SLA — availability/schema can change without guarantee; gate behind optional credentials (repo already does this).","Confirm any hard-coded base URLs are data.uspto.gov / api.uspto.gov, NOT developer.uspto.gov or patentsview.org."]
- **Upstream docs:**
  - https://data.uspto.gov/apis/getting-started — Canonical ODP API onboarding + API-key issuance (replaces legacy PatentsView/Developer Hub keys).
  - https://data.uspto.gov/apis/patent-file-wrapper/search — ODP Patent File Wrapper Search API — supported replacement for application metadata/continuity lookups.
  - https://data.uspto.gov/documents/documents/ODP-API-Query-Spec.pdf — ODP simplified query syntax spec — use for building ODP search payloads instead of ppubs query DSL.
  - https://data.uspto.gov/support/transition-guide/patentsview — Official PatentsView->ODP transition/decommission guide (confirms shutdown dates and key incompatibility).
  - https://github.com/google/patents-public-data — Authoritative Google Patents BigQuery table/schema reference (publications, cpc, etc.); updated through 2026, no SLA.
  - https://ppubs.uspto.gov/pubwebapp/ — PPUBS is a web UI only; no official public API — basis for treating searchWithBeFamily as unsupported.
- **Corrections:**
  - *USPTO Public Search (ppubs) session + search auth pattern*: Flag as fragile/unsupported, not a stable auth pattern. ppubs has no official API; the session+WAF-cookie flow is reverse-engineered and USPTO actively breaks such flows (intermittent 403/404, AWS WAF JS challenge). Document it as best-effort with retry/backoff and an explicit fallback to ODP APIs; do not present as a durable contract.
  - *ppubs searchWithBeFamily query template (JSON payload schema)*: Mark the searchWithBeFamily payload schema as undocumented and version-volatile — pre-mid-2024 templates are already broken upstream. Pin/snapshot the working schema, add schema-drift detection, and prefer the documented ODP query syntax (ODP-API-Query-Spec.pdf) where equivalent results are acceptable.
  - *USPTO Open Data Portal (ODP) endpoint map for application metadata*: This is the DURABLE path: ensure endpoints point at data.uspto.gov / api.uspto.gov (Patent File Wrapper Search/Documents), NOT the decommissioned developer.uspto.gov or search.patentsview.org. Note ODP API keys are distinct from legacy PatentsView keys (old keys invalid post-2026-03-20).
  - *Google Patents BigQuery parameterized search queries (claims/description/CPC/inventor/assignee)*: Add caveat: patents-public-data has no SLA and dataset/schema can change without guarantee; reference google/patents-public-data table docs for canonical table/column names (e.g. patents-public-data.patents.publications) and keep query construction tolerant of schema updates.
  - *Graceful-degradation BigQuery client init (optional credential capability gating)*: Validate as best-practice and extend the same capability-gating posture to the ppubs driver given its unsupported/unstable nature — i.e., degrade gracefully when ppubs returns WAF/403, not only when BigQuery creds are absent.

## Gold nuggets (7)

### 1. USPTO Public Search (ppubs) session + search auth pattern
`data-ingestion` · relevance: **direct** · verified

Reverse-engineered auth flow for the undocumented ppubs.uspto.gov API: GET /pubwebapp/ to seed cookies, POST /api/users/me/session with X-Access-Token:"null" to mint a caseId + access token, then auto-refresh on 403 and back off on 429 using the x-rate-limit-retry-after-seconds header. beep's USPTO driver skeleton can lift this exact handshake/retry logic (non-obvious, not in official docs). Adds the ppubs full-text endpoint which the ODP API does not cover. Note: snippet spans two methods (get_session lines 68-100, make_request lines 102-118).

- **Source:** `src/patent_mcp_server/uspto/ppubs_uspto_gov.py:68-118`
- **beep-target:** @beep USPTO driver (ppubs full-text search/document retrieval auth + retry)

```
url = f"{BASE_URL}/api/users/me/session"
response = await self.client.post(url, json=-1,
    headers={"X-Access-Token": "null", "referer": f"{BASE_URL}/pubwebapp/"})
self.case_id = self.session["userCase"]["caseId"]
self.access_token = response.headers["X-Access-Token"]
if response.status_code == 403:
    await self.get_session()
if response.status_code == 429:
    wait_time = int(response.headers.get("x-rate-limit-retry-after-seconds", 5)) + 1
```

### 2. ppubs searchWithBeFamily query template (JSON payload schema)
`data-ingestion` · relevance: **direct** · verified

The exact JSON request body the ppubs search endpoint expects: family-filtering preferences (familyIdFirstPreferred US-PGPUB > USPAT > FPRS), databaseFilters per source (US-PGPUB/USPAT/USOCR), plurals/britishEquivalents flags, and the `.pn.` patent-number query syntax with qt:"brs". Hard-to-discover wire format for USPTO full-text search; beep's USPTO driver can reuse it verbatim as a request schema.

- **Source:** `src/patent_mcp_server/json/search_query.json:1-34`
- **beep-target:** @beep USPTO driver request Schema (PpubsSearchRequest)

```
"familyIdFirstPreferred": "US-PGPUB",
"familyIdSecondPreferred": "USPAT",
"query": {
    "op": "OR",
    "q": "(\"6103599\").pn.",
    "qt": "brs",
    "databaseFilters": [
        { "databaseName": "US-PGPUB", "countryCodes": [] },
        { "databaseName": "USPAT", "countryCodes": [] },
        { "databaseName": "USOCR", "countryCodes": [] }
    ]
```

### 3. Google Patents BigQuery parameterized search queries (claims/description/CPC/inventor/assignee)
`data-ingestion` · relevance: **direct** · verified

A complete, injection-safe set of parameterized BigQuery SQL queries against the patents-public-data publications table covering full-text, by-inventor, by-assignee, and by-CPC search, plus extraction of nested claims_localized and description_localized arrays. Documents that claims/descriptions are NESTED in publications (no separate tables). For beep this is a ready-made non-USPTO global patent retrieval source (90M+ pubs, 17 countries); the claims-extraction shape feeds CandidateClaim/PriorArtReference ingestion.

- **Source:** `src/patent_mcp_server/google/bigquery_client.py:260-320`
- **beep-target:** New @beep/driver-google-patents (BigQuery prior-art + claims ingestion)

```
sql = f"""
SELECT publication_number, claims_localized
FROM `{self.dataset_id}.{GooglePatentsTables.PUBLICATIONS}`
WHERE publication_number = @publication_number LIMIT 1
"""
for i, claim in enumerate(claims_data, 1):
    claims.append({"claim_num": i, "claim_text": claim.get('text', ''),
        "language": claim.get('language', 'en')})
```

### 4. Graceful-degradation BigQuery client init (optional credential capability gating)
`mcp-design` · relevance: **adjacent** · verified

Pattern where a data source self-disables when credentials are absent: sets GCE_METADATA_TIMEOUT to avoid hangs, catches auth failure, logs a warning, sets client=None, and every method checks for it. Mirrors beep's need for conditional tool/driver registration when an API key isn't configured. A clean template for capability-gated drivers in Effect Layers.

- **Source:** `src/patent_mcp_server/google/bigquery_client.py:36-57`
- **beep-target:** @beep conditional driver/tool registration (auth-gated Layers)

```
if "GCE_METADATA_TIMEOUT" not in os.environ:
    os.environ["GCE_METADATA_TIMEOUT"] = "5"
credentials, project = default()
self.client = bigquery.Client(credentials=credentials, project=self.project_id or project)
except Exception as e:
    logger.warning(f"Google BigQuery client not available: {str(e)}. "
        "Google Patents features will be disabled.")
    self.client = None
```

### 5. Unified single-tool MCP dispatch with method enum (context reduction)
`mcp-design` · relevance: **adjacent** · verified

Instead of registering ~25 separate MCP tools, the server exposes ONE uspto_patents tool with a method discriminator and a large optional-arg surface, routing internally. A context-reduction / progressive-disclosure technique relevant to beep's MCP design. The per-method required-arg validation (returns {error, message}) is a reusable guard pattern. Tradeoff: a giant arg signature hurts schema clarity vs. discrete tools.

- **Source:** `src/patent_mcp_server/patents.py:50-126`
- **beep-target:** @beep/nlp-mcp tool-surface design (method-dispatch vs many tools)

```
@mcp.tool()
async def uspto_patents(
    method: str,
    query: Optional[str] = None,
    ...
) -> Dict[str, Any]:
    """Unified tool for USPTO patent operations...
    Available methods:
    - ppubs_search_patents: Search granted patents in USPTO Public Search
    - get_app: Get patent application data by number"""
```

### 6. USPTO Open Data Portal (ODP) endpoint map for application metadata
`ip-domain-models` · relevance: **direct** · verified

A clean catalog of api.uspto.gov ODP v1 endpoints: /applications/{n}/meta-data, /adjustment (patent term adjustment), /assignment, /attorney, /continuity, /foreign-priority, /transactions, /documents, /associated-documents. Directly maps to beep's law-practice domain (PatentAsset, OfficeAction, continuity/priority chains, assignment provenance). Provides precise URL templates; X-API-KEY header auth lives in the api_uspto_gov client.

- **Source:** `src/patent_mcp_server/patents.py:412-464`
- **beep-target:** @beep USPTO ODP driver + law-practice PatentAsset/continuity models

```
url = f"{USPTO_API_BASE}/api/v1/patent/applications/{app_num}/meta-data"
url = f"{USPTO_API_BASE}/api/v1/patent/applications/{app_num}/continuity"
url = f"{USPTO_API_BASE}/api/v1/patent/applications/{app_num}/foreign-priority"
url = f"{USPTO_API_BASE}/api/v1/patent/applications/{app_num}/transactions"
```

### 7. Standardized ApiError response factory
`data-ingestion` · relevance: **adjacent** · verified

A small reusable error-shape factory producing {error:true, message, status_code?, error_code?, details?} with a from_http_error helper that normalizes USPTO's varying error JSON (error/message/errorCode/errorDetails). beep uses Effect typed errors rather than dicts, but this enumerates the real USPTO error field variants worth modeling as tagged errors in the driver layer.

- **Source:** `src/patent_mcp_server/util/errors.py:14-68`
- **beep-target:** @beep driver typed-error taxonomy (USPTO error normalization)

```
error_dict = {"error": True, "message": message}
if status_code is not None:
    error_dict["status_code"] = status_code
if error_code is not None:
    error_dict["error_code"] = error_code
message=response_json.get("error", response_json.get("message", response_text)),
status_code=status_code,
error_code=response_json.get("errorCode"),
```
