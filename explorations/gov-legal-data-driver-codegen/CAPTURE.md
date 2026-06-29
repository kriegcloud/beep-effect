# Capture

<!--
Stage 0. Append-only raw dump: thoughts, links, screenshots (drop files in
assets/ and reference them), half-sentences, contradictions. Nobody tidies
this file; cleaning it up destroys provenance. New material goes under a new
dated heading at the bottom.
-->

## 2026-06-29 — Gold-intake seed

Maps to GOLD_SYNTHESIS theme **"Legal / court / patent data ingestion"**
(`explorations/_gold-intake/GOLD_SYNTHESIS.md` §"Gold catalog by theme", line 101)
and Top-ROI item #1 "OpenAPI→SDK+MCP codegen (Orval) for the 5 bare gov drivers"
(GOLD_SYNTHESIS line 11).

**Cluster rationale (from routing.json):** The four gov/legal drivers are bare
VERSION-only skeletons and govinfo is only partially scaffolded (Search HttpApi
contract, no client/auth), and no goal or exploration currently drives their
implementation: `official-data-sync-foundation` is a disjoint static-dataset
(ISO/IANA/CLDR) goal, and `solo-firm-docketing` is a build-vs-buy decision packet
frozen at its align review gate with an empty MAP.md. The gold (an
OpenAPI→SDK+MCP codegen pipeline plus auth/retry/cache patterns across five APIs)
is genuinely net-new infrastructure that warrants its own exploration,
coordinating with the existing skeletons and the runpod/acp codegen precedent.

Route: `new-exploration` → primaryTarget `gov-legal-data-driver-codegen`
(targetExists=false). Wave P1 (histogram P1:7 / P2:6 / P3:6). themeSpan:
data-ingestion, desktop-portal, effect-ts, governance-ops, mcp-design.
Secondary targets: `packages/drivers/{courtlistener,ecfr,dol,federal-register,govinfo,runpod,acp}`,
`explorations/solo-firm-docketing`.

### Nuggets (19)

