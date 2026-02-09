# Master Orchestration: Knowledge Stats Dashboard POC

This document is the task-level orchestrator for implementing the POC dashboard across `knowledge-{server,client,ui}` and an app route.

> Orchestrator rule (from `specs/_guide/README.md`): coordinate and delegate. Do not brute-force multi-file exploration in a single session without handoffs.

---

## Reference Map

Primary:
- Notion Stats Dashboard page: `30069573788d81c1a881d598349ddcf5`

Local capture (treat as stable reference):
- `specs/pending/open-ontology-reference-capture/outputs/SCOUT_Stats.md`
- `specs/pending/open-ontology-reference-capture/outputs/CAPTURE_Stats.md`

Screenshots:
- Base: `https://static.vaultctx.com/notion/open-ontology/stats/`

---

## Current State (Bootstrapped)

Packages exist under `packages/knowledge/*`.

Confirmed:
- `@beep/knowledge-ui` exports are placeholder-only today (`packages/knowledge/ui/src/index.ts`).

Assumed but must be verified in P1:
- stats RPC contracts/endpoints are missing or incomplete in `@beep/knowledge-client`
- stats server handlers are missing in `@beep/knowledge-server`

---

## Architecture Decisions (POC Defaults)

These are defaults; P1 can revise with evidence.

- Data source: Postgres via `@effect/sql-pg` + existing knowledge tables.
- Transport: `@effect/rpc` pattern used in `packages/knowledge/server/src/rpc/v1/`.
- Validation: Effect Schema on all RPC inputs/outputs (no unchecked decoding).
- UI: Next.js (App Router) page in  unless discovery indicates TodoX-only routing.
- Placement: the dashboard described in this spec should be accessible under the **Knowledge Base** tab in the signed-in app shell navigation.
- Graph: React Flow (`@xyflow/react`) for 2D schema; “3D” toggle may be deferred unless already present in repo.

Risk callout: the Open Ontology reference includes a “3D View” state. If the repo has no existing 3D graph viewer, treat 3D as POC-stretch (implement toggle UI but allow “not supported yet”).

---

## Dashboard Sections (Target UX)

Derived from the Open Ontology reference (P0) plus two POC additions (stretch).

P0:
- Stats summary row (5 metric cards)
- Schema inventory panel (accordion lists)
- Interactive schema graph (React Flow)

Stretch:
- Extraction pipeline section (success/failure rates, token usage, throughput)
- Entity resolution section (cluster cohesion, merge reasons)

---

## Data Model Inputs (Verify Names In P1)

The aggregates should be computed from knowledge tables / domain models under:
- `packages/knowledge/tables`
- `packages/knowledge/domain`

Expected concept coverage (exact names may differ; treat as intent):
- entity + mention counts and distributions (by type / ontology)
- relation predicate distributions (entity-to-entity vs entity-to-literal)
- ontology utilization (classes/properties present vs used)
- extraction runs (status, counts, tokens)
- clustering / merge history (resolution quality signals)

---

## Phase Plan

Each phase ends with:
- `REFLECTION_LOG.md` update
- next phase handoff pair:
  - `handoffs/HANDOFF_P[N+1].md`
  - `handoffs/P[N+1]_ORCHESTRATOR_PROMPT.md`

### P1: Discovery

Goal: map what exists and decide “where the page lives” (within the Knowledge Base tab) and “how stats are exposed”.

Tasks:
1. Identify existing knowledge RPC modules and endpoint patterns.
2. Identify existing UI graph usage (React Flow) and component patterns in `@beep/ui`.
3. Inventory knowledge tables/entities relevant for aggregates (Entity, Relation, Ontology, Extraction, etc.).
4. Decide target route location:
   - or `apps/todox/app/(...)`
   - while ensuring the navigation entry lives under the **Knowledge Base** tab.

Deliverables:
- `outputs/codebase-context.md`
- (optional) `outputs/effect-research.md` if new Effect patterns are needed

### P2: Schema & Contracts

Goal: lock the RPC surface and response schema to support the UI without leaking DB details.

Tasks:
1. Define `DashboardStats` response shape.
2. Define an RPC endpoint in `@beep/knowledge-client` for dashboard stats.
3. Add schema codecs using `@beep/schema` (or repo standard) for output validation.
4. Decide which aggregates are P0 vs POC-stretch:
   - P0: totals, class/property inventory, graph nodes/edges
   - Stretch: extraction pipeline, entity resolution metrics

Deliverables:
- `outputs/contracts.md` (or commit-level description in handoff)
- Updated handoff for P3

### P3: Server Implementation

Goal: implement SQL aggregates and RPC handler(s).

Tasks:
1. Implement a server service/module that computes aggregates from knowledge tables.
2. Add RPC handler in `packages/knowledge/server/src/rpc/v1/` that returns schema-validated `DashboardStats`.
3. Add tests in `packages/knowledge/server/test` covering:
   - empty DB behavior (0 counts)
   - non-empty aggregate correctness (use fixtures)
   - schema validation behavior (bad data rejected, if applicable)

Deliverables:
- Server aggregates + handler code
- Tests passing

### P4: UI Components

Goal: implement dashboard components in `@beep/knowledge-ui` and export them.

Target components (names are suggestions, confirm naming conventions in P1):
- `StatsSummaryRow`
- `SchemaInventoryPanel` (accordion for classes/properties)
- `SchemaGraphViewer` (React Flow)
- `DashboardLayout` (3-region grid)

Interactions (baseline):
- layout algorithm select (Dagre + ELK)
- direction toggle (TD/LR)
- edge style toggle (curved/straight/step)
- spacing toggle (spacious/compact)
- zoom/fit controls

Deliverables:
- `packages/knowledge/ui/src/index.ts` exports
- Component-level VM tests if repo has patterns

### P5: Integration & Polish

Goal: wire end-to-end: route -> data fetch -> UI render.

Tasks:
1. Add page route in chosen app.
2. Add navigation entry under the **Knowledge Base** tab (or whichever shell construct renders that tab panel).
3. Fetch RPC data on server or client (choose one and justify in handoff; POC default: server component fetch if feasible).
4. Ensure basic responsive behavior:
   - 1920x1080 “no-scroll” parity is optional
   - mobile should degrade gracefully (graph can collapse behind a tab)
5. Ensure dark mode renders acceptably.

Deliverables:
- Page renders and can be navigated to

### P6: Verification

Goal: run gates and perform visual QA against reference.

Commands:
- `bun run check`
- `bun run test`
- `bun run lint`

Visual QA tooling:
- Prefer the Playwright MCP server (`mcp__playwright__*`) to capture repeatable screenshots/snapshots for comparison.
- Capture at least:
  - default (light) dashboard
  - dark mode dashboard
  - schema graph with at least one non-default layout selection

Visual QA checklist:
- matches 3-region layout (header/sidebar/main)
- stats row shows 5 metrics
- accordion panel present
- React Flow canvas present and interactive
- dark mode doesn’t break layout

Deliverables:
- `outputs/verification-notes.md` (optional, but recommended)
