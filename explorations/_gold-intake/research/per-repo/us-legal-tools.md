# us-legal-tools  `[T1]`

- **Purpose:** Bun/Turbo monorepo of TypeScript SDKs + MCP servers for five US federal legal/regulatory APIs (eCFR, Federal Register, CourtListener, GovInfo, DOL), generated from OpenAPI via Orval.
- **Stack:** TypeScript 5.8, Bun 1.2 + Turborepo, Orval 7.10 (axios-functions + mcp generators), @modelcontextprotocol/sdk, Zod, axios, Hono + Scalar (docs UI), Biome, Changesets, typedoc.
- **Size / shape:** ~33.5k LOC across ~572 TS files (most Orval-generated); 8 workspace packages (5 API SDK/MCP packages + shared orval-config, scalar-ui docs server, tsconfig). Kind: SDK + MCP-server monorepo.
- **License:** MIT
- **Maturity:** Active; last commit 2025-08-06. Published npm packages, CI (validate/release workflows), changesets versioning.

**Notes:** Heavy overlap with beep's existing skeleton drivers (CourtListener, eCFR, Federal Register, GovInfo, DOL): the bulk of each package is Orval-generated axios endpoints + models that beep likely re-derives. The GOLD is the CODEGEN PIPELINE and PATTERNS, not the generated output: one OpenAPI spec -> both a typed SDK and a runnable MCP server, plus the auth-mutator, Zod-tool-schema, and MCP handler conventions. beep's stack is Effect/effect-Schema/@effect-rpc rather than axios/Zod, so treat these as architectural templates to port, not drop-in code.

## Web enrichment
- **Status:** All five upstream APIs are ACTIVE as of 2026-06 with no decommissions: eCFR v1, Federal Register v1, CourtListener REST v4 (now v4.4), GovInfo, and DOL APIs are all live and documented. The codegen stack is also current: Orval is now published under the orval-labs org (orval-labs/orval), and the @orval/mcp generator is officially supported (orval.dev/docs/guides/mcp). Main correctness items concern (a) CourtListener V4 hardening auth behavior, (b) GovInfo/Federal Register API-key requirements, and (c) an Orval mcp-generator constraint. The repo does NOT touch USPTO/patents, but per cross-cutting brief: the PatentsView/PatentSearch -> USPTO Open Data Portal (data.uspto.gov) migration is a live deprecation cascade worth noting for any sibling patents driver.</statusNotes>
<deprecations">["CourtListener V4 enforces authentication: anonymous/unauthenticated requests now return 401 Unauthorized (V3 tolerated anonymous, throttled). The token-auth axios mutator is therefore mandatory, not optional, for V4. Header format is `Authorization: Token <api_key>` (note the literal word 'Token', not 'Bearer').", "CourtListener Supreme Court Visualization API carries an explicit deprecation notice (late 2025) — avoid generating/relying on visualization endpoints.", "CourtListener V3 is legacy; new work should target V4 (current minor v4.4). A V4 migration guide exists for field/pagination changes (cursor-based pagination).", "GovInfo API requires an api.data.gov API key (api_key query param); without it requests fail — ensure the env-auth matrix covers GovInfo, not just CourtListener.", "Federal Register API is keyless and public, but is explicitly an unofficial 'prototype' edition; GovInfo remains the official legal source — relevant for any provenance/authority nugget.", "Orval @orval/mcp generator officially 'only works in single mode' (one spec per config / no split-mode). The repo's per-spec orval.config one-liner pattern is the correct workaround; do not assume one config can emit multiple MCP servers.", "Cross-cutting (patents, not in this repo): PatentsView legacy API ended Feb 2025; PatentSearch migrates to USPTO Open Data Portal (data.uspto.gov) on 2026-03-20; old PatentSearch keys are NOT valid on ODP (must reissue ODP keys); legacy developer.uspto.gov Developer Hub decommissioned 2026-06-05; PEDS retired 2025; PTAB API v2 decommissions 2026-01-06."]
<corrections>[{"nuggetTitle":"CourtListener token-auth axios mutator","correction":"Strengthen: this is now REQUIRED for V4, not just a convenience. Unauthenticated V4 requests return 401 (auth is enforced, unlike V3). Header must be exactly `Authorization: Token <key>` (CourtListener uses DRF TokenAuthentication, i.e. the literal scheme word 'Token', not 'Bearer'/'Api-Key'). Target endpoints at /api/rest/v4/."},{"nuggetTitle":"Multi-provider MCP server env-auth matrix (claude config)","correction":"The matrix must distinguish auth styles: CourtListener = `Authorization: Token` header (mandatory); GovInfo = `api_key` query param via api.data.gov (mandatory); DOL = api.data.gov/DOL key; eCFR and Federal Register = NO key (public). Conditional tool registration should treat eCFR/FedReg as always-on and gate CourtListener/GovInfo/DOL on presence of their respective keys."},{"nuggetTitle":"Single OpenAPI spec -> dual SDK + MCP server codegen (Orval)","correction":"Confirmed viable on Orval 7.x via the official @orval/mcp generator, but note the documented constraint that the mcp client 'only works in single mode' — hence the repo's one-config-per-spec approach is necessary by design, not just stylistic. Orval is now under the orval-labs GitHub org. The mcp generator emits server.ts (StdioServerTransport by default), tool-schemas.zod.ts, http-client.ts, and handlers.ts; custom transports (e.g. Streamable HTTP) require an override.mcp.server function."},{"nuggetTitle":"Case-law search response model (case/opinion/court fields + BM25 score)","correction":"Validate field names against V4 (not V3): V4 changed several response shapes and uses cursor pagination. The relevance score field and opinion/cluster/docket nesting differ between the /search/ endpoint and the resource endpoints; ground the schema on the V4.4 case-law API docs rather than assuming V3 layout."},{"nuggetTitle":"Citation lookup + normalization tool (text-blob in, normalized cites out)","correction":"CourtListener's citation-lookup endpoint (/api/rest/v4/citation-lookup/) is powered by Free Law Project's eyecite parser; for span-grounded extraction, eyecite (Python) is the canonical upstream and returns start/end spans — worth aligning the normalized_citations span model to eyecite's resolution output rather than re-implementing."}]</corrections>
<upstreamDocs>[{"url":"https://orval.dev/docs/guides/mcp/","note":"Official Orval MCP generator guide — config, generated files, single-mode constraint, custom transport override."},{"url":"https://www.courtlistener.com/help/api/rest/v4/migration-guide/","note":"CourtListener V4 migration guide — auth enforcement (401 anonymous), cursor pagination, field changes."},{"url":"https://www.courtlistener.com/help/api/rest/","note":"CourtListener REST API v4.4 reference — Token auth scheme and endpoint catalog."},{"url":"https://www.ecfr.gov/developers/documentation/api/v1","note":"eCFR API v1 docs — keyless endpoints for titles, structure, full XML by date."},{"url":"https://www.federalregister.gov/developers/documentation/api/v1","note":"Federal Register API v1 — keyless; note 'unofficial prototype' status vs govinfo as official source."},{"url":"https://data.uspto.gov/","note":"USPTO Open Data Portal — destination for PatentsView/PatentSearch migration (2026-03-20); ODP keys required, relevant only to a future patents driver."}]</upstreamDocs>
</invoke>