- **us-legal-tools#1** (us-legal-tools) — Single OpenAPI spec -> dual SDK + MCP server codegen (Orval). `packages/orval-config/src/index.ts:9-47`. → feeds netNew #1 (the canonical single-spec→two-target codegen pattern; port the SDK target + MCP target idea onto Effect/@effect-rpc + effect/Schema). Snippet: `defineConfig({ sdk: {... client:'axios-functions' ...}, mcp: {... client:'mcp', target:'./handlers.ts', schemas:'./http-schemas' } })`.
- **patents-mcp-server#14** (patents-mcp-server) — OpenAPI->Zod response-validation codegen pipeline (Hey API) committed to repo. `package.json:32-33`. → feeds netNew #1 (deterministic-CI governance: `pnpm fetch-specs` downloads upstream spec, `pnpm codegen` runs openapi-ts, generated code committed; `looseParse` fallback for null optionals). Snippet: `"codegen": "openapi-ts", "fetch-specs": "gh api repos/patent-dev/uspto-odp/contents/swagger_fixed.yaml ... > src/specs/uspto-odp.yaml"`.
- **us-legal-tools#2** (us-legal-tools) — Per-spec orval.config one-liner (driver registration pattern). `packages/ecfr-sdk/orval.config.ts:1-3`. → feeds netNew #1 + #2 (near-zero-boilerplate per-driver registration surface for adding a new gov/legal API). Snippet: `export default createOrvalConfig('./v1-openapi3.json', 'https://www.ecfr.gov');`.
- **us-legal-tools#10** (us-legal-tools) — Turbo codegen-as-build-step pipeline (generate -> build, uncached generate). `turbo.json:4-33`. → feeds netNew #1 (deterministic CI: `build` dependsOn `generate`+`^build`, `generate`/`download` cache:false so codegen always re-runs before compile). Snippet: `"build": { "dependsOn": ["generate","^build"] }, "generate": { "cache": false }`.
- **us-legal-tools#4** (us-legal-tools) — MCP tool registration with structured path/query/body param groups. `packages/courtlistener-sdk/src/mcp/server.ts:148-155`. → feeds netNew #1 (MCP target codegen) + #5 (tool naming from operationId, grouped queryParams/bodyParams/pathParams, stdio bootstrap). Snippet: `server.tool('postCitationLookup','Citation lookup and normalization',{ bodyParams: postCitationLookupBody }, postCitationLookupHandler)`.
- **us-legal-tools#12** (us-legal-tools) — Scalar + Hono aggregated OpenAPI docs portal. `packages/scalar-ui/src/server.ts:1-7`. → feeds netNew #1 (secondary / desktop-portal: local-first dev portal exposing every driver's spec via Scalar API-reference UIs; loadLocalSpec/validateSpec). Snippet: `import { apiReference } from '@scalar/hono-api-reference'; ... const app = new Hono();`.
- **us-legal-tools#3** (us-legal-tools) — CourtListener token-auth axios mutator. `packages/courtlistener-sdk/src/api/client.ts:8-22`. → feeds netNew #3 (the exact CourtListener V4 auth shape: Token-header not Bearer, base /api/rest/v4, env COURTLISTENER_API_TOKEN, User-Agent, 30s timeout). Snippet: `baseURL:'https://www.courtlistener.com/api/rest/v4', headers:{ ...(authToken && {'Authorization': `Token ${authToken}`}) }`.
- **doc-haus#14** (doc-haus) — CourtListener case-law client (DUPLICATE of beep skeleton — recorded with caveat). `dochaus/tool/case-law.ts:45-58`. → feeds netNew #3 + #2 (result-shaping caseName/citation/court/citeCount/snippet, unauthenticated-vs-token rate-limit, and the remote-MCP-vs-hand-rolled-client decision to compare against). Snippet: `const token = process.env.COURTLISTENER_API_TOKEN; fetch(`${SEARCH_URL}?${params}`, { headers: token ? { Authorization: `Token ${token}` } : {} })`.
- **mike#11** (mike) — CourtListener API client: bulk-first fallback + citation parse/normalize/verify. `backend/src/lib/courtlistener.ts:457-467`. → feeds netNew #2 + #3 (CourtListener driver citation resolution: regex parse {volume,reporter,page}, local-cache-then-live-API fallback with `bulk+api` source tag). Snippet: `value.trim().match(/\b(\d{1,4})\s+([A-Za-z][A-Za-z0-9.\s]*?)\s+(\d{1,7})\b/)`.
- **us-gov-open-data-mcp#2** (us-gov-open-data-mcp) — Config-object API client factory: auth (query/header/body), disk TTL cache, retry+backoff, rate limit. `src/shared/client.ts:22-65`. → feeds netNew #4 (the core declarative client-factory pattern: `createClient(config)` over subclassing, envParams param→env mapping with graceful omit, Retry-After parsing on 429/502/503/504, friendly auth-failure errors). Snippet: `auth?: { type:"query"|"header"|"body"; envParams: Record<string,string>; prefix?: string }; rateLimit?: { perSecond; burst }; cacheTtlMs?; maxRetries?`.
- **us-gov-open-data-mcp#3** (us-gov-open-data-mcp) — Token-bucket rate limiter with FIFO fairness and batch drain. `src/shared/client.ts:115-182`. → feeds netNew #4 (Effect-wrappable throttle primitive: time-based refill, fast path when token free + queue empty, single-timer FIFO drain of all eligible waiters, no thundering herd). Snippet: `async acquire(){ this.refill(); if (this.tokens>=1 && this.queue.length===0){ this.tokens-=1; return; } return new Promise(resolve => { this.queue.push(resolve); this.scheduleDrain(); }); }`.
- **mcp-uspto#1** (mcp-uspto) — Per-API token-bucket rate limiter with multi-tier auth fetcher. `src/lib/fetcher.ts:15-81`. → feeds netNew #4 (per-tier bucket map keyed by API tier odp/patentsview/tsdr, each own refill rate + API-key header — the per-source rate-limit kernel to port into the Effect HttpClient layer). Snippet: `const buckets: Record<ApiType,Bucket> = { odp:{tokens:10,refillRate:10,...}, patentsview:{tokens:3,refillRate:0.75,...}, tsdr:{tokens:5,refillRate:1,...} }`.
- **uspto-patents-mcp#6** (uspto-patents-mcp) — KV memoize cache with TTL jitter + stable cache-key builder. `src/cache.ts:15-39`. → feeds netNew #4 (cache layer: `KvCache.memoize` wraps fetch with TTL'd KV, +10% random jitter on expiry to avoid cache-stampede, `expirationTtl` 1.5x; `stableKey()` deterministic sorted-key serialization). Snippet: `const jitterMs = Math.floor(Math.random()*0.1*ttlSeconds*1000); ... stableKey: sorted.map(k => `${k}=${JSON.stringify(parts[k])}`).join("&")`.
- **TalentScore#7** (TalentScore) — Effect HttpClient API-wrapper with versioned base URL + Redacted auth header + retry. `packages/server/src/public/files/upload-thing-api.ts:70-102`. → feeds netNew #4 (the canonical Effect-native client wrapper template: mapRequest prepends version-pinned base URL, injects Redacted key header secret-never-logged, filterStatusOk, response-error logging, retryTransient exponential — exposed as Effect.Service with per-version variants). Snippet: `baseClient.pipe(HttpClient.mapRequest(req => req.pipe(HttpClientRequest.prependUrl(".../v7"), HttpClientRequest.setHeader("x-uploadthing-api-key", Redacted.value(env.KEY)))), HttpClient.filterStatusOk, HttpClient.retryTransient({ times:3, schedule: Schedule.exponential("250 millis",1.5) }))`.
- **patent-search-mcp-server#6** (patent-search-mcp-server) — Status-code humanization + typed API error mapping for client-facing MCP errors. `src/api/client.ts:78-106`. → feeds netNew #4 + #1 (status→stable-code enum unauthenticated/payment_required/permission_denied/rate_limited/..., humanizeError for actionable 401/402/429 operator messages; beep models these as Schema.TaggedError, the mapping table transfers). Snippet: `codeForStatus(status){ case 401:"unauthenticated"; case 402:"payment_required"; case 403:"permission_denied"; case 429:"rate_limited"; default: status>=500?"server_error":"bad_request" }`.
- **harvest-mcp#8** (harvest-mcp) — Typed error hierarchy with code + structured data payload. `src/types/index.ts:854-908`. → feeds netNew #1 + #4 (class-based predecessor of beep's Data.TaggedError: a catalog of which failure modes a candidate-extraction/codegen pipeline produces + what diagnostic context each surfaces to the human gate). Snippet: `class HarvestError extends Error { code; data } ... class HARQualityError extends HarvestError { super(message,"HAR_QUALITY_INSUFFICIENT",{ quality, issues, recommendations, ...context }) }`.
- **harvest-mcp#4** (harvest-mcp) — Authentication analysis domain model: TokenInfo, TokenLifecycle, AuthenticationEndpoint, flow complexity. `src/types/index.ts:28-123`. → feeds netNew #5 (ready-made normalized auth descriptor vocabulary for the per-driver env-auth matrix: TokenInfo type bearer/api_key/session/csrf/custom × location header/cookie/url_param/body, TokenLifecycle isStatic/refresh/expiry, securityIssues/recommendations channel). Snippet: `interface TokenInfo { type:"bearer"|"api_key"|"session"|"csrf"|"custom"; location:"header"|"cookie"|"url_param"|"body"; ... } interface TokenLifecycle { isStatic; refreshEndpoint?; generationEndpoint?; expirationPattern? }`.
- **courtlistener#11** (courtlistener) — Citation-aware rate throttle (eyecite parse reused downstream). `cl/api/utils.py:1078-1136`. → feeds netNew #4 + #2 (meter expensive parse once, charge per-citation output volume, DB-backed per-user overrides; throttle lives in `cl/api/utils.py`, the related VersionBasedPagination is in `cl/api/pagination.py`). Snippet: `class CitationCountRateThrottle(ExceptionalUserRateThrottle): def get_citation_count_from_request(...): view.citation_list = filter_out_non_case_law(...eyecite.get_citations(text, tokenizer=HYPERSCAN_TOKENIZER)); return len(...)`.
- **lawyergpt#5** (lawyergpt) — Configurable CSS-selector legal-corpus scraper (NigerianLII judgments). `extractor/main.go:64-93`. → feeds netNew #2 (a non-OpenAPI ingestion path for jurisdiction/court sites with no API: env-driven URL list + configurable goquery CSS selector, batches of 5 POSTed with x-api-key — generalizes to other LII/court sites). Snippet: `func contentSelector() string { selector := strings.TrimSpace(os.Getenv("EXTRACTOR_SELECTOR")); if selector==""{ return ".content-and-enrichments" }; return selector }`.

