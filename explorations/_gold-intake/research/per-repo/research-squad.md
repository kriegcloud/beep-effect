# research-squad  `[T1]`

- **Purpose:** A production-grade multi-agent research system (General Assistant -> Research Lead -> parallel Subagents -> Citations agent) built with Effect-TS and BAML, demonstrating type-safe LLM orchestration, structured concurrency, schema-driven data modeling, and a contract-driven TDD workflow.
- **Stack:** TypeScript, Effect v3 (Effect.Service/Layer/Schema/Stream), @effect/schema, @effect/cli, @effect/platform(-bun/-node), BAML (Boundary ML) for declarative LLM functions, Bun runtime, Vitest+@effect/vitest, Biome, OpenTelemetry/Prometheus/Jaeger observability.
- **Size / shape:** ~15.7k LOC TypeScript across 48 src files + ~2.9k LOC across 10 BAML files; kind = CLI + service library (multi-agent orchestrator, not yet an MCP server).
- **License:** MIT
- **Maturity:** Last commit 2025-10-24; active, well-documented, internally consistent (extensive CLAUDE.md/AGENTS.md Effect rulebook).

**Notes:** Effect v3 here vs beep's Effect v4 target — patterns (Effect.Service, Layer.unwrapEffect, Schema.Class, Data.TaggedError, Schedule retry) are directly portable but API names may have shifted. This repo is NOT an MCP server (it predates that for this project) but its tool-registry + schema-validated dispatch is a clean blueprint for one. No legal/IP domain content; gold is architectural (Effect/BAML/agent patterns) plus the citation-grounding and source-quality models that map onto beep's provenance/candidate-claim layers.

## Web enrichment
- **Status:** research-squad's core stack is current and healthy as of mid-2026. BAML (BoundaryML) is actively developed (v0.222.0, Apr 2026) with TS via NAPI plus WASM bindings, SAP/schema-aligned parsing, and multi-client config (round-robin/fallback) supported — the multi-provider nuggets remain valid. Effect v3 patterns (Service/Layer/Schema/Stream, Schedule, Layer.unwrapEffect) are stable and idiomatic; @effect/schema has been folding into the `effect` package, so confirm import paths against the version pinned. Biggest external risk is the IP-data layer the nuggets target downstream (@beep): the legacy PatentsView/USPTO APIs are mid-decommission and citation/authority nuggets that assume specific patent or legal-citation endpoints need endpoint hardening. eyecite + CourtListener (Free Law Project) is the canonical, actively-maintained legal-citation grounding stack and is the right anchor for the exact-text/span-grounding citation nuggets. For OWL2-in-JS, note no production-grade native JS/WASM DL reasoner exists; EL/RL work (ELK, Whelk EL+RL) is JVM-based — plan for JVM sidecar or RL rule-materialization rather than in-browser DL reasoning.</statusNotes>
<parameter name="deprecations">["USPTO legacy PatentsView: the original PatentsView Legacy API ended support Feb 2025 (replaced by PatentSearch API), and PatentsView itself is migrating to the USPTO Open Data Portal (data.uspto.gov) on March 20, 2026. Old PatentSearch API keys are NOT compatible with ODP — new ODP API keys required.","USPTO legacy Developer Hub (developer.uspto.gov) was decommissioned June 5, 2026; ODP-equivalent functions (e.g. some PatentsView query endpoints) are not all relaunched yet — expect gaps/no firm dates.","USPTO PTAB API v2 scheduled for decommission Jan 6, 2026 — any prior-art/PTAB provenance path must move to the ODP catalog.","Temporary interruptions expected on PatentSearch API during the March 2026 ODP cutover — citation/authority pipelines depending on it need retry + fallback (aligns with the Effect Schedule retry-policy nugget).","No production-grade OWL2 DL reasoner runs natively in JS/TS/WASM; ELK (EL) and Whelk (EL+RL) are JVM. Don't promise in-process browser DL reasoning — use a JVM service or OWL2 RL rule materialization.","FastMCP (punkpeye/fastmcp, TS) is a thin wrapper over the official @modelcontextprotocol/typescript-sdk; mcp-framework now leads on adoption. Tool-registry/schema-validated-dispatch nuggets should target official SDK primitives + Zod/Standard Schema rather than coupling tightly to FastMCP conventions."]
- **Upstream docs:**
  - https://github.com/BoundaryML/baml/blob/canary/CHANGELOG.md — BAML canary changelog — confirm SAP parser, TS NAPI/WASM client, and multi-client (round-robin/fallback) config against pinned version.
  - https://docs.boundaryml.com/ref/overview — BAML language/client reference — canonical for client<> config, retry/fallback policy and structured output schemas.
  - https://data.uspto.gov/support/transition-guide/patentsview — Official USPTO ODP transition guide for PatentsView — endpoint mapping, key incompatibility, migration timeline.
  - https://github.com/freelawproject/eyecite — eyecite — canonical legal citation extractor (used by CourtListener + Caselaw Access Project); provides citation spans for exact-text grounding.
  - https://www.courtlistener.com/help/api/rest/citation-lookup/ — CourtListener Citation Lookup/Verification API (eyecite-powered) — authoritative source-resolution + authority scoring for legal citations.
  - https://github.com/modelcontextprotocol/typescript-sdk — Official MCP TS SDK — base for tool registry, schema-validated dispatch, transports; FastMCP builds on this.
  - https://github.com/google/patents-public-data — Google Patents Public Datasets on BigQuery — stable alternative/complement to USPTO+EPO OPS for patent prior-art and authority signals.
  - https://drops.dagstuhl.de/entities/document/10.4230/TGDK.2.2.7 — Whelk: OWL EL+RL reasoner — reference for the realistic JVM-based reasoning profile if @beep/semantic-web needs OWL2 inference.
