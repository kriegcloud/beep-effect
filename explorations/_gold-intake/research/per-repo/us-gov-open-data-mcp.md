# us-gov-open-data-mcp  `[T2]`

- **Purpose:** MCP server + standalone TypeScript SDK exposing 300+ tools across 40+ U.S. government data APIs (Treasury, FRED, USPTO, Congress, FDA, etc.), with WASM-sandboxed "code mode" for context reduction.
- **Stack:** TypeScript (ESM, Node >=18); FastMCP v3 + Zod v4 for MCP; quickjs-emscripten (WASM sandbox); fast-xml-parser, he; vitest; vitepress/typedoc for docs. No Effect, no DB.
- **Size / shape:** ~35,900 LOC across 208 TS files; MCP server + publishable SDK. ~42 self-contained API modules each as a folder (index/meta/sdk/tools[/prompts/types]) auto-discovered at startup.
- **License:** MIT
- **Maturity:** Active. Last commit 2026-06-11; version 2026.6.10. Newest files mtime 2026-06-29.

**Notes:** This is a mature, well-documented reference implementation of a multi-API MCP server. beep already has skeleton drivers for USPTO/Federal Register/GovInfo/DOL etc., so the per-API SDKs here mostly duplicate beep's driver intent — but the cross-cutting infrastructure (client factory with config-object auth, WASM code-mode context reduction, columnar token-efficient response envelope, metadata-driven auto-discovery + instruction/routing-table generation, TokenBucket rate limiter) is the real gold and is provider-agnostic. The USPTO module is the most directly relevant domain code (PTAB IPR/PGR/CBM, continuity chains, prosecution transactions, assignments) and is worth comparing against beep's USPTO skeleton even though it overlaps.

## Web enrichment
- **Status:** us-gov-open-data-mcp's design is well-aligned with current best practice as of mid-2026, but several upstream API facts it depends on have shifted. (1) The "code-mode" pattern is now an industry-standard, externally validated technique: Cloudflare shipped "Code Mode" (blog Sep 2025; @cloudflare/codemode npm; productized MCP server Apr 2026) reporting ~99.9% input-token reduction by exposing only search()/execute() against a typed SDK — directly corroborating the repo's WASM code-mode nugget. Note the repo uses quickjs-emscripten (a QuickJS WASM interpreter); Cloudflare's reference implementation instead runs LLM-generated JS in a V8 isolate / Dynamic Worker Loader, which is the more performant/canonical sandbox if perf becomes a concern. (2) The biggest external-truth drift is USPTO: PatentsView's legacy API (api.patentsview.org) was shut off ~May 1 2025 (returns HTTP 410); the legacy Developer Hub (developer.uspto.gov) was decommissioned June 5 2026 and everything consolidated into the Open Data Portal at data.uspto.gov; PatentsView itself migrated to ODP March 20 2026. Critically, ODP now requires a signed-in USPTO.gov account (effective June 18 2026) plus extra profile fields (Aug 18 2026), and old PatentSearch/PatentsView API keys are NOT compatible with ODP — any hardcoded base URLs/keys/auth in the USPTO driver need revalidation. (3) PTAB: the old PTAB API v2 was decommissioned Jan 6 2026; PTAB data now lives in ODP (PTAB API v3). (4) FastMCP: the repo pins FastMCP v3. Be aware of an ecosystem fork — the "official" FastMCP TypeScript is now PrefectHQ/fastmcp-ts (Prefect adopted it), while the repo's dependency is almost certainly the original punkpeye/fastmcp v3. They share lineage but are diverging; confirm which package name is in package.json. eyecite (Free Law Project) is current at 2.7.x (Python); the only TS port is a third-party @beshkenadze/eyecite, not an official FLP release.</statusNotes>
<parameter name="deprecations">["USPTO PatentsView legacy API (api.patentsview.org) decommissioned ~May 1 2025 — now returns HTTP 410 Gone. Do not target it.","USPTO legacy Developer Hub (developer.uspto.gov) decommissioned June 5 2026; all APIs consolidated under data.uspto.gov (Open Data Portal).","ODP now requires authenticated USPTO.gov sign-in (eff. June 18 2026) + additional profile fields (eff. Aug 18 2026); legacy PatentSearch/PatentsView API keys are NOT compatible with ODP keys.","PTAB API v2 decommissioned Jan 6 2026; use PTAB API v3 (data served via ODP). Affects the USPTO ODP SDK 'PTAB trials' nugget.","FastMCP TS ecosystem fork: PrefectHQ/fastmcp-ts is now positioned as 'official', diverging from punkpeye/fastmcp v3 — verify which the repo actually depends on before upgrading.","No official TypeScript eyecite exists; @beshkenadze/eyecite is a community port lagging the canonical Python 2.7.x — treat as unofficial if used."]
- **Upstream docs:**
  - https://blog.cloudflare.com/code-mode/ — Cloudflare 'Code Mode' — canonical writeup of the write-code-against-typed-SDK pattern (validates the WASM code-mode nugget; ~99.9% token reduction).
  - https://developers.cloudflare.com/agents/tools/codemode/how-it-works/ — Code Mode internals: search()/execute() two-tool surface + isolate sandbox — reference architecture vs the repo's quickjs-emscripten approach.
  - https://data.uspto.gov/support/transition-guide/patentsview — Official USPTO PatentsView→ODP transition guide: new base URLs, key incompatibility, dataset mapping for the USPTO driver.
  - https://developer.uspto.gov/api-catalog/ptab-api-v3-data-odp — PTAB API v3 (data in ODP) — current endpoint for PTAB trials after v2 decommission.
  - https://github.com/PrefectHQ/fastmcp-ts — PrefectHQ fastmcp-ts — now-official FastMCP TypeScript line; check against the repo's pinned package/version.
  - https://github.com/freelawproject/eyecite — Canonical eyecite (Python, 2.7.x) — authoritative citation grammar/behavior if porting citation parsing to @beep.
