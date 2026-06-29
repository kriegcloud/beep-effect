# harvest-mcp  `[T2]`

- **Purpose:** MCP server that analyzes browser network traffic (HAR files) and uses LLM function-calling to auto-generate TypeScript API-client wrapper scripts reproducing full auth + dependency workflows.
- **Stack:** TypeScript (Bun runtime), @modelcontextprotocol/sdk, Zod, OpenAI + Google Gemini SDKs (multi-provider), Playwright (browser capture), @dagrejs/graphlib (DAG), ts-morph (AST codegen), Pino logging, Vitest, Biome.
- **Size / shape:** ~15.4k LOC of src TypeScript across ~100 files; an MCP STDIO server (library + agents + core services). Notable big files: server.ts 1647, types/index.ts 1423, ManualSessionManager 2095, DependencyAgent 1683, SessionManager 1571, ParameterClassificationAgent 1420.
- **License:** unknown
- **Maturity:** Last commit 2025-07-23; active, claims 279 tests / 100% pass, strict TDD. No LICENSE file present.

**Notes:** No LICENSE file in repo root (private package.json) — treat reuse as inspiration/clean-room, not copy-paste. Domain is API-reverse-engineering, not legal, but the LLM-proposes / heuristic-classifies / human-debug-gate / typed-error architecture maps cleanly onto beep's retrieval-vs-logic wall and candidate->approved gating. Uses Zod + raw MCP SDK + classes, NOT Effect/Schema, so patterns must be re-expressed in beep's stack.

## Web enrichment
- **Status:** harvest-mcp (the HAR-analyzing API-client codegen MCP server) is a niche/private project — no canonical public upstream found; the public 'harvest-mcp' GitHub results are all unrelated Harvest *time-tracking* API integrations. Verify-via-web therefore centers on its STACK, not the app. Stack is current and sound for 2026: MCP TypeScript SDK is actively maintained (stable spec rev 2026-07-28 in flight), Bun/Zod/ts-morph/@dagrejs/graphlib/Playwright/Pino/Vitest/Biome all live. Two real external-behavior risks: (1) the Google Gemini SDK and (2) the Zod v3->v4 transition in the MCP SDK. None of the orchestrator's cross-cutting legal topics (Free Law/eyecite, USPTO/PatentsView, EPO OPS, OWL2, FalkorDB, BAML, FRBR/BFO, OpenCode) apply to this repo — it is a domain-agnostic browser-traffic-to-TypeScript codegen tool; those beep-target mappings are aspirational and should not be 'verified' against this codebase.</statusNotes>
<parameter name="deprecations">["Google Gemini JS SDK: @google/generative-ai is END-OF-LIFE. All support (incl. bug fixes) ended 2025-11-30 and the repo (google-gemini/deprecated-generative-ai-js) was archived 2025-12-16. If harvest-mcp's Gemini provider imports @google/generative-ai it must migrate to the unified @google/genai SDK — different client shape (unified client object vs GenerativeModel; reads GEMINI_API_KEY env automatically). Legacy SDK also lacks newer features (Live API, structured-output/function-calling improvements).","MCP TS SDK x Zod v4: older @modelcontextprotocol/sdk (≈1.17.x) was incompatible with Zod v4 — tools fail at runtime with 'w._parse is not a function' / removed ZodSchema export. Fixed in newer SDK (imports zod/v4 internally, back-compat with Zod >=3.25 via zod/v3 + zod/v4 subpaths). Caution: pin SDK and Zod together; do NOT mix a pre-fix SDK with Zod v4. Confirm package.json resolves a single Zod >=3.25.","FastMCP (punkpeye/fastmcp, TS) is a third-party wrapper on the official SDK, NOT the same as Python FastMCP 3.0; if the nuggets reference 'FastMCP conventions' for a TS server, the canonical baseline is the official @modelcontextprotocol/sdk McpServer + registerTool/Zod patterns, not FastMCP.","HAR capture caution: Playwright-recorded HAR contains live auth tokens/cookies/secrets in headers and bodies. Auto-generated client scripts and the parameter-classification (sessionConstant/staticConstant) outputs can leak credentials — ensure redaction before persistence/LLM submission."]
- **Upstream docs:**
  - https://ai.google.dev/gemini-api/docs/migrate — Official Gemini migration guide: @google/generative-ai (EOL) -> unified @google/genai SDK.
  - https://github.com/google-gemini/deprecated-generative-ai-js — Archived legacy JS SDK repo confirming deprecation/EOL (archived 2025-12-16).
  - https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/server.md — Canonical McpServer/registerTool/Zod server-authoring conventions for the official TS SDK.
  - https://github.com/modelcontextprotocol/typescript-sdk/issues/925 — MCP SDK x Zod v4 incompatibility + resolution (zod/v4 subpath, >=3.25 back-compat).
  - https://github.com/colinhacks/zod/issues/4371 — Zod subpath versioning (zod/v3, zod/v4) enabling incremental migration — the mechanism the SDK relies on.