- **Corrections:**
  - *BAML multi-provider client config with round-robin and fallback*: Still valid and idiomatic in current BAML — client<llm> blocks support round-robin and fallback strategies natively. Verify exact policy/retry syntax against the pinned BAML version (v0.222.0, Apr 2026); SAP (schema-aligned parsing) handles partial/JSON-in-markdown outputs, which strengthens the structured-dispatch and validation nuggets.
  - *Source-authority inference from URL (primary-source taxonomy)*: For legal sources, anchor authority/source-resolution on eyecite + CourtListener Citation Lookup API (Free Law Project) rather than ad-hoc URL heuristics — it returns normalized reporters, court hierarchy and exact citation spans. For patent sources, prefer USPTO ODP (data.uspto.gov) + Google Patents BigQuery; legacy patentsview.org/search.patentsview.org host-based heuristics will break post-March-2026 migration.
  - *Exact-text-preservation citation grounding prompt*: This pattern matches Free Law Project's documented eyecite span-location approach (May 2025 citator work): extract exact character spans, then ground/annotate. Recommend grounding spans with eyecite output where the corpus is legal text, so @beep/langextract spans line up with a canonical citation parser instead of LLM-only extraction.
  - *Source quality / authority evidence schema*: For patent prior-art authority scoring (PriorArtReference), do not depend on the legacy PatentsView API: it lost Legacy-API support Feb 2025 and migrates to USPTO ODP March 20, 2026 with new, incompatible API keys; PTAB API v2 decommissions Jan 6, 2026. Use ODP endpoints + EPO OPS / Google Patents BigQuery, and gate calls behind the retry-policy library given expected cutover interruptions.
  - *Tool registry + schema-validated dispatch router*: Target the official @modelcontextprotocol/typescript-sdk primitives (Tool/Resource/Prompt) with Zod/Standard-Schema validation as the canonical contract; FastMCP is just a convenience wrapper over that SDK and mcp-framework now has broader adoption — avoid coupling the registry design to FastMCP-specific conventions.
  - *Validation results with source-span metadata + non-blocking warnings*: Maps cleanly onto SHACL severity levels (sh:Violation/sh:Warning/sh:Info) for @beep/semantic-web; note that for OWL2 inference backing these validations there is no native JS/TS/WASM DL reasoner — plan a JVM-based ELK/Whelk (EL/RL) sidecar or OWL2 RL rule materialization rather than in-process browser reasoning.

