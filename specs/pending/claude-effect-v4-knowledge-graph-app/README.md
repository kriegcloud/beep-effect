# Effect v4 Knowledge Graph Explorer

> Deploy the existing Effect v4 knowledge graph to a self-hosted FalkorDB VPS and build a production-ready Next.js app with an interactive graph visualization and AI-powered chat interface — all implemented with Effect v4's AI, HTTP, and atom packages.

## Quick Navigation

- [Reflection Log](./REFLECTION_LOG.md) - Cumulative learnings
- [Research Notes](./outputs/research.md) - Source-backed research findings

## Purpose

**Problem:** The Effect v4 knowledge graph exists locally in a FalkorDB/Graphiti Docker setup — useful for developer tooling but invisible to the broader community. People in the Effect Discord and on Twitter frequently ask v4 questions that the graph already answers correctly (preventing hallucination of v3 patterns). There's no way for the community to benefit from this knowledge.

**Solution:** Deploy FalkorDB to a VPS (porting the existing 70MB RDB dump directly), build a Next.js app that lets authenticated users chat with the graph via OpenAI + Effect v4 AI tools, explore it visually with react-force-graph-2d. Access is gated by magic link authentication with an email allowlist.

**Why it matters:** This is a proof-of-concept for Effect v4's full-stack capabilities — AI toolkit, HTTP server, atom-based reactive state, Schema-driven contracts — while simultaneously providing the Effect community with a grounded, hallucination-free knowledge assistant for v4 migration.

## Target Audience

Private beta users invited from the Effect Discord and Twitter. Access controlled by operator-managed email allowlist via better-auth magic links. No multi-tenant, no per-user graph partitioning.

## Core Architecture

```
Browser (React + @effect/atom-react)
  |
  | HTTPS
  v
Vercel (Next.js App Router, Node.js runtime)
  |
  +---> /api/auth/[...all]       -> better-auth (magic link + email allowlist gate)
  |       +---> Neon PostgreSQL (users, sessions, verification tokens)
  |       +---> Resend          (magic link emails)
  |
  +---> /api/chat              -> Effect v4 AI (LanguageModel + KnowledgeGraphToolkit)
  |       |                       toWebHandler(HttpRouter) wrapping Effect layers
  |       +---> OpenAI API     (gpt-4o-mini, tool-calling)
  |       +---> Graphiti API   (search_nodes, search_facts on FalkorDB VPS)
  |
  +---> /api/graph/search      -> Graphiti search passthrough for UI
  |       +---> Graphiti API
  |
  +---> /(app)/                -> Combined workspace: graph (left) + chat (right)


Railway Project (~$8-10/mo)
  |
  +---> FalkorDB Service (one-click template, persistent volume)
  |       70MB dump, 2,229 nodes, 9,697 edges
  |
  +---> Graphiti MCP Service (zepai/knowledge-graph-mcp:standalone)
  |       search_nodes, search_memory_facts, get_episodes
  |       Internal: falkordb.railway.internal:6379
  |
  +---> FastRelay/Caddy Service (auth proxy, X-API-Key enforcement)
  |       Auto TLS via Railway (Let's Encrypt)
```

## Baseline Inputs

- **Existing production graph database:**
  - FalkorDB RDB dump at `~/graphiti-mcp/data/dump.rdb` (70MB)
  - 2,229 nodes + 9,697 edges in the `effect-v4` graph
  - Node types: Entity (918), Entity/Document (466), Episodic (235), Entity/Topic (164)
  - Verified at 95% accuracy (10.5/11 tests) — no re-ingestion required, just port the dump
- Episode source artifacts (for reference/re-extraction if needed):
  - `specs/completed/effect-v4-knowledge-graph/outputs/p2-doc-extraction/` (198 episodes)
  - `specs/completed/effect-v4-knowledge-graph/outputs/p3-ast-extraction/` (1,906 functions)
  - `specs/completed/effect-v4-knowledge-graph/outputs/p4-enrichment/` (51 enrichments)
