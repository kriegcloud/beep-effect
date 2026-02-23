# Research Notes

Source-backed research findings for the Effect v4 Knowledge Graph Explorer spec.

---

## 1. Effect v4 AI Package

**Source:** `.repos/effect-smol/packages/ai/`

### Tool System

Three constructor patterns verified from source:

1. **Compile-time Schema Tools** (our primary pattern):
```ts
Tool.make("ToolName", {
  description: "What this tool does",
  parameters: Schema.Struct({ param: Schema.String }),
  success: Schema.Number,
  failure: Schema.String,
  failureMode: "error" | "return",
  dependencies: [SomeService],
  needsApproval: boolean | (params, ctx) => Effect<boolean>
})
```

2. **Runtime-Discovered Tools** (MCP dynamic): `Tool.dynamic("name", { parameters })`
3. **Provider-Defined Tools**: `Tool.providerDefined({ id, customName })(...)`

Tool annotations: `Tool.Title`, `Tool.Readonly`, `Tool.Destructive`, `Tool.Idempotent`, `Tool.OpenWorld`, `Tool.Strict`.

### Toolkit System

```ts
const MyToolkit = Toolkit.make(Tool1, Tool2, Tool3)

const layer = MyToolkit.toLayer({
  Tool1: (params, ctx) => {
    ctx.preliminary(partialResult) // streaming progress
    return Effect.succeed(result)
  }
})

// Merge toolkits
const merged = Toolkit.merge(toolkit1, toolkit2)
```

### LanguageModel Service

Three primary methods:
- `LanguageModel.generateText({ prompt, toolkit, toolChoice })` -> `GenerateTextResponse`
- `LanguageModel.generateObject({ prompt, schema, objectName })` -> `GenerateObjectResponse<T>`
- `LanguageModel.streamText({ prompt, toolkit })` -> `Effect<Stream<StreamPart>>`

`toolChoice` options: `"auto" | "none" | "required" | { tool: name } | { mode?, oneOf: [names] }`

### McpServer

```ts
// HTTP transport (for Next.js)
McpServer.layerHttp({ name: "server-name", version: "1.0.0", path: "/api/mcp" })

// Register tools
McpServer.toolkit(toolkit): Layer<never, never, McpServer>

// Resources
McpServer.resource`users://{userId}/profile`({ handle, ... })

// Prompts
McpServer.prompt({ name, parameters, completion, content })
```

Protocol version: `"2025-06-18"` (latest).

### OpenAI Provider (`@effect/ai-openai`)

```ts
// Named model (Layer + provider identity)
OpenAiLanguageModel.model("gpt-4o-mini", config?)

// Layer only
OpenAiLanguageModel.layer({ model: "gpt-4o-mini" })
```

Config: `strictJsonSchema`, `fileIdPrefixes`, text verbosity.

### Chat Service

```ts
Chat.empty: Effect<Chat, never, LanguageModel>

// Stateful conversation
interface Service {
  history: Ref<Prompt>
  export: Effect<Prompt>
  generateText(options): Effect<GenerateTextResponse>
  streamText(options): Effect<Stream<StreamPart>>
}
```

Auto-manages conversation history.

---

## 2. Effect v4 HTTP

**Source:** `.repos/effect-smol/packages/effect/src/unstable/http/`

### toWebHandler (Critical for Next.js)

```ts
// Via HttpRouter (recommended)
HttpRouter.toWebHandler(
  appLayer: Layer<HttpRouter>,
  options?: { middleware?: HttpMiddleware }
): { handler: (request: Request) => Promise<Response>, dispose: () => Promise<void> }

