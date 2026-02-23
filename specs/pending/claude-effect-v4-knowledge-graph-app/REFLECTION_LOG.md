# Reflection Log

Cumulative learnings across all phases of the Effect v4 Knowledge Graph Explorer project.

---

## Phase 0: Research & Spec Design (2026-02-22)

**What worked:**
- Deep parallel research across 4 domains (Effect v4 AI/HTTP/atom, Zep Cloud, better-auth, Gaia component)
- Using `.repos/effect-smol` as source of truth for Effect v4 APIs instead of web (which returns v3 docs)
- Graphiti knowledge graph already contained facts about prior architecture decisions
- Prior Codex spec attempt provided useful baseline to improve upon

**What we learned:**

1. **Effect v4 AI package** (`effect/unstable/ai`):
   - `Tool.make(name, { description, parameters, success })` for defining tools with Schema
   - `Toolkit.make(Tool1, Tool2)` + `toolkit.toLayer({ Tool1: handler })` for handler registration
   - `LanguageModel.generateText({ prompt, toolkit })` for tool-calling LLM interaction
   - `McpServer.layerHttp({ name, version, path })` for HTTP MCP transport
   - `McpServer.toolkit(toolkit)` to register toolkit with MCP server
   - All in `effect/unstable/ai` (NOT `@effect/ai` which doesn't exist)

2. **Effect v4 HTTP** (`effect/unstable/http`):
   - `HttpRouter.toWebHandler(appLayer)` returns `{ handler, dispose }` for Next.js
   - Module-level singleton caching avoids per-request layer rebuild
   - `HttpEffect.scopeTransferToStream(response)` for streaming resource lifecycle
   - `HttpRouter.schemaJson(schema)` for request body parsing

3. **Effect Atom** (`effect/unstable/reactivity` + `@effect/atom-react`):
   - `Atom.make(value)` for simple state, `Atom.make(effect)` for async
   - `Atom.fn<Arg>()(handler)` for mutations with `AtomResultFn` type
   - `useAtomValue(atom)` and `useAtom(atom)` hooks
   - `RegistryProvider` wraps app root
   - `AtomHttpApi.Service` for type-safe HTTP API client as atoms

4. **Zep Cloud** (researched but **rejected** in favor of self-hosted FalkorDB):
   - No automatic migration from local Graphiti; would require re-ingesting all 2,155 episodes
   - $25/mo Flex plan vs $4-8/mo VPS
   - ~90-95% data fidelity via LLM re-extraction vs 100% with RDB dump copy
   - Vendor lock-in with API-only access vs full Cypher query control

5. **better-auth** (initially rejected, then **adopted** with magic link plugin):
   - First rejected as overkill for email allowlist — but reconsidered for proper passwordless auth
   - Magic link plugin provides secure, production-grade authentication flow
   - Drizzle adapter on Neon PostgreSQL free tier (no cost for auth storage)
   - Known TypeScript monorepo bug: keep all auth code in `apps/web`, do NOT extract to shared package
   - Resend free tier (100 emails/day) handles magic link delivery
   - Allowlist enforcement at magic link send time — unauthorized emails never receive a link

6. **react-force-graph-2d** (replaced Gaia component):
   - Canvas-based rendering (not SVG) — handles 1000+ nodes smoothly
   - Supports incremental data updates without full simulation restart (key advantage)
   - Rich interaction API: zoom, pan, node drag, click, hover, custom painting
   - 6K+ GitHub stars, active maintenance, well-documented
   - Data format: `{ nodes: [{ id, name, val, color }], links: [{ source, target }] }`

7. **Gaia knowledge-graph component** (researched but **rejected** in favor of react-force-graph-2d):
   - SVG-only rendering — performance drops at 1000+ nodes
   - Full simulation restart on every data change (no incremental updates)
   - Debouncing required for growing/streaming graphs
   - Less control over rendering and interaction

**Key decisions made:**
- AD-001: Self-hosted FalkorDB on VPS (not Zep Cloud) — zero re-ingestion, 100% data fidelity, lower cost
- AD-005: MCP endpoint removed from v1 scope — not needed for core chat+graph goal
- AD-006: better-auth magic link + Neon PostgreSQL + Resend — proper passwordless auth with free tier services
- AD-007: Neon PostgreSQL free tier for auth database — Vercel marketplace integration, auto-synced DATABASE_URL
- AD-008: react-force-graph-2d (not Gaia) — canvas rendering, incremental updates, better performance
- AD-002-AD-004, AD-009-AD-013: Retained from initial design

**Architecture revision rationale:**
- Comprehensive review identified over-engineered decisions (Zep Cloud, original visualization choice)
- Local FalkorDB RDB dump (70MB) is directly portable — eliminates entire re-ingestion phase
- better-auth magic link provides proper security without over-engineering (Neon free tier = $0)
- react-force-graph-2d handles incremental graph expansion natively (critical for search-expand UX)
- MCP endpoint removed to reduce scope — can be added later in ~20 lines if needed
- Monthly cost: $29-48 (down from $50-65 with original Zep Cloud stack)

---