- **Total:** 2,155 episodes already processed into the graph
- Existing Next.js app scaffold at `apps/web`
- Effect v4 packages in repo catalog (`effect`, `@effect/ai-openai`, `@effect/atom-react`)
- `.repos/effect-smol` as v4 API source of truth

## Non-Goals

- Multi-tenant or per-user graph partitioning
- Full user management / role-based access control beyond email allowlist
- Rebuilding the function corpus — top-20 + docs is the v1 data set
- Replacing Next.js App Router with a custom runtime
- Mobile-optimized UI (desktop-first for beta)
- Real-time collaborative graph editing
- Password-based authentication (magic links only)

## Architecture Decision Records

| ID | Decision | Rationale |
|----|----------|-----------|
| AD-001 | **Self-hosted FalkorDB** on Railway as graph system of record | Zero re-ingestion (port 70MB RDB dump directly); 100% data fidelity; full Cypher query control; Railway has first-class FalkorDB template with auto TLS, built-in monitoring, private networking; ~$8-10/mo; VPS ($4/mo) viable alternative if cost is priority |
| AD-002 | **Single shared graph** (`group_id = "effect-v4"`) | No tenant isolation needed; all beta users query the same Effect v4 knowledge; keeps architecture simple |
| AD-003 | **One reusable `KnowledgeGraphToolkit`** consumed by `/api/chat` | Single source of truth for tool semantics; `Toolkit.make(...)` + `toolkit.toLayer({...})` pattern from Effect v4 AI |
| AD-004 | **`HttpRouter.toWebHandler`** for all Effect API routes | Converts Effect layers to standard `(Request) => Promise<Response>` for Next.js; module-level singleton caching avoids per-request layer rebuild |
| ~~AD-005~~ | ~~McpServer.layerHttp~~ | ~~REMOVED — not needed for v1. MCP endpoint can be added later in ~20 lines if IDE integration is desired~~ |
| AD-006 | **better-auth** with magic link plugin | Passwordless auth via email magic links; Drizzle adapter for Neon PostgreSQL; `nextCookies()` plugin for server actions; allowlist enforced at magic link send time (email never sent to non-allowlisted addresses); Resend free tier for email delivery |
| AD-007 | **Neon PostgreSQL** (free tier) for auth database | Serverless-native; Vercel marketplace integration auto-syncs `DATABASE_URL`; free tier (0.5GB) is more than sufficient for auth tables; `@neondatabase/serverless` driver |
| AD-008 | **`react-force-graph-2d`** for visualization | Canvas-based force-directed graph (not SVG); supports incremental node/link addition without full simulation restart; handles 1000+ nodes smoothly; rich interaction API (zoom, pan, node drag, click, hover); well-documented with 6K+ GitHub stars |
| AD-009 | **`@effect/atom-react`** for client state (tested APIs only) | Core atoms (`Atom.make`, computed, `Atom.fn`) and React hooks (`useAtomValue`, `useAtom`) have 2,300+ LOC of tests; **avoid `AtomHttpApi`** (zero test coverage, untested); use `Atom.fn` for Effect-backed async mutations instead; pin exact beta version; fallback to `useState`+`useEffect` if blocked (~2hr migration) |
| AD-010 | **`gpt-4o-mini`** as default model | Lower cost baseline for beta; sufficient for tool-calling + graph-grounded answers; overridable via env var |
| AD-011 | **Email allowlist via env var** for v1 | `ALLOWED_EMAILS` comma-separated list; simplest possible gating; move to DB table in v2 if list grows beyond 50 |
| AD-012 | **Vercel** for deployment (Hobby plan + Fluid compute) | Canonical Next.js host; auto-scaling; edge CDN; env var management; Fluid compute gives 300s function duration on Hobby plan; Active CPU pricing only bills during code execution (not I/O wait) |
| AD-013 | **Graphiti server** as graph API layer | Reuse existing Docker image; exposes search_nodes, search_memory_facts, get_episodes via HTTP; handles embedding similarity, Cypher queries, fact extraction internally; Next.js calls it via HTTP from tool handlers |

## Data Schemas

### FalkorDB/Graphiti Data Model