- **Corrections:**
  - *Multi-provider LLM factory with registry, priority resolution, and actionable missing-key errors*: Validate the Gemini leg specifically: if it depends on @google/generative-ai it is on an EOL/archived SDK (support ended 2025-11-30). The factory should target @google/genai. Also note OpenAI + Gemini now expose overlapping but non-identical function-calling/structured-output schemas — the registry abstraction should normalize tool/function-call shapes per provider, which strengthens (not weakens) this nugget's value as a beep-target.
  - *Interface-Segregation tool contexts + Adapter pattern for MCP tool dependency injection*: Tie to current MCP TS SDK reality: tool registration uses registerTool(name, {inputSchema: zodShape}, handler) with Zod >=3.25; the Zod-version coupling (see deprecations) is the concrete external constraint the DI/adapter layer must isolate. Canonical pattern is the official SDK's McpServer, not FastMCP-TS.
  - *Parameter classification taxonomy: dynamic / sessionConstant / staticConstant / userInput / optional with confidence + provenance source*: Add a security/provenance caveat: values classified sessionConstant/staticConstant from a HAR are frequently secrets (bearer tokens, API keys, CSRF). Provenance schema should carry a 'sensitive' flag and redaction state, not just confidence+source, before this maps cleanly onto @beep/epistemic GroundedExtraction.

## Gold nuggets (8)

### 1. Multi-provider LLM factory with registry, priority resolution, and actionable missing-key errors
`mcp-design` · relevance: **direct** · verified

PROVIDER_REGISTRY maps provider name -> {factory, requiredEnvVar, defaultModel}; createProvider/getDefaultProvider resolve provider via strict priority (CLI args > tool params > env), auto-detect by API-key prefix (sk- vs AIza), and throw structured HarvestError carrying setupInstructions + nextActions instead of a bare string. beep needs exactly this for its Anthropic/OpenAI/xAI drivers: a typed registry + auth-resolution precedence + helpful onboarding errors. Re-express the registry/precedence as an Effect Layer with typed config errors.

- **Source:** `src/core/providers/ProviderFactory.ts:17-245`
- **beep-target:** @beep multi-provider LLM driver layer (Anthropic/OpenAI/xAI auth + model resolution)

```
const PROVIDER_REGISTRY: Record<string, ProviderRegistryEntry> = {
  openai: { name: "openai", factory: async (config) => {...}, requiredEnvVar: "OPENAI_API_KEY", defaultModel: "gpt-4o" },
  gemini: { ... requiredEnvVar: "GOOGLE_API_KEY", defaultModel: "gemini-1.5-flash" },
};
// auto-detect:
if (cliConfig.apiKey.startsWith("sk-")) { openaiKey = cliConfig.apiKey; }
else if (cliConfig.apiKey.startsWith("AIza")) { googleKey = cliConfig.apiKey; }
```

### 2. Parameter classification taxonomy: dynamic / sessionConstant / staticConstant / userInput / optional with confidence + provenance source
`provenance-evidence` · relevance: **adjacent** · verified