## Gold nuggets (15)

### 1. Exact-text-preservation citation grounding prompt
`provenance-evidence` · relevance: **direct** · verified

BAML AddCitations function forces the LLM to reproduce the synthesized text 100% byte-identically (whitespace included) and only insert citation tags at semantic-unit boundaries; output is wrapped in <exact_text_with_citation> and rejected if the non-citation text diverges from the original. This is exactly beep's PROSE-IN/PROOF-OUT discipline: span-anchored, verifiable source attributions without letting the model rewrite content. EvaluateCitationQuality (line 50+) adds an LLM-judge rubric for citation correctness.

- **Source:** `baml_src/agents/citations.baml:24-42`
- **beep-target:** @beep/provenance + @beep/langextract (span-grounded citation insertion); epistemic Evidence/GroundedExtraction.span

```
Based on the provided document, add citations ... within <exact_text_with_citation> tags.
- Do NOT modify the <synthesized_text> in any way - keep all content 100% identical, only add citations
- Pay careful attention to whitespace: DO NOT add or remove any whitespace
- ONLY add citations where the source documents directly support claims in the text
... Text without citations will be collected and compared to the original report ... If the text is not identical, your result will be rejected.
```

### 2. Failure-vs-defect split in LLM client wrapper
`effect-ts` · relevance: **direct** · verified

BamlClientService treats execution failures (rate limits/timeouts/network) as recoverable typed errors (BamlExecutionError, Effect.fail + retry via llmRetry), but treats schema-validation failures of the model's output as DEFECTS via Effect.die(BamlParseError). This is precisely beep's hard wall: an LLM may legitimately fail, but if its output violates the schema contract that is a bug, not a candidate. The pattern (decodeUnknown -> on ParseError, logError + die) is a ready blueprint for ingesting fallible LLM proposals without silently coercing malformed output into the graph.

- **Source:** `src/services/BamlClientService.ts:619-648`
- **beep-target:** @beep/nlp-mcp + epistemic CandidateClaim ingestion; provider drivers (Anthropic/OpenAI/xAI)

```
const parseResult = yield* Schema.decodeUnknown(outputSchema)(rawOutput).pipe(
  Effect.catchAll((parseError: ParseResult.ParseError) =>
    Effect.logError("BAML output failed schema validation").pipe(
      Effect.zipRight(
        Effect.die(new BamlParseError({ functionName: bamlFn.name || "unknown", rawOutput, parseError }))
      )
    )
  )
);
```

### 3. Centralized Effect Schedule retry-policy library
`effect-ts` · relevance: **direct** · verified

A single module defining named retry schedules (llmRetry=2 retries/500ms exp factor 2.0, networkRetry=5 retries/200ms exp, plus quickRetry/databaseRetry/noRetry per file) each documented with cost/idempotency rationale. Directly reusable for beep's fallible boundaries: LLM calls (llmRetry), API drivers like CourtListener/USPTO (networkRetry), and PGlite transactions (databaseRetry). Drop-in once ported to Effect v4 Schedule.

- **Source:** `src/infrastructure/retry-policies.ts:78-113`
- **beep-target:** foundation infra shared across all @beep drivers and @beep/nlp-mcp

```
export const llmRetry = Schedule.exponential(Duration.millis(500), 2.0).pipe(
  Schedule.compose(Schedule.recurs(2)) // Only 2 retries for expensive operations
);
...
export const networkRetry = Schedule.exponential(Duration.millis(200), 2.0).pipe(
  Schedule.compose(Schedule.recurs(5)));
```

### 4. Tool registry + schema-validated dispatch router
`mcp-design` · relevance: **direct** · verified

ToolRouterService dispatches by name through a reusable withInputValidation(schema, toolName) combinator that decodes input via parseSchema and maps ParseError -> ToolValidationError (with TreeFormatter-formatted issues). A clean blueprint for an MCP server's per-tool input validation; the file also carries a ToolMetadata/registry with requiresAuth/category gating. Directly applicable to @beep/nlp-mcp tool registration/validation.

