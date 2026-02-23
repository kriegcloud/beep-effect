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

## 5. Authenticate + Find The Target Nav (for manual/Playwright QA)

The Knowledge Stats Dashboard POC described in this spec should be reachable from the **Knowledge Base** tab in the main shell navigation.

Sign-in steps (validated with Playwright MCP):
1. Go to `http://localhost:3000/auth/sign-in`.
2. Fill `Email` with `beep@hole.com`.
3. Fill `Password` with the local dev password for that account (keep secrets out of git; prefer env/seeded dev credentials).
4. Click `Submit`.
5. Confirm you land on a signed-in route (in our run: `/?id=mail-inbox-1`) and the left tab panel shows `Knowledge Base`.