// Via HttpEffect (lower-level)
HttpEffect.toWebHandler(
  effect: Effect<HttpServerResponse, E, HttpServerRequest>,
  middleware?: HttpMiddleware
): (request: Request) => Promise<Response>
```

### HttpRouter

```ts
HttpRouter.add("GET", "/path/:id", handler): Layer<never, never, HttpRouter>
HttpRouter.addAll([{ method, path, handler }]): Layer
HttpRouter.addGlobalMiddleware(middleware): Layer
HttpRouter.cors(options?): Layer
HttpRouter.schemaJson(schema): Effect<A, HttpServerError, HttpServerRequest>
HttpRouter.schemaParams(schema): Effect<A, HttpServerError, HttpServerRequest>
HttpRouter.provideRequest(layer): Layer  // request-scoped deps
```

### Streaming

```ts
HttpEffect.scopeTransferToStream(response)  // keep resources alive for stream duration
```

---

## 3. Effect Atom + React

**Source:** `.repos/effect-smol/packages/effect/src/unstable/reactivity/` + `.repos/effect-smol/packages/ai/atom-react/`

### Core Atoms

```ts
// Simple state
Atom.make(initialValue: A): Writable<A>

// Derived
Atom.make((get: Context) => get(otherAtom) * 2): Atom<number>

// Effect-backed async
Atom.make(Effect.succeed(42)): Atom<AsyncResult<number, never>>

// Parameterized family (WeakRef caching)
const userAtom = Atom.family((userId: string) => Atom.make(fetchUser(userId)))
```

### Mutations

```ts
// Effect-backed mutation
Atom.fn<Args>()(
  (args, get) => Effect.succeed(result),
  { initialValue: AsyncResult.initial(), concurrent: true }
): AtomResultFn<Args, Result, Error>
```

`AtomResultFn` accepts `Reset` and `Interrupt` symbols for state control.

### React Hooks

```ts
useAtomValue<A>(atom: Atom<A>): A
useAtom<R, W>(atom: Writable<R, W>): [R, (w: W) => void]
useAtomSet<R, W>(atom, options?): (w: W) => void
useAtomRefresh<A>(atom): () => void
useAtomMount<A>(atom): void
useAtomInitialValues(pairs): void
```

### RegistryProvider

```tsx
<RegistryProvider
  initialValues?: Iterable<readonly [Atom<any>, any]>
  scheduleTask?: (task: () => void) => void
  defaultIdleTTL?: Duration
>
  {children}
</RegistryProvider>
```

### AtomHttpApi (Type-safe API Client) — AVOID

**Zero test coverage.** No dedicated test file exists. Complex generic type chains suggest API still evolving. Use `Atom.fn` for async mutations instead.

```ts
// AVOID: AtomHttpApi pattern (untested)
class MyApi extends AtomHttpApi.Service<MyApi>()("MyApi", { ... }) {}

// USE INSTEAD: Atom.fn for async operations (well-tested)
const searchNodes = Atom.fn<[string]>()(
  (query) => fetchGraphData(query),
  { initialValue: AsyncResult.initial() }
)
```

### Maturity Assessment

| Component | Tests (LOC) | Risk | Use In Project? |
|-----------|-------------|------|-----------------|
| Core Atom (make, computed) | 1,820 | Low | Yes |
| Atom.fn (mutations) | Included above | Low | Yes |
| React hooks (useAtomValue, useAtom) | 505 | Low | Yes |
| RegistryProvider + SSR | Included above | Low | Yes |
| Suspense integration | Included above | Low | Yes |
| **AtomHttpApi** | **0** | **High** | **No** |
| **AtomRpc** | **0** | **High** | **No** |
| Reactivity service layer | Limited | Medium | No |

**Fallback plan:** If atom integration fails during P0 spike, migrate to `useState` + `useEffect` + `fetch` (~2 hours). The atom layer is thin — state atoms become useState hooks, `Atom.fn` becomes `useCallback` + fetch.

---

## 4. FalkorDB / Graphiti (Self-Hosted Graph)

**Source:** Local Docker setup at `~/graphiti-mcp/`, FalkorDB docs, Graphiti GitHub

### Local Infrastructure

```yaml
# ~/graphiti-mcp/docker-compose.yml
services:
  falkordb:
    image: falkordb/falkordb:latest
    ports: ["6379:6379"]
    volumes: ["./data:/data"]
  graphiti:
    image: zep/graphiti-mcp:latest
    ports: ["8000:8000"]
    environment:
      FALKORDB_URI: bolt://falkordb:6379
      GRAPHITI_GROUP_ID: effect-v4
      OPENAI_API_KEY: ${OPENAI_API_KEY}