- **Source:** `src/services/ToolRouterService.ts:202-218`
- **beep-target:** @beep/nlp-mcp tool registration/validation; agents Skill/Tool registry

```
function withInputValidation<A, I = any, R = never>(schema: Schema.Schema<A, I, R>, toolName: string) {
  return (input: unknown): Effect.Effect<A, ToolValidationError, R> => {
    return parseSchema(schema)(input).pipe(
      Effect.mapError((parseError) =>
        new ToolValidationError({ toolName, input, issues: [ParseResult.TreeFormatter.formatErrorSync(parseError)] }))
    );
  };
}
```

### 5. Lazy provider selection via Layer.unwrapEffect (multi-provider adapter)
`effect-ts` · relevance: **direct** · verified

WebSearchServiceLive reads ConfigService at layer-build time and constructs ONLY the selected provider's layer (brave/exa/...) via Layer.unwrapEffect, using Layer.effect(WebSearchService, ProviderTag) as an adapter to map a provider-specific tag onto a provider-agnostic interface, with Layer.die for unimplemented providers (tavily/perplexity). This is the exact pattern beep needs to swap Anthropic/OpenAI/xAI LLM providers or CourtListener/USPTO data sources behind one tag without initializing unused providers.

- **Source:** `src/services/WebSearchService.ts:119-145`
- **beep-target:** multi-provider LLM driver layer + swappable data-ingestion drivers

```
export const WebSearchServiceLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const config = yield* ConfigService;
    switch (config.searchProvider) {
      case "brave":
        return Layer.effect(WebSearchService, BraveSearchService).pipe(
          Layer.provide(BraveSearchServiceLive));
      case "exa":
        return Layer.effect(WebSearchService, ExaSearchService).pipe(
          Layer.provide(ExaSearchServiceLive));
```

### 6. Session lifecycle as an explicit, validated state machine
`governance-ops` · relevance: **direct** · verified

Session status transitions are a validTransitions table (initializing->planning->executing->synthesizing->completed|failed, with completed/failed terminal), plus canTransitionTo/getValidNextStates guards, enforced by SessionManagerService on illegal transitions. Directly transferable to beep's ClaimLifecycle / candidate->approved human-gate state machine where only valid transitions (proposed -> reviewed -> approved/rejected) may persist.

- **Source:** `src/domain/models/session.ts:65-91`
- **beep-target:** epistemic ClaimLifecycle state machine + ClaimGate

```
export const validTransitions: Record<SessionStatus, ReadonlyArray<SessionStatus>> = {
  initializing: ["planning", "failed"],
  planning: ["executing", "failed"],
  executing: ["synthesizing", "failed"],
  synthesizing: ["completed", "failed"],
  completed: [],
  failed: [],
};
export const canTransitionTo = (current, next) => validTransitions[current].includes(next);
```

### 7. Domain error taxonomy with retryable/defect classification helpers
`effect-ts` · relevance: **direct** · verified

errors.ts defines tagged error classes grouped (BAML, orchestration, tool, session, content-validation) with isRetryableError/isDefect/getErrorMessage helpers. The deliberate split — BamlExecutionError (retryable failure) vs BamlParseError (defect), and SubagentExecutionError.canRetry — is a model for beep's typed-error channel separating recoverable retrieval errors from contract-violation defects. Reusable structure and naming conventions.

- **Source:** `src/domain/errors.ts:341-361`
- **beep-target:** foundation typed-error conventions across all slices

```
export const isRetryableError = (error: unknown): error is BamlExecutionError | SubagentExecutionError => {
  if (error instanceof BamlExecutionError) return true;
  if (error instanceof SubagentExecutionError && error.canRetry) return true;
  return false;
};
export const isDefect = (error: unknown): error is BamlParseError => {
  return error instanceof BamlParseError;
};
```

### 8. Source quality / authority evidence schema
`provenance-evidence` · relevance: **adjacent** · verified