### netNew (build list)

1. OpenAPI single-spec → dual (Effect SDK + MCP server) codegen pipeline ported onto beep's Effect/effect-Schema/HttpApi stack (us-legal-tools uses Orval/axios/Zod; port the architecture, not the code).
2. Implement the four bare skeleton drivers @beep/{courtlistener,ecfr,dol,federal-register} (currently only export VERSION='0.0.0').
3. CourtListener V4 Token-header auth client layer (Authorization: Token <key>, env COURTLISTENER_API_TOKEN, baseURL /api/rest/v4).
4. Declarative auth+retry+cache client factory (us-gov-open-data-mcp pattern) generalized as an Effect HTTP layer across drivers.
5. Per-driver env-auth matrix + conditional MCP tool registration (CourtListener/GovInfo/DOL key-gated; eCFR/FedReg always-on keyless).
6. Finish PARTIAL @beep/govinfo: add client/auth(api.data.gov api_key)/retry/cache layer on top of existing Search HttpApi domain contracts.

### alreadyCovered (reuse — do not rebuild)

- @beep/govinfo domain layer (Search HttpApi contract + value models like SearchResult/PackageInfo/GranuleMetadata) already scaffolded.
- Repo already has an Effect-native OpenAPI/JSON-schema codegen precedent in packages/drivers/runpod and packages/drivers/acp (openapi.json + scripts/generate.ts) to reuse instead of adopting Orval/axios.
- Static official-dataset sync (ISO4217/IANA/CLDR) is owned separately by goals/official-data-sync-foundation — out of scope for this cluster, do not rebuild.

### cautions

- Licensing: us-legal-tools is MIT but the value is the codegen PIPELINE/PATTERNS, not the Orval-generated axios/Zod output — port the architecture onto Effect/HttpApi/effect-Schema rather than copying; us-gov-open-data-mcp license is unverified, so treat as reimplement-don't-copy.
- API state (verified 2026-06, all five upstreams ACTIVE): CourtListener V4 ENFORCES auth (anonymous = 401), header must be literally 'Authorization: Token <key>' (DRF TokenAuthentication, not Bearer/Api-Key), target /api/rest/v4/ (V3 legacy), and the SCOTUS visualization endpoints are deprecated — do not generate them.
- GovInfo + DOL require api.data.gov api_key (query param); eCFR and Federal Register are keyless (FedReg is an 'unofficial prototype', GovInfo is the official source).
- Orval @orval/mcp generator works in single-mode only (one spec per config) — relevant if Orval is used directly.
- Cross-cutting deprecation (NOT in this repo, flag for any sibling patents driver): PatentsView ended Feb 2025; PatentSearch → USPTO Open Data Portal (data.uspto.gov) on 2026-03-20 with mandatory key reissue; legacy USPTO Developer Hub decommissioned 2026-06-05.

<dump>