- **Corrections:**
  - *WASM code-mode: run LLM-generated JS against tool output for 65-99% context reduction*: Externally validated: Cloudflare's 'Code Mode' (Sep 2025 / npm @cloudflare/codemode) reports ~99.9% input-token reduction via a two-tool search()/execute() surface over a typed SDK. The repo's 65-99% claim is consistent. One caution: Cloudflare runs the generated JS in a V8 isolate (Dynamic Worker Loader), not a QuickJS-WASM interpreter; quickjs-emscripten is correct for portability/sandboxing but is slower for heavy data transforms — consider an isolate path if the code-mode payloads grow.
  - *USPTO ODP SDK: PTAB trials, continuity chains, prosecution transactions, assignments, query DSL*: Verify base URLs/auth against the post-migration ODP. As of 2026: PatentsView legacy API is HTTP 410, Developer Hub is decommissioned (June 5 2026), PTAB API v2 is decommissioned (Jan 6 2026; use PTAB v3 in ODP), and ODP now mandates authenticated USPTO.gov sign-in with new-format keys incompatible with old PatentSearch keys. Any hardcoded developer.uspto.gov / api.patentsview.org hosts or legacy keys in this driver are stale.
  - *Metadata-driven module auto-discovery + generated MCP instructions and cross-ref routing table*: FastMCP v3 supports this composition natively (server-namespaced tools/resources, built-in logging+rate-limit middleware, JWT auth, Standard-Schema input inference incl. Zod). If aligning to upstream, note the package split: PrefectHQ/fastmcp-ts (official) vs punkpeye/fastmcp v3 — confirm the dependency before relying on v3 API specifics.
  - *Config-object API client factory: auth (query/header/body), disk TTL cache, retry+backoff, rate limit*: Sound and reusable, but the USPTO consumer of this factory must be reconfigured for ODP's new authenticated-account requirement (sign-in + profile fields, eff. mid-2026) — query/header API-key-only auth no longer suffices for data.uspto.gov endpoints.

## Gold nuggets (8)

### 1. WASM code-mode: run LLM-generated JS against tool output for 65-99% context reduction
`mcp-design` · relevance: **direct** · verified

executeInSandbox() runs an LLM-written JS script against a tool's raw response inside a QuickJS WASM sandbox (no fs/net/imports), injecting the response as a DATA string and capturing only console.log output, plus before/after byte + reduction metrics. The server.ts code_mode tool wraps ANY registered tool with this. Directly reusable for beep's retrieval wall: when an NLP/MCP tool returns a huge document, let the model extract just the spans/fields it needs without that volume crossing into context — a clean progressive-disclosure / context-reduction primitive that pairs with span-grounded extraction.

- **Source:** `src/shared/sandbox.ts:75-160`
- **beep-target:** @beep/nlp-mcp context-reduction tool; progressive disclosure for large source documents in retrieval slice