The BAML Source class models each retrieved source with quality_score (1-10), source_type, recency enum, authority_level (high|medium|low), is_primary_source bool, potential_issues, and found_by_agent provenance — paired with SourceQualityValidation (issues/recommendations/reliability_indicators). A candidate-evidence model: beep can adapt it for grading PriorArtReference / cited authorities, tracking which agent/extractor proposed a source, and feeding the candidate->approved gate. Primary-source preference maps to legal authority weighting.

- **Source:** `baml_src/types.baml:100-117`
- **beep-target:** epistemic Evidence + law-practice PriorArtReference authority scoring

```
class Source {
  title string
  url string
  quality_score int @description("Quality rating from 1-10")
  source_type string
  recency "current" | "recent" | "dated" | "outdated"
  authority_level "high" | "medium" | "low"
  is_primary_source bool
  potential_issues string[]
  found_by_agent string @description("Which agent discovered this source")
}
```

### 9. Source-authority inference from URL (primary-source taxonomy)
`data-ingestion` · relevance: **adjacent** · adjusted

inferSourceType + isPrimarySource heuristics (.gov/.edu/arxiv.org/sec.gov => primary/government/academic; github/wikipedia classifications) tag source authority. A small but directly reusable classification taxonomy for beep when ranking citations/prior-art: government and court domains (.gov, courtlistener, uspto) should be weighted as primary authority. Worth extending with legal-specific domains. NOTE: re-tagged from ip-domain-models to data-ingestion — this is generic source/domain classification, not intellectual-property modeling.

- **Source:** `src/services/MultiAgentOrchestratorService.ts:962-981`
- **beep-target:** data-ingestion driver source-classification + citation authority ranking

```
function inferSourceType(url: string): string {
  if (url.includes("github.com")) return "code_repository";
  if (url.includes("arxiv.org")) return "academic";
  if (url.includes(".edu")) return "academic";
  if (url.includes(".gov")) return "government";
  if (url.includes("wikipedia.org")) return "encyclopedia";
  return "web_article";
}
function isPrimarySource(url: string): boolean {
  return url.includes(".gov") || url.includes(".edu") || url.includes("arxiv.org") || url.includes("sec.gov");
}
```

### 10. Agent-memory compression / snapshot / restore prompt suite
`agent-memory` · relevance: **direct** · adjusted

memory_manager.baml is a context-management toolkit: UtilitySaveResearchContext creates a compressed MemorySnapshot (query, strategy, key findings, remaining tasks, constraints, completion percentage) when context nears the 200,000-token limit; UtilityRestoreFromMemorySnapshot resumes from a snapshot. A ready design for beep's agent-memory layer: progressive context reduction, snapshot persistence, and recovery for long-running matters. NOTE: companion function is named UtilityRestoreFromMemorySnapshot (not UtilityRestoreFromSnapshot); other prune/budget function names in the original description were not all confirmed at this range.

- **Source:** `baml_src/agents/memory_manager.baml:437-485`
- **beep-target:** agents memory / Thread context-reduction + progressive disclosure

```
function UtilitySaveResearchContext(strategy: ResearchStrategy, findings: AgentFinding[], context_size_tokens: int, current_query: string) -> MemorySnapshot {
  client CustomGPT5Mini
  prompt #"
The research context is approaching the 200,000 token limit. Create a compressed memory snapshot to preserve critical research state for session continuity.
... 3. **Enable Recovery:**
   - Provide sufficient context for research resumption
   - Include completion percentage estimate
```

### 11. Bounded-concurrency subagent execution with graceful degradation
`effect-ts` · relevance: **direct** · verified

executeSubagentsParallel runs tasks via Effect.forEach with { concurrency: maxConcurrency }, and executeSubagentWithRecovery wraps each agent so a failure is caught and converted into a status:'failed' AgentFinding rather than aborting the batch (counts success/failure after). The structured-concurrency + partial-failure pattern beep needs for fanning out NLP extraction across many spans/documents without one bad doc killing the run.

- **Source:** `src/services/MultiAgentOrchestratorService.ts:738-751`
- **beep-target:** @beep/nlp-mcp batch extraction workflow + agents orchestration