```

### Graph Statistics (effect-v4)

| Metric | Value |
|--------|-------|
| RDB dump size | 70MB |
| Total nodes | 2,229 |
| Total edges | 9,697 |
| Redis keys | 16 |
| Graphs | 8 (effect-v4 is primary) |
| Node labels | Entity (918), Entity/Document (466), Episodic (235), Entity/Topic (164) |
| Verification score | 95% (10.5/11 tests) |

### Node Properties
Each node has: `uuid`, `name`, `group_id`, `summary`, `name_embedding` (1024-dim vector), `labels` (array).

### Graphiti MCP API

The Graphiti server exposes MCP tools:
- `search_nodes({ query, max_nodes, group_ids })` — Semantic search over entity nodes
- `search_memory_facts({ query, max_facts, group_ids })` — Search for relationships/facts
- `get_episodes({ group_ids, max_episodes })` — Retrieve source episodes
- `add_memory({ name, episode_body, source, group_id })` — Add new data (read-only for our app)

### Migration Path

**Zero re-ingestion required.** The RDB dump is a standard Redis snapshot:
```bash
scp ~/graphiti-mcp/data/dump.rdb user@vps:~/graphiti/data/dump.rdb
docker compose up -d  # FalkorDB auto-loads on startup
```

### Cost Comparison

| Approach | Monthly | Migration | Data Fidelity | Control |
|----------|---------|-----------|---------------|---------|
| Self-hosted FalkorDB (VPS) | $4-8 | Copy file | 100% | Full Cypher |
| Zep Cloud (Flex) | $25 | Re-ingest 2,155 episodes | ~90-95% (LLM extraction) | API only |

---

## 5. better-auth (Magic Link Authentication)

**Source:** better-auth docs (better-auth.com), npm

### Overview

Full-featured authentication framework for Next.js with plugin system. We use the magic link plugin for passwordless email authentication, backed by Neon PostgreSQL via Drizzle adapter. Email allowlist enforced server-side in the `sendMagicLink` callback.

### Server Setup

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
      expiresIn: 300, // 5 minutes
    }),
  ],
})
```

### Client Setup

```ts
// lib/auth/client.ts
import { createAuthClient } from "better-auth/react"
import { magicLinkClient } from "better-auth/client/plugins"

export const { signIn, signUp, useSession } = createAuthClient({
  plugins: [magicLinkClient()],
})
```

### Route Handler

```ts
// app/api/auth/[...all]/route.ts
import { toNextJsHandler } from "better-auth/next-js"
import { auth } from "@/lib/auth/server"
export const { GET, POST } = toNextJsHandler(auth)
```

### Server-side Session Check

```ts
// app/(app)/layout.tsx
const session = await auth.api.getSession({ headers: await headers() })
if (!session) redirect("/sign-in")
```

### Key Features
- `nextCookies()` plugin required for server action support
- `magicLinkClient()` on client side for `signIn.magicLink({ email, callbackURL })`
- Drizzle adapter manages auth tables (user, session, account, verification)
- Allowlist enforcement at magic link send time — email never sent to unauthorized addresses

### Dependencies
- `better-auth` — auth framework
- `@neondatabase/serverless` — Neon PostgreSQL driver
- `drizzle-orm` + `drizzle-kit` — ORM + migrations
- `resend` — email delivery for magic links

### Known Issues
- TypeScript monorepo bug ("cannot be named without reference") — keep all auth code in `apps/web`, do NOT extract to shared package
- Disable `declaration` and `composite` in tsconfig if issues arise

---

## 6. react-force-graph-2d (Graph Visualization)

**Source:** GitHub (vasturiano/react-force-graph), npm

### Install

```bash
npm install react-force-graph-2d
```

