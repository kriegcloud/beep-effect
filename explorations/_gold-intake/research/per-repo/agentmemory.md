# agentmemory  `[T1]`

- **Purpose:** Persistent, hybrid-search + knowledge-graph memory engine for AI coding agents, exposed over MCP and built on the iii-sdk worker/KV engine.
- **Stack:** TypeScript (Node >=20, ESM), iii-sdk engine, Zod v4 schemas, multi-provider LLM SDKs (@anthropic-ai/sdk + agent-sdk, OpenAI/OpenRouter/Gemini/Minimax), optional @xenova/transformers + onnxruntime for local embeddings, vitest, tsdown.
- **Size / shape:** ~39k LOC TS across ~150 source files in src/ (functions/, state/, providers/, mcp/, eval/); kind: MCP server + memory engine library + CLI, plus benchmark/eval harnesses and a web viewer.
- **License:** Apache-2.0
- **Maturity:** Active. Last commit 2026-06-28; npm version 0.9.27; 80+ versioned export schema entries indicate frequent releases.

**Notes:** Plain TypeScript + Zod + a bespoke engine (iii-sdk), NOT Effect/effect-Schema, so DI/Layer patterns do not transfer directly; the value is in the data models, GraphRAG/retrieval algorithms, memory-tier + confidence-decay design, multi-provider resiliency, and MCP server ergonomics. Extraction is XML-tag-based, not span-grounded like beep's @beep/langextract, so reuse the prompt/parser shape but not the grounding mechanism.

## Web enrichment
- **Status:** All core stack dependencies for agentmemory are current and actively maintained as of mid-2026: FastMCP (TS, punkpeye/fastmcp) tracks MCP spec 2025-06-18 and uses Standard Schema (Zod/ArkType/Valibot) for tool params; BAML (BoundaryML) is actively developed with Tier-1 TS support and its Schema-Aligned Parsing remains the canonical alternative to regex-parsed XML extraction; FalkorDB + GraphRAG-SDK + TrustGraph are an active GraphRAG stack (FalkorDB v4.6+, temporal-graph features on the 2026 roadmap), matching the repo's FalkorDB-projection target. The main external-data caution is unrelated to the running engine but relevant to the broader patents/legal beep targets: the USPTO PatentsView/PatentSearch API ecosystem is mid-migration to the Open Data Portal (data.uspto.gov) with confirmed decommissions (see deprecations). eyecite (Free Law Project) is current (active, v2.7.x line) and remains the canonical citation parser for the legal-NLP nuggets. No deprecations affect agentmemory's own iii-sdk/Node/Zod/MCP runtime.</statusNotes>
<parameter name="deprecations">["USPTO PatentsView Legacy API (api.patentsview.org) fully decommissioned: requests return HTTP 410 Gone as of May 1, 2025. Use the newer PatentSearch API instead.","PatentsView migrated to the USPTO Open Data Portal (data.uspto.gov) on March 20, 2026; the legacy PatentsView Developer Hub was decommissioned June 5, 2026. PatentSearch-equivalent API functions are being reintroduced on ODP but as of mid-2026 have NO published launch date — any patents beep target must treat ODP API availability as in-flux and code defensively.","Confirm/prefer USPTO ODP over PatentsView for new patent-data integrations; do not build new code against legacy PatentsView endpoints.","MCP transport: prefer Streamable HTTP (spec 2025-03-26 / 2025-06-18) over deprecated HTTP+SSE transport for any new/standalone MCP server work."]
- **Upstream docs:**
  - https://github.com/punkpeye/fastmcp — FastMCP (TS) canonical repo: Standard Schema tool params, MCP 2025-06-18 annotations, OAuth, Streamable HTTP transport.
  - https://data.uspto.gov/support/transition-guide/patentsview — USPTO Open Data Portal PatentsView transition guide — authoritative source for ODP migration and legacy decommission timeline.
  - https://docs.boundaryml.com/ — BAML docs: Schema-Aligned Parsing for reliable structured LLM output, TS Tier-1 codegen (replaces regex/XML parsing).
  - https://github.com/FalkorDB/GraphRAG-SDK — FalkorDB GraphRAG-SDK: ontology management + GraphRAG retrieval, the canonical reference for the graph-projection target.
  - https://www.falkordb.com/news-updates/trustgraph-autonomous-knowledge-extraction/ — TrustGraph + FalkorDB agentic knowledge extraction with provenance/relationship preservation.
  - https://github.com/freelawproject/eyecite — eyecite (Free Law Project) — active canonical legal-citation parser (extract/aggregate/annotate/clean), v2.7.x.
  - https://learn.microsoft.com/en-us/azure/search/hybrid-search-ranking — Azure AI Search RRF hybrid-scoring reference (k=60 default, rank-only fusion) for validating the retrieval-fusion nugget.
