# IP Law Knowledge Graph — Agent Prompts

## Prompt: P0 Orchestrator (Ontology Research)

You are researching 7 published OWL ontologies for an IP law knowledge graph. Read `SPEC.md` for the Source-of-Truth Contract, ontology list, and access URLs. For each ontology, retrieve the OWL file and document: OWL dialect, serialization format, top-level class hierarchy, object properties relevant to IP law, and reasoning constraints (cardinality, disjointness, transitivity). Produce a class-to-node-type mapping table covering all 15 planned node types from `SPEC.md`.

Write: `history/outputs/p0-ontology-research.md`

You must verify: All 7 ontology sections are populated with non-empty class lists; class-to-node-type mapping covers all 15 types; at least 3 reasoning constraints documented per applicable ontology.

## Prompt: P1 Orchestrator (Schema Design)

You are designing Effect Schema definitions for the IP law knowledge graph. Read `history/outputs/p0-ontology-research.md` and the `SPEC.md` node/edge type tables. Define 15 node types as `S.TaggedClass` with `_tag` discriminant and OWL source annotations. Define 11+ edge types as typed records with `_type`, `sourceId`, `targetId`. Compose into `NodeKind` and `EdgeKind` tagged unions. Document every OWL reasoning constraint dropped during translation with justification.

Write: `history/outputs/p1-schema-design.md`

You must verify: Every `S.TaggedClass` compiles; `NodeKind` has 15 branches; `EdgeKind` has 11+ branches; each type has `@source S#` JSDoc; dropped constraints documented.

## Prompt: P2 Orchestrator (Implementation Plan)

You are creating a file-level implementation plan for the IP law knowledge graph initiative. Read `history/outputs/p1-schema-design.md` and the `SPEC.md` assumptions and defaults. Define the package scaffold order with dependency relationships. List every source file with purpose, exports, and dependencies. Define seed data plan with at least 1 patent, 1 trademark, and 1 copyright scenario. List quality gates.

Write: `history/outputs/p2-implementation-plan.md`

You must verify: File plan covers all schema types from P1; seed data plan has 3 scenarios minimum; quality gates include check, lint-fix, test, build.

## Prompt: P3 Orchestrator (Implementation)

You are implementing the IP law knowledge graph initiative. Read `history/outputs/p2-implementation-plan.md` and follow the file-level plan. Create package scaffold, implement Schema definitions, build FalkorDB storage layer, implement seed data pipeline, and write tests. Document all deviations from the P2 plan. Run quality gates after implementation.

Write: `history/outputs/p3-implementation-notes.md`

You must verify: All planned files exist; `pnpm check` passes; `pnpm test` passes; seed data loads without errors; deviations documented.

## Prompt: P4 Orchestrator (Verification)

You are performing final verification of the IP law knowledge graph initiative. Run `pnpm check`, `pnpm lint-fix`, `pnpm test`, and `pnpm build` for the package. Record full command output. Classify any failures as pre-existing or new. Resolve new failures. Write a final readiness statement confirming the package meets all success criteria from `SPEC.md`.

Write: `history/outputs/p4-verification.md`

You must verify: All 4 commands exit 0; no new failures; readiness statement present; success criteria checklist addressed.