The Graphiti API returns entity nodes and edges that map to the graph visualization format:

```
Graphiti EntityNode -> GraphNode
  node.uuid           -> node.id
  node.name            -> node.label
  node.labels[0]       -> node.type (e.g., "Entity", "Entity/Document", "Entity/Topic")
  node.summary         -> node.data.summary

Graphiti Fact/Edge -> GraphLink
  edge.source_node_uuid -> link.source
  edge.target_node_uuid -> link.target
  edge.name             -> link.label
  edge.fact             -> link.data.fact
```

### Chat API Contract

```
POST /api/chat
Request:  { messages: Array<{ role: "user" | "assistant", content: string }> }
Response: SSE stream of StreamPart events (text, tool-call, tool-result, graph-snippet)
  - text: { type: "text", content: string }
  - tool-call: { type: "tool-call", name: string, args: unknown }
  - tool-result: { type: "tool-result", name: string, result: unknown }
  - graph-snippet: { type: "graph-snippet", nodes: GraphNode[], links: GraphLink[] }
  - done: { type: "done" }
```

### Graph Search API Contract

```
GET /api/graph/search?q={query}&scope={nodes|edges|both}&limit={number}
Response: { nodes: GraphNode[], links: GraphLink[] }
```

## Output Directory Structure

```
outputs/
  research.md                          # Source-backed research notes
  p0-foundations/                       # Auth, project setup artifacts
  p1-vps-deployment/                   # FalkorDB VPS setup, verification
  p2-toolkit/                           # Tool definitions, Graphiti service, tests
  p3-chat-api/                         # Chat route, regression tests
  p4-graph-ui-atoms/                   # react-force-graph-2d component integration, atom state
  p5-deployment/                       # Vercel config, runbooks, smoke tests
```

## Success Criteria

- [ ] Existing Effect v4 graph data (2,229 nodes, 9,697 edges) running on FalkorDB VPS and queryable via Graphiti API
- [ ] `/api/chat` implemented with Effect v4 AI `LanguageModel.streamText` + `KnowledgeGraphToolkit` + OpenAI (SSE streaming)
- [ ] Graph UI renders via `react-force-graph-2d` component with live graph data
- [ ] better-auth with magic links gates access to approved email allowlist only
- [ ] Atom-based client state powers chat and graph UI reactively
- [ ] All Effect API routes use `HttpRouter.toWebHandler` with module-level singleton caching
- [ ] Vercel deployment working with all env vars configured
- [ ] `bun run check && bun run test && bun run lint && bun run build` all pass
- [ ] Production runbook documents failure handling, rollback, and cost monitoring

## Phase Breakdown

| Phase | Focus | Outputs | Agent(s) | Sessions |
|-------|-------|---------|----------|----------|
| P0 | Foundations: Auth + DB + Project Setup | better-auth magic link, Neon PostgreSQL, Drizzle, Resend, project scaffold | 1 implementation agent | 1 |
| P1 | FalkorDB Railway Deployment + Verification | Railway project provisioned (FalkorDB + Graphiti + auth proxy), RDB dump loaded, verification queries pass | 1 ops agent | 1 |
| P2 | KnowledgeGraphToolkit + Graphiti Service | Tool definitions with Schema, Graphiti Effect service, endpoint tests | 1-2 implementation agents | 1-2 |
| P3 | Chat API Route | Chat handler, OpenAI integration, regression tests | 1 implementation agent | 1 |
| P4 | Graph UI + Atom Client | react-force-graph-2d component, atom state, graph search page, chat page | 1-2 UI agents | 1-2 |
| P5 | Deployment + Hardening | Vercel config, env wiring, smoke tests, runbook, cost controls | 1 ops agent | 1 |

## Phase Exit Criteria

