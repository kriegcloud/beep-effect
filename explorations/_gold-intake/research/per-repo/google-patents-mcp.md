# google-patents-mcp  `[T2]`

- **Purpose:** MCP server exposing a single `search_patents` tool that proxies the SerpApi Google Patents API over stdio.
- **Stack:** TypeScript (ES modules, Node 18+); @modelcontextprotocol/sdk; node-fetch; winston logging; dotenv. Distributed via npx/Smithery.
- **Size / shape:** ~415 LOC single-file MCP server (src/index.ts) + Dockerfile + smithery.yaml; tiny CLI/MCP-server package.
- **License:** MIT
- **Maturity:** Last commit 2025-08-26; v0.2.0 (changelog dated 2025-04-17). Small, low-activity single-author project.

**Notes:** Tiny single-file proxy MCP server over SerpApi's Google Patents endpoint. No parsing of patent content, no schemas beyond the input JSON Schema, no provenance/span tracking, no ontology work. Returns raw SerpApi JSON verbatim. Real value is the patent-search filter taxonomy and the MCP-server compat boilerplate; everything else (winston file-logging fallback chain, base64 helpers that are defined but unused) is boilerplate. beep already has USPTO driver skeleton, so the search capability overlaps; this only adds a Google-Patents/SerpApi variant and a filter vocabulary.

## Web enrichment
- **Status:** google-patents-mcp (kunihiros/google-patents-mcp) is a thin, still-functional stdio MCP server wrapping SerpApi's Google Patents engine (engine=google_patents). As of mid-2026 the underlying SerpApi Google Patents Search + Details APIs are actively maintained (live status at serpapi.com/status/google_patents) and the project is still listed/distributable via npx and Smithery/PulseMCP/mcpmarket. No decommission of the SerpApi path is observed. Caveat: SerpApi is a paid third-party scraper proxy (requires SERPAPI_API_KEY, quota-limited), not an official Google or USPTO API — so the data source carries vendor-lock and ToS risk, and is distinct from the free official patent APIs (USPTO ODP, EPO OPS, Google Patents Public Datasets on BigQuery). The cross-cutting USPTO/PatentsView deprecation activity does NOT affect this repo directly (it does not call PatentsView), but matters for any sibling USPTO driver in the same ecosystem. MCP-design nugget is dated: the repo's manual list-method stubs reflect the low-level Server class pattern; the current TS SDK favors the higher-level McpServer which auto-handles tools/list, input validation, and JSON-Schema conversion.</statusNotes>
<deprecations>SerpApi Google Patents is a PAID, ToS-bound scraping proxy of Google Patents, not an official API — no SLA for downstream legal use; treat as enrichment, not a system-of-record for prior art.</deprecations>
<deprecations>USPTO PatentsView / PatentSearch API (search.patentsview.org) is migrating to the USPTO Open Data Portal (data.uspto.gov): legacy Developer Hub decommissioned ~June 5 2026; legacy patentsview.org migrating to ODP from March 20 2026; old PatentSearch API keys are NOT compatible with ODP keys (must re-issue). The pre-2024 legacy API was fully discontinued Feb 2025.</deprecations>
<deprecations>PTAB API v2 on developer.uspto.gov was decommissioned January 6 2026 — any sibling PTAB driver must target the ODP equivalents.</deprecations>
<deprecations>Low-level MCP `Server` class with hand-written ListTools/CallTool handlers is now the legacy pattern; the current @modelcontextprotocol/sdk recommends `McpServer` (declarative tool registration). Manual empty stubs for resources/list and prompts/list are no longer required boilerplate under McpServer.</deprecations>
<upstreamDocs>
<url>https://serpapi.com/google-patents-api</url>
<note>Canonical SerpApi Google Patents Search API: parameter taxonomy (q, before/after, country, status, type, assignee, inventor, sort, cluster, num) the repo's input schema proxies.</note>
</upstreamDocs>
<upstreamDocs>
<url>https://serpapi.com/google-patents-details-api</url>
<note>Companion Details API (engine=google_patents_details) — the obvious second tool the single-tool server omits.</note>
</upstreamDocs>
<upstreamDocs>
<url>https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/server.md</url>
<note>Official TS SDK server guide: McpServer vs low-level Server, StdioServerTransport, tools/list auto-handling — the modern scaffold to migrate the nugget toward.</note>
</upstreamDocs>
<upstreamDocs>
<url>https://data.uspto.gov/support/transition-guide/patentsview</url>
<note>Official PatentsView-to-ODP transition guide incl. key re-issuance — relevant for any official-API patent driver alongside this SerpApi one.</note>
</upstreamDocs>
<corrections>
<correction>SerpApi is a paid third-party scraping proxy of Google Patents, not an official Google/USPTO API. The filter taxonomy (before:priority/filing/publication, after, country, status=GRANT/APPLICATION, type=PATENT/DESIGN, assignee, inventor, sort, num, cluster) is SerpApi-defined and ToS-bound. For a law-practice PriorArtReference search, treat SerpApi as one enrichment driver and pair/fallback to official sources (USPTO Open Data Portal, EPO OPS, Google Patents Public Datasets on BigQuery) for authoritative/citable data. Also expose the companion google_patents_details engine for full-text/claims, which single-q search does not return.</correction>
</corrections>
<corrections>
<nuggetTitle>Minimal stdio MCP server scaffold with required list-method stubs</nuggetTitle>
<correction>The "required list-method stubs" (empty resources/list, prompts/list handlers) are an artifact of the low-level `Server` class. The current @modelcontextprotocol/sdk recommends `McpServer`, which registers tools declaratively and auto-implements tools/list, input validation, and JSON-Schema generation — eliminating the stub boilerplate. When reusing as client-compat boilerplate for @beep/nlp-mcp and driver servers, prefer McpServer + StdioServerTransport and only declare capabilities you actually serve; manual empty stubs are no longer needed for client compatibility.</correction>
</corrections>
<corrections>
<nuggetTitle>Env-var-first API key resolution with fail-fast</nuggetTitle>
<correction>Pattern is sound, but note SerpApi keys are quota-metered paid credentials; for multi-provider driver auth, fail-fast on missing key is good, yet also surface 401/429 quota-exhaustion distinctly (SerpApi returns these on overage) rather than treating all upstream errors uniformly. For official USPTO ODP drivers, account for the 2025-2026 key migration: PatentSearch API keys are not interchangeable with ODP keys, so secret resolution should be per-endpoint, not one shared "USPTO" key.</correction>
</corrections>
</invoke>


