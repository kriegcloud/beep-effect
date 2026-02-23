# Quick Start

## What Is This?

A multi-phase research and knowledge extraction pipeline that harvests Palantir's public resources into a Graphiti knowledge graph, enabling future reverse-engineering of their Ontology system.

## Current Status

| Phase | Status | Description |
|-------|--------|-------------|
| P0 | **Complete** | Spec scaffolding, schemas, ADRs |
| P1 | Pending | Knowledge Graph schema design (research + review) |
| P2 | Pending | Web research (5 parallel agents) |
| P3 | Pending | Blog post enrichment (136 URLs) |
| P4 | Pending | Docs scraper + repo analysis (parallel) |
| P5 | Pending | RAG enrichment pipeline |
| P6 | Pending | Knowledge graph construction |
| P7 | Pending | Verification and coverage report |

## How to Continue

| Phase | Handoff | Orchestrator Prompt |
|-------|---------|---------------------|
| P1 | [HANDOFF_P1.md](./handoffs/HANDOFF_P1.md) | [P1_ORCHESTRATOR_PROMPT.md](./handoffs/P1_ORCHESTRATOR_PROMPT.md) |
| P2 | [HANDOFF_P2.md](./handoffs/HANDOFF_P2.md) | [P2_ORCHESTRATOR_PROMPT.md](./handoffs/P2_ORCHESTRATOR_PROMPT.md) |
| P3 | [HANDOFF_P3.md](./handoffs/HANDOFF_P3.md) | [P3_ORCHESTRATOR_PROMPT.md](./handoffs/P3_ORCHESTRATOR_PROMPT.md) |
| P4 | [HANDOFF_P4.md](./handoffs/HANDOFF_P4.md) | [P4_ORCHESTRATOR_PROMPT.md](./handoffs/P4_ORCHESTRATOR_PROMPT.md) |
| P5 | [HANDOFF_P5.md](./handoffs/HANDOFF_P5.md) | [P5_ORCHESTRATOR_PROMPT.md](./handoffs/P5_ORCHESTRATOR_PROMPT.md) |
| P6 | [HANDOFF_P6.md](./handoffs/HANDOFF_P6.md) | [P6_ORCHESTRATOR_PROMPT.md](./handoffs/P6_ORCHESTRATOR_PROMPT.md) |
| P7 | [HANDOFF_P7.md](./handoffs/HANDOFF_P7.md) | [P7_ORCHESTRATOR_PROMPT.md](./handoffs/P7_ORCHESTRATOR_PROMPT.md) |

## Key Decisions Already Made

1. **Graphiti + FalkorDB** for knowledge graph (already deployed from shared-memories spec)
2. **Separate schemas** for web research (WebResearchLink) vs repo analysis (RepoAnalysisResult)
3. **KG schema designed upfront** (P1) before data collection begins
4. **Docs scraper + repo analysis run in parallel** (P4a + P4b)
5. **URL-based deduplication** with merge-richer-metadata strategy
6. **No coding standards enforced** — all code is archival, use whatever works best
7. **Research-first KG schema** — deploy agents to study best practices before committing

## Data Schemas

See [README.md](./README.md#data-schemas) for `WebResearchLink` and `RepoAnalysisResult` type definitions.

## Research Resources

| Resource | Count | Description |
|----------|-------|-------------|
| Curated blog links | 136 | `resources/blog-posts-articles-and-resources.md` |
| Palantir repos | 18 | `.repos/palantir/*` (git subtrees) |
| Reference images | 7 | `resources/images/` (architecture diagrams) |
