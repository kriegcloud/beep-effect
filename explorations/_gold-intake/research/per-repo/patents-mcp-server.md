# patents-mcp-server  `[T1]`

- **Purpose:** FastMCP TypeScript patent-intelligence MCP server exposing ~45-55 tools across USPTO ODP, EPO OPS, and Google Patents BigQuery for prior-art / FTO / portfolio research.
- **Stack:** TypeScript (ESM, Node 22), FastMCP v3 + Zod v4 schemas, native fetch, fast-xml-parser, @google-cloud/bigquery, Hey API OpenAPI->Zod codegen, ts-builds toolchain, functype-os, pnpm.
- **Size / shape:** ~11.9k LOC across ~30 TS files (src + tests); kind: MCP server (stdio + httpStream) with API clients, tool/prompt/resource modules, and a transient file store.
- **License:** MIT
- **Maturity:** Active; last commit 2026-06-06. v1.0.4.

**Notes:** Overlaps beep's existing USPTO driver skeleton, but adds EPO OPS (OAuth2 + INPADOC families + XML parsing) and BigQuery full-text that beep does not have. Strongest reusable assets: conditional-tool-registration pattern, EPO OAuth token cache, transient-PDF-out-of-context store with UUID+TTL, the 403->file-wrapper fallback (provenance fallback), CPC/status-code taxonomies, EPO/BigQuery search-syntax knowledge, and the six structured patent-analysis prompt workflows. No Effect/OWL/SHACL code here (it's FastMCP+Zod, not Effect v4).

## Web enrichment
- **Status:** All three core data backends remain viable as of June 2026, so the server's architecture is sound, but two version/API facts should be updated. (1) USPTO ODP (data.uspto.gov) is now the canonical USPTO data source and is actively absorbing PatentsView: the PatentsView LEGACY API was decommissioned May 1, 2025 (returns HTTP 410), its replacement is the PatentSearch API, and patentsview.org itself began migrating into ODP on March 20, 2026 (legacy Developer Hub decommissioned June 5, 2026). PatentsView API functions are slated to be reintroduced on ODP with no firm date. The repo's choice to target ODP directly (rather than PatentsView) is correct and forward-compatible; only ensure any residual references to api.patentsview.org are removed. (2) PPUBS / Patent Public Search is NOT decommissioned — it is current (it was itself the 2022 replacement for PubEAST/PubWEST/PatFT/AppFT). PPUBS has no official public API/auth, so 403-aware fallback to the file-wrapper PDF path is the right pattern. (3) FastMCP (TS) has advanced to v4.0.1 (April 2026); the repo pins v3. v4.0.0 shipped a notable OAuth security fix (OAuthProxy no longer defaults allowedRedirectUriPatterns to broad http/https) and both FastMCP and a new EdgeFastMCP now use Hono internally — relevant if/when an HTTP transport with auth is added. (4) Google Patents public BigQuery dataset (project patents-public-data, sourced from IFI CLAIMS, ~90M+ publications, quarterly, CC-BY-4.0) is current and stable; dry-run cost gating remains best practice.</statusNotes>
<deprecations">PatentsView LEGACY API decommissioned 2025-05-01 — requests to api.patentsview.org now return HTTP 410 Gone; do not depend on it. Replacement is the PatentSearch API (search.patentsview.org) and increasingly USPTO ODP.</deprecations>
<deprecations>patentsview.org website migrating into USPTO ODP (data.uspto.gov) starting 2026-03-20; legacy PatentsView Developer Hub decommissioned 2026-06-05. PatentsView-style API endpoints are not yet re-launched on ODP (no ETA) — bulk datasets are available via ODP Bulk Datasets API.</deprecations>
<deprecations>FastMCP (TS) is now v4.x (v4.0.1, Apr 2026); repo pins v3. v4.0.0 contained an OAuth security fix and a Hono-based transport/EdgeFastMCP rework — review before upgrading, especially if adding remote/HTTP auth.</deprecations>
<deprecations>USPTO ODP APIs (data.uspto.gov / api.uspto.gov) require a registered API key for most endpoints — credential-conditional tool registration must account for ODP key presence, not just EPO OPS/BigQuery creds.</deprecations>
<deprecations>PPUBS exposes no official public/authenticated API; treat the 403/blocked path as expected and rely on the file-wrapper PDF fallback rather than assuming a stable PPUBS endpoint.</deprecations>
<upstreamDocs>
<url>https://data.uspto.gov/support/transition-guide/patentsview</url>
<note>Official USPTO ODP transition guide mapping retired PatentsView endpoints/fields to ODP equivalents — authoritative for migrating status-code and bulk-data tooling.</note>
</upstreamDocs>
<upstreamDocs>
<url>https://patentsview.org/data-in-action/support-legacy-api-end-february-2025-switch-patentsearch-api-now</url>
<note>Confirms legacy PatentsView API sunset and PatentSearch API as the replacement (note actual hard cutoff became 2025-05-01 with 410 responses).</note>
</upstreamDocs>
<upstreamDocs>
<url>https://github.com/punkpeye/fastmcp/releases</url>
<note>FastMCP TS releases (v4.0.1); see v4.0.0 OAuth security fix and Hono/EdgeFastMCP changes before upgrading from v3.</note>
</upstreamDocs>
<upstreamDocs>
<url>https://github.com/google/patents-public-data</url>
<note>Canonical Google Patents BigQuery dataset docs/schemas (patents-public-data, IFI CLAIMS) — table structures for full-text search and UNNEST struct handling.</note>
</upstreamDocs>
<upstreamDocs>
<url>https://www.uspto.gov/patents/search/patent-public-search</url>
<note>Confirms PPUBS is the current operational search system (replaced four legacy tools in 2022); no decommission planned.</note>
</upstreamDocs>
<corrections>
<nuggetTitle>USPTO application status-code dictionaries (prosecution lifecycle vocabulary)</nuggetTitle>
<correction>Source these from USPTO ODP, not PatentsView: the PatentsView legacy API is dead (410 since 2025-05-01) and PatentsView is folding into data.uspto.gov. Treat ODP as the canonical, long-lived vocabulary source; ODP also requires an API key.</correction>
</corrections>
<corrections>
<nuggetTitle>403-aware fallback that reroutes the agent to the authoritative document path</nuggetTitle>
<correction>Strengthen the framing: PPUBS/file-wrapper has no public authenticated API, so the 403/blocked path is the expected steady state, not an error edge case. ODP's patent-file-wrapper documents API (data.uspto.gov/apis/patent-file-wrapper/documents) is the authoritative structured source for the PDF fallback.</correction>
</corrections>
<corrections>
<nuggetTitle>Multi-provider config loader with path expansion, JSON-or-keyfile credentials, and source availability matrix</nuggetTitle>
<correction>The availability matrix should treat USPTO ODP as API-key-gated (data.uspto.gov key) alongside EPO OPS OAuth2 and BigQuery service-account creds — three distinct auth modalities, each independently enabling its tool subset.</correction>
</corrections>
<corrections>
<nuggetTitle>Conditional MCP tool registration keyed on available credentials</nuggetTitle>
<correction>Still valid, but note FastMCP v4 (current) changed auth/transport (Hono-based, OAuthProxy redirect-pattern security fix); the v3 registration pattern is fine for stdio but revisit credential/auth wiring if upgrading to v4 or adding remote HTTP transport.</correction>
</corrections>
</invoke>