## Gold nuggets (4)

### 1. Google Patents search input schema (filter taxonomy)
`ip-domain-models` · relevance: **adjacent** · verified

A complete, well-documented JSON Schema for the SerpApi Google Patents search tool. The enumerated filters and date-prefix syntax (priority/filing/publication:YYYYMMDD, status GRANT|APPLICATION, type PATENT|DESIGN, country/language/inventor/assignee) are directly reusable as a prior-art search schema for a beep patent-search driver/MCP tool. Adds a Google-Patents-via-SerpApi alternative and a ready filter vocabulary.

- **Source:** `src/index.ts:286-302`
- **beep-target:** law-practice PriorArtReference search / a SerpApi/Google-Patents driver alongside the USPTO skeleton

```
before: { type: 'string', description: "Maximum date filter (e.g., 'publication:20231231', 'filing:20220101'). Format: type:YYYYMMDD where type is 'priority', 'filing', or 'publication'." },
status: { type: 'string', enum: ['GRANT', 'APPLICATION'], description: "Filter by patent status: 'GRANT' or 'APPLICATION'." },
type: { type: 'string', enum: ['PATENT', 'DESIGN'], description: "Filter by patent type: 'PATENT' or 'DESIGN'." }
```

### 2. Minimal stdio MCP server scaffold with required list-method stubs
`mcp-design` · relevance: **adjacent** · verified

Shows the bare structure of an MCP server: Server construction with capabilities, setupToolHandlers, and crucially empty ListResources/ListPrompts handlers added explicitly because some clients require those endpoints to exist. Useful reference pattern for beep's MCP servers to avoid client-compat breakage.

- **Source:** `src/index.ts:239-258`
- **beep-target:** @beep/nlp-mcp and driver MCP servers (client-compat boilerplate)

```
this.server = new Server(
  { name: 'google-patents-server', version: '0.2.0' },
  { capabilities: { resources: {}, tools: {}, prompts: {} } }
);
this.setupToolHandlers();
// Register handlers for standard MCP list methods required by some clients
this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({ resources: [] }));
this.server.setRequestHandler(ListPromptsRequestSchema, async () => ({ prompts: [] }));
```

### 3. Timeout + safe param passthrough for an upstream HTTP API client
`data-ingestion` · relevance: **adjacent** · verified

A compact API-client pattern: AbortController-based 30s timeout, building URLSearchParams from a fixed required set plus arbitrary optional params, and redacting the API key from logs. Error handling maps HTTP status/AbortError onto MCP error codes. Reusable shape for beep's Effect-based driver fetch wrappers (though beep would express timeouts/errors via Effect typed errors rather than try/catch).

- **Source:** `src/index.ts:335-348`
- **beep-target:** driver HTTP fetch wrapper / auth-key redaction in logging

```
const searchParams = new URLSearchParams({ engine: 'google_patents', q: q, api_key: SERPAPI_API_KEY });
for (const [key, value] of Object.entries(otherParams)) {
  if (value !== undefined) { searchParams.append(key, String(value)); }
}
const apiUrl = `https://serpapi.com/search.json?${searchParams.toString()}`;
logger.info(`Calling SerpApi: ${apiUrl.replace(SERPAPI_API_KEY, '****')}`); // redact key
```

### 4. Env-var-first API key resolution with fail-fast
`governance-ops` · relevance: **adjacent** · verified

Auth pattern: read SERPAPI_API_KEY from the environment and exit(1) at startup if absent, trusting only the env var. Useful precedent for beep multi-provider key handling (Anthropic/OpenAI/xAI + data APIs).

- **Source:** `src/index.ts:214-223`
- **beep-target:** multi-provider auth / secret resolution for drivers

```
const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;
if (!SERPAPI_API_KEY) {
    logger.error('Error: SERPAPI_API_KEY environment variable is not set.');
    process.exit(1);
} else {
    logger.info('SERPAPI_API_KEY found.');
}
```
