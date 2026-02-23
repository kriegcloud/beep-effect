# Research Notes: Effect v4 KG App

Date: 2026-02-22

## Method
- Effect v4 research source: existing Effect v4 knowledge graph (`group_id: effect-v4`) and local source tree in `.repos/effect-smol` (no web docs for Effect, per project guidance).
- External web research source: official docs for Zep, Gaia UI, Next.js, Vercel, and auth/session primitives.
- SDK shape validation source: `@getzep/zep-cloud` package type definitions.

## 1) Effect v4 Findings (local source + KG)

### Toolkit + Tool Handlers
- `Toolkit.make(...)` and `toolkit.toLayer({...handlers})` are the standard pattern for typed tool handlers.

Local references:
- `.repos/effect-smol/packages/effect/src/unstable/ai/Toolkit.ts`

### Next-compatible web handler bridge
- `HttpRouter.toWebHandler(appLayer, options)` returns `{ handler, dispose }`.
- This is a direct fit for Next.js route handlers, enabling Effect layers to serve `Request -> Response`.
- Middleware caveat is documented in source: server middleware in this conversion path is not the same as router-level response mutation middleware.

Local references:
- `.repos/effect-smol/packages/effect/src/unstable/http/HttpRouter.ts`
- `.repos/effect-smol/packages/effect/src/unstable/http/HttpEffect.ts`
- `.repos/effect-smol/packages/effect/HTTPAPI.md`

### AI orchestration with tools
- `LanguageModel.generateText({ prompt, toolkit, ... })` supports toolkit-based tool calling.
- Tool choice modes include `auto`, `required`, `none`, explicit tool, and subset restrictions.
- OpenAI provider integration is available through `@effect/ai-openai`:
  - `OpenAiLanguageModel.model(modelName)`
  - `OpenAiClient.layer(...)` / `layerConfig(...)`.

Local references:
- `.repos/effect-smol/packages/effect/src/unstable/ai/LanguageModel.ts`
- `.repos/effect-smol/packages/ai/openai/src/OpenAiLanguageModel.ts`
- `.repos/effect-smol/packages/ai/openai/src/OpenAiClient.ts`

### Effect Atom client patterns
- `@effect/atom-react` provides:
  - `RegistryProvider`
  - `useAtom`, `useAtomValue`, `useAtomSet`, `useAtomSuspense`, etc.
- This enables an Effect-native client state model for chat and graph interaction.

Local references:
- `.repos/effect-smol/packages/atom/react/src/RegistryContext.ts`
- `.repos/effect-smol/packages/atom/react/src/Hooks.ts`
- `.repos/effect-smol/packages/atom/react/test/index.test.tsx`

## 2) Zep Findings

### SDK + auth
- JS SDK package: `@getzep/zep-cloud`.
- Typical auth setup uses `ZEP_API_KEY` and `new ZepClient({ apiKey })`.

Sources:
- https://help.getzep.com/v2/quickstart
- https://www.npmjs.com/package/@getzep/zep-cloud
- https://github.com/getzep/zep-js

### Graph ingestion
- `graph.add({ data, type, graphId? | userId?, sourceDescription?, createdAt? })`.
- `type` values: `"text" | "json" | "message"`.
- `graph.addBatch` exists; docs caution to use batch only for order-insensitive workloads.

Sources:
- https://help.getzep.com/v2/knowledge-graphs
- `@getzep/zep-cloud` type definitions:
  - `api/resources/graph/client/requests/AddDataRequest`
  - `api/types/GraphDataType`

### Graph querying
- `graph.search({ query, graphId?|userId?, scope?, limit?, reranker?, searchFilters?, ... })`.
- `scope` values: `"edges" | "nodes" | "episodes"`.
- Results include `nodes`, `edges`, and optional `episodes`.

Sources:
- https://help.getzep.com/v2/knowledge-graphs
- `@getzep/zep-cloud` type definitions:
  - `api/resources/graph/client/requests/GraphSearchQuery`
  - `api/types/GraphSearchResults`
  - `api/types/GraphSearchScope`
  - `api/types/SearchFilters`

### Node/edge shape for visualization
- `EntityNode` contains fields including `uuid`, `name`, `labels`, `summary`, optional `score/relevance`.
- `EntityEdge` contains `uuid`, `name`, `fact`, `sourceNodeUuid`, `targetNodeUuid`, timestamps, optional `score/relevance`.

Source:
- `@getzep/zep-cloud` type definitions:
  - `api/types/EntityNode`
  - `api/types/EntityEdge`

### Ontology controls (optional but useful)
- Wrapper `graph.setEntityTypes(...)` / `graph.setOntology(...)` supports defining entity and edge types.
- Can target project-wide or scoped users/graphs.

Source:
- `@getzep/zep-cloud` wrapper API:
  - `wrapper/graph`
  - `wrapper/ontology`