## Gold nuggets (14)

### 1. Conditional MCP tool registration keyed on available credentials
`mcp-design` · relevance: **direct** · verified

registerAllTools only registers a source's tools when its API keys are present, so the MCP client never sees broken tools. Directly reusable for beep's multi-provider MCP servers (USPTO/EPO/Anthropic/OpenAI/xAI) where tool surface should depend on configured auth.

- **Source:** `src/tools/index.ts:12-26`
- **beep-target:** @beep/nlp-mcp + driver MCP servers: conditional tool registration based on configured provider auth

```
export const registerAllTools = (server: FastMCP): void => {
  if (config.usptoApiKey) {
    registerOdpTools(server)
    registerPtabTools(server)
    registerCitationsTools(server)
    registerOfficeActionsTools(server)
  }
  if (config.epoConsumerKey && config.epoConsumerSecret) {
    registerEpoTools(server)
  }
  ...
  registerUtilityTools(server)
}
```

### 2. EPO OPS OAuth2 client-credentials client with token cache, throttle detection, and namespace-aware XML parsing
`data-ingestion` · relevance: **direct** · verified

Self-contained EPO Open Patent Services client: base64 client-credentials token grant with a 19-min cached token (1-min buffer), auto token-clear + retry on 400/401, EPO 'traffic light' (black) rate-limit detection, and a fast-xml-parser configured to force-array the repeating patent elements (family-member, classification-cpc, applicant, inventor, priority-claim, legal). beep has no EPO driver; this is a complete international-patent-family + legal-status source.

- **Source:** `src/clients/epo-ops.client.ts:40-127`
- **beep-target:** new @beep driver: EPO OPS (OAuth2 token cache + INPADOC family/legal-status ingestion)

