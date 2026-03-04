# HANDOFF P0 — Launch Packet Complete

## Objective

Freeze all technology selections and architectural decisions. Validate that core dependencies (falkordblite, ts-morph) install and function. Create the spec package with full traceability from research corpus to locked defaults. Hand off to P1 Schema Engineer with clear inputs and non-negotiable constraints.

---

## Locked Defaults (Do Not Reopen in P1 Unless ADR + Source Proof)

### Technology Locks

| Decision Surface | Locked Default | Why |
|---|---|---|
| Graph database | `FalkorDB` with `falkordblite` embedded for dev/CI | GraphBLAS 500x faster multi-hop vs Neo4j; zero-config embedded [S1][R1] |
| AST parser (primary) | `ts-morph` | Full TypeScript type resolution [S1][S2][R2] |
| AST parser (incremental) | `tree-sitter` | Incremental parsing, unchanged subtree reuse [S1] |
| Embedding model | `Voyage Code 3` via Vercel AI SDK | 13.8% better than OpenAI on code; 32K context [S1] |
| LLM (enrichment) | `Claude Sonnet 4.5` | 77.2% SWE-bench; optimal quality/cost [S1] |
| LLM (deep review) | `Claude Opus 4.5` | Multi-step dependency impact analysis [S1] |
| Certainty model | Three-layer: deterministic (1.0), type-system (0.85–0.95), LLM (0.6–0.85) | FORGE 2026: AST corrected 77% of LLM hallucinations [S2][S3] |
| Node ID format | SCIP-style: `<workspace>::<file>::<symbol>::<kind>::<signature-hash>` | Proven at Sourcegraph/Meta scale [S1][S4] |
| JSDoc standard | JSDoc with `jsdoc/no-types` | Universal AI training coverage; custom tag extensibility [S1][S2] |
| File watcher | `@parcel/watcher` | Post-restart detection; native APIs; used by Turborepo [S1] |
| Cypher builder | `@neo4j/cypher-builder` | OpenCypher-compatible; parameter binding [S1] |
| MCP SDK | `@modelcontextprotocol/sdk` | Anthropic-backed; TypeScript-first [S1] |
| Classification | 8-category discriminated union | Moggi's effects + architectural convergence [S2] |
| Testing | `Vitest` + `falkordblite` | Real DB in tests, zero Docker [S1] |
| Incremental strategy | SHA-256 + Turborepo `--affected` + hash manifest | Two-level change detection [S1] |
| Effect-TS integration | `Effect<A, E, R>` decomposition for `@throws`/`@requires` | Type system encodes error/dependency channels [S2] |

### Interface Locks

| Interface | Locked Contract |
|---|---|
| Graph node schema | Effect Schema with `kind` discriminant, `id`, `qualifiedName`, `hash`, `certaintyTier`, `provenance` |
| Graph edge schema | Effect Schema with `kind` discriminant, `source`, `target`, `certaintyTier`, `provenance` |
| Certainty metadata | `certaintyTier: 1 | 2 | 3`, `provenance: "ast" | "type-checker" | "llm"` on all nodes/edges |
| JSDoc drift | `DOCUMENTED_BY` edges carry `signatureHash`, `lastValidated`, `driftDetected` |
| Sub-graph extraction | 2-hop traversal via CALLS, CONTAINS, IMPORTS, EXTENDS, IMPLEMENTS, TYPE_OF |
| MCP tools | `search-symbol`, `traverse-dependencies`, `explain-function`, `find-similar`, `check-drift` |

---

## P0 Completion Checklist

- [x] README.md with locked defaults, phase architecture, quantitative targets, rollout/fallback
- [x] QUICK_START.md executive summary
- [x] MASTER_ORCHESTRATION.md with phase-by-phase orchestration
- [x] RUBRICS.md with per-phase pass/fail dimensions
- [x] REFLECTION_LOG.md template
- [x] outputs/initial_plan.md with research-to-decision mapping
- [x] handoffs/HANDOFF_P0.md (this document)
- [x] All locked defaults have [S#][R#] traceability tags
- [ ] falkordblite installs and connects (to be validated at P1 entry)
- [ ] ts-morph parses sample file (to be validated at P1 entry)

---

## Deliverables for P1 — Schema + Data Model Freeze

### Inputs to Read

1. `README.md` — Graph Schema Summary section (15 node types, 17+ edge types, certainty model)
2. `README.md` — Locked Interface Defaults table
3. `README.md` — Eight-Category Classification Taxonomy
4. `README.md` — Three-Layer Certainty Model
5. `README.md` — Deterministic JSDoc Extraction section
6. `outputs/initial_plan.md` — Research-to-decision mapping for schema choices

### Required Outputs

1. `outputs/p1-schema/graph-schema.ts` — Effect Schema definitions for all node and edge types
2. `outputs/p1-schema/cypher-constraints.cypher` — FalkorDB indexes (range, full-text, HNSW vector) and constraints
3. `outputs/p1-schema/certainty-model.ts` — `CertaintyTier`, `Provenance`, and metadata types
4. `outputs/p1-schema/category-taxonomy.ts` — 8-category discriminated union with property→category Galois connection

### Required Checks

1. `pnpm check` — Effect Schema compiles with zero type errors
2. falkordblite connects and accepts all Cypher constraints
3. Node ID generator produces valid SCIP-style qualified names for all 15 node types
4. Category taxonomy switch is provably exhaustive (TypeScript `never` analysis)

### Exit Gate

1. All 15 node types have complete property schemas in Effect Schema
2. All 17+ edge types include `certaintyTier` and `provenance` properties
3. Cypher constraints (unique node IDs, indexed properties) apply without error
4. 8-category taxonomy `_tag` switch is exhaustive with `never` return type on default
5. `handoffs/HANDOFF_P1.md` exists
