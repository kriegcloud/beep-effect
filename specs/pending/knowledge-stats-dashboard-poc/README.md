# Knowledge Stats Dashboard POC

> Extend the existing `packages/knowledge/*` vertical slice with a POC Stats Dashboard page that visualizes aggregate knowledge graph statistics and an interactive ontology schema graph (React Flow).

---

## Objective

Build a POC dashboard page that renders real, server-computed aggregate metrics from `@beep/knowledge-tables`, plus a schema visualization driven by ontology class/property definitions (not instance entities).

This spec is scoped to a *working* dashboard with solid architecture boundaries, typed RPC contracts, and minimal-but-real UI interactivity.

---

## Reference Implementation (Source Of Truth)

### Notion (primary)

| Resource | Notion ID | Notes |
|---|---|---|
| Stats Dashboard page | `30069573788d81c1a881d598349ddcf5` | Contains screenshots + component descriptions + feature mapping table. |

Important constraint: the prior capture spec references Notion “data sources” as `collection://…`. Not all Notion API / MCP setups can query those URIs directly. Treat them as hints; prefer reading the Stats page blocks and the local capture outputs below.

### Local capture outputs (reliable fallback)

| File | Purpose |
|---|---|
| `specs/pending/open-ontology-reference-capture/outputs/SCOUT_Stats.md` | 3-region layout, selectors, element inventory, metric values, graph nodes/edges inventory. |
| `specs/pending/open-ontology-reference-capture/outputs/CAPTURE_Stats.md` | Captured interactive states + screenshot filenames + selectors. |

### Screenshot CDN (for visual parity checks)

Base: `https://static.vaultctx.com/notion/open-ontology/stats/`

Key images:
- `screenshots/stats-default.png`
- `screenshots/stats-dark-mode.png`
- `screenshots/stats-3d-view.png`
- `screenshots/stats-elk-force-layout.png`
- `scout/scout-stats-full-viewport.png`

---

## Current State (Bootstrapped)

**Already exists:**
- `packages/knowledge/{domain,tables,server,client,ui}` scaffolding
- `@beep/knowledge-tables` and `@beep/knowledge-domain` are present
- `@beep/knowledge-ui` exists but exports nothing yet (`packages/knowledge/ui/src/index.ts` is placeholder-only)

**Known gaps relevant to this spec (verify in P1):**
- stats RPC contracts/endpoints are not yet defined in `@beep/knowledge-client`
- stats aggregation handlers are not yet implemented in `@beep/knowledge-server`
- dashboard UI components/page route do not exist yet

---

## Goals

1. Dashboard page renders server-side aggregate stats from knowledge tables.
2. Schema graph renders ontology schema (classes + properties) using React Flow and supports basic interactions:
   - layout algorithm switching (at least Dagre + ELK)
   - direction + edge style + spacing toggles
   - zoom/fit controls
3. All data flowing over RPC is schema-validated and type-safe (no `any`, no unchecked casts).
4. Basic tests exist for the server aggregates (unit tests minimum).

---

## Non-Goals

- Full design parity/polish (this is a POC).
- Instance-level entity graph visualization (schema only).
- Client-side recomputation of aggregates (server SQL only).
- Shipping a new design system; reuse `@beep/ui` and existing tokens.

---

## Packages & Boundaries

Follow `domain -> tables -> server -> client -> ui` and cross-slice rules (imports only via `@beep/*` packages).

Target packages:
- `packages/knowledge/server` (SQL aggregates + RPC handlers)
- `packages/knowledge/client` (RPC contracts + schemas)
- `packages/knowledge/ui` (dashboard components)
- `apps/web` (page route + wiring) or `apps/todox` (if product decision dictates; decide in P1)

---

## Complexity Classification

Using the formula from `specs/_guide/README.md`:

```
Complexity = (Phases × 2) + (Agents × 3) + (CrossPkg × 4) + (ExtDeps × 3) + (Uncertainty × 5) + (Research × 2)
```

| Factor | Value | Contribution |
|---|---:|---:|
| Phases | 6 | 12 |
| Agents | 4 | 12 |
| Cross-Package Dependencies | 4 | 16 |
| External Dependencies | 1 | 3 |
| Uncertainty | 1 | 5 |
| Research Required | 1 | 2 |
| **Total** | | **50** |

**Classification: High** (41-60 points)

---

## Phase Overview

| Phase | Name | Output |
|---|---|---|
| P1 | Discovery | `outputs/codebase-context.md` (patterns + file map) |
| P2 | Schema & Contracts | RPC endpoint plan + response schemas |
| P3 | Server Implementation | SQL aggregate queries + RPC handlers + tests |
| P4 | UI Components | Stats cards + schema panel + React Flow viewer |
| P5 | Integration & Polish | App route + wiring + theming + responsive constraints |
| P6 | Verification | `bun run check`, `bun run test`, visual QA vs reference screenshots |

See `MASTER_ORCHESTRATION.md` for task-level detail and handoff expectations.

---

## Success Criteria

- [ ] Dashboard route renders without runtime errors.
- [ ] Metrics are real (queried from Postgres), not mocked in UI.
- [ ] Graph renders from ontology schema data and supports layout switching + zoom/fit.
- [ ] RPC contract is schema-validated (Effect Schema), no `any`.
- [ ] Server aggregates have tests.
- [ ] Dark mode doesn’t break layout (basic parity with reference).

