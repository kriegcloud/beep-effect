# uspto-patents-mcp  `[T2]`

- **Purpose:** Hosted MCP server over the USPTO/PatentsView patent database: free-text/assignee/inventor search, full-record read with claims, assignee portfolios, BFS citation-graph traversal, and weekly grant-digest webhooks.
- **Stack:** TypeScript (ESM), Cloudflare Workers runtime, Workers KV (cache + usage), JSON-RPC 2.0 MCP transport (hand-rolled, no SDK), Dodo Payments billing/webhooks, Vitest, Wrangler.
- **Size / shape:** Small library/MCP server: ~14 TS source files in src/ (mcp-server, patentsview, tools, auth, cache, billing, webhook, checkout, admin, email, openapi, dodo, index), ~2 test files; roughly 1.5-2k LOC.
- **License:** MIT
- **Maturity:** Last commit 2026-06-11; v0.2.0. Actively maintained as part of an "atlasword" portfolio of hosted MCP servers.

**Notes:** The PatentsView API client overlaps with beep's existing skeletoned USPTO driver, so the HTTP-wrapper nuggets are partial duplicates — but the query-DSL builder, citation BFS, and the PatentsView-v1-sunset detection are concrete, reusable details the skeleton likely lacks. LICENSE file copyright header is stale ("sec-edgar-mcp contributors") — a vendored/templated repo. mcp-server.ts and cache.ts are explicitly "vendored from products/_template", confirming this is one instance of a reusable MCP-server template; the template-level patterns (conditional premium-tool registration, KV memoize, Bearer/tier auth) are the most transferable assets.

