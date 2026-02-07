# Quick Start (POC)

This spec is meant to be executed phase-by-phase with handoffs. If you only have 30-60 minutes, do **P1** and a minimal slice of **P2** to lock down contracts and scope.

## 1. Read The Reference (10 min)

- Notion Stats Dashboard page: `30069573788d81c1a881d598349ddcf5`
- Local capture docs:
  - `specs/pending/open-ontology-reference-capture/outputs/SCOUT_Stats.md`
  - `specs/pending/open-ontology-reference-capture/outputs/CAPTURE_Stats.md`

## 2. Run Phase 1 (Discovery)

Use: `specs/pending/knowledge-stats-dashboard-poc/handoffs/P1_ORCHESTRATOR_PROMPT.md`

Deliverable: `specs/pending/knowledge-stats-dashboard-poc/outputs/codebase-context.md`

## 3. Lock Contracts (Phase 2)

Define a minimal `getDashboardStats` RPC endpoint shape:
- stats summary row (counts)
- schema inventory (classes + properties)
- graph data (nodes + edges) derived from ontology schema
- (optional for POC) extraction pipeline aggregates

## 4. Validate Locally (when implementing)

Use repo gates:
- `bun run check`
- `bun run test`
- `bun run lint`

Avoid starting long-running `dev` servers in automated sessions unless explicitly requested.