## Gold nuggets (12)

### 1. Single OpenAPI spec -> dual SDK + MCP server codegen (Orval)
`mcp-design` · relevance: **direct** · verified

createOrvalConfig() factory drives Orval to emit BOTH a typed axios client SDK and an MCP server (handlers + Zod tool-schemas) from one OpenAPI input, parameterized by inputFile/baseUrl/mutator. This is exactly the OpenAPI->driver+MCP codegen pattern beep wants for its CourtListener/USPTO/eCFR/etc drivers; port the two-target idea (SDK target + MCP target from one spec) onto Effect/@effect-rpc + effect/Schema instead of axios/Zod.

- **Source:** `packages/orval-config/src/index.ts:9-47`
- **beep-target:** OpenAPI codegen for @beep/* API drivers + paired MCP servers

```
return defineConfig({
  sdk: { input: { target: inputFile }, output: { mode: 'split', target: './src/api/generated/endpoints.ts', client: 'axios-functions', httpClient: 'axios', override: { mutator: { path: mutatorPath, name: mutatorName } } } },
  mcp: { input: { target: inputFile }, output: { workspace: './src/mcp', client: 'mcp', target: './handlers.ts', schemas: './http-schemas' } },
});
```

### 2. Per-spec orval.config one-liner (driver registration pattern)
`data-ingestion` · relevance: **adjacent** · verified

Each API package reduces to a single call binding spec file + base URL. Clean convention for adding a new gov/legal API driver with near-zero boilerplate; mirrors what beep's driver skeletons want as a registration surface.

- **Source:** `packages/ecfr-sdk/orval.config.ts:1-3`
- **beep-target:** @beep eCFR driver config (duplicates existing skeleton)

```
import { createOrvalConfig } from '@us-legal-tools/orval-config';

export default createOrvalConfig('./v1-openapi3.json', 'https://www.ecfr.gov');
```

### 3. CourtListener token-auth axios mutator
`data-ingestion` · relevance: **direct** · verified

Custom axios instance injecting `Authorization: Token <env>` + User-Agent + base URL + timeout, with cancellation. Concrete, correct auth shape for the CourtListener REST v4 API (token-in-header, not Bearer). beep already skeletons a CourtListener driver; reuse this exact header/env convention (COURTLISTENER_API_TOKEN, `Token ` prefix) when wiring its Effect HTTP layer.

- **Source:** `packages/courtlistener-sdk/src/api/client.ts:8-22`
- **beep-target:** @beep CourtListener driver auth layer (Token-header pattern)

```
const authToken = process.env.COURTLISTENER_API_TOKEN;
const source = axios.CancelToken.source();
const promise = axios({
  baseURL: 'https://www.courtlistener.com/api/rest/v4',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': '@us-legal-tools/courtlistener-sdk/1.5.1',
    ...(authToken && { 'Authorization': `Token ${authToken}` }),
  },
  ...config, ...options, cancelToken: source.token,
}).then(({ data }) => data);
```

### 4. MCP tool registration with structured path/query/body param groups
`mcp-design` · relevance: **direct** · adjusted

server.tool(name, description, { queryParams | bodyParams | pathParams }, handler) — Orval-generated MCP server that groups inputs into named param objects, each backed by a Zod schema. Clean template for beep's MCP servers (FastMCP+Zod): consistent param grouping + tool naming derived from operationId, with stdio transport bootstrap.

- **Source:** `packages/courtlistener-sdk/src/mcp/server.ts:148-155`
- **beep-target:** @beep/nlp-mcp / driver MCP servers tool-registration convention

```
server.tool(
  'postCitationLookup',
  'Citation lookup and normalization',
  {
    bodyParams: postCitationLookupBody
  },
  postCitationLookupHandler
);
```

### 5. Zod tool-schema with rich .describe() metadata for LLM tool calls
`mcp-design` · relevance: **direct** · verified

Generated Zod param schemas carry per-field .describe() text, enums, defaults, and pagination cursors — the LLM-facing tool contract. Directly informs beep's progressive-disclosure/context-reduction MCP tooling: descriptions, enum constraints, and nullish handling give the model precise affordances. Port shape to effect/Schema with annotations.

- **Source:** `packages/courtlistener-sdk/src/mcp/tool-schemas.zod.ts:15-21`
- **beep-target:** effect/Schema annotations for MCP tool input contracts

```
export const getSearchQueryParams = zod.object({
  "q": zod.string().optional().describe('Search query with support for advanced operators and field-specific searches (caseName:, court_id:, dateFiled:, etc.)'),
  "type": zod.enum(['o', 'r', 'rd', 'd', 'p', 'oa']).default(getSearchQueryTypeDefault).describe('Type of content to search'),
  "order_by": zod.enum(['score', 'dateFiled', 'dateArgued', 'citeCount']).optional().describe('Field to order results by'),
  "cursor": zod.string().optional().describe('Cursor for pagination')
})
```

### 6. Citation lookup + normalization tool (text-blob in, normalized cites out)
`legal-nlp` · relevance: **direct** · verified

CourtListener citation-lookup endpoint: accepts a free-text blob (max 10k chars) OR volume/reporter/page, returns normalized_citations. Rate limited to 60 citations/minute, 250/request (documented in the handler JSDoc). This is precisely beep's PROSE->candidate-citation flow: feed prose, get back normalized citation candidates to ground as spans.

- **Source:** `packages/courtlistener-sdk/src/mcp/handlers.ts:143-158`
- **beep-target:** @beep epistemic: citation CandidateClaim extraction via CourtListener lookup

```
export type postCitationLookupArgs = {
  bodyParams: PostCitationLookupBody;
}
export const postCitationLookupHandler = async (args: postCitationLookupArgs) => {
  const res = await postCitationLookup(args.bodyParams);
  return { content: [ { type: 'text' as const, text: JSON.stringify(res) } ] };
};
```

### 7. Citation result schema (normalized_citations) for span grounding
`provenance-evidence` · relevance: **direct** · adjusted

Typed result shape for citation lookup: CitationResult.normalized_citations[] of CitationResultNormalizedCitationsItem. Maps cleanly to beep's GroundedExtraction: each normalized citation can become a CandidateClaim with provenance spans into the source prose. (Original nugget cited citationLookupText.ts, which is actually the INPUT text-blob schema; the result schema lives in citationResult.ts — repointed.)

- **Source:** `packages/courtlistener-sdk/src/mcp/http-schemas/citationResult.ts:8-12`
- **beep-target:** @beep/langextract span-grounded citation candidates

```
import type { CitationResultNormalizedCitationsItem } from './citationResultNormalizedCitationsItem';

export interface CitationResult {
  normalized_citations?: CitationResultNormalizedCitationsItem[];
}
```

### 8. Case-law search response model (case/opinion/court fields + BM25 score)
`ip-domain-models` · relevance: **adjacent** · verified

Rich Zod model of a CourtListener search result: caseName, citation[], court_id, dateFiled, docketNumber, opinions[], meta.score.bm25, etc. A ready-made legal case-law schema and relevance-scoring shape to inform beep's law-practice domain (citing case metadata) and GraphRAG ranking.

- **Source:** `packages/courtlistener-sdk/src/mcp/tool-schemas.zod.ts:23-52`
- **beep-target:** @beep law-practice case-law / PriorArtReference schema

```
export const getSearchResponse = zod.object({
  "count": zod.number().optional().describe('Total number of results'),
  "results": zod.array(zod.object({
    "caseName": zod.string().optional().describe('Case name'),
    "citation": zod.array(zod.string()).optional().describe('Citations for this case'),
    "court_id": zod.string().optional().describe('Court identifier'),
    "dateFiled": zod.string().date().optional().describe('Date the case was filed'),
    "meta": zod.object({ "score": zod.object({ "bm25": zod.number().optional() }).optional() }).optional(),
  }))
})
```

### 9. Multi-provider MCP server env-auth matrix (claude config)
`mcp-design` · relevance: **adjacent** · adjusted

Documented mapping of each MCP server to its required env credential (none / COURTLISTENER_API_TOKEN / GOV_INFO_API_KEY / DOL_API_KEY) plus a ready mcpServers JSON block. Useful blueprint for beep's multi-provider auth + conditional tool registration (no-auth public APIs run unconditionally; keyed ones gate on env presence). (Line range corrected: matrix/JSON block is at ~252-300, not 1-90.)

- **Source:** `README.md:252-300`
- **beep-target:** beep MCP multi-provider auth / conditional tool registration

```
"mcpServers": {
  "courtlistener": { "command": "bunx", ... "env": { "COURTLISTENER_API_TOKEN": "your-token" } },
  "govinfo": { "command": "bunx", ... "env": { "GOV_INFO_API_KEY": "your-key" } },
  "dol": { "command": "bunx", ... "env": { "DOL_API_KEY": "your-key" } }
}
```

### 10. Turbo codegen-as-build-step pipeline (generate -> build, uncached generate)
`governance-ops` · relevance: **adjacent** · verified

turbo.json wires `build` to depend on `generate` (and `^build`), with `generate`/`download` marked cache:false so codegen always re-runs deterministically before compile, docs depend on generate, tests depend on build. Good template for beep's deterministic CI where OpenAPI/ontology artifacts are generated then compiled.

- **Source:** `turbo.json:4-33`
- **beep-target:** beep Turbo pipeline: codegen->build determinism

```
"build": { "dependsOn": ["generate", "^build"], "outputs": ["dist/**"] },
"download": { "cache": false },
"generate": { "cache": false },
"docs:generate": { "dependsOn": ["generate"], "outputs": ["docs/**"], "cache": true },
"test": { "dependsOn": ["build"], "cache": false }
```

### 11. Dual ESM/CJS + d.ts build with MCP SDK externalized
`governance-ops` · relevance: **serendipitous** · verified

build.ts uses Bun.build to emit ESM (.mjs) and CJS (.js) from both src/index and src/mcp/index, externalizing @modelcontextprotocol/sdk/axios/zod, then tsc --emitDeclarationOnly. Reusable packaging recipe for shipping a library + a runnable MCP entrypoint from one package (beep packages also expose ./mcp subpath exports).

- **Source:** `packages/ecfr-sdk/build.ts:12-44`
- **beep-target:** beep package build: library + ./mcp dual entrypoint packaging

```
await Bun.build({
  entrypoints: ['./src/index.ts', './src/mcp/index.ts'],
  outdir: './dist', format: 'esm', target: 'node',
  external: ['@modelcontextprotocol/sdk', 'axios', 'zod'],
  splitting: true, sourcemap: 'linked',
  naming: { entry: '[dir]/[name].mjs' },
});
```

### 12. Scalar + Hono aggregated OpenAPI docs portal
`desktop-portal` · relevance: **serendipitous** · verified

A small Hono server that renders a landing page linking to Scalar API-reference UIs for every spec in the monorepo (loadLocalSpec/validateSpec utils). Lightweight pattern for a local-first developer portal exposing all driver API specs/tools — adjacent to beep's desktop portal needs for browsing available data sources.

- **Source:** `packages/scalar-ui/src/server.ts:1-7`
- **beep-target:** beep local docs/data-source portal (Tauri-adjacent)

```
import { Hono } from 'hono';
import { apiReference } from '@scalar/hono-api-reference';
import { apiConfigs } from './api-configs';
import { loadLocalSpec, getContentType, validateSpec } from './utils/spec-loader';
import { errorPage } from './components/error-page';

const app = new Hono();
```