```
const getAccessToken = async (): Promise<string> => {
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token
  }
  const credentials = Buffer.from(`${key}:${secret}`).toString("base64")
  ...
  tokenCache = { token: data.access_token, expiresAt: Date.now() + 19 * 60 * 1000 }
  ...
  const throttling = response.headers.get("x-throttling-control")
  if (throttling?.includes("black")) {
    throw new Error("EPO rate limit exceeded (black). Wait before retrying.")
  }
```

### 3. Transient UUID+TTL file store keeping large PDFs out of the model context
`mcp-design` · relevance: **direct** · verified

odp-download-document fetches a multi-page file-wrapper PDF and, instead of returning bytes to the model, writes it under a v4-UUID filename with a TTL sweep and returns JSON {url, mimeType, expiresInSeconds}. Strict UUID_V4 regex gates filesystem access (no path interpolation), background unref'd sweep purges expired files. A clean pattern for beep's context-reduction / progressive disclosure: surface a fetchable handle, not the payload.

- **Source:** `src/resources/store.ts:7-21`
- **beep-target:** @beep/nlp-mcp context-reduction: return fetchable resource handles (UUID+TTL) instead of large document bytes

```
export const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

export type FileStore = {
  readonly ttlSeconds: number
  put(buf: Buffer, ext: string): { id: string }
  getPath(id: string): string | null
  sweep(): void
  startSweep(): void
}
```

### 4. 403-aware fallback that reroutes the agent to the authoritative document path
`provenance-evidence` · relevance: **adjacent** · verified

When the structured office-action endpoint returns 403 (credential not entitled), the error handler returns a guidance message telling the agent to list documents and download the actual office-action PDF — i.e. fall back from a derived/structured tier to the primary source document. Maps to beep's provenance ethos (always be able to reach the source) and to graceful degradation in tool design.

- **Source:** `src/tools/office-actions.tools.ts:20-27`
- **beep-target:** law-practice OfficeAction ingestion: fallback from structured rejection API to source file-wrapper PDF

```
export const OA_FALLBACK_MESSAGE =
  "The structured office-action endpoint is unavailable for this credential (HTTP 403 ..." +
  "... list the application's documents with odp-get-documents, then download the relevant office-action document " +
  "with odp-download-document and read the returned PDF (OCR it if it is a scanned image with no text layer)."

export const handleOfficeActionError = (error: unknown): string =>
  isForbiddenError(error) ? OA_FALLBACK_MESSAGE : handleApiError(error)
```

### 5. Office-action rejection-type taxonomy embedded in tool descriptions (101/102/103/112)
`ip-domain-models` · relevance: **direct** · verified

The office-action tools encode the USPTO statutory rejection vocabulary (35 USC 101/102/103/112) and the substantive sections (rejections, applicant amendments/remarks, examiner citations, prior-art reference lists) via tool descriptions. This is the exact controlled vocabulary beep's Rejection/OfficeAction domain models and the patent_validity flow need.

- **Source:** `src/tools/office-actions.tools.ts:98-101`
- **beep-target:** law-practice Rejection schema (rejectionType enum 101/102/103/112, affectedClaims)

```
    name: "office-action-get-rejections",
    description:
      "Get rejection data from office actions for a patent application. Includes rejection types (35 USC 101, 102, 103, 112) and affected claims.",
```

### 6. Patent number normalization (country prefix + kind code stripping)
`ip-domain-models` · relevance: **direct** · verified

normalizePatentNumber strips country prefixes (US/EP/WO/JP/CN/KR/DE/FR/GB/CA/AU), extracts kind codes, and removes separators to produce a canonical id. Reusable as the identity-normalization primitive for beep's PatentAsset / PriorArtReference keys across the many number formats (17/248,024, US-11646472-B2, US10301314).

- **Source:** `src/lib/patent-number.ts:1-21`
- **beep-target:** @beep/identity + law-practice PatentAsset: canonical patent-number normalizer

```
const kindCodePattern = /[-\s]?([A-Z]\d?)$/
const countryPrefixPattern = /^(US|EP|WO|JP|CN|KR|DE|FR|GB|CA|AU)[\s-]*/i

export const normalizePatentNumber = (input: string): string => {
  const trimmed = input.trim()
  ...
  const withoutPrefix = withoutKind.replace(countryPrefixPattern, "")
  const digitsOnly = withoutPrefix.replace(/[/,\s-]/g, "")
  return kindCode ? `${digitsOnly}${kindCode}` : digitsOnly
}
```

### 7. CPC classification taxonomy (section + class maps) as a local lookup
`kg-ontology-reasoning` · relevance: **adjacent** · adjusted

