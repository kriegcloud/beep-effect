# Codex Effect v4 Knowledge Graph App

## Status
ACTIVE

## Owner
@elpresidank

## Created
2026-02-22

## Last Updated
2026-02-22

## Quick Navigation

- [Quick Start](./QUICK_START.md)
- [Research Notes](./outputs/research.md)
- [Phase Research Index](./outputs/phase-research-index.md)
- [Canonical Pattern Review](./outputs/canonical-pattern-review.md)
- [Comprehensive Review](./outputs/comprehensive-review.md)
- [Reflection Log](./REFLECTION_LOG.md)
- [Handoffs Index](./handoffs/README.md)
- [P1 Handoff](./handoffs/HANDOFF_P1.md)
- [P1 Orchestrator Prompt](./handoffs/P1_ORCHESTRATOR_PROMPT.md)

## Purpose

Turn the completed Effect v4 knowledge-graph work into a production-ready private beta application that invited Effect community users can query and visualize.

## Problem Statement

The existing Effect v4 graph artifacts are valuable but not currently exposed through a deployable, authenticated application. There is no single system that provides:

1. Graph deployment into Zep.
2. A production chat interface grounded by graph retrieval.
3. A reusable graph-tool layer behind the chat experience.
4. A graph visualization UI for exploration.
5. A private-beta auth model with magic-link sign-in and invite-only access control.

## Proposed Solution

Build a Next.js app that:

1. Ingests the completed graph artifacts into Zep.
2. Uses Effect v4 (`effect/unstable/http` + `HttpRouter.toWebHandler`) for API surfaces.
3. Exposes one shared `KnowledgeGraphToolkit` for grounded chat and API reuse.
4. Uses OpenAI through `@effect/ai-openai` for chat tool-calling.
5. Renders graph structure with Gaia's `knowledge-graph` component.
6. Uses Better Auth magic-link sign-in with Drizzle + Neon and server-enforced email allowlist checks.

## Primary Goal

Deliver a production-ready private beta app deployable to Zep + Vercel, with a working graph, chat interface, and graph visualization.

## Goals

- Deploy existing Effect v4 graph data to Zep and verify retrieval quality.
- Provide `/api/chat` using Effect AI + shared toolkit + OpenAI.
- Provide `/api/graph/search` backing an interactive graph UI.
- Provide one reusable toolkit/service layer used by chat and graph retrieval paths.
- Restrict access to approved emails via Better Auth magic-link flow and allowlist enforcement.
- Ship deployment/runbook guidance for production operation.

## Non-Goals

- Multi-tenant graph partitioning.
- Per-user graph ownership or ACL modeling.
- Public signup flow.
- Full IAM admin dashboard.
- Replacing Next.js app router with a custom server runtime.

## Scope

### In Scope

- Zep ingestion pipeline for completed graph outputs.
- Effect v4 HTTP handlers in Next route handlers.
- Shared toolkit used by chat + graph retrieval routes.
- Better Auth magic-link auth with Drizzle adapter and Neon Postgres.
- Gaia graph visualization with Zep node/edge mapping.
- Vercel deployment shape and operational hardening.

### Out of Scope

- Tenant scoping and user-scoped graph storage.
- Public onboarding automation.
- Advanced ontology constraints unless retrieval quality requires them.

## Success Criteria

- [ ] Existing Effect v4 graph data is ingested into Zep and queryable.
- [ ] `/api/chat` returns graph-grounded answers using shared toolkit tools.
- [ ] Shared toolkit/services are reused by chat and graph API paths.
- [ ] Graph UI renders live nodes/edges with interactive expansion.
- [ ] Access is restricted to approved allowlist emails via Better Auth magic-link sign-in.
- [ ] Deployment works on Vercel Node runtime with required secrets.
- [ ] Runbooks cover allowlist ops, ingestion verification, and rollback.

## Required Outputs