### Key Props

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| graphData | { nodes, links } | required | Graph data object |
| nodeLabel | string/fn | "name" | Node tooltip/label accessor |
| nodeColor | string/fn | - | Node color accessor |
| nodeVal | string/fn | "val" | Node size accessor |
| linkLabel | string/fn | - | Link label accessor |
| onNodeClick | (node, event) => void | - | Click handler |
| onNodeHover | (node, prevNode) => void | - | Hover handler |
| width | number | window width | Canvas width |
| height | number | window height | Canvas height |
| cooldownTicks | number | Infinity | Simulation ticks before stopping |

### Data Types

```ts
Node: { id: string, name?: string, val?: number, color?: string, [key: string]: any }
Link: { source: string, target: string, [key: string]: any }
GraphData: { nodes: Node[], links: Link[] }
```

### Performance

- Canvas-based rendering (not SVG) — handles 1000+ nodes smoothly
- Supports incremental data updates without full simulation restart
- Node dragging, zoom/pan built in
- Customizable node/link rendering via canvas callbacks

### Key Advantages Over Gaia (Original Choice)

- **Incremental updates:** Mutate the existing graphData object and call `.graphData(newData)` — simulation adjusts without restart
- **Canvas rendering:** Handles much larger graphs than SVG-based approaches
- **Rich API:** Zoom, pan, center on node, d3 force customization, custom painting
- **Well-documented:** 6K+ GitHub stars, active maintenance
- Docs: https://github.com/vasturiano/react-force-graph

---

## 7. Vercel Deployment (Fluid Compute)

**Source:** Vercel docs (vercel.com/docs/fluid-compute, vercel.com/docs/functions/usage-and-pricing)

### Key Considerations

- **Fluid compute (default since April 2025):** Hobby plan now supports 300s (5 min) function duration — more than enough for streaming chat with tool-calling. Pro plan not required.
- **Active CPU pricing:** Only billed during actual code execution, not during I/O wait (database queries, AI model calls). Perfect for our I/O-heavy chat workload (waiting on OpenAI + Graphiti).
- **Node.js runtime:** Must set `export const runtime = "nodejs"` on AI/tool routes (Edge runtime doesn't support all Node.js APIs).
- **Module-level singleton:** Cache `HttpRouter.toWebHandler(appLayer)` at module level to avoid per-request layer rebuild on cold start.
- **Optimized concurrency:** Multiple invocations share a single function instance, reducing cold starts.
- **Bytecode caching:** Node.js 20+ automatically caches compiled bytecode, reducing subsequent cold start times.
- **Environment variables:** Mark sensitive vars (BETTER_AUTH_SECRET, DATABASE_URL, RESEND_API_KEY, GRAPHITI_API_KEY, OPENAI_API_KEY) as "Sensitive" in Vercel dashboard (write-only, no readback).

### Pricing (Fluid Compute)

| Tier | Cost | Default Duration | Max Duration | Notes |
|------|------|-----------------|-------------|-------|
| Hobby | $0 | 300s (5 min) | 300s (5 min) | Sufficient for production with Fluid compute |
| Pro | $20/mo | 300s (5 min) | 800s (13 min) | Only needed if functions require >5 min |

### Active CPU Pricing Model
- **CPU:** Billed per CPU-hour, only during active code execution (pauses during I/O wait)
- **Memory:** Billed per GB-hour for provisioned memory (continues during I/O)
- **Invocations:** First 1M requests included on both Hobby and Pro
- Net effect: AI chat routes that spend most time waiting on OpenAI/Graphiti are very cheap

---

## 8. Graphiti-to-react-force-graph-2d Data Mapping

Direct mapping verified against both APIs:

```
Graphiti EntityNode          ->  react-force-graph-2d Node
  node.uuid                  ->  id
  node.name                  ->  name (label)
  node.labels[0]             ->  type (for color coding)
  node.summary               ->  summary (tooltip/detail)
  (computed from relevance)  ->  val (node size)

Graphiti Fact/Edge           ->  react-force-graph-2d Link
  fact.source_node_uuid      ->  source
  fact.target_node_uuid      ->  target
  fact.name                  ->  label
  fact.fact                  ->  fact (tooltip)
```

No intermediate store needed. Search results map directly from Graphiti API to react-force-graph-2d `graphData` prop.