## 3) Gaia Knowledge Graph Component Findings
- Install path includes:
  - `d3-force`
  - `@visx/group`
  - component registry install command from Gaia docs.
- Main props:
  - `nodes`
  - `links`
  - `onNodeClick`
  - `selectedNodeId`
- Supports interactive graph exploration with optional zoom controls.

Source:
- https://ui.heygaia.io/docs/components/knowledge-graph

## 4) Better Auth + DB-Backed Auth Findings

### Better Auth capabilities relevant to this project
- Better Auth supports stateless sessions, but plugin-heavy setups commonly rely on database-backed auth models.
- Magic-link plugin support exists and is compatible with App Router integration patterns.
- Drizzle adapter support is first-class for Postgres providers.

Implication:
- For invite-only beta with magic-link sign-in, Better Auth + Drizzle + Postgres is a practical fit.

### Recommended DB provider choice
- Vercel's previous Postgres product path is now effectively replaced by Neon integration.
- Neon provides straightforward serverless Postgres + Drizzle compatibility and works cleanly with Vercel deployments.

Implication:
- Use Neon Postgres (preferably via Vercel Marketplace integration) as the primary database provider.

### Allowlist model with Better Auth
- Keep allowlist enforcement as a separate server-side check around magic-link initiation and protected-route checks.
- Continue using normalized exact-match email checks.
- For this beta, keep allowlist source simple via `ALLOWED_EMAILS` env var.

## 5) Next.js + Vercel Deployment Findings

### Route handlers
- Next app router route handlers support direct `Request`/`Response` handlers and are suitable for API endpoints.

Source:
- https://nextjs.org/docs/app/building-your-application/routing/route-handlers

### Runtime controls
- Route segment config supports:
  - `runtime` (`'nodejs'` vs `'edge'`)
  - `maxDuration`
  - `preferredRegion`
  - `dynamic` and cache controls.
- For Effect + tool calling, `runtime = "nodejs"` is the safe baseline.

Source:
- https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config

### Production config discipline
- Keep preview/prod environment contracts explicit and validated at startup.
- For this stack, run Effect-heavy routes with Node runtime and fail fast on missing auth/DB/Zep/OpenAI env values.

## 6) Key Implementation Implications
1. Reuse one typed `Toolkit` across chat and graph retrieval services to avoid divergence.
2. Keep ingestion deterministic (phase ordering), using batch mode only where order does not matter.
3. Map Zep edge/node UUIDs directly into Gaia graph IDs to avoid client-side reconciliation complexity.
4. Enforce auth before graph queries; for private beta, use approved-email allowlist and a shared `graphId`.
5. Use Node runtime and module-level cached web handlers to reduce cold-path overhead.

## 6.1) Project-Specific Decision Override
- Tenant/user graph partitioning is intentionally out of scope for this spec iteration.
- Access model is private beta:
  - operator-approved email list
  - authenticated sessions required
  - single shared graph scope (`graphId = effect-v4`)

## 7) Source Index

### Local (Effect-only)
- `.repos/effect-smol/packages/effect/src/unstable/ai/Toolkit.ts`
- `.repos/effect-smol/packages/effect/src/unstable/http/HttpRouter.ts`
- `.repos/effect-smol/packages/effect/src/unstable/http/HttpEffect.ts`
- `.repos/effect-smol/packages/effect/src/unstable/ai/LanguageModel.ts`
- `.repos/effect-smol/packages/ai/openai/src/OpenAiClient.ts`
- `.repos/effect-smol/packages/ai/openai/src/OpenAiLanguageModel.ts`
- `.repos/effect-smol/packages/atom/react/src/RegistryContext.ts`
- `.repos/effect-smol/packages/atom/react/src/Hooks.ts`
- `.repos/effect-smol/packages/effect/HTTPAPI.md`

### External
- [Zep Quickstart](https://help.getzep.com/v2/quickstart)
- [Zep Knowledge Graph docs](https://help.getzep.com/v2/knowledge-graphs)
- [Zep JS SDK repo](https://github.com/getzep/zep-js)
- [NPM @getzep/zep-cloud](https://www.npmjs.com/package/@getzep/zep-cloud)
- [Better Auth docs](https://www.better-auth.com/docs)
- [Better Auth Magic Link plugin](https://www.better-auth.com/docs/plugins/magic-link)
- [Better Auth Drizzle adapter](https://www.better-auth.com/docs/adapters/drizzle)
- [Neon docs](https://neon.com/docs)
- [Vercel Marketplace: Neon](https://vercel.com/marketplace/neon)
- [Vercel changelog: Postgres migration to Neon](https://vercel.com/changelog/our-updated-storage-offering-from-vercel-and-neon)
- [Gaia knowledge-graph component](https://ui.heygaia.io/docs/components/knowledge-graph)
- [Next.js route handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Next.js route segment config](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config)
- [Next.js cookies API](https://nextjs.org/docs/app/api-reference/functions/cookies)