| Phase | Done When |
|-------|-----------|
| P0 | better-auth magic link auth works locally; email allowlist enforced; magic link sent only to allowlisted emails; auth-gated layout redirects; `bun run check` passes |
| P1 | FalkorDB running on Railway with ported RDB dump; Graphiti API reachable over HTTPS via auth proxy; 5 verification queries return correct results; latency acceptable (<500ms) |
| P2 | `KnowledgeGraphToolkit` defines `SearchGraph`, `GetNode`, `GetFacts` tools with Schema parameters; `GraphitiService` calls VPS API; toolkit tests pass |
| P3 | `/api/chat` returns grounded answers using toolkit; rejects hallucinated v3 patterns; auth required; regression tests for 5 canonical queries pass |
| P4 | Graph page renders nodes/edges from Graphiti; click-to-expand shows neighbors; chat page sends/receives messages via atoms; auth-gated layout works |
| P5 | Vercel deployment working; all env vars configured; Graphiti API health passes; smoke tests cover auth + chat + graph; runbook committed |

## Planned File Layout

### App files (`apps/web/src/`)

```
app/
  api/
    auth/
      [...all]/route.ts             # better-auth catch-all handler (magic link + session)
    chat/route.ts                   # Effect v4 AI chat (toWebHandler)
    graph/search/route.ts           # Graphiti search passthrough
  (app)/
    layout.tsx                      # Auth-gated layout (better-auth session check)
    page.tsx                        # Combined workspace: graph (left) + chat (right)
  (auth)/
    sign-in/page.tsx                # Email input -> magic link flow
    layout.tsx                      # Unauthenticated layout
  layout.tsx                        # Root layout
  page.tsx                          # Landing / redirect

lib/
  auth/
    server.ts                       # better-auth server config (magic link plugin, allowlist, Drizzle adapter)
    client.ts                       # better-auth React client exports (magicLinkClient plugin)
  db/
    index.ts                        # Drizzle + Neon client
    schema.ts                       # Auth tables schema (user, session, account, verification)
  effect/
    runtime.ts                      # Shared Effect layers (OpenAI, Graphiti, etc.)
    tools.ts                        # KnowledgeGraphToolkit definition
    tool-handlers.ts                # Tool handler implementations (Graphiti queries)
    mappers.ts                      # Graphiti EntityNode/Edge -> GraphNode/Link
  graphiti/
    client.ts                       # Graphiti API client wrapped as Effect service

state/
  chat.atoms.ts                     # Chat conversation atoms (messages, loading, mutation)
  graph.atoms.ts                    # Graph data atoms (nodes, links, search query, selection)
  registry.tsx                      # AtomRegistry provider + runtime setup

components/
  graph/ForceGraph.tsx               # react-force-graph-2d wrapper with custom rendering
  graph/
    GraphPanel.tsx                  # Graph page wrapper with controls
    NodeDetail.tsx                  # Selected node detail panel
  chat/
    ChatPanel.tsx                   # Chat message list + input
    MessageBubble.tsx               # Individual message rendering
    ToolCallTrace.tsx               # Tool call visualization
```

## Data Flow

### Railway Deployment Flow (P1)