Hardcoded CPC section (A-H, Y) and class/subclass maps (incl. AI/ML-relevant G06N/G06Q/G06T/G06V, H04L/H04W) with a hierarchical resolver that walks code->subclass->class->section. Beep's WIPO-IPC ontology slot and any classification-taxonomy need can seed from this; also doubles as an MCP resource (patents://cpc/{code}).

- **Source:** `src/tools/utility.tools.ts:48-100`
- **beep-target:** @beep/rdf WIPO-IPC/CPC taxonomy seed + MCP resource patents://cpc/{code}

```
const CPC_CLASS_MAP: Record<string, string> = {
  A61: "Medical or Veterinary Science; Hygiene",
  C07: "Organic Chemistry",
  G06F: "Electric Digital Data Processing",
  G06N: "Computing Arrangements Based on Specific Computational Models (AI/ML)",
  G06V: "Image or Video Recognition or Understanding",
  H04L: "Transmission of Digital Information",
  H04W: "Wireless Communication Networks",
  ...
```

### 8. USPTO application status-code dictionaries (prosecution lifecycle vocabulary)
`ip-domain-models` · relevance: **direct** · adjusted

STATUS_CODE_MAP translates USPTO numeric codes to prosecution states (Abandoned variants, Docketed, Non Final Action Mailed, Final Rejection, Notice of Allowance, RCE Filed, Patented Case, On Appeal). A second, divergent status-code map also lives in src/resources/index.ts. A ready-made controlled vocabulary for beep's ClaimLifecycle/prosecution-event modeling and OfficeAction state transitions.

- **Source:** `src/tools/utility.tools.ts:15-46`
- **beep-target:** law-practice prosecution-event/status enum for OfficeAction + PatentAsset lifecycle

```
const STATUS_CODE_MAP: Record<string, string> = {
  "1": "Abandoned -- Failure to Respond to an Office Action",
  "30": "Patented Case",
  "41": "Non Final Action Mailed",
  "47": "Final Rejection Mailed",
  "70": "Notice of Allowance Mailed -- Application Received in Office of Publications",
  "93": "Notice of Appeal Filed",
  "160": "RCE Filed",
  ...
```

### 9. Six structured patent-analysis prompt-template workflows (prior art, validity, FTO, landscape, PTAB, portfolio)
`legal-nlp` · relevance: **direct** · verified

FastMCP prompt definitions with typed arguments that emit step-by-step methodology markdown (e.g. validity covers 102/103/112 + prosecution-history estoppel; FTO covers literal infringement + doctrine of equivalents + design-arounds). The file defines exactly six prompts: prior_art_search, patent_validity, competitor_portfolio, ptab_research, freedom_to_operate, patent_landscape. Reusable agent prompt templates / skill scaffolds for beep's IP-attorney workflows.

- **Source:** `src/prompts/index.ts:119-125`
- **beep-target:** agents Skill prompt templates: prior-art / validity / FTO / landscape workflows