```
export async function executeInSandbox(data: string, script: string): Promise<SandboxResult> {
  const beforeBytes = Buffer.byteLength(data, "utf-8");
  const qjs = await getRuntime();
  const runtime = qjs.newRuntime();
  const deadline = Date.now() + TIMEOUT_MS;
  runtime.setInterruptHandler(shouldInterruptAfterDeadline(deadline));
  runtime.setMemoryLimit(64 * 1024 * 1024);
  const vm = runtime.newContext();
  const dataHandle = vm.newString(data);
  vm.setProp(vm.global, "DATA", dataHandle);
```

### 2. Config-object API client factory: auth (query/header/body), disk TTL cache, retry+backoff, rate limit
`data-ingestion` · relevance: **direct** · verified

createClient(config) builds an HTTP client from a declarative ClientConfig instead of subclassing: auth.type 'query'|'header'|'body' with envParams mapping param->env var (graceful omit if unset), extraParams, header prefix (Bearer), per-source rate limit, disk-backed TTL cache surviving restarts, exponential-backoff-with-jitter retry honoring Retry-After on 429/502/503/504, and friendly auth-failure errors. This is exactly the multi-provider auth + resilient-fetch pattern beep's gov-data drivers need; worth porting the auth-config shape and Retry-After parsing even though beep wraps fetch in Effect.

- **Source:** `src/shared/client.ts:22-65`
- **beep-target:** shared driver base for @beep CourtListener/USPTO/eCFR/FederalRegister/GovInfo/DOL clients (auth + retry + cache layer)

```
  auth?: {
    type: "query" | "header" | "body";
    envParams: Record<string, string>;
    extraParams?: Record<string, string>;
    prefix?: string;
  };
  rateLimit?: { perSecond: number; burst: number };
  cacheTtlMs?: number;
  maxRetries?: number;
  checkError?: (data: unknown) => string | null;
```

### 3. Token-bucket rate limiter with FIFO fairness and batch drain
`data-ingestion` · relevance: **adjacent** · verified

TokenBucket is a self-contained, dependency-free rate limiter: time-based refill, fast path when a token is free and queue empty, otherwise FIFO queue drained by a single timer that releases all eligible waiters in one pass (no thundering herd). Per-source perSecond/burst config. Directly reusable as an Effect-wrappable primitive for throttling outbound calls to rate-limited gov APIs.

- **Source:** `src/shared/client.ts:115-182`
- **beep-target:** rate-limit utility in @beep driver foundation

```
export class TokenBucket {
  private tokens: number;
  async acquire(): Promise<void> {
    this.refill();
    if (this.tokens >= 1 && this.queue.length === 0) {
      this.tokens -= 1;
      return;
    }
    return new Promise<void>(resolve => {
      this.queue.push(resolve);
      this.scheduleDrain();
    });
  }
```

### 4. Token-efficient columnar response envelope with timeseries stats and null-stripping
`mcp-design` · relevance: **adjacent** · verified

response.ts standardizes tool results into timeseries/table/record/list/empty envelopes. detectTrend() computes a linear-regression slope plus R2 to label a numeric series increasing/decreasing/stable/volatile; toColumnar/stripNulls compress array-of-objects payloads and prune null columns. A reusable pattern for compressing API payloads before they hit an LLM, and the trend/stat computation is a serendipitous idea for summarizing numeric evidence server-side rather than asking the model to do arithmetic.

- **Source:** `src/shared/response.ts:201-237`
- **beep-target:** tool-result formatting helpers in @beep/nlp-mcp / driver response layer

```
function detectTrend(values: number[]): "increasing" | "decreasing" | "stable" | "volatile" | null {
  if (values.length < 3) return null;
  const slope = (n * sumXY - sumX * sumY) / denom;
  if (r2 < 0.3) return "volatile";
  if (Math.abs(relSlope) < 0.01) return "stable";
  return slope > 0 ? "increasing" : "decreasing";
}
```

### 5. Metadata-driven module auto-discovery + generated MCP instructions and cross-ref routing table
`mcp-design` · relevance: **direct** · verified

Each API is a folder exporting an ApiModule (name/displayName/auth/workflow/tips/domains/crossRef/tools). server.ts readdirSync-discovers them, applies default tool annotations, supports selective loading via --modules/MODULES, and validates required env keys at startup. buildInstructions() auto-generates the system instructions and a question-type->sources routing table from each module's crossRef hints. A clean blueprint for beep's conditional tool registration, multi-provider key validation, and auto-generating agent guidance from per-driver metadata.

