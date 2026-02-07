# Phase 1 Orchestrator Prompt (Discovery)

Copy-paste this prompt to start Phase 1 discovery for `knowledge-stats-dashboard-poc`.

---

## Prompt

You are implementing Phase 1 (Discovery) of the `specs/pending/knowledge-stats-dashboard-poc/` spec.

### Context

Reference implementation documentation:
- Notion Stats Dashboard page: `30069573788d81c1a881d598349ddcf5`
- Local capture docs:
  - `specs/pending/open-ontology-reference-capture/outputs/SCOUT_Stats.md`
  - `specs/pending/open-ontology-reference-capture/outputs/CAPTURE_Stats.md`

Tooling hazard:
- Notion `collection://...` identifiers are not reliably queryable in all environments. Prefer page IDs and local outputs.

### Your Mission

Produce an actionable codebase context report for implementing the dashboard.

Write: `specs/pending/knowledge-stats-dashboard-poc/outputs/codebase-context.md`

Include:
1. Where the dashboard route should live (`apps/web` vs `apps/todox`) and why.
2. Existing knowledge RPC patterns:
   - where v1 RPC endpoints are defined
   - how client contracts map to server handlers
3. Existing UI patterns for dashboard/layout and any React Flow usage in the repo.
4. A concrete file touch list for:
   - P2 (contracts)
   - P3 (server aggregates)
   - P4 (UI components)
   - P5 (app route wiring)

### Constraints

- Follow slice boundaries: domain -> tables -> server -> client -> ui.
- Do not add new libraries in Discovery; just record what exists.
- Record evidence (file paths) for each claim.

### Verification

- Ensure `outputs/codebase-context.md` is created.
- Update `specs/pending/knowledge-stats-dashboard-poc/REFLECTION_LOG.md` (Phase 1 section).
- Update the next handoff pair:
  - `specs/pending/knowledge-stats-dashboard-poc/handoffs/HANDOFF_P2.md`
  - `specs/pending/knowledge-stats-dashboard-poc/handoffs/P2_ORCHESTRATOR_PROMPT.md`

### Success Criteria

- [ ] `outputs/codebase-context.md` exists and includes a file touch list
- [ ] Route location is decided with evidence
- [ ] Next-phase handoff updated