ParameterClassification union plus ClassifiedParameter carry classification, confidence (0-1), source ('heuristic'|'llm'|'manual'|'consistency_analysis'), and metadata (consistencyScore, parameterPattern, domainContext). Heuristic classifier returns {classification, confidence, pattern, domainContext} per parameter before LLM refinement. This is a direct analog of beep's CandidateClaim: a fallible proposal tagged with confidence + how-derived provenance + a manual override path - the same shape epistemic slice needs for GroundedExtraction and the candidate->approved gate.

- **Source:** `src/types/index.ts:187-242`
- **beep-target:** @beep/epistemic CandidateClaim/GroundedExtraction confidence+source schema

```
export type ParameterClassification =
  | "dynamic" | "sessionConstant" | "staticConstant" | "userInput" | "optional";
export interface ClassifiedParameter {
  name: string; value: string; classification: ParameterClassification;
  confidence: number;
  source: "heuristic" | "llm" | "manual" | "consistency_analysis";
  metadata: { occurrenceCount: number; totalRequests: number; consistencyScore: number; parameterPattern: string; domainContext?: string; };
}
```

### 3. Layered heuristic-then-LLM classification pipeline (cheap deterministic pass before fallible model)
`legal-nlp` · relevance: **adjacent** · verified

classifyParameter runs deterministic heuristics first: auth/token/key header => sessionConstant conf 0.8; q/query/search => userInput conf 0.95; pagination params => userInput conf 0.9; static coordinates => staticConstant. The LLM is invoked only as a fallback/refinement for complex cases, not as the authority. This mirrors beep's hard wall: deterministic/SHACL logic first, LLM only proposes - and shows a concrete pattern for minimizing LLM calls and keeping reasoning auditable.

- **Source:** `src/agents/ParameterClassificationAgent.ts:417-466`
- **beep-target:** @beep/nlp-mcp extraction tools: deterministic-first then LLM-refine pipeline

```
if (location === "url") {
  if (["q", "query", "search", "text", "texto", "term"].includes(nameLower)) {
    return { classification: "userInput", confidence: 0.95, pattern: "search_query", domainContext: "search" };
  }
}
```

### 4. Authentication analysis domain model: TokenInfo, TokenLifecycle, AuthenticationEndpoint, flow complexity
`data-ingestion` · relevance: **adjacent** · verified

A reusable schema for describing API auth: TokenInfo with type (bearer/api_key/session/csrf/custom) + location (header/cookie/url_param/body) + scope + expiry, TokenLifecycle (isStatic, refreshEndpoint, generationEndpoint, expirationPattern), AuthenticationEndpoint purpose (login/refresh/logout/validate), and an AuthenticationAnalysis aggregate with securityIssues/recommendations and flowComplexity. beep's data-source drivers (CourtListener/USPTO/etc.) each need a normalized auth descriptor; this is a ready-made vocabulary including a securityIssues/recommendations channel.

- **Source:** `src/types/index.ts:28-123`
- **beep-target:** @beep driver auth descriptor schema (shared across data-source drivers)

```
export interface TokenInfo {
  type: "bearer" | "api_key" | "session" | "csrf" | "custom";
  location: "header" | "cookie" | "url_param" | "body";
  name: string; value: string; isExpired?: boolean; expiresAt?: Date; scope?: string[];
}
export interface TokenLifecycle { isStatic: boolean; expiresIn?: number; refreshEndpoint?: string; generationEndpoint?: string; expirationPattern?: string; }
```

### 5. Interface-Segregation tool contexts + Adapter pattern for MCP tool dependency injection
`effect-ts` · relevance: **adjacent** · verified

Instead of passing a god-object server into every MCP tool, harvest defines minimal capability interfaces (SessionQuery, SessionLogging, SessionAnalysis, SessionManagement, CompletedSessionOperations) and composes per-tool-group contexts (DebugToolContext, AnalysisToolContext, CodegenToolContext, SystemToolContext...) built over SessionManagerAdapter. This is a hand-rolled version of what beep gets natively from Effect Layers/Services - useful as a spec for which capabilities each MCP tool group actually needs, and a reference when defining beep's @effect-rpc service boundaries.

