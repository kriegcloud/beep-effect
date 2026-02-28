# Handoff P2: KnowledgeGraphToolkit + Graphiti Service

## Context Budget

| Memory Type | Budget | Estimated | Status |
|-------------|--------|-----------|--------|
| Working | 2,000 | ~1,800 | OK |
| Episodic | 1,000 | ~600 | OK |
| Semantic | 500 | ~450 | OK |
| Procedural | Links | Links | OK |

## Working Memory (Current Phase)

### Phase 2 Goal
Define the `KnowledgeGraphToolkit` with Effect v4 Schema-typed tools and the `GraphitiService` Effect service that calls the Railway FalkorDB. The toolkit will be consumed by the chat route in P3.

### Deliverables
1. `apps/web/src/lib/effect/tools.ts` — Tool definitions (SearchGraph, GetNode, GetFacts)
2. `apps/web/src/lib/effect/tool-handlers.ts` — Handler implementations calling Graphiti API
3. `apps/web/src/lib/graphiti/client.ts` — Graphiti API client wrapped as Effect service
4. `apps/web/src/lib/effect/mappers.ts` — Graphiti EntityNode/Edge -> react-force-graph-2d Node/Link
5. `apps/web/src/lib/effect/runtime.ts` — Shared Effect layers (OpenAI, Graphiti, toolkit)
6. Tests for toolkit execution and Graphiti service

### Success Criteria
- [ ] `SearchGraph` tool: takes `{ query, scope, limit }`, returns `{ nodes, links }`
- [ ] `GetNode` tool: takes `{ nodeId }`, returns node details + neighbors
- [ ] `GetFacts` tool: takes `{ query, maxFacts }`, returns facts/relationships
- [ ] All tool parameters and success types defined with Effect v4 Schema (with annotations)
- [ ] Graphiti client wrapped as Effect service (`GraphitiService`)
- [ ] Toolkit layer is reusable (will be consumed by P3 chat route)
- [ ] Tests pass for toolkit execution and Graphiti service

### Implementation Notes

**Tool definitions (Effect v4 AI pattern):**
```ts
import { Tool, Toolkit } from "effect/unstable/ai"
import * as S from "effect/Schema"

const SearchGraph = Tool.make("SearchGraph", {
  description: "Search the Effect v4 knowledge graph for entities and relationships",
  parameters: S.Struct({
    query: S.NonEmptyString,
    scope: S.optionalKey(S.Literals(["nodes", "edges", "both"])).pipe(S.withDecodingDefault(() => "both")),
    limit: S.optionalKey(S.Int.check(S.isGreaterThanOrEqualTo(1))).pipe(S.withDecodingDefault(() => 20))
  }),
  success: S.Struct({
    nodes: S.Array(GraphNodeSchema),
    links: S.Array(GraphLinkSchema)
  })
})

const KnowledgeGraphToolkit = Toolkit.make(SearchGraph, GetNode, GetFacts)
```

**Handler layer:**
```ts
const toolsLayer = KnowledgeGraphToolkit.toLayer({
  SearchGraph: Effect.fn(function* (params) {
    const graphiti = yield* GraphitiService
    const results = yield* graphiti.searchNodes(params)
    return yield* mapGraphitiResults(results)
  }),
  // ...
})
```

**Graphiti service (Effect-wrapped):**
```ts
class GraphitiService extends ServiceMap.Service<GraphitiService>("@beep/web/GraphitiService")(
  {
    searchNodes: Effect.fn(function* (params) { ... }),
    getNode: Effect.fn(function* (nodeId) { ... }),
    searchFacts: Effect.fn(function* (params) { ... })
  }
) {}
```

The `GraphitiService` makes HTTP calls to the Graphiti API via the Caddy auth proxy on Railway:
```ts
// lib/graphiti/client.ts
// Calls GRAPHITI_API_URL (https://auth-proxy-production-91fe.up.railway.app) with X-API-Key header
// Maps Graphiti MCP tool responses to typed results
// MCP endpoint: /mcp (no trailing slash — /mcp/ returns 307 redirect)
```

### Key Design Decisions
- Tools are read-only (no graph mutations from users)
- Tool.Readonly annotation on all tools
- Schema annotations with `identifier`, `title`, `description` on all schemas
- `GraphitiService` as an Effect service (not bare HTTP calls) for testability and layer composition
- Module-level singleton for `{ handler }` to avoid cold-start layer rebuild

## Episodic Memory

### From P0-P1
- Auth working with email allowlist (better-auth magic link)
- Railway FalkorDB deployed with 2,229 nodes, 9,697 edges (via SST IaC)
- Graphiti API reachable over HTTPS at `https://auth-proxy-production-91fe.up.railway.app`
- Verification queries confirmed graph quality
- All infrastructure provisioned via `op run --env-file=.env -- bunx sst deploy --stage dev`

## Semantic Memory

### Effect v4 AI Imports
```ts
import { Tool, Toolkit, McpServer, LanguageModel } from "effect/unstable/ai"
import { HttpRouter } from "effect/unstable/http"
import { OpenAiLanguageModel } from "@effect/ai-openai"
```

### Schema Annotation Rules (ALWAYS FOLLOW)
- `identifier`: `"@beep/web/path/to/SchemaName"`
- `title`: Human-readable
- `description`: Thoughtful, explains purpose
- Apply via `.annotate({ identifier, title, description })`

### Tagged Error Rules (ALWAYS FOLLOW)
- Use `S.TaggedErrorClass<MyError>("@beep/web/path/SchemaName")("MyError", { fields }, { title, description })`
- NEVER use `Data.TaggedError`

## Procedural Memory

### References
- Effect v4 AI source: `.repos/effect-smol/packages/ai/`
- Effect v4 HTTP source: `.repos/effect-smol/packages/effect/src/unstable/http/`
- MCP server tests: `.repos/effect-smol/packages/ai/ai/test/McpServer.test.ts`
- Research notes: `outputs/research.md` sections 1-2
