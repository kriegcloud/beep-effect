# IP Law Knowledge Graph — Quick Start

> A TypeScript + Effect v4 knowledge graph for intellectual property law, grounded in 7 published OWL ontologies.

## What This Delivers

- A curated survey of 7 OWL ontologies covering patents, trademarks, copyrights, judicial decisions, and legal norms
- Effect Schema definitions for 15 node types and 11+ edge types as tagged unions with OWL traceability
- FalkorDB-backed graph storage with Cypher create/read/query operations
- Seed data demonstrating patent, trademark, and copyright scenarios

## Current Status

| Phase | Focus | Status |
|---|---|---|
| P0 | Ontology Research | PENDING |
| P1 | Schema Design | PENDING |
| P2 | Implementation Plan | PENDING |
| P3 | Implementation | PENDING |
| P4 | Verification | PENDING |

## Start Here

1. Read the [README.md](./README.md) for full context, ADRs, and domain tables
2. Open the handoff for the current pending phase (start with P0)
3. Execute the corresponding orchestrator prompt

## Phase Entry Files

| Phase | Handoff | Orchestrator | Output |
|---|---|---|---|
| P0 | [HANDOFF_P0.md](./handoffs/HANDOFF_P0.md) | [P0_ORCHESTRATOR_PROMPT.md](./handoffs/P0_ORCHESTRATOR_PROMPT.md) | [p0-ontology-research.md](./outputs/p0-ontology-research.md) |
| P1 | [HANDOFF_P1.md](./handoffs/HANDOFF_P1.md) | [P1_ORCHESTRATOR_PROMPT.md](./handoffs/P1_ORCHESTRATOR_PROMPT.md) | [p1-schema-design.md](./outputs/p1-schema-design.md) |
| P2 | [HANDOFF_P2.md](./handoffs/HANDOFF_P2.md) | [P2_ORCHESTRATOR_PROMPT.md](./handoffs/P2_ORCHESTRATOR_PROMPT.md) | [p2-implementation-plan.md](./outputs/p2-implementation-plan.md) |
| P3 | [HANDOFF_P3.md](./handoffs/HANDOFF_P3.md) | [P3_ORCHESTRATOR_PROMPT.md](./handoffs/P3_ORCHESTRATOR_PROMPT.md) | [p3-implementation-notes.md](./outputs/p3-implementation-notes.md) |
| P4 | [HANDOFF_P4.md](./handoffs/HANDOFF_P4.md) | [P4_ORCHESTRATOR_PROMPT.md](./handoffs/P4_ORCHESTRATOR_PROMPT.md) | [p4-verification.md](./outputs/p4-verification.md) |

## Verification Commands

```bash
pnpm check --filter @beep/ip-law-graph
pnpm lint-fix --filter @beep/ip-law-graph
pnpm test --filter @beep/ip-law-graph
pnpm build --filter @beep/ip-law-graph
```
