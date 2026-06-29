# mcp-uspto  `[T2]`

- **Purpose:** An MCP (Model Context Protocol) stdio server exposing 13 USPTO tools — patent/trademark search, prosecution status, assignments, continuity, foreign priority, and PTAB decisions — across three USPTO API tiers (ODP, PatentsView, TSDR).
- **Stack:** TypeScript (ESM, Node >=18), @modelcontextprotocol/sdk McpServer + StdioServerTransport, Zod for tool schemas, native fetch. No DB, no Effect.
- **Size / shape:** ~1,744 LOC across ~17 TS files; small MCP server (1 entrypoint, 2 lib files, 13 one-tool-per-file modules).
- **License:** MIT
- **Maturity:** Last commit 2026-04-28; v0.1.2 published to npm; single author (Chinmay Manohar), actively maintained, notes PatentsView->ODP migration planned for ~March 2026.

**Notes:** Small, focused, clean MCP server. Heavy overlap with beep's existing USPTO driver skeleton, so most value is reference-grade: USPTO ODP endpoint shapes/field names, the token-bucket rate-limit algorithm, and the graceful key-missing pattern. No Effect/Schema, no provenance/span tracking, no SHACL/RDF, no DB. Tools are one-file-per-tool with Zod schemas (good MCP structure to mirror). One-tool-per-file registration + central index.ts is a tidy conditional-registration template.

## Web enrichment
- **Status:** mcp-uspto's three-tier design is broadly viable but two tiers have moving deadlines. (1) PatentsView: the LEGACY API (api.patentsview.org) is fully decommissioned — it returns HTTP 410 Gone since ~May 1, 2025. The replacement is the PatentSearch API at https://search.patentsview.org/api/v1 (endpoints patent/, inventor/, etc.), which now REQUIRES an X-Api-Key header and uses a JSON query DSL (_and/_or, _gt/_gte/_lt/_lte, _text_all/_text_any/_text_phrase, ISO-8601 dates). If the repo's PatentsView driver targets api.patentsview.org or assumes keyless access, it is broken. Additionally PatentsView is migrating into data.uspto.gov (ODP) on 2026-03-20. (2) ODP (data.uspto.gov) is the strategic successor and absorbed PEDS (PEDS retired 2025-03-14; use ODP Patent File Wrapper), PTAB (DH PTAB API v2 decommissioned 2026-01-06 — PTAB now served from ODP), and Office Action / Enriched Citation APIs. The legacy Developer Hub (developer.uspto.gov) was decommissioned 2026-06-05. New auth gating: since 2026-06-18 ODP requires sign-in with a USPTO.gov account, and from 2026-08-18 ODP requires four extra profile fields — relevant to the repo's "API key missing" auth-gating nugget, which should now also account for account-level/registration gating, not just a header key. (3) TSDR API v1 still operates with an API key (X-API-KEY via account.uspto.gov/api-manager) at 60 req/min general, 4 req/min for PDF/ZIP — consistent with the per-API token-bucket nugget. Net: continuity, prosecution-timeline, file-wrapper, and continuity/foreign-priority data should be sourced from ODP (Patent File Wrapper / continuity endpoints) rather than legacy PEDS; PatentsView is for bulk search only and must use the new keyed PatentSearch endpoint.</statusNotes>
<deprecations">["PatentsView Legacy API (api.patentsview.org) DECOMMISSIONED — returns HTTP 410 Gone since ~2025-05-01. Migrate to PatentSearch API at search.patentsview.org/api/v1.","PatentSearch API now REQUIRES an X-Api-Key header (keyless/unauthenticated requests rejected or rate-limited) — verify the repo's PatentsView tier sends a key.","PatentsView platform itself migrates into USPTO ODP (data.uspto.gov) on 2026-03-20 — endpoint/base-URL drift expected.","PEDS (Patent Examination Data System) RETIRED 2025-03-14 — continuity/prosecution/file-wrapper data must come from ODP Patent File Wrapper, not PEDS.","PTAB API v2 on Developer Hub DECOMMISSIONED 2026-01-06 — PTAB decisions now served via ODP. Repo's PTAB tool must target ODP.","Legacy Developer Hub (developer.uspto.gov) DECOMMISSIONED 2026-06-05 — any developer.uspto.gov API URLs are dead; use data.uspto.gov.","ODP now requires USPTO.gov account sign-in (since 2026-06-18) and four additional profile fields (from 2026-08-18) — bare API key may no longer be sufficient; auth-gating logic needs updating.","TSDR API v1 rate limits are strict: 60 req/min/key general, 4 req/min/key for PDF/ZIP and multi-case downloads — token-bucket should use separate buckets for document downloads."]
- **Upstream docs:**
  - https://data.uspto.gov/support/transition-guide/patentsview — USPTO ODP official PatentsView->ODP transition guide; canonical source for migration dates and endpoint mapping.
  - https://search.patentsview.org/docs/docs/Search%20API/SearchAPIReference/ — PatentSearch API reference — base URL /api/v1, X-Api-Key auth, JSON query DSL operators (authoritative for the query-builder nugget).
  - https://patentsview.org/data-in-action/patentsview-ends-support-legacy-api — Confirms legacy api.patentsview.org returns 410 Gone (decommission notice).
  - https://data.uspto.gov/apis/getting-started — ODP getting-started: API key + USPTO.gov account auth model, current catalog of patent/PTAB/file-wrapper endpoints.
  - https://developer.uspto.gov/swagger/tsdr-api-v1 — TSDR API v1 Swagger — request syntax, API key header, status/document/multi-case download endpoints and rate limits.