| Artifact | Purpose |
|----------|---------|
| `outputs/research.md` | Source-backed technical research |
| `outputs/phase-research-index.md` | Per-phase research map for orchestrators |
| `outputs/p1-auth-allowlist-research.md` | P1 implementation-critical context |
| `outputs/p2-zep-ingestion-research.md` | P2 implementation-critical context |
| `outputs/p3-toolkit-chat-foundation-research.md` | P3 implementation-critical context |
| `outputs/p4-chat-route-research.md` | P4 implementation-critical context |
| `outputs/p5-graph-ui-atom-research.md` | P5 implementation-critical context |
| `outputs/p6-deployment-hardening-research.md` | P6 implementation-critical context |
| `outputs/canonical-pattern-review.md` | Canonical structure audit against completed specs |
| `outputs/comprehensive-review.md` | Architecture/decision fit review |
| `handoffs/HANDOFF_P1.md` | P1 execution context and verification plan |
| `handoffs/P1_ORCHESTRATOR_PROMPT.md` | Copy-paste starter prompt for P1 |
| `handoffs/HANDOFF_P2..P6.md` | Phase-by-phase execution context for remaining work |
| `handoffs/P2..P6_ORCHESTRATOR_PROMPT.md` | Copy-paste prompts for each subsequent phase |

## Architecture Decision Records

| ID | Decision | Rationale |
|----|----------|-----------|
| AD-001 | Single shared graph (`graphId = effect-v4`) | Simplest architecture for private beta and matches current objective |
| AD-002 | Shared `KnowledgeGraphToolkit` used by chat and graph retrieval services | Prevents behavior drift and duplicate logic |
| AD-003 | Better Auth magic-link with server-side allowlist enforcement | Provides proof-of-email ownership while keeping beta UX simple |
| AD-004 | Neon Postgres (via Vercel Marketplace integration) with Drizzle adapter | Best fit for simple managed Postgres + straightforward app integration |
| AD-005 | Next route handlers implemented via Effect `HttpRouter.toWebHandler` | Canonical Effect v4 web integration boundary |
| AD-006 | Node runtime routes for chat/graph APIs | More reliable for tool-calling and graph query behavior |
| AD-007 | Zep as runtime system of record for retrieval | Avoids secondary graph cache drift |
| AD-008 | Deterministic phased ingestion with verification scripts | Enables replayability and quality checks |
| AD-009 | Minimal email-centric magic-link UX for beta | Aligns with manual invite workflow |
| AD-010 | Defer ontology typing unless search quality requires it | Keeps v1 focused on shipping stable core features |

## Architecture Overview

```
Completed Effect v4 Graph Artifacts
  -> Zep Ingestion Scripts
  -> Zep Graph (graphId: effect-v4)

Next.js App (apps/web)
  -> Better Auth (magic-link + allowlist gate + DB-backed sessions/users)
  -> Effect runtime + layers
       -> KnowledgeGraphToolkit
       -> Zep client services
       -> OpenAI model services

Routes
  /api/auth/[...all] -> Better Auth handler
  /api/chat          -> generateText + toolkit
  /api/graph/search  -> graph query adapter for UI

UI
  Gaia knowledge-graph component
  effect atom-react client state (chat + graph)
```

## Better Options

1. Recommended v1: keep all agent interaction through `/api/chat` with server-side tool-calling and shared toolkit handlers.
2. Optional v1.1: add a typed `/api/query` endpoint for deterministic graph lookups without model inference.
3. Optional v2: add signed service-token access for trusted automations if non-browser clients are required.
4. For database provider, prefer Neon via Vercel Marketplace integration over legacy Vercel Postgres paths.

## Data Flows

### Ingestion Flow

1. Read completed graph artifacts from `specs/completed/effect-v4-knowledge-graph/outputs/*`.
2. Transform records into Zep graph add payloads.
3. Run deterministic ingestion phases (modules, migrations, docs, enrichments, selected function/type episodes).
4. Run verification script with count checks and spot queries.