- **Corrections:**
  - *Triple-stream hybrid retrieval (BM25 + vector + graph) fused via Reciprocal Rank Fusion*: Validate the RRF constant: k=60 is the empirically-established default (Cormack et al. 2009, TREC), with k in [40,80] performing comparably; lower k (20-40) weights top ranks more, higher k favors cross-list consensus. RRF intentionally ignores raw scores and fuses on rank only, which is the correct choice for fusing heterogeneous BM25/vector/graph signals with incomparable score scales. If one stream (e.g. graph) is less reliable, a higher k is the safer choice. Confirm the repo's k matches this and is not score-normalizing across streams.
  - *XML-schema LLM extraction prompt + regex parser for entities/relations with temporal + context metadata*: The regex-over-XML extraction parser is brittle vs. current best practice. For the @beep/langextract target, prefer BAML's Schema-Aligned Parsing (BoundaryML) or a Standard-Schema/Zod structured-output path: BAML compiles type-safe TS clients and reliably coerces non-conformant LLM output without native function-calling, eliminating fragile regex parsing of malformed XML.
  - *Typed MCP tool registry with progressive-disclosure descriptions and self-documenting scoping rules*: Align tool metadata to MCP spec 2025-03-26+ tool annotations (title, readOnlyHint, openWorldHint) which formalize the 'self-documenting scoping' intent; FastMCP (TS) exposes these natively. Progressive-disclosure descriptions are a useful convention but should be layered on top of standard annotation fields rather than replacing them.
  - *Standalone MCP server with proxy-or-degraded-fallback and conditional tool exposure*: For the beep MCP-server target, note FastMCP (TS) supports MCP spec 2025-06-18 incl. OAuth discovery endpoints and Streamable HTTP; build conditional tool registration on the official annotation/transport conventions and avoid the deprecated SSE-only transport for proxy/degraded-mode servers.
  - *Scale-driven graph index design: name-index, edge-key, and node-degree side indexes to avoid O(n) scans*: The FalkorDB-projection target is sound: FalkorDB uses sparse-matrix adjacency + linear-algebra (GraphBLAS/AVX) so degree and edge-key access is efficient; pair with GraphRAG-SDK ontology management and note FalkorDB's roadmap adds temporal graphs (2026), relevant to the bitemporal-edges nugget.
  - *Bitemporal, versioned knowledge-graph edges with provenance and never-overwrite semantics*: Cross-check against FalkorDB/GraphRAG-SDK temporal-graph and TrustGraph provenance-preserving extraction (active 2026 roadmap) rather than treating bitemporal versioning as bespoke; consider PROV-O alignment for the @beep/provenance target to make the provenance model interoperable.

## Gold nuggets (13)

### 1. Triple-stream hybrid retrieval (BM25 + vector + graph) fused via Reciprocal Rank Fusion
`kg-ontology-reasoning` · relevance: **direct** · verified

GraphRAG-style retrieval that runs BM25, vector ANN, and entity-graph expansion in parallel, fuses them with RRF (1/(k+rank)) using renormalized weights when a stream is empty, then diversifies by session and optionally reranks. Directly reusable as the projection-side retrieval layer over beep's FalkorDB graph + PGlite, and the graceful weight renormalization when vector/graph are absent is exactly what a local-first workbench needs.

- **Source:** `src/state/hybrid-search.ts:194-219`
- **beep-target:** @beep/semantic-web / FalkorDB-projection GraphRAG retrieval over the authoritative graph

```
const hasVector = vectorResults.length > 0;
const hasGraph = graphResults.length > 0;
let effectiveBm25W = this.bm25Weight;
let effectiveVectorW = hasVector ? this.vectorWeight : 0;
let effectiveGraphW = hasGraph ? this.graphWeight : 0;
const totalW = effectiveBm25W + effectiveVectorW + effectiveGraphW;
if (totalW > 0) { effectiveBm25W /= totalW; effectiveVectorW /= totalW; effectiveGraphW /= totalW; }
combinedScore:
  effectiveBm25W * (1 / (RRF_K + s.bm25Rank)) +
  effectiveVectorW * (1 / (RRF_K + s.vectorRank)) +
  effectiveGraphW * (1 / (RRF_K + s.graphRank)),
```

### 2. Bitemporal, versioned knowledge-graph edges with provenance and never-overwrite semantics
`provenance-evidence` · relevance: **direct** · verified

