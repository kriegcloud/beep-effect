# P2 Handoff — Implementation Plan

## Objective

Produce a file-level build plan for the `packages/ip-law-graph` package, including scaffold order, dependency graph, seed data strategy, and quality gates.

## Inputs

- [SPEC.md](../../SPEC.md) — Assumptions and Defaults, ADR-002 (FalkorDB), ADR-005 (Cypher)
- [p1-schema-design.md](../../history/outputs/p1-schema-design.md) — Complete node and edge type definitions

## Required Work

1. Define the package scaffold order: which directories and files to create first based on dependency relationships.
2. List every planned source file with its purpose, named exports, and internal dependencies.
3. Define seed data plan covering at least 1 patent scenario, 1 trademark scenario, and 1 copyright scenario with specific entities and relationships.
4. Specify the expected graph shape after seed data loading (node count, edge count, connected components).
5. List quality gates: `pnpm check`, `pnpm lint-fix`, `pnpm test`, `pnpm build` with expected outcomes.
6. Define rollback notes for common failure modes.

## Deliverable

Write: `history/outputs/p2-implementation-plan.md`

## Completion Checklist

- [ ] Package scaffold order defined with dependency rationale
- [ ] File-level plan covers all schema types from P1
- [ ] Seed data plan has at least 3 scenarios (patent, trademark, copyright)
- [ ] Quality gates listed with expected outcomes
- [ ] Rollback notes present for common failure modes

## Exit Gate

P2 is complete when `history/outputs/p2-implementation-plan.md` contains a file-level plan that another agent can follow without making additional design decisions.