### Chat Flow

1. Authenticated user posts to `/api/chat`.
2. Server validates session + allowlist gate.
3. Handler runs `LanguageModel.generateText` with shared toolkit tools.
4. Response returns answer + source/tool metadata.

### Graph UI Flow

1. Client requests `/api/graph/search` with a query or seed node.
2. Route runs Zep graph search.
3. Mapper translates entities/edges into Gaia node/link shape.
4. UI expands neighbors and updates node details on interaction.

## Implementation Blueprint

### Planned App Files (`apps/web`)

- `src/app/api/auth/[...all]/route.ts`
- `src/middleware.ts`
- `src/app/api/chat/route.ts`
- `src/app/api/graph/search/route.ts`
- `src/app/(app)/graph/page.tsx`
- `src/app/(app)/layout.tsx`
- `src/lib/auth.ts`
- `src/lib/auth-client.ts`
- `src/lib/auth/allowlist.ts`
- `src/lib/auth/require-approved-session.ts`
- `src/lib/db/client.ts`
- `src/lib/db/schema/auth.ts`
- `drizzle.config.ts`
- `src/lib/effect/runtime.ts`
- `src/lib/graph/zep-client.ts`
- `src/lib/graph/tools.ts`
- `src/lib/graph/mappers.ts`
- `src/state/chat.atoms.ts`
- `src/state/graph.atoms.ts`
- `src/components/chat/*`
- `src/components/graph/KnowledgeGraphPanel.tsx`
- `scripts/zep-ingest-effect-v4.ts`
- `scripts/zep-verify-effect-v4.ts`

## Environment Contract