## Web enrichment
- **Status:** CRITICAL/TIME-SENSITIVE: This server is built on the PatentsView PatentSearch API (base https://search.patentsview.org/api/v1, X-Api-Key header). That entire platform began migrating to the USPTO Open Data Portal (data.uspto.gov) on March 20, 2026, and as of today (2026-06-29) the PatentSearch API endpoints are PAUSED/being decommissioned with NO replacement API yet live on ODP (only bulk data downloads + data dictionaries are available so far; USPTO gives "no estimate" for when API functions relaunch). So the repo's core data source is effectively down/sunsetting right now — the server's live search/read/portfolio/citation-graph tools will fail against the upstream until ODP ships equivalent endpoints. Note also two layers of "sunset": (a) the OLD legacy api.patentsview.org query API was retired Feb 2025 (superseded by search.patentsview.org PatentSearch API); (b) the NEW PatentSearch API is the one now being migrated to ODP as of Mar 2026. The repo's "v1 sunset detection" nugget conflates/anticipates these; it should target the Mar 2026 ODP migration as the active cutover, not the 2025 legacy retirement. Additional facts: PatentSearch data only runs through 2024-09-30 (stale, not real-time grants — affects the "weekly grant-digest webhook" value prop); ODP will require a USPTO.gov sign-in (June 18, 2026) and extra profile fields (Aug 18, 2026), and previously-issued PatentSearch API keys are NOT compatible with ODP — new ODP API keys must be obtained. Stack choices (Cloudflare Workers, KV, hand-rolled JSON-RPC MCP, Dodo Payments) are not deprecated; hand-rolling the MCP transport is viable but FastMCP-TS / the official @modelcontextprotocol/typescript-sdk are the canonical conventions and both now standardize on Standard Schema (Zod/Valibot/ArkType) for tool params.</statusNotes>
<deprecations">PLACEHOLDER</deprecations>
</invoke>


## Gold nuggets (8)

### 1. PatentsView query-DSL builder (text/assignee/inventor/date → API query)
`data-ingestion` · relevance: **direct** · verified

buildQuery() composes PatentsView's JSON query DSL from flat search params: _text_any over title+abstract, nested assignees.assignee_name / inventors.inventor_name field paths, and _gte/_lte date clauses combined under _and. Directly reusable as the query-construction layer for beep's USPTO driver and as a model for translating attorney prior-art search intent into structured patent queries.

- **Source:** `src/patentsview.ts:151-161`
- **beep-target:** @beep USPTO driver — PatentsView query builder + PatentSummary schema

```
if (opts.query) {
  clauses.push({ _text_any: { patent_title: opts.query, patent_abstract: opts.query } });
}
if (opts.assignee) clauses.push({ "assignees.assignee_name": opts.assignee });
if (opts.inventor) clauses.push({ "inventors.inventor_name": opts.inventor });
if (opts.dateFrom) clauses.push({ _gte: { patent_date: opts.dateFrom } });
if (opts.dateTo)   clauses.push({ _lte: { patent_date: opts.dateTo } });
return clauses.length === 1 ? clauses[0] : { _and: clauses };
```

### 2. Bounded BFS over the patent citation graph (forward/backward/both)
`kg-ontology-reasoning` · relevance: **direct** · verified

citationGraph() does a depth-capped BFS over USPTO citations, emitting {nodes, edges} with per-level frontier ceiling (50) and depth cap (2) to bound CPU. fetchCitations() queries /uspatentcitation/ in both directions (patent_id for backward, citation_id for forward). This is exactly the prior-art / citation-projection algorithm beep would push into FalkorDB as a Cypher projection; the explicit edge list {from,to} maps cleanly onto a graph projection layer.

- **Source:** `src/patentsview.ts:89-149`
- **beep-target:** FalkorDB citation projection / PriorArtReference graph traversal

```
for (let d = 0; d < depth && frontier.length > 0; d++) {
  const capped = frontier.slice(0, 50);  // CPU-budget ceiling
  const nextFrontier: string[] = [];
  for (const cur of capped) {
    const cites = await this.fetchCitations(cur, direction);
    for (const c of cites) {
      edges.push({ from: cur, to: c.patent_id });
      if (!nodes.has(c.patent_id)) { nodes.set(c.patent_id, c); nextFrontier.push(c.patent_id); }
    }
  }
  frontier = nextFrontier;
}
```

### 3. PatentsView v1 sunset detection — graceful upstream-migration error
`data-ingestion` · relevance: **direct** · verified

post() detects when api.patentsview.org 301-redirects to data.uspto.gov/odp (HTML, not JSON) and throws an actionable migration error instead of a cryptic JSON parse failure. Important operational intelligence for beep's USPTO driver: the legacy PatentsView v1 endpoint is dead, and ingestion must target the USPTO Open Data Portal (data.uspto.gov/odp) with API-key registration. Saves beep from building against a sunset API.

- **Source:** `src/patentsview.ts:177-183`
- **beep-target:** @beep USPTO driver — base URL / endpoint selection + error typing

```
const ct = r.headers.get("content-type") || "";
if (!ct.includes("application/json")) {
  throw new Error(
    "PatentsView v1 API has been sunset by USPTO. Migrate to data.uspto.gov/odp " +
    "(requires API key registration). See https://data.uspto.gov/support/transition-guide/patentsview"
  );
}
```

### 4. Tier-gated conditional MCP tool registration (premium flag)
`mcp-design` · relevance: **adjacent** · verified

The Tool interface carries a `premium?` flag; listTools() filters tools by caller tier so free/solo callers never see (or can call) team-only tools, with a dedicated rpcError on tools/call. This is a clean pattern for beep's MCP servers where some tools must be conditionally exposed (e.g. tools that write to the authoritative graph vs. read-only retrieval tools, or gated behind the candidate→approved human gate).

- **Source:** `src/mcp-server.ts:41-66`
- **beep-target:** @beep/nlp-mcp — conditional/role-gated tool registration

```
listTools(tier: ToolContext["tier"]): Tool[] {
  return Array.from(this.tools.values()).filter((t) => !t.premium || tier === "team" || tier === "pro");
}
...
if (tool.premium && ctx.tier !== "team" && ctx.tier !== "pro") {
  return rpcError(id, -32000, `Tool '${name}' is premium-only. Upgrade to Team or Pro tier to use it.`);
}
```

### 5. Hand-rolled minimal MCP JSON-RPC server (no SDK dependency)
`mcp-design` · relevance: **adjacent** · verified

A complete MCP server in ~90 lines: handles initialize/tools/list/tools/call/ping, wraps results in the content[{type:text}] envelope, and centralizes error mapping to JSON-RPC codes. Useful reference for a lightweight, dependency-free MCP transport beep could embed (e.g. inside a Tauri sidecar or Worker) without the full @modelcontextprotocol/sdk. Pins protocolVersion 2025-06-18.

- **Source:** `src/mcp-server.ts:45-75`
- **beep-target:** lightweight MCP transport reference for beep MCP servers

```
case "tools/call": {
  const { name, arguments: args } = req.params ?? {};
  const tool = this.tools.get(name);
  if (!tool) return rpcError(id, -32601, `Tool not found: ${name}`);
  ...
  const result = await tool.handler(args ?? {}, ctx);
  return { jsonrpc: "2.0", id, result: { content: [{ type: "text", text: typeof result === "string" ? result : JSON.stringify(result, null, 2) }], isError: false } };
}
```

### 6. KV memoize cache with TTL jitter + stable cache-key builder
`data-ingestion` · relevance: **adjacent** · verified

KvCache.memoize wraps an async fetch with a TTL'd KV cache, adds up to 10% random jitter to expiry (avoids cache-stampede/thundering-herd), and stores expirationTtl at 1.5x. stableKey() deterministically serializes an options object (sorted keys) into a cache key. Directly applicable to beep's local-first API drivers for caching upstream USPTO/CourtListener responses deterministically.

- **Source:** `src/cache.ts:15-39`
- **beep-target:** shared driver response-cache utility (deterministic cache keys)

```
async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  const jitterMs = Math.floor(Math.random() * 0.1 * ttlSeconds * 1000);
  const exp = Date.now() + ttlSeconds * 1000 + jitterMs;
  ...
}
...
export function stableKey(parts: object | string): string {
  if (typeof parts === "string") return parts;
  const sorted = Object.keys(parts).sort();
  return sorted.map((k) => `${k}=${JSON.stringify((parts as any)[k])}`).join("&");
}
```

### 7. Bearer-key auth + tier resolution with team sub-key roll-up
`governance-ops` · relevance: **serendipitous** · verified

resolveKey() resolves a Bearer key to a tier/owner, falling back from owner-key lookup to team-member sub-key lookup, where sub-keys inherit the owner's tier and roll quota up to the owner's effectiveKey. Documented KV key conventions (key:/sub:/counter:/rate:/team:/team-member:) form a complete multi-tenant auth model. Adjacent to beep (single solo attorney, local-first) but a strong reference if beep ever exposes hosted MCP endpoints or needs audit-scoped sub-identities.

- **Source:** `src/auth.ts:77-122`
- **beep-target:** hosted-MCP auth / @beep/identity multi-tenant key model

```
// 2) Try team-member sub-key lookup. Quota + tier inherited from the owner.
const member = await usage.get<TeamMemberRecord>(`team-member:${apiKey}`, "json");
if (member) {
  const ownerRec = await usage.get<KeyRecord>(`key:${member.owner_api_key}`, "json");
  ...
  return { tier: ownerRec.tier, owner: ownerRec.owner, status: ownerRec.status, effectiveKey: member.owner_api_key, is_team_member: true, member_id: apiKey };
}
```

### 8. USPTO MCP tool schemas (search/read/portfolio/citation-graph) + PatentSummary model
`ip-domain-models` · relevance: **direct** · verified

buildTools() defines the JSON-Schema input contracts for the four core patent tools and PatentSummary defines the canonical record shape (patent_id, title, date, abstract, assignees[], inventors[], claims[]). These are exactly the field set beep's PatentAsset / PriorArtReference domain models need from USPTO, and the tool argument schemas (patent_number normalization, date_from/date_to, assignee) are a ready template for beep's USPTO MCP tools. Overlaps with beep's existing USPTO driver skeleton — record as refinement, not new.

- **Source:** `src/tools.ts:6-32`
- **beep-target:** law-practice PatentAsset/PriorArtReference fields + @beep USPTO MCP tools

```
name: "uspto_patent_search",
description: "Search US patents by free-text query, assignee, inventor, and date range. Returns recent matches with title, date, abstract, and assignees.",
inputSchema: { type: "object", properties: { query: { type: "string" }, assignee: { type: "string" }, inventor: { type: "string" }, date_from: { type: "string", description: "ISO YYYY-MM-DD." }, date_to: { type: "string" }, limit: { type: "integer", default: 25, minimum: 1, maximum: 100 } }, required: [] }
```
