# Phase 2 Orchestrator Prompt (Schema & Contracts)

Copy-paste this prompt to start Phase 2 for `knowledge-stats-dashboard-poc`.

---

## Prompt

You are implementing Phase 2 (Schema & Contracts) of `specs/pending/knowledge-stats-dashboard-poc/`.

### Context

Reference layout + interactions:
- `specs/pending/open-ontology-reference-capture/outputs/SCOUT_Stats.md`
- `specs/pending/open-ontology-reference-capture/outputs/CAPTURE_Stats.md`

### Your Mission

Define an RPC contract and schema-validated response type for the dashboard stats.

Requirements:
- Define a `DashboardStats` (or similarly named) output schema.
- Include:
  - summary counts (5 cards)
  - schema inventory lists (classes/properties)
  - graph data (nodes/edges) for React Flow
- No `any`, no unchecked casts.

Update next phase:
- `specs/pending/knowledge-stats-dashboard-poc/handoffs/HANDOFF_P3.md`
- `specs/pending/knowledge-stats-dashboard-poc/handoffs/P3_ORCHESTRATOR_PROMPT.md`

### Success Criteria

- [ ] Client contract exists and is schema-validated
- [ ] Endpoint naming matches server RPC conventions
- [ ] P3 handoff updated with exact shapes
