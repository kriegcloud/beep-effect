# Handoff P3: Server Implementation

## Context For Phase 3

### Working Context (<=2K tokens)

Current task: implement SQL aggregates and RPC handlers that satisfy the Phase 2 contract.

Success criteria:
- [ ] Server aggregates are computed in SQL (not client-side)
- [ ] RPC handler returns schema-validated `DashboardStats`
- [ ] Tests cover:
  - empty DB (0s)
  - representative non-empty data correctness

Immediate dependencies:
- `packages/knowledge/server/src/`
- `packages/knowledge/server/src/rpc/v1/`
- `packages/knowledge/tables/src/`
- `packages/knowledge/server/test/`

### Episodic Context (<=1K tokens)

- Phase 2 defines final contract and schemas; Phase 3 must conform.

### Semantic Context (<=500 tokens)

- Aggregates must represent the schema graph (classes/properties), not instance entities.

### Procedural Context (links only)

- Testing standards: `documentation/patterns/effect-testing-standards.md` (if present)
- Effect patterns: `.claude/rules/effect-patterns.md`

## Verification Checklist

- [ ] RPC endpoint is implemented and wired
- [ ] SQL queries are explainable and indexed where needed
- [ ] Tests exist and pass
- [ ] P4 handoff/prompt updated