```
const findings = yield* Effect.forEach(
  tasks,
  (task, index) =>
    executeSubagentWithRecovery(baml, sessionManager, sessionId, task, availableTools, currentDate, index + 1),
  { concurrency: maxConcurrency }
);
```

### 12. HAR/API tool-call audit extractor
`governance-ops` · relevance: **adjacent** · verified

har-parser.effect.ts matches Claude/Anthropic API endpoints via CLAUDE_API_PATTERNS (claude.ai/api, anthropic.com/api, /v1/messages, /chat/completions) and extracts Claude API requests from HAR network captures. Useful to beep for audit/observability: reconstructing what LLM/tool calls ran, replaying agent traces, and building a tamper-evident record of retrieval activity behind the ethical wall.

- **Source:** `src/validation/parsers/har-parser.effect.ts:97-113`
- **beep-target:** agent activity audit / provenance trace replay

```
const CLAUDE_API_PATTERNS = [
  /claude\.ai\/api/,
  /anthropic\.com\/api/,
  /\/v1\/messages/,
  /\/chat\/completions/,
];
function isClaudeApiRequest(url: string): boolean {
  return CLAUDE_API_PATTERNS.some((pattern) => pattern.test(url));
}
```

### 13. Research-need decision gate with clarification path
`governance-ops` · relevance: **adjacent** · verified

The ResearchDecision / ResearchAction / ClarificationRequest BAML schemas model a gate before expensive work: needs_research bool + reasoning, requires_clarification + suggested_clarifications, estimated_complexity enum, and a ResearchAction enum (ask_clarifications | launch_research | simple_response). Maps to beep's candidate->approved human gate and to a 'should this even enter the pipeline?' triage before extraction/reasoning runs.

- **Source:** `baml_src/types.baml:137-163`
- **beep-target:** epistemic ClaimGate / human triage gate before retrieval pipeline

```
class ResearchDecision {
  needs_research bool @description("Whether the query requires the full research system")
  reasoning string
  suggested_clarifications string[]
  estimated_complexity "straightforward" | "breadth_first" | "depth_first" | "high_complexity"
  requires_clarification bool @description("Whether to ask clarifying questions before proceeding")
}
```

### 14. Validation results with source-span metadata + non-blocking warnings
`provenance-evidence` · relevance: **adjacent** · verified

validateToolInputEffect validates each tool call against its domain schema and accepts optional provenance metadata (sourceFile, lineNumber, timestamp, agentName) for the ValidationResult; the Effect never fails (errors captured in result). The split of hard errors vs soft warnings, with line-level source provenance on every validated record, mirrors beep's need to attach character/line spans and SHACL-style severity (Violation vs Warning) to candidate claims.

- **Source:** `src/validation/validators/tool-validator.effect.ts:36-45`
- **beep-target:** @beep/semantic-web SHACL severity reporting + epistemic GroundedExtraction.span metadata

```
export const validateToolInputEffect = (
  toolName: string,
  toolInput: unknown,
  metadata?: { sourceFile?: string; lineNumber?: number; timestamp?: string; agentName?: string; }
): Effect.Effect<ValidationResult, never> =>
```

### 15. BAML multi-provider client config with round-robin and fallback
`mcp-design` · relevance: **serendipitous** · verified

clients.baml declaratively defines LLM clients across providers (OpenAI, Anthropic haiku/sonnet) with per-client retry_policy, plus composite clients: CustomFast (round-robin alternating CustomGPT5Mini/CustomHaiku) and OpenaiFallback (fallback strategy trying clients in order). Even though beep uses Effect rather than BAML, a concise reference for provider abstraction, retry policy attachment, and resilient fallback/load-balancing across Anthropic/OpenAI/xAI providers.

- **Source:** `baml_src/clients.baml:38-54`
- **beep-target:** multi-provider LLM driver fallback/round-robin layer

```
client<llm> CustomFast {
  provider round-robin
  options { strategy [CustomGPT5Mini, CustomHaiku] }
}
client<llm> OpenaiFallback {
  provider fallback
  options { strategy [CustomGPT5Mini, CustomGPT5Mini] }
}
```