```
### Step 6: Validity Assessment
Compile validity analysis covering:
- Novelty (35 USC 102) — prior art predating priority date
- Obviousness (35 USC 103) — combinations of prior art
- Written description (35 USC 112) — specification support
- Prosecution history estoppel — narrowing amendments`
```

### 10. BigQuery full-text patent search with mandatory dry-run cost gating and UNNEST struct handling
`data-ingestion` · relevance: **adjacent** · verified

Every query runs a dryRun first to estimate bytes/cost ($5/TB, 1 TB free tier) before executing, and full-text search uses EXISTS+UNNEST over localized title/abstract array structs with CONTAINS_SUBSTR; includes a depth-1/2 citation-network CTE and CPC analytics aggregation. The dry-run-before-execute cost-governance pattern and the UNNEST-of-localized-text technique are reusable for any beep BigQuery/large-source ingestion driver.

- **Source:** `src/clients/bigquery.client.ts:33-72`
- **beep-target:** new @beep driver: Google Patents BigQuery full-text search (cost-gated query runner)

```
const runQuery = async (sql: string, params?: Record<string, unknown>): Promise<BigQueryResult> => {
  const client = getBigQueryClient()
  // Always dry run first to estimate cost
  const [dryRunJob] = await client.createQueryJob({ query: sql, params, dryRun: true, useLegacySql: false })
  const bytesProcessed = dryRunJob.metadata?.statistics?.totalBytesProcessed ?? "0"
  const costEstimate = estimateCost(bytesProcessed)
  const [job] = await client.createQueryJob({ query: sql, params, useLegacySql: false })
  const [rows] = await job.getQueryResults()
```

### 11. Edge-gated resource route with strict-UUID guard serving private, no-store PDFs
`desktop-portal` · relevance: **adjacent** · verified

GET /resources/:file validates the .pdf suffix + strict v4 UUID before any fs access, streams the file with cache-control: private, no-store, and 404s on expired/missing. The 'access control at the edge; UUID+TTL is in-app defense-in-depth' comment is a concise security model for beep's Tauri/local-first resource serving where the LLM must never receive raw bytes or be able to enumerate files.

- **Source:** `src/resources/routes.ts:17-36`
- **beep-target:** desktop/local-first resource serving: UUID-gated transient document route

```
export const registerResourceRoutes = (server: FastMCP, store: FileStore = resourceStore): void => {
  server.getApp().get("/resources/:file", (c) => {
    const file = c.req.param("file")
    if (!file.endsWith(".pdf")) return notFound("Not found")
    const id = file.slice(0, -".pdf".length)
    if (!UUID_V4.test(id)) return notFound("Not found")
    const path = store.getPath(id)
    if (!path) return notFound("Not found or expired")
    ...
      headers: { "content-type": "application/pdf", "cache-control": "private, no-store" },
```

### 12. Multi-provider config loader with path expansion, JSON-or-keyfile credentials, and source availability matrix
`mcp-design` · relevance: **adjacent** · verified

loadConfig centralizes env parsing with typed defaults, tilde/$HOME path expansion (functype-os expandPath Either), GCP credentials accepted as inline JSON or keyfile path, and getAvailableSources produces a configured/healthy matrix per source. A clean template for beep's multi-provider credential layering and the check-api-status health-probe tool.

- **Source:** `src/lib/config.ts:92-110`
- **beep-target:** driver config layer + check-api-status health tool (multi-provider auth matrix)

```
export const getAvailableSources = (cfg: AppConfig): ApiStatus[] => [
  { name: "USPTO ODP", configured: cfg.usptoApiKey !== undefined, healthy: false },
  { name: "EPO OPS", configured: cfg.epoConsumerKey !== undefined && cfg.epoConsumerSecret !== undefined, healthy: false },
  { name: "Google BigQuery", configured: (cfg.googleApplicationCredentials !== undefined || cfg.googleCredentialsJson !== undefined) && cfg.googleCloudProject !== undefined, healthy: false },
]
```

### 13. EPO CQL + BigQuery + ODP query-syntax cheat-sheet as an MCP resource
`legal-nlp` · relevance: **serendipitous** · verified

A search-syntax resource documenting EPO CQL fields (ti/ab/ta/pa/in/pn/cpc/pd), operators, truncation, the 10-term/2000-result limits, ODP free-text + patent-number formats, and BigQuery SEARCH/UNNEST patterns + DOCDB number format. Valuable domain knowledge for beep's NLP query-construction agents and for grounding prose->query translation.

- **Source:** `src/resources/index.ts:60-90`
- **beep-target:** agents query-construction skill: prose->patent-query (CQL/SQL) grounding knowledge

```
## EPO CQL (Contextual Query Language)
- `ti` — Title: `ti="antibody drug conjugate"`
- `pa` — Applicant: `pa="Northwestern University"`
- `cpc` — CPC code: `cpc=C07D487/04`
- `pd` — Publication date: `pd>=20200101`
### Limits: Max 10 query terms, max 2000 results per query
## Google BigQuery SQL
- Full-text: `WHERE SEARCH(abstract_localized.text, 'metarrestin')`
- Claims: `CROSS JOIN UNNEST(claims_localized) AS cl WHERE SEARCH(cl.text, 'antibody')`
```

### 14. OpenAPI->Zod response-validation codegen pipeline (Hey API) committed to repo
`governance-ops` · relevance: **direct** · adjusted

ODP responses are validated with Zod schemas generated from the upstream USPTO OpenAPI spec via Hey API/openapi-ts (pnpm fetch-specs downloads swagger_fixed.yaml from the patent-dev/uspto-odp repo to src/specs/uspto-odp.yaml, pnpm codegen runs openapi-ts), with a looseParse fallback when the API returns null for optional fields. Generated code is committed so CI is deterministic. Applicable to beep's OpenAPI-codegen + deterministic-CI governance goals and schema-first source validation. Note: cited line corrected to 32-33 (was 35-36).

- **Source:** `package.json:32-33`
- **beep-target:** driver codegen: OpenAPI->Schema response validation + deterministic committed-codegen CI

```
    "codegen": "openapi-ts",
    "fetch-specs": "gh api repos/patent-dev/uspto-odp/contents/swagger_fixed.yaml --jq '.content' | base64 -d > src/specs/uspto-odp.yaml",
```