GraphEdge carries tvalid/tvalidEnd (real-world validity), version/supersededBy/isLatest (assertion history), sourceObservationIds (provenance), and an EdgeContext (reasoning, sentiment, alternatives, confidence). The extraction prompt mandates 'NEVER overwrite existing relationships — always create new versioned edges'. This is a near-perfect template for beep's temporal/provenance-grounded facts: every edge knows when it was true, where it came from, and what it superseded.

- **Source:** `src/types.ts:411-435`
- **beep-target:** @beep/provenance + epistemic ClaimLifecycle; temporal fact edges in the authoritative graph

```
export interface GraphEdge {
  id: string; type: GraphEdgeType;
  sourceNodeId: string; targetNodeId: string;
  weight: number;
  sourceObservationIds: string[];
  createdAt: string;
  tcommit?: string; tvalid?: string; tvalidEnd?: string;
  context?: EdgeContext;
  version?: number; supersededBy?: string; isLatest?: boolean;
  stale?: boolean;
}
```

### 3. XML-schema LLM extraction prompt + regex parser for entities/relations with temporal + context metadata
`legal-nlp` · relevance: **adjacent** · verified

A temporal knowledge-extraction system prompt forces the model to emit a strict <temporal_graph> XML with typed entities, typed relationships, validity dates, reasoning, sentiment and alternatives; a companion regex parser (parseTemporalGraphXml) turns it into GraphNode/GraphEdge. The prompt rules weight relationships 1.0 explicit / 0.5 inferred / 0.1 speculative. Reusable as a CANDIDATE-claim extraction prompt template for @beep/langextract — but note beep wants exact character-span grounding, which this XML scheme does not provide.

- **Source:** `src/functions/temporal-graph.ts:14-46`
- **beep-target:** @beep/langextract candidate-claim extraction prompt + parser (span grounding must be added)

```
const TEMPORAL_EXTRACTION_SYSTEM = `You are a temporal knowledge extraction engine...
<relationship type="..." source="entity name" target="entity name" weight="0.1-1.0"
  valid_from="ISO date or 'unknown'" valid_to="ISO date or 'current'">
  <reasoning>WHY this relationship exists</reasoning>
  <sentiment>positive|negative|neutral</sentiment>
Rules:
- NEVER overwrite existing relationships — always create new versioned edges
- Weight relationships by directness: 1.0 = explicit statement, 0.5 = inferred, 0.1 = speculative`;
```

### 4. Multi-provider LLM abstraction with resilient wrapper, fallback chain, and per-provider default models
`mcp-design` · relevance: **direct** · adjusted

