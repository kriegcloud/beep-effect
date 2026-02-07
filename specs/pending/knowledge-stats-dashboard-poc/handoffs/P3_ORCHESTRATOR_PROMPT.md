# Phase 3 Orchestrator Prompt (Server Implementation)

Copy-paste this prompt to start Phase 3 for `knowledge-stats-dashboard-poc`.

---

## Prompt

You are implementing Phase 3 (Server Implementation) of `specs/pending/knowledge-stats-dashboard-poc/`.

### Context

Phase 2 should have produced a schema-validated dashboard stats contract in `packages/knowledge/client`.

### Your Mission

Implement server-side SQL aggregates and RPC handler(s) that return the dashboard stats.

Requirements:
- SQL aggregates only.
- Use existing service/layer patterns in `packages/knowledge/server/src/Service`.
- Add tests in `packages/knowledge/server/test`.

Update next phase:
- `specs/pending/knowledge-stats-dashboard-poc/handoffs/HANDOFF_P4.md`
- `specs/pending/knowledge-stats-dashboard-poc/handoffs/P4_ORCHESTRATOR_PROMPT.md`

### Verification

Run:
- `bun run check`
- `bun run test`

### Success Criteria

- [ ] RPC endpoint works end-to-end at the server level
- [ ] Tests cover empty/non-empty correctness