- `APP_BASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `DATABASE_URL`
- `DATABASE_URL_UNPOOLED` (optional; recommended for migrations)
- `ALLOWED_EMAILS` (comma-separated, required)
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `OPENAI_API_KEY`
- `OPENAI_CHAT_MODEL` (optional override)
- `ZEP_API_KEY`
- `ZEP_BASE_URL` (optional override)
- `GRAPH_ID` (optional override; default `effect-v4`)

## Phase Overview

| Phase | Name | Status | Description |
|-------|------|--------|-------------|
| P0 | Spec + Research + Review | **Complete** | Canonical spec scaffold + research + comprehensive review |
| P1 | Auth + Access Foundation | Pending | Better Auth magic-link + Drizzle/Neon + allowlist route gating |
| P2 | Zep Ingestion Pipeline | Pending | Ingest completed graph assets and verify search quality |
| P3 | Toolkit + Chat Foundation | Pending | Build shared toolkit/service layer for grounded chat |
| P4 | Chat Route | Pending | Build `/api/chat` with OpenAI tool-calling |
| P5 | Graph UI + Atom State | Pending | Build Gaia graph UI and client state |
| P6 | Deployment Hardening | Pending | Finalize vercel config, ops guardrails, runbooks |

## Phase Completion Requirements

| Phase | Required Exit Evidence |
|-------|------------------------|
| P1 | Better Auth magic-link works; allowlist-enforced auth rejects non-approved emails |
| P2 | Ingestion + verification scripts pass; graph retrieval works via API |
| P3 | Shared toolkit/services validated and reused by chat + graph routes |
| P4 | `/api/chat` returns grounded responses with tool traces |
| P5 | Graph UI renders and interactive expansion works on live data |
| P6 | Deployment checklist + rollback runbook validated in preview/prod |

## Canonical Pattern Compliance

Canonical structure for this spec has been aligned to patterns repeatedly used across completed specs:

- Status/owner/created metadata sections.
- Explicit problem statement and proposed solution.
- Goals/non-goals plus in-scope/out-of-scope boundaries.
- Checklist-style success criteria.
- Phase overview with explicit phase completion requirements.
- Supporting artifacts: `QUICK_START.md`, `REFLECTION_LOG.md`, `outputs/*`, `handoffs/*`.

See [outputs/canonical-pattern-review.md](./outputs/canonical-pattern-review.md) for the comparison baseline and mapping.

## Comprehensive Fit Review Summary

Detailed review: [outputs/comprehensive-review.md](./outputs/comprehensive-review.md)

Top conclusions:

1. Shared graph scope is the best fit for this private beta.
2. Better Auth magic-link with DB-backed sessions is the best fit for secure invite-only beta.
3. Shared toolkit across chat + graph retrieval is the highest leverage reliability decision.
4. Effect `toWebHandler` is the right route integration boundary.
5. Ontology typing and tenant concerns should stay deferred until post-beta evidence requires expansion.

## Complexity Assessment

```
Phases:       7  x2 = 14
Agents:       2  x3 =  6
CrossPkg:     1  x0.5= 0.5
ExtDeps:      4  x3 = 12  (Zep, OpenAI, Neon, Resend)
Uncertainty:  2  x5 = 10
Research:     2  x2 =  4
                     ----
Total:             46.5 -> Medium complexity
```

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Magic-link abuse or replay | High | Medium | short-lived tokens, one-time verification semantics, provider rate limits |
| Tool-call latency spikes | Medium | Medium | Timeout/tool budget caps + short cache |
| Ingestion drift or partial loads | Medium | Medium | Deterministic phases + replayable verification scripts |
| Serverless cold starts | Medium | Medium | Keep handler/toolkit singletons at module scope |
| Zep/OpenAI/Email transient failures | Medium | Medium | Retry/backoff and degraded-response handling |

## Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| Zep Cloud (`@getzep/zep-cloud`) | External API/SDK | Required |
| OpenAI API | External API | Required |
| Neon Postgres | Infrastructure | Required |
| Resend (magic-link email delivery) | External API | Required |
| Vercel | Deployment | Required |
| Gaia `knowledge-graph` component | UI component | Required |

## Verification Commands

```bash
# workspace quality gates
bun run check
bun run test
bun run lint
bun run build

# web app target build
bunx turbo run build --filter=@beep/web

# planned scripts (after implementation)
bun run apps/web/scripts/zep-ingest-effect-v4.ts
bun run apps/web/scripts/zep-verify-effect-v4.ts
```

## Key Files

| File | Purpose |
|------|---------|
| `specs/pending/codex-effect-v4-knowledge-graph-app/README.md` | Master spec |
| `specs/pending/codex-effect-v4-knowledge-graph-app/QUICK_START.md` | Fast implementation triage |
| `specs/pending/codex-effect-v4-knowledge-graph-app/REFLECTION_LOG.md` | Cumulative learnings |
| `specs/pending/codex-effect-v4-knowledge-graph-app/outputs/research.md` | Source-backed research |
| `specs/pending/codex-effect-v4-knowledge-graph-app/outputs/phase-research-index.md` | Phase-by-phase research entrypoint |
| `specs/pending/codex-effect-v4-knowledge-graph-app/outputs/canonical-pattern-review.md` | Canonical pattern compliance audit |
| `specs/pending/codex-effect-v4-knowledge-graph-app/outputs/comprehensive-review.md` | Decision fit review |
| `specs/pending/codex-effect-v4-knowledge-graph-app/handoffs/HANDOFF_P1.md` | Next phase execution handoff |
| `specs/pending/codex-effect-v4-knowledge-graph-app/handoffs/P1_ORCHESTRATOR_PROMPT.md` | Next phase starter prompt |

## Related Specs

- `specs/completed/effect-v4-knowledge-graph/` (source graph assets)
- `specs/completed/effect-v4-migration/README.md` (Effect v4 baseline)
- `specs/completed/shared-memories/README.md` (Graphiti/Zep integration precedent)

## Open Questions

No blocker-level open questions remain for v1 scope.

## Exit Condition

This spec is complete when phases P1-P6 are implemented with passing verification and deployment runbooks validated for private beta operations.