1. Deploy FalkorDB via [Railway one-click template](https://railway.com/deploy/falkordb)
2. Load 70MB RDB dump (custom Docker image with baked-in dump or redis-cli replication)
3. Deploy Graphiti MCP service pointing to `falkordb.railway.internal:6379`
4. Deploy FastRelay auth proxy in front of Graphiti (X-API-Key enforcement)
5. Set `GRAPHITI_API_URL` env var pointing to the Railway public URL
6. Verify with same 5 canonical queries used in local verification
7. Configure scheduled daily volume backups and monitoring alerts

### Chat Flow (P3)

1. Client sends messages via atom mutation -> `POST /api/chat`
2. Route validates session (better-auth) and parses request body (Schema)
3. `LanguageModel.streamText` runs with OpenAI model + `KnowledgeGraphToolkit`
4. Tools call Graphiti API (`search_nodes`, `search_memory_facts`) via Effect service
5. Response streams as SSE events: text tokens, tool calls/results, graph snippets
6. Client atom accumulates streaming tokens + highlights graph nodes from tool results

### Graph Visualization Flow (P4)

1. Graph page mounts -> atom triggers `GET /api/graph/search?q=&scope=both&limit=200`
2. Route calls Graphiti `search_nodes` and maps to graph format via `mappers.ts`
3. react-force-graph-2d component renders force-directed graph
4. Node click -> atom triggers neighbor search -> expands graph incrementally
5. Debounced state updates prevent full D3 simulation restart on every addition

## Auth Design

### Magic Link Flow

- **Sign-in flow:** Email input -> check against `ALLOWED_EMAILS` env var -> send magic link via Resend -> user clicks link -> session created
- **Session:** Cookie-based via better-auth (7-day expiry, daily refresh)
- **Allowlist:** `ALLOWED_EMAILS` env var (comma-separated) for v1; enforced at magic link send time (never sends email to non-allowlisted addresses)
- **Middleware:** `auth.api.getSession()` for server components; route handler checks for protected API routes
- **Database:** Neon PostgreSQL free tier for auth tables (user, session, account, verification)

### better-auth Configuration

```ts
// lib/auth/server.ts
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { magicLink } from "better-auth/plugins"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const allowedEmails = new Set(
  (process.env.ALLOWED_EMAILS ?? "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean)
)

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  plugins: [
    nextCookies(),
    magicLink({
      sendMagicLink: async ({ email, token, url }) => {
        if (!allowedEmails.has(email.toLowerCase().trim())) {
          throw new Error("Email not authorized")
        }
        await resend.emails.send({
          from: "Effect v4 KG <noreply@yourdomain.com>",
          to: email,
          subject: "Sign in to Effect v4 Knowledge Graph",
          html: `<a href="${url}">Click here to sign in</a>`,
        })
      },
    }),
  ],
})
```

### Required Environment Variables

```
# Auth (Sensitive)
BETTER_AUTH_SECRET=              # 32+ chars, high entropy
BETTER_AUTH_URL=                 # https://yourapp.vercel.app

# Database (Sensitive, auto-synced by Neon Vercel integration)
DATABASE_URL=                    # Neon pooled connection string
DATABASE_URL_UNPOOLED=           # Neon direct connection (migrations only)

# Email (Sensitive)
RESEND_API_KEY=                  # From resend.com dashboard

# Graph Backend (Sensitive)
GRAPHITI_API_URL=                # https://graph.yourdomain.com (Graphiti server on VPS)
GRAPHITI_API_KEY=                # Shared secret for Graphiti API auth

# OpenAI (Sensitive)
OPENAI_API_KEY=                  # For chat completions

# Access Control
ALLOWED_EMAILS=                  # Comma-separated email allowlist

# Optional
OPENAI_MODEL=                    # Default: gpt-4o-mini
```

## Production Hardening Requirements

### Security
- Require authenticated session for all `/api/chat`, `/api/graph/*` routes
- Enforce allowlist check at magic link send time (server-side only)
- Request body size limits (16KB for chat, 4KB for graph search)
- Rate limits per session: 30 chat requests/min, 60 graph requests/min
- API keys server-only (never exposed to client)
- better-auth session cookies: secure + httpOnly + sameSite

### Reliability
- Retries with exponential backoff for Graphiti and OpenAI transient failures (Effect.retry)
- Request abort signal wired to Effect.interrupt for cancellation
- Graceful fallback responses on partial tool failure
- Module-level handler singleton prevents cold-start layer rebuild

### Observability
- Structured logs via `Effect.log` around tool calls, query latency, token usage
- Error reporting with trace correlation IDs

### Cost Controls
- Default to `gpt-4o-mini` (overridable via `OPENAI_MODEL` env var)
- Cap max tokens per chat request (4096 output)
- Cap tool iterations per request (max 3 rounds)
- Short TTL cache for repeated graph queries (5 min)

## Key Technology Reference

### Effect v4 AI Package (source: `.repos/effect-smol`)

**Imports:** `import { Tool, Toolkit, LanguageModel, McpServer } from "effect/unstable/ai"`

**Tool definition:**
```
Tool.make("SearchGraph", {
  description: "Search the Effect v4 knowledge graph",
  parameters: Schema.Struct({ query: Schema.String, scope: Schema.Literal("nodes", "edges", "both") }),
  success: Schema.Struct({ nodes: Schema.Array(NodeSchema), links: Schema.Array(LinkSchema) })
})
```

**Toolkit + handler:**
```
const toolkit = Toolkit.make(SearchGraphTool, GetNodeTool, GetFactsTool)
const toolsLayer = toolkit.toLayer({ SearchGraph: (params) => graphitiSearch(params), ... })
```

**LanguageModel (chat):**
```
LanguageModel.generateText({ prompt, toolkit, toolChoice: "auto" })
  .pipe(Effect.provide(OpenAiLanguageModel.model("gpt-4o-mini")), Effect.provide(toolsLayer))
```

### Effect v4 HTTP (source: `.repos/effect-smol`)

**Imports:** `import { HttpRouter } from "effect/unstable/http"`

**toWebHandler for Next.js:**
```
const { handler } = HttpRouter.toWebHandler(appLayer)
export const GET = handler
export const POST = handler
```

### Effect Atom + React (source: `.repos/effect-smol`)

**Imports:**
```
import { Atom } from "effect/unstable/reactivity"
import { useAtomValue, useAtom, RegistryProvider } from "@effect/atom-react"
```

**Atom patterns:**
```
// Simple state
const messagesAtom = Atom.make<Array<Message>>([])

// Effect-backed async
const graphAtom = Atom.make((get) =>
  HttpClient.get("/api/graph/search?q=&scope=both")
)

// Mutation
const sendMessage = Atom.fn<SendMessageArgs>()(
  (args, get) => HttpClient.post("/api/chat", { body: args })
)
```

### react-force-graph-2d

**Install:** `npm install react-force-graph-2d`

**Data format:**
```
GraphData: { nodes: Node[], links: Link[] }
Node: { id: string, name?: string, val?: number, color?: string, [key]: any }
Link: { source: string, target: string, [key]: any }
```

**Key advantages over Gaia (original choice):**
- Canvas rendering (not SVG) — handles 1000+ nodes smoothly
- Supports incremental data updates without full simulation restart
- Node dragging, zoom/pan built in
- Customizable node/link rendering via canvas callbacks
- Well-documented: https://github.com/vasturiano/react-force-graph

### better-auth

**Install:** `npm install better-auth`

**Pattern:** Full-featured auth with magic link plugin. Uses Drizzle adapter for Neon PostgreSQL storage. `nextCookies()` plugin for server action support. Email allowlist enforced in `sendMagicLink` callback — unauthorized emails never receive a link. Client-side: `createAuthClient()` with `magicLinkClient()` plugin for `signIn.magicLink({ email })` flow.

## Cost Projections (v1 Beta)

| Service | Monthly Cost | Notes |
|---------|-------------|-------|
| Vercel | $0 (Hobby + Fluid) | Fluid compute gives 300s duration on Hobby; Active CPU pricing only bills during code execution |
| Railway (FalkorDB + Graphiti) | $8-10 (Hobby plan) | One-click FalkorDB template, auto TLS, built-in monitoring; VPS at $4/mo if cost is priority |
| OpenAI | ~$5-20 | gpt-4o-mini at ~$0.15/M input, $0.60/M output; varies with usage |
| Neon PostgreSQL | $0 (free tier) | 0.5GB storage, sufficient for auth tables |
| Resend | $0 (free tier) | 100 emails/day, sufficient for beta magic links |
| better-auth | $0 | npm package, no managed service |
| **Total** | **$13-30/month** | Down from $50-65/month with original Zep Cloud + Pro plan stack |

### Cost Comparison vs Original Spec

| Component | Original (Zep+Neon) | Revised (FalkorDB+better-auth) | Savings |
|-----------|---------------------|-------------------------------|---------|
| Graph hosting | $25/mo (Zep Flex) | $8-10/mo (Railway) | $15-17/mo |
| Auth database | $0-5/mo (Neon) | $0 (Neon free tier) | $0 |
| External services | 5 (Zep, Neon, OpenAI, Vercel, Gaia) | 4 (Neon, Resend, OpenAI, Vercel) + npm pkgs | 1 fewer managed service |
| Migration effort | Re-ingest 2,155 episodes ($$$) | Copy 70MB RDB dump (free) | Hours saved |

## Complexity Assessment

```
Phases:       6  x2 = 12
Agents:       7  x3 = 21  (1 ops + 4 impl + 2 UI)
CrossPkg:     1  x0.5= 0.5 (apps/web only, minimal cross-package)
ExtDeps:      5  x3 = 15  (OpenAI, react-force-graph-2d, better-auth, Neon, Resend)
SelfHosted:   1  x3 =  3  (FalkorDB on Railway — managed, less overhead than VPS)
Uncertainty:  1  x3 =  3  (atom+Effect — core APIs tested, avoid AtomHttpApi)
Research:     1  x2 =  2  (research phase complete)
                     ----
Total:              56.5  -> Medium complexity
```

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Railway downtime affects graph queries | High | Low | Railway auto-restart policies; built-in monitoring alerts; auto TLS renewal |
| Tool-call latency spikes from chained graph queries | Medium | Medium | Cap tool iterations (3); add query timeout (10s); short-term cache (5 min TTL) |
| `@effect/atom-react` is unstable/underdocumented | Medium | Low | P0 includes atom+Next.js prototype spike (~30min); restrict to tested APIs only (no `AtomHttpApi`, no `AtomRpc`); use `Atom.fn` for async ops; pin exact beta version; fallback to `useState`+`useEffect`+`fetch` is ~2hr migration |
| Graphiti API latency over network (local was <50ms) | Medium | Medium | Railway US region; query result caching; lazy-load graph subsets |
| Serverless cold-start penalties on Vercel | Low | Low | Module-level handler singleton caching; Fluid compute optimized concurrency + bytecode caching |
| Graph visualization performance at 2000+ nodes | Low | Low | react-force-graph-2d uses canvas (handles 1000+ well); default to search-scoped subgraph (50-200 nodes); full graph as opt-in |
| Email allowlist bypass | High | Low | Server-side only enforcement; encrypted cookie validation; no client-side allowlist check |
| FalkorDB RDB dump compatibility across versions | Low | Low | Same Docker image version; test dump restoration before prod cutover |

## Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| Railway (Hobby plan) | External | Needs setup |
| OpenAI API key | External | Available |
| Vercel project (Hobby plan + Fluid compute) | External | Needs setup |
| Effect v4 packages (`effect`, `@effect/ai-openai`, `@effect/atom-react`) | Local | In repo catalog |
| `.repos/effect-smol` | Local | Cloned |
| FalkorDB RDB dump (`~/graphiti-mcp/data/dump.rdb`) | Local | Available (70MB) |
| Graphiti Docker image (`zep/graphiti-mcp`) | External | In use locally |
| react-force-graph-2d | External | npm install |
| better-auth | External | npm install |
| @neondatabase/serverless | External | npm install |
| drizzle-orm / drizzle-kit | External | npm install |
| resend | External | npm install |
| Neon PostgreSQL (free tier) | External | Needs setup (Vercel marketplace) |
| Resend (free tier) | External | Needs setup (resend.com) |

## Open Questions (Resolved)

1. ~~Should we support streaming chat responses (SSE) in v1?~~ **Yes** — use `LanguageModel.streamText` + SSE for real-time token streaming
2. ~~Do we want a combined graph+chat workspace page?~~ **Yes** — split view with graph left, chat right; chat answers highlight relevant nodes in the graph
3. ~~Graphiti API auth mechanism?~~ **Simple shared API key** (X-API-Key header) — single-tenant, only Vercel deployment calls it; key stored server-only in env vars; HTTPS provides transport security

## Exit Condition

This spec is complete when a follow-up implementation can land all phases with passing checks and a deployed app where authenticated users can:
- Chat against the Effect v4 knowledge graph with grounded, hallucination-free answers
- Inspect graph structure visually via force-directed visualization
- All behind email-allowlist access control deployed on Vercel + FalkorDB VPS
