# P3 Handoff — Implementation

## Objective

Implement the `packages/ip-law-graph` package following the file-level plan from P2, including Schema definitions, FalkorDB storage layer, seed data pipeline, and tests.

## Inputs

- [SPEC.md](../../SPEC.md) — ADRs, Success Criteria
- [p1-schema-design.md](../../history/outputs/p1-schema-design.md) — Schema definitions to implement
- [p2-implementation-plan.md](../../history/outputs/p2-implementation-plan.md) — File-level plan, seed data strategy, quality gates

## Required Work

1. Create package scaffold in the order specified by P2.
2. Implement all Effect Schema definitions for 15 node types and 11+ edge types.
3. Implement FalkorDB storage layer with create, read, and query operations using Cypher.
4. Implement seed data pipeline and load representative data for patent, trademark, and copyright scenarios.
5. Write unit tests for schema validation (encode/decode round-trips).
6. Write integration tests for graph create/read/query operations.
7. Run `pnpm check` and `pnpm lint-fix` to verify type correctness and code style.
8. Document all deviations from the P2 plan with rationale.

## Deliverable

Write: `history/outputs/p3-implementation-notes.md`

## Completion Checklist

- [ ] All planned source files exist per P2 file plan
- [ ] Schema definitions compile without type errors
- [ ] FalkorDB storage layer passes integration tests
- [ ] Seed data loads without errors
- [ ] All deviations from P2 plan documented

## Exit Gate

P3 is complete when all source files are implemented, tests pass, seed data loads successfully, and `history/outputs/p3-implementation-notes.md` documents the full implementation record.