- **Source:** `src/types/index.ts:1004-1095`
- **beep-target:** @beep MCP tool service boundaries / Effect Layer capability split

```
export interface SessionQuery { getSession(sessionId: string): HarvestSession; }
export interface SessionLogging { addLog(sessionId: string, level: LogEntry["level"], message: string, data?: unknown): void; }
export interface DebugToolContext extends SessionQuery, SessionLogging, SessionAnalysis {
  sessionManager: SessionManagerAdapter;
  completedSessionManager: CompletedSessionManagerAdapter;
}
```

### 6. Modular MCP tool registration split by domain with shared typed context
`mcp-design` · relevance: **direct** · adjusted

server.ts wires tools via per-domain registrar functions (registerSessionTools, registerAnalysisTools, registerAuthTools, registerDebugTools, registerCodegenTools, registerManualSessionTools, registerWorkflowTools, registerSystemTools), each receiving the MCP server + its narrow context built by createXToolContext factories. This is a clean blueprint for beep's @beep/nlp-mcp registering many NLP tools and for conditional/progressive registration - group tools by capability and inject only the context each group needs rather than one monolithic register call.

- **Source:** `src/server.ts:11-42`
- **beep-target:** @beep/nlp-mcp tool registry organization (tools grouped by domain)

```
import { registerAnalysisTools } from "./tools/analysisTools.js";
import { registerAuthTools } from "./tools/authTools.js";
import { registerCodegenTools } from "./tools/codegenTools.js";
import { registerDebugTools } from "./tools/debugToolRegistry.js";
import { registerManualSessionTools } from "./tools/manualSessionTools.js";
import { registerSessionTools } from "./tools/sessionTools.js";
import { registerSystemTools } from "./tools/systemTools.js";
import { registerWorkflowTools } from "./tools/workflowTools.js";
```

### 7. Input-quality gating with graded verdict + actionable issues/recommendations before expensive analysis
`governance-ops` · relevance: **adjacent** · verified

assessQuality grades parsed HAR as excellent/good/poor/empty from request statistics and auth-error count, and HARQualityError refuses to proceed when quality is insufficient, bundling issues + recommendations into the error. beep ingestion needs the same gate: before sending a source document into span-grounded extraction or the candidate pipeline, score input completeness and either proceed or return a typed error telling the user how to improve the input (e.g. OCR quality, missing pages).

- **Source:** `src/core/HARParser.ts:174-227`
- **beep-target:** @beep ingestion input-quality gate before extraction pipeline

```
function assessQuality(stats: HARStats, authErrors: number): "excellent" | "good" | "poor" | "empty" {
  if (stats.relevantEntries === 0) return "empty";
  if (authErrors > 0) return "poor";
  if (stats.apiRequests >= 3 || stats.postRequests >= 2) return "excellent";
  if (stats.relevantEntries >= 5 || stats.apiRequests >= 1) return "good";
  return "poor";
}
```

### 8. Typed error hierarchy with code + structured data payload
`effect-ts` · relevance: **serendipitous** · verified

HarvestError base carries a string code + arbitrary structured data, subclassed into SessionNotFoundError, HARQualityError (packs quality/issues/recommendations/context), HARGenerationError. This is the class-based predecessor of beep's Effect typed errors (Data.TaggedError) - a useful catalog of which failure modes a candidate-extraction/codegen pipeline produces and what diagnostic context each should surface to the human gate.

- **Source:** `src/types/index.ts:854-908`
- **beep-target:** @beep typed-error taxonomy for extraction/codegen failures

```
export class HarvestError extends Error {
  public code: string; public data?: unknown;
  constructor(message: string, code = "HARVEST_ERROR", data?: unknown) {
    super(message); this.name = "HarvestError"; this.code = code; this.data = data;
  }
}
export class HARQualityError extends HarvestError { constructor(quality, issues, recommendations, context?) { super(message, "HAR_QUALITY_INSUFFICIENT", { quality, issues, recommendations, ...context }); } }
```