- **Source:** `src/server.ts:55-72`
- **beep-target:** @beep MCP server tool-registration + conditional-loading + generated agent instructions

```
const MODULES: ApiModule[] = [];
const apiDirs = readdirSync(apisDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .sort();
for (const dir of apiDirs) {
  try {
    const mod = await import(`./apis/${dir}/index.js`);
    MODULES.push(mod.default as ApiModule);
  } catch (err) {
    console.error(`Failed to load module "${dir}":`, (err as Error).message);
  }
}
```

### 6. ApiModule/ModuleMeta contract with Domain + QuestionType taxonomies and RouteHint
`mcp-design` · relevance: **adjacent** · adjusted

shared/types.ts defines the schema-first contract every driver satisfies: a fixed DOMAINS union, a QUESTION_TYPES union (includes 'patents' at line 85), and RouteHint mapping a question type to specific tools. A reusable typed taxonomy/metadata model for classifying drivers and routing queries — beep could adopt a similar typed registry so the agent layer knows which driver answers which kind of legal question. Re-themed from agent-memory to mcp-design: this is a tool/driver registry + routing contract, not a memory system.

- **Source:** `src/shared/types.ts:106-144`
- **beep-target:** typed driver/skill registry + query-routing metadata for @beep agents

```
export interface RouteHint {
  question: QuestionType;
  route: string;
}
export interface ModuleMeta {
  name: string;
  displayName: string;
  category: string;
  description: string;
  auth?: { envVar: string | string[]; signup: string; };
  workflow: string;
  tips: string;
  domains: Domain[];
  crossRef?: RouteHint[];
```

### 7. USPTO ODP SDK: PTAB trials, continuity chains, prosecution transactions, assignments, query DSL
`ip-domain-models` · relevance: **direct** · verified

Typed client for api.uspto.gov ODP covering patent application search, application details, parent/child continuity, assignments, prosecution transactions (office actions/responses), documents, and PTAB proceedings/decisions (IPR/PGR/CBM/DER). Includes applicationTypeCodes and trialTypeCodes constants and OdpSearchResult normalization. Overlaps beep's existing USPTO skeleton driver, but the field-path query syntax, response unwrapping, PTAB modeling, and structured filter/rangeFilter/sort POST body are concrete reference material for beep's PatentAsset/OfficeAction/Rejection/PriorArtReference models.

- **Source:** `src/apis/uspto/sdk.ts:42-67`
- **beep-target:** @beep USPTO driver (already skeletoned) + law-practice PatentAsset/OfficeAction/PriorArtReference schemas

```
export const applicationTypeCodes = {
  UTL: "Utility", DES: "Design", PLT: "Plant", PPA: "Provisional", REI: "Reissue",
} as const;
export const trialTypeCodes = {
  IPR: "Inter Partes Review", PGR: "Post Grant Review",
  CBM: "Covered Business Method", DER: "Derivation",
} as const;
export interface OdpSearchResult {
  count: number;
  requestIdentifier?: string;
  results: Record<string, unknown>[];
  facets?: Record<string, { value: string; count: number }[]>;
}
```

### 8. Lightweight string-DSL parsers for filters/range-filters/sorts into structured query objects
`mcp-design` · relevance: **serendipitous** · adjusted

uspto/tools.ts parses ergonomic LLM-friendly string forms ('field value1,value2', 'field from:to', 'field order') into structured OdpFilter/OdpRangeFilter/OdpSort objects for the POST body. A small reusable pattern: expose simple flat string params to the model (easy to fill, cheap tokens) then deterministically parse into a typed query — useful for beep's MCP/NLP tools where the model emits compact queries that code validates/expands. Re-themed from legal-nlp to mcp-design: this is generic tool-input parsing, not legal NLP.

- **Source:** `src/apis/uspto/tools.ts:28-55`
- **beep-target:** query-param parsing helpers for @beep NLP/MCP tool inputs

```
function parseFilter(s: string): OdpFilter | null {
  const idx = s.indexOf(" ");
  if (idx <= 0) return null;
  const name = s.substring(0, idx);
  const vals = s.substring(idx + 1).split(",").map((v) => v.trim()).filter(Boolean);
  return vals.length ? { name, value: vals } : null;
}
function parseRangeFilter(s: string): OdpRangeFilter | null {
  return { field, valueFrom: range.substring(0, colonIdx), valueTo: range.substring(colonIdx + 1) };
}
```
