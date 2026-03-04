# repo-codegraph-canonical — Quick Start

## Problem

AI coding agents hallucinate when they lack structured context about code relationships, types, error channels, and dependencies. Flat file retrieval delivers 31 percentage points worse accuracy than graph-structured context (DeepCodeSeek 2025), and documentation drift silently degrades agent grounding quality over time.

## Solution

A **deterministic-first knowledge graph** for the beep-effect monorepo that maximizes computable facts before introducing any inference. Three certainty tiers layer on each other:

1. **Layer 1 (certainty = 1.0)**: 14+ JSDoc tags extracted directly from the TypeScript AST — `@param`, `@returns`, `@throws` (via Effect `<A, E, R>` decomposition), `@requires`, `@async`, `@extends`, `@implements`, and more. These are computed, not authored, and cannot hallucinate.

2. **Layer 2 (certainty = 0.85–0.95)**: Type-system-derived semantic information — complex type resolution, generic instantiation, conditional type evaluation via the TypeScript type checker.

3. **Layer 3 (certainty = 0.6–0.85)**: LLM-inferred content — natural-language descriptions, `@example` blocks, `@category` classification (constrained to an 8-category taxonomy grounded in category theory), `@business-rule`, `@side-effect`. Validated via De-Hallucinator iterative grounding.

## Key Decisions

| Decision | Choice | Why |
|---|---|---|
| Graph DB | FalkorDB (falkordblite embedded for dev) | 500x faster multi-hop vs Neo4j; zero-config `npm install`; native vector search |
| AST parser | ts-morph + tree-sitter | ts-morph for full type resolution; tree-sitter for fast incremental parsing |
| Embeddings | Voyage Code 3 | 13.8% better than OpenAI on code; 32K token context |
| LLM | Claude Sonnet 4.5 | Best quality/cost for JSDoc generation, NL-to-Cypher, code understanding |
| Schema | 15 node types, 17+ edge types | Synthesized from CPG, SCIP, CodeQL, ICSE 2025 research |
| Classification | 8-category discriminated union | Grounded in Moggi's monads; compile-time exhaustive |
| Incremental indexing | SHA-256 hashing + Turborepo `--affected` | Two-level: package-level via Turbo, file-level via hash manifest |
| Interface | MCP server with 5 tools | `search-symbol`, `traverse-dependencies`, `explain-function`, `find-similar`, `check-drift` |

## Phase Roadmap

| Phase | Focus | Key Output |
|---|---|---|
| P0 | Launch packet | Locked defaults, technology validation |
| P1 | Schema + data model freeze | Effect Schema definitions, Cypher constraints |
| P2 | AST extraction + deterministic enrichment | Layer 1+2 JSDoc generation, Effect type decomposition |
| P3 | FalkorDB storage + incremental indexing | MERGE upserts, hash manifest, Turborepo integration |
| P4 | LLM enrichment + classification | Layer 3 content, 8-category taxonomy, De-Hallucinator |
| P5 | Embedding + MCP server + query layer | Voyage Code 3, NL-to-Cypher, 2-hop sub-graph extraction |
| P6 | JSDoc freshness + CI/CD | PR drift detection, weekly audit, AI-assisted suggestions |
| P7 | Deployment + validation | Railway deploy, performance benchmarks, health score |

## Top-Level Success Criteria

- Exported symbol coverage ≥ 98%
- Deterministic re-indexing produces identical graph (100%)
- Sub-graph extraction p95 ≤ 200ms
- Agent hallucination rate ≤ -30% with KG context vs without
- Documentation health score ≥ 85%
- Single-file re-index ≤ 3s

## Read Next

- [README.md](./README.md) — full spec with locked defaults, schema details, and quantitative targets
- [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md) — phase-by-phase execution guide
- [RUBRICS.md](./RUBRICS.md) — validation rubrics per phase