createProvider/createFallbackProvider build a MemoryProvider behind a ResilientProvider (circuit breaker) and a FallbackChainProvider. defaultModelFor resolves each provider's OWN env-driven default model so a fallback never inherits the primary's incompatible model name (a documented #778 bug that 404'd every call and tripped the breaker). Gemini reuses the OpenAI-compatible OpenRouterProvider class but is pointed at Google's generativelanguage /openai endpoint. Directly informs beep's Anthropic/OpenAI/xAI driver layer and its auth/fallback strategy.

- **Source:** `src/providers/index.ts:35-93`
- **beep-target:** beep LLM driver layer (Anthropic/OpenAI/xAI) provider selection + fallback/circuit-breaker

```
function defaultModelFor(providerType: ProviderConfig["provider"]): string {
  switch (providerType) {
    case "anthropic": return getEnvVar("ANTHROPIC_MODEL") || "claude-sonnet-4-20250514";
    case "openrouter": return getEnvVar("OPENROUTER_MODEL") || "anthropic/claude-sonnet-4-20250514";
...
if (providers.length > 1) {
  return new ResilientProvider(new FallbackChainProvider(providers));
}
```

### 5. Memory retention scoring: salience x exponential temporal decay + reinforcement boost, with hot/warm/cold/evictable tiers
`agent-memory` · relevance: **direct** · adjusted

computeRetention combines type-weighted salience, exp(-lambda*days) decay, and a reinforcement boost summed over recent access timestamps (1/daysSinceAccess * sigma), clamped to [0,1]; tier thresholds classify memories and a separate evict pass deletes below-threshold rows with dryRun + audit. This is a ready-made forgetting/aging model for @beep agents memory and for prioritizing which candidate claims stay 'hot' in working context.

- **Source:** `src/functions/retention.ts:81-95`
- **beep-target:** @beep agents memory retention/decay + working-set prioritization

```
function computeRetention(salience, createdAt, accessTimestamps, config): number {
  const deltaT = (Date.now() - new Date(createdAt).getTime()) / (1000*60*60*24);
  const temporalDecay = Math.exp(-config.lambda * deltaT);
  const reinforcementBoost = computeReinforcementBoost(accessTimestamps, config.sigma);
  return Math.min(1, salience * temporalDecay + reinforcementBoost);
}
```

### 6. Four-tier memory model (working/episodic/semantic/procedural) with confidence + provenance per fact
`agent-memory` · relevance: **direct** · verified

ConsolidationTier plus SemanticMemory (fact + confidence + sourceSessionIds/sourceMemoryIds + accessCount + strength) and ProceduralMemory (steps + triggerCondition + expectedOutcome + provenance) give a layered memory schema where every consolidated fact carries confidence and source links. Maps cleanly onto beep's candidate->approved progression and provenance-carrying claims; the semantic-tier 'fact + confidence + sources' shape is essentially a CandidateClaim/Evidence record.

- **Source:** `src/types.ts:494-527`
- **beep-target:** epistemic CandidateClaim/Evidence + @beep agents memory tiering

```
export type ConsolidationTier = "working" | "episodic" | "semantic" | "procedural";
export interface SemanticMemory {
  id: string; fact: string; confidence: number;
  sourceSessionIds: string[]; sourceMemoryIds: string[];
  accessCount: number; lastAccessedAt: string;
  strength: number; createdAt: string; updatedAt: string;
}
```

### 7. Heuristic confidence scoring for typed memory relations (supersedes/contradicts/extends/derives/related)
`agent-memory` · relevance: **adjacent** · verified

computeConfidence derives a [0,1] confidence for a relation between two memories from shared sessions, recency of both endpoints, and relation type (supersedes +0.1, contradicts -0.05). Combined with MemoryRelation's typed edge vocabulary, this is a lightweight, explainable claim-lifecycle/contradiction signal beep can adapt for ranking candidate claims and flagging conflicting assertions before the human gate.

- **Source:** `src/functions/relations.ts:10-37`
- **beep-target:** epistemic ClaimLifecycle confidence + contradiction detection feeding the human gate

```
function computeConfidence(source, target, relationType): number {
  let score = 0.5;
  const sharedSessions = source.sessionIds.filter(sid => target.sessionIds.includes(sid));
  score += Math.min(sharedSessions.length * 0.1, 0.3);
...
  if (relationType === "supersedes") score += 0.1;
  if (relationType === "contradicts") score -= 0.05;
  return Math.max(0, Math.min(1, score));
}
```

### 8. Typed MCP tool registry with progressive-disclosure descriptions and self-documenting scoping rules
`mcp-design` · relevance: **direct** · adjusted

CORE_TOOLS is a flat McpToolDef[] (name/description/JSON-Schema inputSchema) where descriptions teach the model WHEN to call the tool (e.g. memory_recall: 'Use when you need to recall what happened in previous sessions'). A clean framework-free reference for how to author @beep/nlp-mcp's NLP tools without FastMCP lock-in.

- **Source:** `src/mcp/tools-registry.ts:1-38`
- **beep-target:** @beep/nlp-mcp tool definitions + progressive-disclosure tool descriptions

```
export type McpToolDef = {
  name: string;
  description: string;
  inputSchema: { type: "object"; properties: Record<string,{type:string;description:string}>; required?: string[] };
};
export const CORE_TOOLS: McpToolDef[] = [
  { name: "memory_recall", description: "Search past session observations for relevant context. Use when you need to recall what happened in previous sessions...", ... } ]
```

### 9. Standalone MCP server with proxy-or-degraded-fallback and conditional tool exposure
`mcp-design` · relevance: **direct** · verified

The stdio MCP server proxies to a full local engine when AGENTMEMORY_URL is reachable, otherwise runs a REDUCED local fallback exposing only an IMPLEMENTED_TOOLS subset and announces 'running reduced LOCAL FALLBACK with N of M tools'. This conditional-registration + graceful-degradation pattern is directly applicable to beep's MCP-everywhere design where some tools require the heavy reasoning/PGlite backend and others can run thin.

- **Source:** `src/mcp/standalone.ts:16-58`
- **beep-target:** beep MCP servers: conditional tool registration + proxy/degraded-mode design

```
const IMPLEMENTED_TOOLS = new Set([
  "memory_save", "memory_recall", "memory_smart_search",
  "memory_sessions", "memory_export", "memory_audit", "memory_governance_delete",
]);
...
process.stderr.write(`[@agentmemory/mcp] no server reachable at ${displayAgentmemoryUrl()}; running reduced LOCAL FALLBACK with ${IMPLEMENTED_TOOLS.size} of ${fullToolCount} tools...`);
```

### 10. Governance delete/bulk-delete with dry-run, filter predicates, batched deletes, and append-only audit trail
`governance-ops` · relevance: **direct** · verified

mem::governance-bulk requires at least one filter for non-dryRun, supports type/date/quality filters, deletes in 50-item batches (BATCH_SIZE) and reports dryRun previews (wouldDelete + ids). Directly transferable to beep's governance/approval-gate layer: previewable, filter-gated bulk mutations plus an audit trail are exactly what an attorney-facing workbench needs.

- **Source:** `src/functions/governance.ts:54-104`
- **beep-target:** beep governance/approval-gate + audit log over the authoritative graph

```
const hasFilter = (data.type && data.type.length > 0) || data.dateFrom || data.dateTo || data.qualityBelow !== undefined;
if (!hasFilter && !data.dryRun) return { success: false, error: "At least one filter is required for non-dryRun bulk delete" };
...
if (data.dryRun) return { success: true, dryRun: true, wouldDelete: candidates.length, ids: candidates.map(m => m.id) };
```

### 11. Secret/PII redaction pass for ethical-wall enforcement (private tags + provider key regexes)
`governance-ops` · relevance: **adjacent** · verified

stripPrivateData strips <private>...</private> blocks (-> [REDACTED]) and a curated battery of credential regexes (OpenAI sk-/sk-proj-, Anthropic sk-ant-, GitHub ghp_/github_pat_, AWS AKIA, Google AIza, JWTs, Slack xoxb, npm/gitlab/DO tokens) replacing matches with [REDACTED_SECRET]. Useful for beep's ethical-wall/confidentiality layer: scrub privileged or secret content out of any text crossing into shared/projected stores or LLM prompts.

- **Source:** `src/functions/privacy.ts:3-29`
- **beep-target:** beep ethical-wall / confidentiality redaction before persistence or LLM submission

```
const PRIVATE_TAG_RE = /<private>[\s\S]*?<\/private>/gi;
const SECRET_PATTERN_SOURCES = [
  /sk-ant-[A-Za-z0-9\-_]{20,}/g,
  /gh[pus]_[A-Za-z0-9]{36,}/g,
  /AKIA[0-9A-Z]{16}/g,
  /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, ... ];
export function stripPrivateData(input: string): string { ... }
```

### 12. Scale-driven graph index design: name-index, edge-key, and node-degree side indexes to avoid O(n) scans
`kg-ontology-reasoning` · relevance: **serendipitous** · adjusted

Rather than enumerate a 75K+ node KV scope (which blocks the worker event loop and times out), the schema maintains targeted lookup indexes: graphNameIndex (`type|name` -> nodeId) for dedup, graphEdgeKey (`src|tgt|type` -> edgeId) for edge dedup, graphNodeDegree (nodeId -> incident count) for top-N ranking, plus a precomputed graphSnapshot top-degree subgraph. A concrete blueprint for keeping beep's FalkorDB/PGlite graph projection performant locally without full re-scans.

- **Source:** `src/state/schema.ts:24-39`
- **beep-target:** FalkorDB/PGlite graph projection: dedup + degree indexes for local-first scale

```
graphSnapshot: "mem:graph:snapshot",
// targeted-lookup indexes so graph-extract never enumerates the full scope
graphNameIndex: "mem:graph:name-index",   // `${type}|${name}` -> nodeId
graphEdgeKey: "mem:graph:edge-key",       // `${src}|${tgt}|${type}` -> edgeId
graphNodeDegree: "mem:graph:node-degree", // nodeId -> incident-edge count
```

### 13. Boundary validation gate returning structured EvalResult instead of throwing
`effect-ts` · relevance: **adjacent** · verified

validateInput/validateOutput wrap a Zod schema and return a discriminated {valid:true,data} | {valid:false,result} where the failure path carries field-path-prefixed error strings and a qualityScore. This 'validate at the boundary, return typed errors' pattern mirrors what beep wants from effect/Schema decode boundaries on the retrieval->logic wall; worth porting to Effect's Schema.decodeEither so candidate payloads are rejected with structured, surfaceable errors.

- **Source:** `src/eval/validator.ts:4-23`
- **beep-target:** effect/Schema decode boundary on the retrieval->logic wall (typed candidate rejection)

```
export function validateInput<T>(schema, data, functionId):
  | { valid: true; data: T }
  | { valid: false; result: EvalResult } {
  const parsed = schema.safeParse(data);
  if (parsed.success) return { valid: true, data: parsed.data };
  return { valid: false, result: { valid: false,
    errors: parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`),
    qualityScore: 0, latencyMs: 0, functionId } };
}
```