- **Corrections:**
  - *PatentsView query DSL builder (CPC/date/assignee filters)*: Target the new PatentSearch API (https://search.patentsview.org/api/v1), NOT legacy api.patentsview.org (410 Gone). Requests require an X-Api-Key header. Query is a single JSON object using _and/_or join operators, _gt/_gte/_lt/_lte comparisons, and _text_all/_text_any/_text_phrase for full-text; dates must be ISO-8601 (YYYY-MM-DD). Validate CPC/date/assignee filters against PatentSearch field names, which differ from legacy field names.
  - *Per-API token-bucket rate limiter with multi-tier auth fetcher*: Confirmed correct shape but refine limits: TSDR is 60 req/min/key for metadata but only 4 req/min/key for PDF/ZIP and multi-case downloads — model document-download as a separate stricter bucket. PatentsView now needs its own keyed bucket (X-Api-Key). ODP increasingly requires a USPTO.gov account session in addition to a key (since 2026-06-18).
  - *Graceful 'API key missing' as structured content, not an error*: Broaden the gating signal beyond a missing header key: ODP (since 2026-06-18) requires a USPTO.gov account and (from 2026-08-18) four additional profile fields, and legacy api.patentsview.org now returns 410 Gone. The helper should surface these distinct failure modes (missing key vs. account/registration not provisioned vs. decommissioned endpoint) as structured guidance, not a generic auth error.
  - *Patent continuity (family-tree) data model — parent/child + continuity type*: Source continuity data from ODP (data.uspto.gov Patent File Wrapper / continuity endpoints), not PEDS — PEDS was retired 2025-03-14. Any developer.uspto.gov base URLs are dead (Developer Hub decommissioned 2026-06-05).
  - *Prosecution-timeline transaction model (status code / date / description)*: Prosecution/transaction history now comes from ODP Patent File Wrapper rather than PEDS (retired 2025-03-14). Ensure the tool targets data.uspto.gov endpoints; developer.uspto.gov is decommissioned.
  - *File-wrapper document listing model (office actions / responses / claims)*: Use ODP's Patent File Wrapper API on data.uspto.gov; the Office Action Rejection and Enriched Citation APIs have migrated off the now-decommissioned Developer Hub into ODP. Update any hardcoded developer.uspto.gov endpoints.

## Gold nuggets (6)

### 1. Per-API token-bucket rate limiter with multi-tier auth fetcher
`data-ingestion` · relevance: **direct** · verified

A self-contained rate-limited HTTP fetcher keyed by API tier (odp/patentsview/tsdr), each with its own token bucket (10/sec, 0.75/sec, 1/sec) and configurable API-key header. beep's USPTO driver (and the CourtListener/eCFR/FedReg/GovInfo/DOL drivers) all need per-source rate limiting + auth; this is a clean reference algorithm to port into an Effect-wrapped HttpClient layer. Beep already has a USPTO driver skeleton, so this overlaps — but the token-bucket + per-tier bucket map pattern is the reusable kernel.

- **Source:** `src/lib/fetcher.ts:15-81`
- **beep-target:** @beep USPTO driver + shared HttpClient rate-limit/auth layer

```
const buckets: Record<ApiType, Bucket> = {
  odp: { tokens: 10, maxTokens: 10, refillRate: 10, lastRefill: Date.now() },
  patentsview: { tokens: 3, maxTokens: 3, refillRate: 0.75, lastRefill: Date.now() },
  tsdr: { tokens: 5, maxTokens: 5, refillRate: 1, lastRefill: Date.now() },
};
```

### 2. Graceful 'API key missing' as structured content, not an error
`mcp-design` · relevance: **adjacent** · verified

keyMissingResponse returns a structured JSON content block (error code, tool name, registration URL) instead of throwing, so the LLM gets actionable guidance and can degrade gracefully when credentials are absent. Useful pattern for beep's multi-provider MCP tools (USPTO/CourtListener/GovInfo + Anthropic/OpenAI/xAI keys) where conditional tool availability and helpful auth prompts matter for a solo-attorney local setup.

- **Source:** `src/lib/config.ts:32-50`
- **beep-target:** @beep/nlp-mcp tool auth-gating helper

```
export function keyMissingResponse(envVar: string, registrationUrl: string, toolName: string) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(
          {
            error: "api_key_required",
            tool: toolName,
            message: `This tool requires an API key. Set the ${envVar} environment variable.`,
            registration: registrationUrl,
          },
```

### 3. Patent continuity (family-tree) data model — parent/child + continuity type
`ip-domain-models` · relevance: **direct** · verified

A normalized record shape for patent family relationships: parent/child application + patent numbers, filing dates, continuity type (continuation/divisional/CIP/provisional), and claim type. This is a direct ontology-mapping target for beep's PatentAsset/PriorArtReference models and for representing FRBR-style derivation chains in the KG (continuation edges = derivation provenance between application works).

- **Source:** `src/tools/patent-continuity.ts:14-23`
- **beep-target:** law-practice PatentAsset family/continuity schema + KG derivation edges

```
interface ContinuityRecord {
  parentApplicationNumber?: string;
  childApplicationNumber?: string;
  parentPatentNumber?: string;
  childPatentNumber?: string;
  parentFilingDate?: string;
  childFilingDate?: string;
  continuityType?: string;
  claimType?: string;
}
```

### 4. Prosecution-timeline transaction model (status code / date / description)
`ip-domain-models` · relevance: **direct** · verified

Maps the ODP /transactions endpoint (statusCodeBag) into a clean timeline of status changes from filing to grant/abandonment. Directly relevant to beep's OfficeAction/Rejection/prosecution modeling and to provenance: each transaction is a dated event that can anchor a CandidateClaim about prosecution history. The endpoint+field mapping saves reverse-engineering the ODP API shape.

- **Source:** `src/tools/patent-status.ts:13-53`
- **beep-target:** law-practice OfficeAction/prosecution-timeline ingestion

```
const timeline = (data.statusCodeBag ?? []).map((s) => ({
  status: s.statusCodeText ?? null,
  date: s.statusDate ?? null,
  description: s.statusDescriptionText ?? null,
}));
```

### 5. PatentsView query DSL builder (CPC/date/assignee filters)
`data-ingestion` · relevance: **adjacent** · verified

Programmatically constructs PatentsView's JSON query language (_or/_and/_text_any/_begins/_gte/_lte) plus field-selection (f), pagination (o), sort (s). Reusable as a reference for building structured patent searches with CPC classification filtering — feeds beep's WIPO-IPC/CPC taxonomy work and the USPTO driver's search surface. Note: file flags PatentsView is migrating to ODP ~March 2026, so endpoint may change.

- **Source:** `src/tools/patentsview-search.ts:74-107`
- **beep-target:** @beep USPTO driver search + WIPO-IPC/CPC classification filters

```
const conditions: Array<Record<string, unknown>> = [
  { _or: [{ _text_any: { patent_title: query } }, { _text_any: { patent_abstract: query } }] },
];
if (assignee) { conditions.push({ _text_any: { assignee_organization: assignee } }); }
if (cpc_code) { conditions.push({ _begins: { cpc_group_id: cpc_code } }); }
if (date_from) { conditions.push({ _gte: { patent_date: date_from } }); }
```

### 6. File-wrapper document listing model (office actions / responses / claims)
`ip-domain-models` · relevance: **direct** · verified

Maps the ODP /documents endpoint (documentBag) to {document_id, description, date, direction, page_count}. The directionCategory (incoming/outgoing) and document code description are exactly what beep needs to enumerate prosecution documents before span-grounded extraction of OfficeAction/Rejection text. A concrete acquisition target feeding @beep/langextract span extraction.

- **Source:** `src/tools/patent-documents.ts:57-63`
- **beep-target:** @beep USPTO driver document-list -> @beep/langextract OfficeAction extraction

```
const docs = (data.documentBag ?? []).slice(0, limit).map((d) => ({
  document_id: d.documentIdentifier ?? null,
  description: d.documentCodeDescriptionText ?? null,
  date: d.officialDate ?? null,
  direction: d.directionCategory ?? null,
  page_count: d.pageCount ?? null,
}));
```
